"use client";

import { useEffect, type ReactNode } from "react";
import { useKeranjangStore } from "../stores/keranjang.store";
import { rekonsiliasiKeranjang } from "../actions/reconciliation.action";

interface CartHydrationProviderProps {
  children: ReactNode;
}

/**
 * Provider Hidrasi & Rekonsiliasi Keranjang Belanja (Module 02.13 & 02.14)
 * Menangani SSR-safe hydration:
 * 1. Menunggu hingga proses rehydrate() selesai sepenuhnya sebelum menetapkan apakahHydrated = true
 * 2. Mencegah rekonsiliasi lambat (stale reconciliation race condition) menimpa mutasi baru pengguna
 * 3. Sinkronisasi multi-tab lewat event storage
 */
export function CartHydrationProvider({ children }: CartHydrationProviderProps) {
  useEffect(() => {
    let dibatalkan = false;

    async function inisialisasiHidrasiDanRekonsiliasi() {
      try {
        // 1. Tunggu proses rehidrasi LocalStorage selesai
        await useKeranjangStore.persist.rehydrate();
        if (dibatalkan) return;

        useKeranjangStore.getState().setHydrated(true);

        // 2. Ambil snapshot state setelah rehydrate selesai
        const stateAwal = useKeranjangStore.getState();
        const itemsAwal = stateAwal.items;
        const waktuSnapshot = stateAwal.terakhirDiubah;

        if (itemsAwal.length > 0) {
          useKeranjangStore.getState().setSedangRekonsiliasi(true);

          try {
            const hasil = await rekonsiliasiKeranjang({
              items: itemsAwal.map((i) => ({ varianId: i.varianId, jumlah: i.jumlah })),
            });

            if (dibatalkan) return;

            // 3. Race condition guard: Pastikan pengguna belum melakukan perubahan keranjang selama request berlangsung
            const stateTerkini = useKeranjangStore.getState();
            if (stateTerkini.terakhirDiubah === waktuSnapshot) {
              if (hasil.sukses && hasil.apakahAdaPerubahan) {
                stateTerkini.terapkanHasilRekonsiliasi(hasil);
              }
            } else {
              console.info(
                "Rekonsiliasi awal diabaikan karena item keranjang telah dimutasi oleh pengguna sebelum respons tiba."
              );
            }
          } catch (err) {
            console.warn("Rekonsiliasi keranjang latar belakang dilewati:", err);
          } finally {
            if (!dibatalkan) {
              useKeranjangStore.getState().setSedangRekonsiliasi(false);
            }
          }
        }
      } catch (err) {
        console.error("Gagal saat memulihkan keranjang belanja:", err);
      }
    }

    inisialisasiHidrasiDanRekonsiliasi();

    // 4. Listener Sinkronisasi Multi-Tab (Storage Event)
    function sinkronkanAntarTab(e: StorageEvent) {
      if (e.key === "void-supply-cart") {
        useKeranjangStore.persist.rehydrate();
      }
    }

    window.addEventListener("storage", sinkronkanAntarTab);
    return () => {
      dibatalkan = true;
      window.removeEventListener("storage", sinkronkanAntarTab);
    };
  }, []);

  return <>{children}</>;
}
