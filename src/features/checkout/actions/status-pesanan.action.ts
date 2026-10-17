"use server";

import { eq, desc } from "drizzle-orm";
import {
  db,
  pesanan,
  pembayaran,
  pengiriman,
  itemPesanan,
  pelacakanPengiriman,
} from "@/lib/db";
import { batalkanPesananKedaluwarsa } from "../services/reservasi.service";

export interface EventPelacakan {
  id: string;
  nomorResi: string;
  kurir: string;
  statusPelacakan: string;
  keterangan: string;
  lokasi: string | null;
  waktuPeristiwa: string;
}

export interface DetailPelacakan {
  kurir: string;
  layanan: string;
  estimasiHari: string;
  nomorResi?: string | null;
  statusPengiriman: "menunggu_resi" | "dalam_pengiriman" | "terkirim" | "gagal";
  riwayat: EventPelacakan[];
}

export interface DetailStatusPesanan {
  nomorPesanan: string;
  isAuthorized: boolean;
  statusPesanan: "menunggu_pembayaran" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
  statusPembayaran: "menunggu_pembayaran" | "berhasil" | "kadaluarsa" | "gagal" | "dikembalikan";
  totalAkhir: number;
  subtotal: number;
  totalOngkir: number;
  totalDiskon?: number;
  kodeVoucher?: string | null;
  dibuatPada: string;
  kedaluwarsaPada?: string | null;
  diterimaPada?: string | null;
  garansiBerakhirPada?: string | null;
  namaPelanggan: string;
  emailPelanggan: string;
  teleponPelanggan: string;
  kurir?: {
    nama: string;
    layanan: string;
    estimasiHari: string;
    nomorResi?: string | null;
  };
  pelacakan?: DetailPelacakan;
  pembayaran?: {
    metode?: string | null;
    snapToken?: string | null;
    snapRedirectUrl?: string | null;
    nomorVa?: string | null;
    bankVa?: string | null;
    qrString?: string | null;
    instruksiPembayaran?: unknown;
    dibayarPada?: string | null;
  };
  items: Array<{
    id: string;
    namaProduk: string;
    namaVarian: string;
    sku: string;
    hargaSatuan: number;
    jumlah: number;
    subtotalItem: number;
  }>;
}

export interface HasilAmbilStatusPesanan {
  sukses: boolean;
  pesan: string;
  data?: DetailStatusPesanan;
}

function sensorNama(nama: string): string {
  if (!nama) return "***";
  const kata = nama.trim().split(" ");
  return kata.map((k) => (k.length > 1 ? `${k[0]}***` : k)).join(" ");
}

function sensorEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.com";
  const [user, domain] = email.split("@");
  const maskedUser = user.length > 2 ? `${user.slice(0, 2)}***` : `${user[0]}***`;
  return `${maskedUser}@${domain}`;
}

function sensorTelepon(telp: string): string {
  if (!telp || telp.length < 6) return "******";
  return `${telp.slice(0, 4)}****${telp.slice(-3)}`;
}

/**
 * Server Action: Ambil Status Pesanan & Eksekusi Lazy Expiry Check
 * Digunakan oleh halaman status pesanan dan polling client untuk mendapatkan status real-time.
 * Menjamin pencegahan kebocoran data (SEC-02 IDOR Prevention).
 */
