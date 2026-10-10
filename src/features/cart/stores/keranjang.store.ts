import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type ItemKeranjang,
  type InputItemKeranjang,
  type HasilAksiKeranjang,
  type HasilRekonsiliasiKeranjang,
  BATAS_MAKSIMAL_PER_SKU,
} from "../types/cart.type";
import { stateKeranjangTersimpanSkema } from "../schemas/cart.schema";

export { BATAS_MAKSIMAL_PER_SKU };

export function apakahJumlahItemValid(jumlah: number): boolean {
  return Number.isInteger(jumlah) && jumlah >= 1 && jumlah <= BATAS_MAKSIMAL_PER_SKU;
}

export interface KeranjangState {
  items: ItemKeranjang[];
  apakahBuka: boolean;
  apakahHydrated: boolean;
  sedangRekonsiliasi: boolean;

  // Aksi-aksi Keranjang
  tambahItem: (item: InputItemKeranjang) => HasilAksiKeranjang;
  ubahJumlah: (varianId: string, jumlah: number) => HasilAksiKeranjang;
  hapusItem: (varianId: string) => void;
  kosongkan: () => void;
  setBuka: (buka: boolean) => void;
  toggleBuka: () => void;
  setHydrated: (hydrated: boolean) => void;
  setSedangRekonsiliasi: (status: boolean) => void;
  terapkanHasilRekonsiliasi: (hasil: HasilRekonsiliasiKeranjang) => void;

  // Selectors / Getters
  hitungTotalItem: () => number;
  hitungSubtotalIdr: () => number;
}

export const useKeranjangStore = create<KeranjangState>()(
  persist(
    (set, get) => ({
      items: [],
      apakahBuka: false,
      apakahHydrated: false,
      sedangRekonsiliasi: false,

      setBuka: (buka: boolean) => set({ apakahBuka: buka }),
      toggleBuka: () => set((state) => ({ apakahBuka: !state.apakahBuka })),
      setHydrated: (hydrated: boolean) => set({ apakahHydrated: hydrated }),
      setSedangRekonsiliasi: (status: boolean) => set({ sedangRekonsiliasi: status }),

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

      terapkanHasilRekonsiliasi: (hasil: HasilRekonsiliasiKeranjang) => {
        if (!hasil.sukses) return;

        // Petakan item hasil rekonsiliasi yang disetujui server
        const itemBaru: ItemKeranjang[] = hasil.items
          .filter((item) => item.status === "tersedia" || item.status === "stok_kurang")
          .map((item) => ({
            varianId: item.varianId,
            produkId: item.produkId,
            nama: item.nama,
            slug: item.slug,
            gambar: item.gambar,
            sku: item.sku,
            ukuran: item.ukuran,
            warna: item.warna,
            hargaTampilanIdr: item.hargaServerIdr, // Selalu gunakan harga resmi dari server
            jumlah: item.jumlahDisetujui,
            statusKetersediaan: item.status,
            stokTersediaServer: item.stokAktual,
          }));

        set({ items: itemBaru });
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
    }),
    {
      name: "void-supply-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          console.warn("⚠️ Gagal memulihkan keranjang dari storage. Mengosongkan keranjang.");
          return;
        }

        // Validasi runtime isi LocalStorage dengan Zod untuk mencegah tampering / data corrupt
        const validasi = stateKeranjangTersimpanSkema.safeParse({ items: state.items });
        if (!validasi.success) {
          console.warn(
            "⚠️ Format data keranjang di LocalStorage tidak valid atau telah dimodifikasi. Mengosongkan keranjang belanja secara aman."
          );
          state.items = [];
        }
      },
    }
  )
);
