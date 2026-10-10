"use server";

import { z } from "zod";
import { inArray } from "drizzle-orm";
import { db, varianProduk } from "@/lib/db";
import { hitungOngkirBiteship, type OpsiKurir } from "@/lib/services/biteship.service";
import { niatItemKeranjangSkema } from "@/features/cart/schemas/cart.schema";

const permintaanOngkirSkema = z.object({
  kodePosTujuan: z.string().length(5, "Kode pos harus terdiri dari 5 digit angka"),
  items: z.array(niatItemKeranjangSkema).min(1, "Daftar item tidak boleh kosong"),
});

export interface HasilCekOngkirServer {
  sukses: boolean;
  pesan: string;
  totalBeratGram: number;
  opsiKurir: OpsiKurir[];
}

/**
 * Server Action: Hitung Ongkir Resmi Berdasarkan Berat Database
 * Dipanggil dari server (bukan dari client browser langsung) untuk melindungi API key Biteship
 * dan memastikan total berat fisik dihitung secara otentik dari PostgreSQL.
 */
export async function hitungOngkirServerAction(
  input: z.infer<typeof permintaanOngkirSkema>
): Promise<HasilCekOngkirServer> {
  const parseResult = permintaanOngkirSkema.safeParse(input);
  if (!parseResult.success) {
    return {
      sukses: false,
      pesan: parseResult.error.errors[0]?.message || "Format permintaan ongkir tidak valid.",
      totalBeratGram: 0,
      opsiKurir: [],
    };
  }

  const { kodePosTujuan, items } = parseResult.data;

  try {
    const daftarVarianId = items.map((i) => i.varianId);

    // Ambil berat resmi dari tabel varian_produk di PostgreSQL
    const dataVarian = await db
      .select({
        id: varianProduk.id,
        beratGram: varianProduk.beratGram,
      })
      .from(varianProduk)
      .where(inArray(varianProduk.id, daftarVarianId));

    const beratMap = new Map(dataVarian.map((v) => [v.id, v.beratGram]));

    let totalBeratGram = 0;
    for (const item of items) {
      const beratSatuan = beratMap.get(item.varianId) || 500;
      totalBeratGram += beratSatuan * item.jumlah;
    }

    // Panggil service Biteship secara aman di backend
    const opsiKurir = await hitungOngkirBiteship({
      kodePosTujuan,
      totalBeratGram,
    });

    return {
      sukses: true,
      pesan: "Tarif ongkos kirim berhasil dihitung.",
      totalBeratGram,
      opsiKurir,
    };
  } catch (error) {
    console.error("Galat hitung ongkir server:", error);
    return {
      sukses: false,
      pesan: "Gagal menghitung tarif ongkos kirim.",
      totalBeratGram: 0,
      opsiKurir: [],
    };
  }
}
