"use server";

import { desc, eq, and, sql, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { varianProduk, produk } from "@/lib/db/schema";
import {
  riwayatMutasiStok,
  auditAktivitasAdmin,
  type jenisMutasiStokEnum,
} from "@/lib/db/admin.schema";
import { verifikasiStafAdmin, verifikasiHakAksesAdmin } from "./auth-guard";

export interface ItemInventarisAdmin {
  id: string;
  produkId: string;
  namaProduk: string;
  gambarUtama: string;
  kategori: string;
  ukuran: string;
  warna: string;
  sku: string;
  stok: number;
  beratGram: number;
  harga: number;
  apakahKritis: boolean;
}

export interface BarisMutasiStok {
  id: string;
  namaProduk: string;
  namaVarian: string;
  sku: string;
  adminNama: string;
  jenisMutasi: string;
  kuantitasSebelum: number;
  perubahan: number;
  kuantitasSesudah: number;
  nomorReferensi: string | null;
  catatan: string | null;
  dibuatPada: string;
}

/**
 * Server Action: Mengambil seluruh inventaris stok SKU untuk tabel manajemen
 */
export async function ambilInventarisAdminAction(filter?: {
  cari?: string;
  hanyaKritis?: boolean;
}): Promise<{
  sukses: boolean;
  inventaris: ItemInventarisAdmin[];
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, inventaris: [], pesan: cek.pesan };
    }

    const kondisi: any[] = [];

    if (filter?.hanyaKritis) {
      kondisi.push(sql`${varianProduk.stok} <= 5`);
    }

    if (filter?.cari && filter.cari.trim()) {
      const q = `%${filter.cari.trim().toLowerCase()}%`;
      kondisi.push(
        or(
          sql`lower(${produk.nama}) LIKE ${q}`,
          sql`lower(${varianProduk.sku}) LIKE ${q}`,
          sql`lower(${varianProduk.warna}) LIKE ${q}`
        )
      );
    }

    const whereClause = kondisi.length > 0 ? and(...kondisi) : undefined;

    const rows = await db
      .select({
        id: varianProduk.id,
        produkId: produk.id,
        namaProduk: produk.nama,
        gambarUtama: produk.gambarUtama,
        ukuran: varianProduk.ukuran,
        warna: varianProduk.warna,
        sku: varianProduk.sku,
        stok: varianProduk.stok,
        beratGram: varianProduk.beratGram,
        harga: varianProduk.harga,
      })
      .from(varianProduk)
      .innerJoin(produk, eq(varianProduk.produkId, produk.id))
      .where(whereClause)
      .orderBy(varianProduk.stok, produk.nama);

    const hasil: ItemInventarisAdmin[] = rows.map((r) => ({
      id: r.id,
      produkId: r.produkId,
      namaProduk: r.namaProduk,
      gambarUtama: r.gambarUtama,
      kategori: "Streetwear",
      ukuran: r.ukuran,
      warna: r.warna,
      sku: r.sku,
      stok: r.stok,
      beratGram: r.beratGram,
      harga: r.harga,
      apakahKritis: r.stok <= 5,
    }));

    return { sukses: true, inventaris: hasil };
  } catch (error) {
    console.error("[ADMIN INVENTARIS] Gagal memuat data stok:", error);
    return { sukses: false, inventaris: [], pesan: "Gagal memuat inventaris." };
  }
}

/**
 * Server Action: Eksekusi penyesuaian stok fisik (Restock / Opname / Koreksi)
 * Menerapkan Compare-and-Set atomik dan pencatatan buku besar imutabel
 */
