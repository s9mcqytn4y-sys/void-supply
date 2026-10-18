import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

export interface PesananAktifData {
  nomorPesanan: string;
  totalAkhir: number;
  dibuatPada: number;
  kedaluwarsaPada: number;
  tokenAkses?: string;
}

export interface PesananAktifState {
  pesananAktif: PesananAktifData | null;
  tersembunyi: boolean;
}

export interface PesananAktifActions {
  setPesananAktif: (data: PesananAktifData) => void;
  sembunyikanBanner: () => void;
  tampilkanBanner: () => void;
  bersihkanPesananAktif: () => void;
}

export type PesananAktifStore = PesananAktifState & PesananAktifActions;

export const usePesananAktifStore = create<PesananAktifStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        pesananAktif: null,
        tersembunyi: false,

        setPesananAktif: (data: PesananAktifData) =>
          set({
            pesananAktif: data,
            tersembunyi: false,
          }),

        sembunyikanBanner: () =>
          set({
            tersembunyi: true,
          }),

        tampilkanBanner: () =>
          set({
            tersembunyi: false,
          }),

        bersihkanPesananAktif: () =>
          set({
            pesananAktif: null,
            tersembunyi: false,
          }),
      }),
      {
        name: "void_pesanan_aktif_storage",
      }
    )
  )
);
