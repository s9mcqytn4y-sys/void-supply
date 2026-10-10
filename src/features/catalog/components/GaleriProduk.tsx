"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PropertiGaleriProduk {
  namaProduk: string;
  gambarUtama: string;
  galeriGambar: readonly string[];
}

export function GaleriProduk({
  namaProduk,
  gambarUtama,
  galeriGambar,
}: PropertiGaleriProduk) {
  // Susun daftar unik gambar
  const daftarGambar = Array.from(new Set([gambarUtama, ...galeriGambar])).filter(Boolean);
  const [indeksAktif, setIndeksAktif] = useState(0);

  const gambarTerpilih = daftarGambar[indeksAktif] || gambarUtama;

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-6">
      {/* Thumbnail Bar (Bawah di Mobile, Kiri di Desktop) */}
      {daftarGambar.length > 1 && (
        <div
          role="tablist"
          aria-label="Pilihan sudut pandang foto produk"
          className="flex gap-3 overflow-x-auto pb-2 md:w-20 md:flex-col md:overflow-visible md:pb-0"
        >
          {daftarGambar.map((gambar, idx) => {
            const isAktif = idx === indeksAktif;
            return (
              <button
                key={gambar}
                type="button"
                role="tab"
                aria-selected={isAktif}
                aria-label={`Lihat tampilan foto ke-${idx + 1} dari ${namaProduk}`}
                onClick={() => setIndeksAktif(idx)}
                className={cn(
                  "relative aspect-4/5 w-16 shrink-0 overflow-hidden border bg-neutral-900 transition-all duration-200 md:w-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  isAktif
                    ? "border-white opacity-100 ring-1 ring-white"
                    : "border-neutral-800 opacity-60 hover:border-neutral-600 hover:opacity-90"
                )}
              >
                <Image
                  src={gambar}
                  alt={`Thumbnail sudut pandang ${idx + 1} ${namaProduk}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Focus Canvas: Rasio Editorial 4:5 */}
      <div className="relative aspect-4/5 w-full flex-1 overflow-hidden border border-neutral-800 bg-neutral-900">
        <Image
          src={gambarTerpilih}
          alt={`Foto utama ${namaProduk} sudut ${indeksAktif + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-opacity duration-300"
        />

        {/* Sudut Indikator Foto */}
        <div className="absolute right-3 bottom-3 border border-neutral-800/80 bg-neutral-950/80 px-2.5 py-1 font-mono text-[10px] tracking-widest text-neutral-300 uppercase backdrop-blur-sm">
          FOTO {indeksAktif + 1} / {daftarGambar.length}
        </div>
      </div>
    </div>
  );
}
