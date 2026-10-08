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
  readonly gambarUtama: string;
  readonly galeriGambar: readonly string[];
  readonly varian: readonly VarianProdukItem[];
}