export async function ambilStatusPesanan(
  nomorPesanan: string,
  tokenAkses?: string
): Promise<HasilAmbilStatusPesanan> {
  try {
    if (!nomorPesanan || typeof nomorPesanan !== "string") {
      return {
        sukses: false,
        pesan: "Nomor pesanan tidak valid.",
      };
    }

    // 1. Ambil data pesanan dari database
    const [pesananDb] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan.trim()))
      .limit(1);

    if (!pesananDb) {
      return {
        sukses: false,
        pesan: `Pesanan dengan nomor '${nomorPesanan}' tidak ditemukan.`,
      };
    }

    // 2. Lazy Expiry Check: Batalkan jika sudah melewati 15 menit dan masih menunggu pembayaran
    const sekarang = new Date();
    const batasKedaluwarsa =
      pesananDb.kedaluwarsaPada ||
      new Date(new Date(pesananDb.dibuatPada).getTime() + 15 * 60 * 1000);

    let statusPesananSaatIni = pesananDb.statusPesanan;

    if (
      statusPesananSaatIni === "menunggu_pembayaran" &&
      sekarang >= batasKedaluwarsa
    ) {
      await batalkanPesananKedaluwarsa(pesananDb.id);
      statusPesananSaatIni = "dibatalkan";
    }

    // 3. Ambil relasi pembayaran, pengiriman, dan item pesanan
    const [pembayaranDb] = await db
      .select()
      .from(pembayaran)
      .where(eq(pembayaran.pesananId, pesananDb.id))
      .limit(1);

    const [pengirimanDb] = await db
      .select()
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, pesananDb.id))
      .limit(1);

    const itemsDb = await db
      .select()
      .from(itemPesanan)
      .where(eq(itemPesanan.pesananId, pesananDb.id));

    const riwayatPelacakanDb = await db
      .select()
      .from(pelacakanPengiriman)
      .where(eq(pelacakanPengiriman.pesananId, pesananDb.id))
      .orderBy(desc(pelacakanPengiriman.waktuPeristiwa));

    // Evaluasi otorisasi (SEC-02A & SEC-03):
    // 1. Dapatkan token dari argumen atau dari cookie session
    let tokenPengguna = tokenAkses?.trim();
    if (!tokenPengguna) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        tokenPengguna = cookieStore.get(`void_order_token_${nomorPesanan}`)?.value?.trim();
      } catch {
        // Lingkungan non-SSR / unit test tanpa request context
      }
    }

    // Fail-Closed Guard: Otorisasi hanya bernilai true jika pesanan memiliki token dan hash SHA-256 cocok (atau token plain)
    let isAuthorized = false;
    if (tokenPengguna) {
      try {
        const crypto = await import("crypto");
        const hashedInput = crypto.createHash("sha256").update(tokenPengguna).digest("hex");
        isAuthorized =
          (Boolean(pesananDb.hashTokenAkses) && hashedInput === pesananDb.hashTokenAkses) ||
          (Boolean(pesananDb.tokenAkses) && tokenPengguna === pesananDb.tokenAkses);
      } catch {
        isAuthorized = Boolean(pesananDb.tokenAkses) && tokenPengguna === pesananDb.tokenAkses;
      }
    }

    if (!isAuthorized) {
      // SEC-03: Minimal Public Status View (Bebas PII, tanpa items, tanpa harga, tanpa kurir)
      return {
        sukses: true,
        pesan: "Status pesanan publik dimuat dalam mode aman.",
        data: {
          nomorPesanan: pesananDb.nomorPesanan,
          isAuthorized: false,
          statusPesanan: statusPesananSaatIni,
          statusPembayaran: pembayaranDb?.statusPembayaran || "menunggu_pembayaran",
          totalAkhir: 0,
          subtotal: 0,
          totalOngkir: 0,
          dibuatPada: pesananDb.dibuatPada.toISOString(),
          kedaluwarsaPada: batasKedaluwarsa.toISOString(),
          namaPelanggan: "",
          emailPelanggan: "",
          teleponPelanggan: "",
          kurir: undefined,
          pembayaran: undefined,
          items: [],
        },
      };
    }

    // Authorized View: Kembalikan data lengkap pesanan
    return {
      sukses: true,
      pesan: "Detail pesanan berhasil diambil.",
      data: {
        nomorPesanan: pesananDb.nomorPesanan,
        isAuthorized: true,
        statusPesanan: statusPesananSaatIni,
        statusPembayaran: pembayaranDb?.statusPembayaran || "menunggu_pembayaran",
        totalAkhir: pesananDb.totalAkhir,
        subtotal: pesananDb.subtotal,
        totalOngkir: pesananDb.totalOngkir,
        totalDiskon: pesananDb.totalDiskon || 0,
        kodeVoucher: pesananDb.kodeVoucher,
        dibuatPada: pesananDb.dibuatPada.toISOString(),
        kedaluwarsaPada: batasKedaluwarsa.toISOString(),
        diterimaPada: pesananDb.diterimaPada ? pesananDb.diterimaPada.toISOString() : null,
        garansiBerakhirPada: pesananDb.garansiBerakhirPada ? pesananDb.garansiBerakhirPada.toISOString() : null,
        namaPelanggan: pesananDb.namaPelanggan,
        emailPelanggan: pesananDb.emailPelanggan,
        teleponPelanggan: pesananDb.teleponPelanggan,
        kurir: pengirimanDb
          ? {
              nama: pengirimanDb.kurir,
              layanan: pengirimanDb.layanan,
              estimasiHari: pengirimanDb.estimasiHari,
              nomorResi: pengirimanDb.nomorResi,
            }
          : undefined,
        pelacakan: pengirimanDb
          ? {
              kurir: pengirimanDb.kurir,
              layanan: pengirimanDb.layanan,
              estimasiHari: pengirimanDb.estimasiHari,
              nomorResi: pengirimanDb.nomorResi,
              statusPengiriman: pengirimanDb.statusPengiriman,
              riwayat: riwayatPelacakanDb.map((item) => ({
                id: item.id,
                nomorResi: item.nomorResi,
                kurir: item.kurir,
                statusPelacakan: item.statusPelacakan,
                keterangan: item.keterangan,
                lokasi: item.lokasi,
                waktuPeristiwa: item.waktuPeristiwa.toISOString(),
              })),
            }
          : undefined,
        pembayaran: pembayaranDb
          ? {
              metode: pembayaranDb.metodePembayaran,
              snapToken: pembayaranDb.snapToken,
              snapRedirectUrl: pembayaranDb.snapRedirectUrl,
              nomorVa: pembayaranDb.nomorVa,
              bankVa: pembayaranDb.bankVa,
              qrString: pembayaranDb.qrString,
              instruksiPembayaran: pembayaranDb.instruksiPembayaran,
              dibayarPada: pembayaranDb.dibayarPada?.toISOString() || null,
            }
          : undefined,
        items: itemsDb.map((item) => ({
          id: item.id,
          namaProduk: item.namaProduk,
          namaVarian: item.namaVarian,
          sku: item.sku,
          hargaSatuan: item.hargaSatuan,
          jumlah: item.jumlah,
          subtotalItem: item.subtotalItem,
        })),
      },
    };
  } catch (error) {
    console.error("Galat saat mengambil status pesanan:", error);
    return {
      sukses: false,
      pesan:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memuat status pesanan.",
    };
  }
}
