import { z } from "zod";

export const filterKatalogSkema = z.object({
  kategori: z.string().optional(),
  koleksi: z.string().optional(),
  urutan: z.enum(["terbaru", "harga_rendah", "harga_tinggi"]).default("terbaru"),
  pencarian: z.string().optional(),
});

export const pilihVarianSkema = z.object({
  produkId: z.string().uuid(),
  ukuran: z.string().min(1, "Ukuran pakaian wajib dipilih"),
  kuantitas: z.number().int().positive().default(1),
});

export type FilterKatalog = z.infer<typeof filterKatalogSkema>;
export type PilihVarianInput = z.infer<typeof pilihVarianSkema>;
