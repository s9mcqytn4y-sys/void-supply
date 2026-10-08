import { z } from "zod";

// 1. Skema Validasi Status Domain (Enum)
export const statusProdukSkema = z.enum(["draft", "aktif", "habis", "arsip"], {
  errorMap: () => ({ message: "Status produk harus salah satu dari: draft, aktif, habis, arsip" }),
});

// 2. Skema Validasi Varian Fisik
export const varianProdukSkema = z.object({
  id: z.string().uuid("Format ID varian tidak valid"),
  ukuran: z.string().min(1, "Ukuran busana wajib ditentukan"),
  warna: z.string().min(1, "Pilihan warna busana wajib ditentukan"),
  sku: z.string().min(3, "SKU harus minimal 3 karakter"),
  stok: z.number().int().nonnegative("Stok tidak boleh bernilai negatif"),
  beratGram: z.number().int().positive("Berat garmen harus lebih dari 0 gram"),
  harga: z.number().int().positive("Harga varian harus lebih dari Rp 0"),
});

// 3. Skema Validasi Filter & Parameter Query Katalog
export const filterKatalogSkema = z.object({
  kategori: z.string().optional(),
  koleksi: z.string().optional(),
  urutan: z
    .enum(["terbaru", "harga_rendah", "harga_tinggi"], {
      errorMap: () => ({ message: "Opsi urutan tidak valid" }),
    })
    .default("terbaru"),
  pencarian: z.string().max(100, "Kata kunci pencarian maksimal 100 karakter").optional(),
});

// 4. Skema Validasi Seleksi Varian & Penambahan ke Keranjang
export const pilihVarianSkema = z.object({
  produkId: z.string().uuid("Format ID produk tidak valid"),
  ukuran: z.string().min(1, "Ukuran pakaian wajib dipilih"),
  kuantitas: z
    .number()
    .int("Kuantitas harus bilangan bulat")
    .positive("Kuantitas minimal 1 unit")
    .max(10, "Maksimal 10 unit per artikel dalam satu pesanan")
    .default(1),
});

export const tambahKeranjangSkema = z.object({
  varianId: z.string().uuid("ID varian tidak valid"),
  jumlah: z
    .number()
    .int("Jumlah unit harus bilangan bulat")
    .min(1, "Jumlah minimal 1 pcs")
    .max(10, "Maksimal pemesanan 10 pcs per artikel drop"),
});

// TypeScript Inference
export type StatusProdukInput = z.infer<typeof statusProdukSkema>;
export type VarianProdukInput = z.infer<typeof varianProdukSkema>;
export type FilterKatalog = z.infer<typeof filterKatalogSkema>;
export type PilihVarianInput = z.infer<typeof pilihVarianSkema>;
export type TambahKeranjangInput = z.infer<typeof tambahKeranjangSkema>;
