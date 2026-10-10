"use client";

import Link from "next/link";
import Image from "next/image";
import { useKeranjangStore } from "@/features/cart/stores/keranjang.store";

export function HeaderToko() {
  const toggleBuka = useKeranjangStore((state) => state.toggleBuka);
  // Reaktif terhadap perubahan isi keranjang (state.items) sesuai rekomendasi Zustand
  const totalItem = useKeranjangStore((state) =>
    state.items.reduce((total, item) => total + item.jumlah, 0)
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/90 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Kembali ke Beranda VOID Supply"
        >
          <div className="relative h-7 w-40 sm:h-8 sm:w-48">
            <Image
              src="/images/brand/void-logo.svg"
              alt="VOID Supply Logo"
              fill
              priority
              className="object-contain object-left transition-opacity group-hover:opacity-90"
            />
          </div>
        </Link>

        {/* Navigasi Utama */}
        <nav
          aria-label="Navigasi Utama Toko"
          className="flex items-center gap-4 sm:gap-8"
        >
          <Link
            href="/katalog"
            className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            KATALOG
          </Link>
          <Link
            href="/#manifesto"
            className="hidden font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-white sm:inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            MANIFESTO
          </Link>

          {/* Tombol Keranjang Belanja dengan Badge Counter */}
          <button
            type="button"
            onClick={toggleBuka}
            aria-label={`Buka keranjang belanja, terdapat ${totalItem} artikel`}
            className="relative inline-flex min-h-11 items-center gap-2 border border-neutral-800 bg-neutral-900 px-3.5 py-2 font-mono text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:border-neutral-600 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>BAG</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center px-1 font-mono text-[11px] font-bold ${
                totalItem > 0 ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {totalItem}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
