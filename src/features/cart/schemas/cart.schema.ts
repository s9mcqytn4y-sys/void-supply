import { z } from "zod";
import { BATAS_MAKSIMAL_PER_SKU } from "../types/cart.type";

/**
 * Skema validasi runtime data keranjang tersimpan di LocalStorage (Module 02.13)
 * Mencegah data tampered, corrupted, atau tipe tidak sesuai yang dapat menyebabkan crash aplikasi.
 */
export const itemKeranjangTersimpanSkema = z.object({
  varianId: z.string().min(1, "Varian ID wajib ada"),
  produkId: z.string().min(1, "Produk ID wajib ada"),
  nama: z.string().min(1, "Nama produk wajib ada"),
  slug: z.string().min(1, "Slug wajib ada"),
  gambar: z.string().min(1, "Gambar wajib ada"),
  sku: z.string().min(1, "SKU wajib ada"),
  ukuran: z.string().min(1, "Ukuran wajib ada"),
  warna: z.string().min(1, "Warna wajib ada"),
  hargaTampilanIdr: z.number().int().nonnegative("Harga tidak boleh negatif"),
  jumlah: z
    .number()
    .int()
    .min(1, "Jumlah minimal 1 unit")
    .max(BATAS_MAKSIMAL_PER_SKU, `Jumlah maksimal ${BATAS_MAKSIMAL_PER_SKU} unit`),
});

export const stateKeranjangTersimpanSkema = z.object({
  items: z.array(itemKeranjangTersimpanSkema),
});

export type ItemKeranjangTersimpan = z.infer<typeof itemKeranjangTersimpanSkema>;
export type StateKeranjangTersimpan = z.infer<typeof stateKeranjangTersimpanSkema>;

/**
 * Skema Niat Pembelian Minimum (Browser to Server Contract)
 * Browser hanya mengirimkan niat (intent): varianId + jumlah yang diinginkan.
 * Server bertanggung jawab 100% memvalidasi SKU, harga riil, dan ketersediaan stok database.
 */
export const niatItemKeranjangSkema = z.object({
  varianId: z.string().uuid("Varian ID harus berupa UUID valid"),
  jumlah: z.number().int().min(1).max(BATAS_MAKSIMAL_PER_SKU),
});

export const permintaanRekonsiliasiSkema = z.object({
  items: z.array(niatItemKeranjangSkema),
});

export type NiatItemKeranjang = z.infer<typeof niatItemKeranjangSkema>;
export type PermintaanRekonsiliasi = z.infer<typeof permintaanRekonsiliasiSkema>;
