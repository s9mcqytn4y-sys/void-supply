"use server";

import { inArray, eq } from "drizzle-orm";
import { db, produk, varianProduk } from "@/lib/db";
import {
  permintaanRekonsiliasiSkema,
  type PermintaanRekonsiliasi,
} from "../schemas/cart.schema";
import type {
  HasilRekonsiliasiKeranjang,
  ItemHasilRekonsiliasi,
} from "../types/cart.type";

/**
 * Server Action: Rekonsiliasi Keranjang Belanja (Module 02.13)
 * Bertindak sebagai Source of Truth untuk memvalidasi:
 * 1. SKU & Varian ID riil dari database PostgreSQL
 * 2. Status produk (aktif vs habis/arsip)
 * 3. Harga aktual server (bukan harga tampilan yang bisa dimodifikasi di client)
 * 4. Ketersediaan stok fisik riil
 */
export async function rekonsiliasiKeranjang(
  payload: PermintaanRekonsiliasi
): Promise<HasilRekonsiliasiKeranjang> {
  const parseResult = permintaanRekonsiliasiSkema.safeParse(payload);
  if (!parseResult.success) {
    return {
      sukses: false,
      pesan: "Format permintaan rekonsiliasi tidak valid.",
      items: [],
      subtotalServerIdr: 0,
      totalBeratGram: 0,
      apakahAdaPerubahan: true,
    };
  }

  const { items: niatItems } = parseResult.data;

  if (niatItems.length === 0) {
    return {
      sukses: true,
      pesan: "Keranjang belanja kosong.",
      items: [],
      subtotalServerIdr: 0,
      totalBeratGram: 0,
      apakahAdaPerubahan: false,
    };
  }

  try {
    const daftarVarianId = niatItems.map((item) => item.varianId);

    // Ambil data varian fisik dan relasi produk langsung dari basis data
    const barisDatabase = await db
      .select({
        varianId: varianProduk.id,
        produkId: produk.id,
        namaProduk: produk.nama,
        slugProduk: produk.slug,
        gambarUtama: produk.gambarUtama,
        statusProduk: produk.status,
        sku: varianProduk.sku,
        ukuran: varianProduk.ukuran,
        warna: varianProduk.warna,
        stok: varianProduk.stok,
        beratGram: varianProduk.beratGram,
        harga: varianProduk.harga,
      })
      .from(varianProduk)
      .innerJoin(produk, eq(varianProduk.produkId, produk.id))
      .where(inArray(varianProduk.id, daftarVarianId));

    const dbMap = new Map(barisDatabase.map((row) => [row.varianId, row]));

    let apakahAdaPerubahan = false;
    let subtotalServerIdr = 0;
    let totalBeratGram = 0;
    const itemHasil: ItemHasilRekonsiliasi[] = [];

    for (const niat of niatItems) {
      const dataDb = dbMap.get(niat.varianId);

      // Kasus 1: Varian ID tidak ditemukan dalam database
      if (!dataDb) {
        apakahAdaPerubahan = true;
        itemHasil.push({
          varianId: niat.varianId,
          produkId: "",
          nama: "Artikel Tidak Ditemukan",
          slug: "",
          gambar: "/images/products/drop-04/void-tee-01-front.webp",
          sku: "UNKNOWN",
          ukuran: "-",
          warna: "-",
          hargaServerIdr: 0,
          jumlahDiminta: niat.jumlah,
          jumlahDisetujui: 0,
          beratGram: 0,
          stokAktual: 0,
          status: "tidak_ditemukan",
          pesan: "Artikel tidak ditemukan dalam database kami.",
        });
        continue;
      }

      // Kasus 2: Produk berstatus non-aktif atau stok habis (0)
      if (dataDb.statusProduk !== "aktif" || dataDb.stok <= 0) {
        apakahAdaPerubahan = true;
        itemHasil.push({
          varianId: dataDb.varianId,
          produkId: dataDb.produkId,
          nama: dataDb.namaProduk,
          slug: dataDb.slugProduk,
          gambar: dataDb.gambarUtama,
          sku: dataDb.sku,
          ukuran: dataDb.ukuran,
          warna: dataDb.warna,
          hargaServerIdr: dataDb.harga,
          jumlahDiminta: niat.jumlah,
          jumlahDisetujui: 0,
          beratGram: dataDb.beratGram,
          stokAktual: 0,
          status: "habis",
          pesan: `Stok untuk artikel ${dataDb.namaProduk} (${dataDb.ukuran}) saat ini telah habis.`,
        });
        continue;
      }

      // Kasus 3: Stok tersedia kurang dari jumlah yang diminta pembeli
      if (dataDb.stok < niat.jumlah) {
        apakahAdaPerubahan = true;
        const jumlahDisesuaikan = dataDb.stok;
        subtotalServerIdr += dataDb.harga * jumlahDisesuaikan;
        totalBeratGram += dataDb.beratGram * jumlahDisesuaikan;

        itemHasil.push({
          varianId: dataDb.varianId,
          produkId: dataDb.produkId,
          nama: dataDb.namaProduk,
          slug: dataDb.slugProduk,
          gambar: dataDb.gambarUtama,
          sku: dataDb.sku,
          ukuran: dataDb.ukuran,
          warna: dataDb.warna,
          hargaServerIdr: dataDb.harga,
          jumlahDiminta: niat.jumlah,
          jumlahDisetujui: jumlahDisesuaikan,
          beratGram: dataDb.beratGram,
          stokAktual: dataDb.stok,
          status: "stok_kurang",
          pesan: `Stok tersisa hanya ${dataDb.stok} unit. Jumlah disesuaikan secara otomatis.`,
        });
        continue;
      }

      // Kasus 4: Stok mencukupi sepenuhnya
      subtotalServerIdr += dataDb.harga * niat.jumlah;
      totalBeratGram += dataDb.beratGram * niat.jumlah;

      itemHasil.push({
        varianId: dataDb.varianId,
        produkId: dataDb.produkId,
        nama: dataDb.namaProduk,
        slug: dataDb.slugProduk,
        gambar: dataDb.gambarUtama,
        sku: dataDb.sku,
        ukuran: dataDb.ukuran,
        warna: dataDb.warna,
        hargaServerIdr: dataDb.harga,
        jumlahDiminta: niat.jumlah,
        jumlahDisetujui: niat.jumlah,
        beratGram: dataDb.beratGram,
        stokAktual: dataDb.stok,
        status: "tersedia",
      });
    }

    return {
      sukses: true,
      pesan: apakahAdaPerubahan
        ? "Beberapa artikel mengalami penyesuaian ketersediaan atau harga."
        : "Seluruh artikel dalam keranjang terverifikasi tersedia.",
      items: itemHasil,
      subtotalServerIdr,
      totalBeratGram,
      apakahAdaPerubahan,
    };
  } catch (error) {
    console.error("Galat saat rekonsiliasi keranjang:", error);
    return {
      sukses: false,
      pesan: "Gagal menghubungkan ke server basis data untuk memeriksa stok.",
      items: [],
      subtotalServerIdr: 0,
      totalBeratGram: 0,
      apakahAdaPerubahan: true,
    };
  }
}
