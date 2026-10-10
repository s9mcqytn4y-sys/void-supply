/**
 * Domain Type Definition: Keranjang Belanja (Module 02.12)
 * VOID Supply E-Commerce
 */

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
}

export type InputItemKeranjang = Omit<ItemKeranjang, "jumlah"> & {
  jumlah: number;
};

export interface HasilAksiKeranjang {
  sukses: boolean;
  pesan: string;
}
