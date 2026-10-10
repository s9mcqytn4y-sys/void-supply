import { create } from "zustand";
import type { ItemKeranjang, InputItemKeranjang, HasilAksiKeranjang } from "../types/cart.type";

export const BATAS_MAKSIMAL_PER_SKU = 10;

export function apakahJumlahItemValid(jumlah: number): boolean {
  return Number.isInteger(jumlah) && jumlah >= 1 && jumlah <= BATAS_MAKSIMAL_PER_SKU;
}

export interface KeranjangState {
  items: ItemKeranjang[];
  apakahBuka: boolean;

  // Aksi-aksi Keranjang
  tambahItem: (item: InputItemKeranjang) => HasilAksiKeranjang;
  ubahJumlah: (varianId: string, jumlah: number) => HasilAksiKeranjang;
  hapusItem: (varianId: string) => void;
  kosongkan: () => void;
  setBuka: (buka: boolean) => void;
  toggleBuka: () => void;

  // Selectors / Getters
  hitungTotalItem: () => number;
  hitungSubtotalIdr: () => number;
}

export const useKeranjangStore = create<KeranjangState>((set, get) => ({
  items: [],
  apakahBuka: false,

  setBuka: (buka: boolean) => set({ apakahBuka: buka }),
  toggleBuka: () => set((state) => ({ apakahBuka: !state.apakahBuka })),

  tambahItem: (itemBaru: InputItemKeranjang): HasilAksiKeranjang => {
    if (!apakahJumlahItemValid(itemBaru.jumlah)) {
      return {
        sukses: false,
        pesan: `Jumlah pesanan harus bernilai antara 1 hingga ${BATAS_MAKSIMAL_PER_SKU} unit.`,
      };
    }

    const state = get();
    const itemEksis = state.items.find((x) => x.varianId === itemBaru.varianId);

    if (itemEksis) {
      const totalAkumulasi = itemEksis.jumlah + itemBaru.jumlah;
      if (totalAkumulasi > BATAS_MAKSIMAL_PER_SKU) {
        return {
          sukses: false,
          pesan: `Batas maksimal pemesanan adalah ${BATAS_MAKSIMAL_PER_SKU} unit per SKU. Saat ini di keranjang sudah terdapat ${itemEksis.jumlah} unit.`,
        };
      }

      set({
        items: state.items.map((x) =>
          x.varianId === itemBaru.varianId ? { ...x, jumlah: totalAkumulasi } : x
        ),
      });

      return {
        sukses: true,
        pesan: `Berhasil menambahkan ${itemBaru.jumlah} unit lagi ke keranjang. Total: ${totalAkumulasi} unit.`,
      };
    }

    set({
      items: [...state.items, itemBaru],
    });

    return {
      sukses: true,
      pesan: `Berhasil memasukkan ${itemBaru.jumlah}x ${itemBaru.nama} (${itemBaru.ukuran}) ke keranjang belanja.`,
    };
  },

  ubahJumlah: (varianId: string, jumlah: number): HasilAksiKeranjang => {
    if (!apakahJumlahItemValid(jumlah)) {
      return {
        sukses: false,
        pesan: `Jumlah unit harus bernilai antara 1 hingga ${BATAS_MAKSIMAL_PER_SKU}.`,
      };
    }

    const state = get();
    const targetItem = state.items.find((x) => x.varianId === varianId);
    if (!targetItem) {
      return {
        sukses: false,
        pesan: "Item tidak ditemukan di dalam keranjang belanja.",
      };
    }

    set({
      items: state.items.map((x) => (x.varianId === varianId ? { ...x, jumlah } : x)),
    });

    return {
      sukses: true,
      pesan: `Jumlah item berhasil diubah menjadi ${jumlah} unit.`,
    };
  },

  hapusItem: (varianId: string) => {
    set((state) => ({
      items: state.items.filter((x) => x.varianId !== varianId),
    }));
  },

  kosongkan: () => {
    set({ items: [] });
  },

  hitungTotalItem: () => {
    return get().items.reduce((total, item) => total + item.jumlah, 0);
  },

  hitungSubtotalIdr: () => {
    return get().items.reduce(
      (total, item) => total + item.hargaTampilanIdr * item.jumlah,
      0
    );
  },
}));
