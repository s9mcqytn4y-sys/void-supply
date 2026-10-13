"use server";

import { eq } from "drizzle-orm";
import { db, pesanan, pembayaran, pengiriman, itemPesanan } from "@/lib/db";
import { batalkanPesananKedaluwarsa } from "../services/reservasi.service";

export interface DetailStatusPesanan {
  nomorPesanan: string;
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

/**
 * Server Action: Ambil Status Pesanan & Eksekusi Lazy Expiry Check
 * Digunakan oleh halaman status pesanan dan polling client untuk mendapatkan status real-time.
 */
export async function ambilStatusPesanan(
  nomorPesanan: string
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

    return {
      sukses: true,
      pesan: "Detail pesanan berhasil diambil.",
      data: {
        nomorPesanan: pesananDb.nomorPesanan,
        statusPesanan: statusPesananSaatIni,
        statusPembayaran: pembayaranDb?.statusPembayaran || "menunggu_pembayaran",
        totalAkhir: pesananDb.totalAkhir,
        subtotal: pesananDb.subtotal,
        totalOngkir: pesananDb.totalOngkir,
        dibuatPada: pesananDb.dibuatPada.toISOString(),
        kedaluwarsaPada: batasKedaluwarsa.toISOString(),
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
        pembayaran: pembayaranDb
          ? {
              metode: pembayaranDb.metodePembayaran,
              snapToken: pembayaranDb.snapToken,
              snapRedirectUrl: pembayaranDb.snapRedirectUrl,
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
