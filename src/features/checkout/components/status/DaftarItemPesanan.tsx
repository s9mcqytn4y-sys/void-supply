"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import type { ItemPesananStatus } from "@/features/checkout/actions/status-pesanan.action";

interface PropsDaftarItemPesanan {
  items: ItemPesananStatus[];
}

export function DaftarItemPesanan({ items }: PropsDaftarItemPesanan) {
  const totalKuantitas = items.reduce((acc, i) => acc + i.jumlah, 0);

  return (
    <div className="mt-8">
      <h2 className="border-b border-neutral-800 pb-2 font-mono text-xs font-bold text-white uppercase tracking-wider">
        ARTIKEL PESANAN ({totalKuantitas} UNIT)
      </h2>
      <ul className="mt-3 divide-y divide-neutral-900 font-mono text-xs">
        {items.map((item) => {
          const isBundle = item.sku.toLowerCase().includes("bundle");
          const isPreOrder = item.sku.toLowerCase().includes("po") || isBundle;

          return (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{item.namaProduk}</p>
                  {isBundle ? (
                    <span className="border border-amber-500/40 bg-amber-950/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 uppercase">
                      BUNDLE
                    </span>
                  ) : isPreOrder ? (
                    <span className="border border-blue-500/40 bg-blue-950/30 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase">
                      PRE-ORDER
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {item.namaVarian} // SKU: {item.sku} &times; {item.jumlah}
                </p>
              </div>
              <span className="font-bold text-white shrink-0 sm:text-right">
                {formatRupiah(item.subtotalItem)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
