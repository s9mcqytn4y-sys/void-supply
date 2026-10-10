/**
 * Domain Type Definition: Keranjang Belanja (Module 02.12)
 * VOID Supply E-Commerce
 */

export const BATAS_MAKSIMAL_PER_SKU = 10;

export type StatusKetersediaanItem = "tersedia" | "stok_kurang" | "habis" | "tidak_ditemukan";

export interface ItemKeranjang {
  readonly varianId: string;
  readonly produkId: string;
  readonly nama: string;
  readonly slug: string;
  readonly gambar: string;
  readonly sku: string;
  readonly ukuran: string;
  readonly warna: string;
  readonly hargaTampilanIdr: number;
  readonly jumlah: number;
  readonly statusKetersediaan?: StatusKetersediaanItem;
  readonly stokTersediaServer?: number;
}

export type InputItemKeranjang = Omit<ItemKeranjang, "jumlah"> & {
  jumlah: number;
};

export interface HasilAksiKeranjang {
  sukses: boolean;
  pesan: string;
}

export interface ItemHasilRekonsiliasi {
  varianId: string;
  produkId: string;
  nama: string;
  slug: string;
  gambar: string;
  sku: string;
  ukuran: string;
  warna: string;
  hargaServerIdr: number;
  jumlahDiminta: number;
  jumlahDisetujui: number;
  beratGram: number;
  stokAktual: number;
  status: StatusKetersediaanItem;
  pesan?: string;
}

export interface HasilRekonsiliasiKeranjang {
  sukses: boolean;
  pesan: string;
  items: ItemHasilRekonsiliasi[];
  subtotalServerIdr: number;
  totalBeratGram: number;
  apakahAdaPerubahan: boolean;
}
