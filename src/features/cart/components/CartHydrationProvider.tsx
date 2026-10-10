"use client";

import { useEffect, type ReactNode } from "react";
import { useKeranjangStore } from "../stores/keranjang.store";
import { rekonsiliasiKeranjang } from "../actions/reconciliation.action";

interface CartHydrationProviderProps {
  children: ReactNode;
}

/**
 * Provider Hidrasi & Rekonsiliasi Keranjang Belanja (Module 02.13)
 * Menangani SSR-safe hydration tanpa mismatch render, listener sync multi-tab,
 * dan rekonsiliasi otomatis ke basis data PostgreSQL.
 */
export function CartHydrationProvider({ children }: CartHydrationProviderProps) {
  useEffect(() => {
    // 1. Pulihkan data state dari LocalStorage setelah client mount
    useKeranjangStore.persist.rehydrate();
    useKeranjangStore.getState().setHydrated(true);

    // 2. Jalankan rekonsiliasi stok & harga terhadap PostgreSQL jika ada item
    const itemsAwal = useKeranjangStore.getState().items;
    if (itemsAwal.length > 0) {
      useKeranjangStore.getState().setSedangRekonsiliasi(true);
      rekonsiliasiKeranjang({
        items: itemsAwal.map((i) => ({ varianId: i.varianId, jumlah: i.jumlah })),
      })
        .then((hasil) => {
          if (hasil.sukses && hasil.apakahAdaPerubahan) {
            useKeranjangStore.getState().terapkanHasilRekonsiliasi(hasil);
          }
        })
        .catch((err) => {
          console.warn("⚠️ Rekonsiliasi awal latar belakang dilewati:", err);
        })
        .finally(() => {
          useKeranjangStore.getState().setSedangRekonsiliasi(false);
        });
    }

    // 3. Listener Sinkronisasi Multi-Tab (Storage Event)
    function sinkronkanAntarTab(e: StorageEvent) {
      if (e.key === "void-supply-cart") {
        useKeranjangStore.persist.rehydrate();
      }
    }

    window.addEventListener("storage", sinkronkanAntarTab);
    return () => {
      window.removeEventListener("storage", sinkronkanAntarTab);
    };
  }, []);

  return <>{children}</>;
}
