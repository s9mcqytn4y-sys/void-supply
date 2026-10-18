"use server";

import { desc, eq, sql, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pesanan, varianProduk, produk, pengiriman } from "@/lib/db/schema";
import { riwayatMutasiStok } from "@/lib/db/admin.schema";
import { verifikasiStafAdmin } from "./auth-guard";

export interface MetrikDasborAdmin {
  totalOmset: number;
  totalPesanan: number;
  pesananPerluProses: number;
  totalArtikelKritis: number;
  pesananTerbaru: {
    id: string;
    nomorPesanan: string;
    namaPelanggan: string;
    totalAkhir: number;
    statusPesanan: string;
    kurir: string | null;
    dibuatPada: string;
  }[];
  stokKritis: {
    id: string;
    namaProduk: string;
    namaVarian: string;
    sku: string;
    stok: number;
  }[];
}

/**
 * Server Action: Mengambil data ringkasan metrik dasbor admin secara teragregasi
 */
export async function ambilStatistikDasborAction(): Promise<{
  sukses: boolean;
  data?: MetrikDasborAdmin;
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, pesan: cek.pesan || "Akses tidak sah." };
    }

    // 1. Agregasi Total Omset dan Total Pesanan
    const [ringkasanPesanan] = await db
      .select({
        totalPesanan: sql<number>`count(*)`,
        totalOmset: sql<number>`COALESCE(sum(CASE WHEN ${pesanan.statusPesanan} != 'dibatalkan' THEN ${pesanan.totalAkhir} ELSE 0 END), 0)`,
        perluProses: sql<number>`count(CASE WHEN ${pesanan.statusPesanan} IN ('diproses', 'menunggu_pembayaran') THEN 1 ELSE NULL END)`,
      })
      .from(pesanan);

    // 2. Varian dengan stok menipis (<= 5 unit)
    const varianMenipis = await db
      .select({
        id: varianProduk.id,
        namaProduk: produk.nama,
        namaVarian: sql<string>`concat(${varianProduk.warna}, ' / ', ${varianProduk.ukuran})`,
        sku: varianProduk.sku,
        stok: varianProduk.stok,
      })
      .from(varianProduk)
      .innerJoin(produk, eq(varianProduk.produkId, produk.id))
      .where(sql`${varianProduk.stok} <= 5`)
      .orderBy(varianProduk.stok)
      .limit(5);

    // 3. 5 Pesanan Terbaru
    const barisPesanan = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        namaPelanggan: pesanan.namaPelanggan,
        totalAkhir: pesanan.totalAkhir,
        statusPesanan: pesanan.statusPesanan,
        kurir: pengiriman.kurir,
        dibuatPada: pesanan.dibuatPada,
      })
      .from(pesanan)
      .leftJoin(pengiriman, eq(pengiriman.pesananId, pesanan.id))
      .orderBy(desc(pesanan.dibuatPada))
      .limit(5);

    return {
      sukses: true,
      data: {
        totalOmset: Number(ringkasanPesanan?.totalOmset || 0),
        totalPesanan: Number(ringkasanPesanan?.totalPesanan || 0),
        pesananPerluProses: Number(ringkasanPesanan?.perluProses || 0),
        totalArtikelKritis: varianMenipis.length,
        pesananTerbaru: barisPesanan.map((p) => ({
          id: p.id,
          nomorPesanan: p.nomorPesanan,
          namaPelanggan: p.namaPelanggan,
          totalAkhir: p.totalAkhir,
          statusPesanan: p.statusPesanan,
          kurir: p.kurir,
          dibuatPada: new Date(p.dibuatPada).toISOString(),
        })),
        stokKritis: varianMenipis,
      },
    };
  } catch (error) {
    console.error("[ADMIN DASBOR] Gagal memuat data statistik:", error);
    return {
      sukses: false,
      pesan: "Gagal memuat ringkasan dasbor operasional.",
    };
  }
}
