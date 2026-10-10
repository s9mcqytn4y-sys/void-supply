"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useKeranjangStore } from "../stores/keranjang.store";
import { ItemKeranjangCard } from "./ItemKeranjangCard";

export function RingkasanKeranjang() {
  const items = useKeranjangStore((state) => state.items);
  const apakahBuka = useKeranjangStore((state) => state.apakahBuka);
  const setBuka = useKeranjangStore((state) => state.setBuka);
  const kosongkan = useKeranjangStore((state) => state.kosongkan);
  const hitungTotalItem = useKeranjangStore((state) => state.hitungTotalItem);
  const hitungSubtotalIdr = useKeranjangStore((state) => state.hitungSubtotalIdr);

  const drawerRef = useRef<HTMLDivElement>(null);
  const totalItem = hitungTotalItem();
  const subtotalIdr = hitungSubtotalIdr();

  // Aksesibilitas: Keyboard Escape & Focus Management
  useEffect(() => {
    if (!apakahBuka) return;

    document.body.style.overflow = "hidden";

    function tanganiKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setBuka(false);
        return;
      }

      // Focus trap
      if (e.key === "Tab" && drawerRef.current) {
        const elemenFokus = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!elemenFokus || elemenFokus.length === 0) return;

        const pertama = elemenFokus[0];
        const terakhir = elemenFokus[elemenFokus.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === pertama) {
            e.preventDefault();
            terakhir.focus();
          }
        } else {
          if (document.activeElement === terakhir) {
            e.preventDefault();
            pertama.focus();
          }
        }
      }
    }

    window.addEventListener("keydown", tanganiKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tanganiKeyDown);
    };
  }, [apakahBuka, setBuka]);

  if (!apakahBuka) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-drawer-keranjang"
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs"
      onClick={() => setBuka(false)}
    >
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-md flex-col border-l border-neutral-800 bg-neutral-950 p-6 shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h2 id="judul-drawer-keranjang" className="font-mono text-sm font-bold text-white uppercase">
              KERANJANG BELANJA
            </h2>
            <p className="font-mono text-xs text-neutral-400">
              {totalItem} artikel dipilih // Maksimal 10 unit per SKU
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBuka(false)}
            aria-label="Tutup keranjang belanja"
            className="flex h-9 w-9 items-center justify-center border border-neutral-800 font-mono text-xs text-neutral-400 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            ✕
          </button>
        </div>

        {/* Isi Keranjang atau Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="h-12 w-12 border border-dashed border-neutral-700 flex items-center justify-center font-mono text-xs text-neutral-400 mb-4">
              [Ø]
            </div>
            <p className="font-mono text-xs font-semibold text-neutral-300 uppercase">
              KERANJANG BELANJA KOSONG
            </p>
            <p className="mt-1 max-w-xs text-xs text-neutral-400">
              Belum ada artikel busana yang Anda pilih dari rilisan Drop 04.
            </p>
            <Link
              href="/katalog"
              onClick={() => setBuka(false)}
              className="mt-6 inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-semibold text-black uppercase transition-colors hover:bg-neutral-200"
            >
              JELAJAHI KATALOG
            </Link>
          </div>
        ) : (
          <>
            {/* Daftar Item Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1">
              {items.map((item) => (
                <ItemKeranjangCard key={item.varianId} item={item} />
              ))}
            </div>

            {/* Footer Ringkasan Biaya & Checkout */}
            <div className="border-t border-neutral-800 pt-4">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <span className="text-neutral-400">SUBTOTAL ESTIMASI:</span>
                <span className="text-sm font-bold text-white">{formatRupiah(subtotalIdr)}</span>
              </div>
              <p className="font-mono text-[10px] text-neutral-400">
                Ongkos kirim kurir terverifikasi (Biteship) dan pembayaran online akan dihitung pada tahap checkout.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={() => setBuka(false)}
                  className="flex min-h-11 w-full items-center justify-center border border-white bg-white font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  LANJUT KE PEMBAYARAN ({formatRupiah(subtotalIdr)})
                </Link>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={kosongkan}
                  className="min-h-11 w-full font-mono text-xs text-neutral-400 hover:text-rose-400"
                >
                  KOSONGKAN KERANJANG
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
