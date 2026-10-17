"use client";

import React from "react";
import { useKeranjangStore } from "@/features/cart/stores/keranjang.store";
import { useI18n } from "@/lib/i18n";

export function CartButton() {
  const toggleBuka = useKeranjangStore((state) => state.toggleBuka);
  const totalItem = useKeranjangStore((state) =>
    state.items.reduce((total, item) => total + item.jumlah, 0)
  );
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleBuka}
      aria-label={`Buka keranjang belanja, terdapat ${totalItem} artikel`}
      className="relative inline-flex min-h-11 items-center gap-2 border border-neutral-800 bg-neutral-900 px-3.5 py-2 font-mono text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:border-neutral-600 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <span>{t.nav.bag}</span>
      <span
        className={`flex h-5 min-w-5 items-center justify-center px-1 font-mono text-[11px] font-bold ${
          totalItem > 0 ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"
        }`}
      >
        {totalItem}
      </span>
    </button>
  );
}