export async function mutasiStokAdminAction(input: {
  varianId: string;
  jenisMutasi: "restock" | "koreksi_fisik" | "retur" | "rusak";
  perubahan: number;
  nomorReferensi?: string;
  catatan?: string;
}): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const cek = await verifikasiHakAksesAdmin();
    if (!cek.sah || !cek.admin) {
      return { sukses: false, pesan: cek.pesan || "Akses tidak sah." };
    }

    const adminAktif = cek.admin;

    if (!Number.isInteger(input.perubahan) || input.perubahan === 0) {
      return { sukses: false, pesan: "Nilai perubahan stok harus berupa bilangan bulat bukan nol." };
    }

    if ((input.jenisMutasi === "restock" || input.jenisMutasi === "retur") && input.perubahan < 0) {
      return {
        sukses: false,
        pesan: `Jenis mutasi '${input.jenisMutasi}' harus menambah stok (nilai perubahan harus positif).`,
      };
    }

    if (input.jenisMutasi === "rusak" && input.perubahan > 0) {
      return {
        sukses: false,
        pesan: "Jenis mutasi 'rusak' harus mengurangi stok (nilai perubahan harus bernilai negatif).",
      };
    }

    const hasilTransaksi = await db.transaction(async (tx) => {
      const [varian] = await tx
        .select({
          id: varianProduk.id,
          stok: varianProduk.stok,
          sku: varianProduk.sku,
        })
        .from(varianProduk)
        .where(eq(varianProduk.id, input.varianId))
        .limit(1);

      if (!varian) {
        return { sukses: false, pesan: "Varian produk tidak ditemukan." };
      }

      const stokSebelum = varian.stok;
      const stokSesudah = stokSebelum + input.perubahan;

      if (stokSesudah < 0) {
        return {
          sukses: false,
          pesan: `Gagal: Stok tidak boleh bernilai negatif (Stok saat ini: ${stokSebelum}, pengurangan: ${Math.abs(input.perubahan)}).`,
        };
      }

      const [varianTerupdate] = await tx
        .update(varianProduk)
        .set({
          stok: stokSesudah,
          diperbaruiPada: new Date(),
        })
        .where(
          and(
            eq(varianProduk.id, input.varianId),
            eq(varianProduk.stok, stokSebelum)
          )
        )
        .returning({ id: varianProduk.id });

      if (!varianTerupdate) {
        return {
          sukses: false,
          pesan: "Gagal memperbarui stok: Nilai stok telah berubah oleh transaksi lain.",
        };
      }

      await tx.insert(riwayatMutasiStok).values({
        varianId: input.varianId,
        adminId: adminAktif.id,
        jenisMutasi: input.jenisMutasi,
        kuantitasSebelum: stokSebelum,
        perubahan: input.perubahan,
        kuantitasSesudah: stokSesudah,
        nomorReferensi: input.nomorReferensi || null,
        catatan: input.catatan || null,
      });

      await tx.insert(auditAktivitasAdmin).values({
        adminId: adminAktif.id,
        tindakan: "mutasi_stok_manual",
        targetId: varian.sku,
        payloadAman: {
          jenisMutasi: input.jenisMutasi,
          perubahan: input.perubahan,
          stokSebelum,
          stokSesudah,
        },
      });

      return {
        sukses: true,
        pesan: `Stok SKU ${varian.sku} berhasil disesuaikan (${stokSebelum} ke ${stokSesudah} unit).`,
      };
    });

    return hasilTransaksi;
  } catch (error) {
    console.error("[MUTASI STOK] Gagal memperbarui stok:", error);
    return {
      sukses: false,
      pesan: "Gagal menyesuaikan stok karena kendala server.",
    };
  }
}

/**
 * Server Action: Mengambil riwayat buku besar mutasi stok
 */
export async function ambilRiwayatMutasiStokAction(filter?: {
  varianId?: string;
}): Promise<{
  sukses: boolean;
  mutasi: BarisMutasiStok[];
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, mutasi: [], pesan: cek.pesan };
    }

    const whereClause = filter?.varianId
      ? eq(riwayatMutasiStok.varianId, filter.varianId)
      : undefined;

    const rows = await db
      .select({
        id: riwayatMutasiStok.id,
        namaProduk: produk.nama,
        ukuran: varianProduk.ukuran,
        warna: varianProduk.warna,
        sku: varianProduk.sku,
        jenisMutasi: riwayatMutasiStok.jenisMutasi,
        kuantitasSebelum: riwayatMutasiStok.kuantitasSebelum,
        perubahan: riwayatMutasiStok.perubahan,
        kuantitasSesudah: riwayatMutasiStok.kuantitasSesudah,
        nomorReferensi: riwayatMutasiStok.nomorReferensi,
        catatan: riwayatMutasiStok.catatan,
        dibuatPada: riwayatMutasiStok.dibuatPada,
      })
      .from(riwayatMutasiStok)
      .innerJoin(varianProduk, eq(riwayatMutasiStok.varianId, varianProduk.id))
      .innerJoin(produk, eq(varianProduk.produkId, produk.id))
      .where(whereClause)
      .orderBy(desc(riwayatMutasiStok.dibuatPada))
      .limit(100);

    const hasil: BarisMutasiStok[] = rows.map((r) => ({
      id: r.id,
      namaProduk: r.namaProduk,
      namaVarian: `${r.warna} / ${r.ukuran}`,
      sku: r.sku,
      adminNama: "Staf Logistik",
      jenisMutasi: r.jenisMutasi,
      kuantitasSebelum: r.kuantitasSebelum,
      perubahan: r.perubahan,
      kuantitasSesudah: r.kuantitasSesudah,
      nomorReferensi: r.nomorReferensi,
      catatan: r.catatan,
      dibuatPada: new Date(r.dibuatPada).toISOString(),
    }));

    return { sukses: true, mutasi: hasil };
  } catch (error) {
    console.error("[MUTASI STOK] Gagal memuat buku besar mutasi:", error);
    return { sukses: false, mutasi: [], pesan: "Gagal memuat buku besar mutasi." };
  }
}
