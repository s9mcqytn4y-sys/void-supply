"use client";

import { useState } from "react";
import type { VarianProdukItem } from "../types/product.type";
import { Button } from "@/components/ui/button";
import { PanduanUkuran } from "./PanduanUkuran";

export interface PropertiPemilihVarian {
  kategori: string;
  varian: readonly VarianProdukItem[];
  apakahHabisTotal: boolean;
}

export function PemilihVarian({
  kategori,
  varian,
  apakahHabisTotal,
}: PropertiPemilihVarian) {
  // Urutkan varian jika perlu dan cari varian default pertama yang tersedia
  const varianPertamaTersedia = varian.find((v) => v.stok > 0);
  const [varianTerpilihId, setVarianTerpilihId] = useState<string | null>(
    varianPertamaTersedia ? varianPertamaTersedia.id : varian[0]?.id ?? null
  );

  const varianAktif = varian.find((v) => v.id === varianTerpilihId);
  const apakahVarianHabis = !varianAktif || varianAktif.stok <= 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Pemilihan Ukuran + Link Modal Panduan Ukuran */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            PILIH UKURAN {varianAktif ? `// [${varianAktif.ukuran}]` : ""}
          </label>
          <PanduanUkuran kategori={kategori} />
        </div>

        {/* Grid Ukuran Buttons */}
        <div
          role="radiogroup"
          aria-label="Pilihan ukuran produk"
          className="grid grid-cols-5 gap-2 sm:gap-3"
        >
          {varian.map((v) => {
            const isTersedia = v.stok > 0;
            const isSelected = v.id === varianTerpilihId;

            const buttonStateClass =
              isSelected && isTersedia
                ? "border-white bg-white text-black ring-1 ring-white"
                : isTersedia
                  ? "border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:text-white active:scale-98"
                  : "cursor-not-allowed border-neutral-900 bg-neutral-950 text-neutral-600 line-through opacity-50";

            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!isTersedia}
                onClick={() => setVarianTerpilihId(v.id)}
                className={`flex min-h-11 flex-col items-center justify-center border font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${buttonStateClass}`}
              >
                <span>{v.ukuran}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Indikator Status Stok Aktual Real-time */}
      <div className="flex items-center justify-between border-t border-b border-neutral-800/80 py-3 font-mono text-xs">
        <span className="text-neutral-400">STATUS INVENTARIS:</span>
        {apakahHabisTotal ? (
          <span className="font-semibold text-rose-400">SELURUH VARIAN TELAH HABIS</span>
        ) : apakahVarianHabis ? (
          <span className="font-semibold text-neutral-500">UKURAN INI HABIS</span>
        ) : varianAktif && varianAktif.stok < 10 ? (
          <span className="font-semibold text-amber-400">
            SISA {varianAktif.stok} UNIT DI GUDANG
          </span>
        ) : (
          <span className="font-semibold text-emerald-400">STOK TERSEDIA (SIAP KIRIM)</span>
        )}
      </div>

      {/* 3. Tombol Aksi Tambah ke Keranjang */}
      <Button
        type="button"
        variant={apakahVarianHabis || apakahHabisTotal ? "secondary" : "primary"}
        size="lg"
        disabled={apakahVarianHabis || apakahHabisTotal}
        className="w-full text-xs tracking-widest sm:text-sm"
      >
        {apakahHabisTotal
          ? "PRODUK DIARSIPKAN // HABIS"
          : apakahVarianHabis
            ? "UKURAN TIDAK TERSEDIA"
            : "TAMBAH KE KERANJANG"}
      </Button>
    </div>
  );
}
