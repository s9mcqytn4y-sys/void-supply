"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface DimensiUkuran {
  ukuran: string;
  panjangBadan: number;
  lebarDada: number;
  panjangLengan: number;
}

const TABEL_DIMENSI_DEFAULT: DimensiUkuran[] = [
  { ukuran: "S", panjangBadan: 70, lebarDada: 52, panjangLengan: 23 },
  { ukuran: "M", panjangBadan: 72, lebarDada: 55, panjangLengan: 24 },
  { ukuran: "L", panjangBadan: 75, lebarDada: 58, panjangLengan: 25 },
  { ukuran: "XL", panjangBadan: 77, lebarDada: 61, panjangLengan: 26 },
  { ukuran: "XXL", panjangBadan: 79, lebarDada: 64, panjangLengan: 27 },
];

export function PanduanUkuran({ kategori = "T-Shirt" }: { kategori?: string }) {
  const [apakahBuka, setApakahBuka] = useState(false);

  // Keyboard accessibility: Tutup modal saat tombol Escape ditekan (Sesuai R-32)
  useEffect(() => {
    function tanganiKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && apakahBuka) {
        setApakahBuka(false);
      }
    }
    if (apakahBuka) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", tanganiKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tanganiKeyDown);
    };
  }, [apakahBuka]);

  return (
    <>
      <button
        type="button"
        onClick={() => setApakahBuka(true)}
        className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-400 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-haspopup="dialog"
        aria-expanded={apakahBuka}
      >
        <span>PANDUAN UKURAN (CM)</span>
      </button>

      {/* Modal Dialog Panduan Ukuran */}
      {apakahBuka && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-panduan-ukuran"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setApakahBuka(false)}
        >
          <div
            className="relative w-full max-w-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="font-mono text-[11px] tracking-widest text-neutral-400 uppercase">
                  SIZE CONFIDENCE // {kategori}
                </span>
                <h2 id="judul-panduan-ukuran" className="mt-1 text-xl font-bold text-white uppercase">
                  Tabel Dimensi Ukuran (CM)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setApakahBuka(false)}
                className="flex h-9 w-9 items-center justify-center border border-neutral-800 font-mono text-sm text-neutral-400 hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Tutup panduan ukuran"
              >
                ✕
              </button>
            </div>

            {/* Catatan Fit Karakteristik */}
            <div className="my-4 border-l-2 border-neutral-500 bg-neutral-900/50 p-3 text-xs leading-relaxed text-neutral-300">
              <strong className="font-semibold text-white">Potongan Boxy Streetwear:</strong> Pola
              dirancang dengan drop-shoulder dan siluet lebar. Gunakan ukuran asli untuk tampilan
              oversized kasual, atau turun satu ukuran jika menginginkan potongan tubuh yang lebih pas.
            </div>

            {/* Tabel Dimensi Pengukuran Nyata */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th scope="col" className="py-2.5 pr-4 font-semibold uppercase">
                      Ukuran
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold uppercase">
                      Panjang (cm)
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold uppercase">
                      Lebar Dada (cm)
                    </th>
                    <th scope="col" className="py-2.5 pl-4 font-semibold uppercase">
                      Lengan (cm)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-200">
                  {TABEL_DIMENSI_DEFAULT.map((item) => (
                    <tr key={item.ukuran} className="hover:bg-neutral-900/40">
                      <td className="py-3 pr-4 font-bold text-white">{item.ukuran}</td>
                      <td className="py-3 px-4">{item.panjangBadan}</td>
                      <td className="py-3 px-4">{item.lebarDada}</td>
                      <td className="py-3 pl-4">{item.panjangLengan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Modal CTA Tutup */}
            <div className="mt-6 flex justify-end border-t border-neutral-800 pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setApakahBuka(false)}
                className="min-h-11 px-6 font-mono text-xs"
              >
                TUTUP PANDUAN
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
