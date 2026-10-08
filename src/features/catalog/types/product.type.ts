import type {
  produk,
  varianProduk,
  kategori,
  pelanggan,
  statusProdukEnum,
  statusPesananEnum,
  statusPembayaranEnum,
  statusPengirimanEnum,
} from "@/lib/db/schema";

// 1. Tipe Status Domain dari PostgreSQL Enum
export type StatusProduk = (typeof statusProdukEnum.enumValues)[number];
export type StatusPesanan = (typeof statusPesananEnum.enumValues)[number];
export type StatusPembayaran = (typeof statusPembayaranEnum.enumValues)[number];
export type StatusPengiriman = (typeof statusPengirimanEnum.enumValues)[number];

// 2. Tipe Database yang Di-infer langsung dari Skema Drizzle ORM
export type ProdukDatabase = typeof produk.$inferSelect;
export type VarianDatabase = typeof varianProduk.$inferSelect;
export type KategoriDatabase = typeof kategori.$inferSelect;
export type PelangganDatabase = typeof pelanggan.$inferSelect;

export type ProdukDenganRelasi = ProdukDatabase & {
  varian: VarianDatabase[];
  kategoriRelasi: KategoriDatabase | null;
};

// 3. Tipe Value Object & Representasi UI
export type UkuranProduk = "S" | "M" | "L" | "XL" | "XXL" | "ALL";

export interface VarianProdukItem {
  readonly id: string;
  readonly ukuran: string;
  readonly warna: string;
  readonly sku: string;
  readonly stok: number;
  readonly beratGram: number;
  readonly harga: number;
}

export interface ProdukRingkasan {
  readonly id: string;
  readonly nama: string;
  readonly slug: string;
  readonly kategori: string;
  readonly hargaDasar: number;
  readonly gambarUtama: string;
  readonly totalStok: number;
  readonly apakahHabis: boolean;
  readonly apakahStokMenipis: boolean;
  readonly ukuranTersedia: string[];
  readonly varian: readonly VarianProdukItem[];
}

export interface ProdukDetail {
  readonly id: string;
  readonly nama: string;
  readonly slug: string;
  readonly deskripsi: string;
  readonly kategori: string;
  readonly hargaDasar: number;
  readonly status: StatusProduk;
  readonly gambarUtama: string;
  readonly galeriGambar: readonly string[];
  readonly varian: readonly VarianProdukItem[];
}
