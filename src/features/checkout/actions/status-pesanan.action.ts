"use server";

import { eq } from "drizzle-orm";
import { db, pesanan, pembayaran, pengiriman, itemPesanan } from "@/lib/db";
import { batalkanPesananKedaluwarsa } from "../services/reservasi.service";

export interface DetailStatusPesanan {
  nomorPesanan: string;
  isAuthorized: boolean;
  statusPesanan: "menunggu_pembayaran" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
  statusPembayaran: "menunggu_pembayaran" | "berhasil" | "kadaluarsa" | "gagal" | "dikembalikan";
  totalAkhir: number;
  subtotal: number;
  totalOngkir: number;
  dibuatPada: string;
  kedaluwarsaPada?: string | null;
  namaPelanggan: string;
  emailPelanggan: string;
  teleponPelanggan: string;
  kurir?: {
    nama: string;
    layanan: string;
    estimasiHari: string;
    nomorResi?: string | null;
  };
  pembayaran?: {
    metode?: string | null;
    snapToken?: string | null;
    snapRedirectUrl?: string | null;
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

    // Evaluasi otorisasi (SEC-02): Jika pesanan memiliki tokenAkses, token wajib cocok
    const isAuthorized = !pesananDb.tokenAkses || (Boolean(tokenAkses) && tokenAkses === pesananDb.tokenAkses);

    return {
      sukses: true,
      pesan: isAuthorized
        ? "Detail pesanan berhasil diambil."
        : "Detail pesanan ditampilkan dalam mode terlindungi (PII disamarkan).",
      data: {
        nomorPesanan: pesananDb.nomorPesanan,
        isAuthorized,
        statusPesanan: statusPesananSaatIni,
        statusPembayaran: pembayaranDb?.statusPembayaran || "menunggu_pembayaran",
        totalAkhir: pesananDb.totalAkhir,
        subtotal: pesananDb.subtotal,
        totalOngkir: pesananDb.totalOngkir,
        dibuatPada: pesananDb.dibuatPada.toISOString(),
        kedaluwarsaPada: batasKedaluwarsa.toISOString(),
        namaPelanggan: isAuthorized ? pesananDb.namaPelanggan : sensorNama(pesananDb.namaPelanggan),
        emailPelanggan: isAuthorized ? pesananDb.emailPelanggan : sensorEmail(pesananDb.emailPelanggan),
        teleponPelanggan: isAuthorized ? pesananDb.teleponPelanggan : sensorTelepon(pesananDb.teleponPelanggan),
        kurir: pengirimanDb
          ? {
              nama: pengirimanDb.kurir,
              layanan: pengirimanDb.layanan,
              estimasiHari: pengirimanDb.estimasiHari,
              nomorResi: isAuthorized ? pengirimanDb.nomorResi : undefined,
            }
          : undefined,
        pembayaran: pembayaranDb
          ? {
              metode: pembayaranDb.metodePembayaran,
              snapToken: isAuthorized ? pembayaranDb.snapToken : undefined,
              snapRedirectUrl: isAuthorized ? pembayaranDb.snapRedirectUrl : undefined,
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
