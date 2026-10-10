"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

import type { DimensiUkuranGarmen } from "../types/product.type";

export interface PropertiPanduanUkuran {
  kategori?: string;
  namaProduk?: string;
  panduanUkuran?: readonly DimensiUkuranGarmen[] | null;
}

export function PanduanUkuran({
  kategori = "T-Shirt",
  namaProduk,
  panduanUkuran,
}: PropertiPanduanUkuran) {
  const [apakahBuka, setApakahBuka] = useState(false);
  const tombolPemicuRef = useRef<HTMLButtonElement>(null);
  const kontainerDialogRef = useRef<HTMLDivElement>(null);

  // Aksesibilitas: Focus Trap & Restore Focus saat modal buka/tutup (Sesuai WCAG AA & R-32)
  useEffect(() => {
    if (!apakahBuka) return;

    document.body.style.overflow = "hidden";

    // Fokuskan modal saat pertama kali terbuka
    const elemenFokusSebelumnya = document.activeElement as HTMLElement | null;
    const fokusables = kontainerDialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (fokusables && fokusables.length > 0) {
      fokusables[0].focus();
    }

    function tanganiKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setApakahBuka(false);
        return;
      }

      // Focus trap dengan tombol Tab
      if (e.key === "Tab" && kontainerDialogRef.current) {
        const daftarFokus = kontainerDialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!daftarFokus || daftarFokus.length === 0) return;

        const elemenPertama = daftarFokus[0];
        const elemenTerakhir = daftarFokus[daftarFokus.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === elemenPertama) {
            e.preventDefault();
            elemenTerakhir.focus();
          }
        } else {
          if (document.activeElement === elemenTerakhir) {
            e.preventDefault();
            elemenPertama.focus();
          }
        }
      }
    }

    window.addEventListener("keydown", tanganiKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tanganiKeyDown);
      // Restore focus ke tombol pembuka
      if (tombolPemicuRef.current) {
        tombolPemicuRef.current.focus();
      } else if (elemenFokusSebelumnya) {
        elemenFokusSebelumnya.focus();
      }
    };
  }, [apakahBuka]);

  const daftarDimensi = panduanUkuran && panduanUkuran.length > 0 ? panduanUkuran : null;

  // Deteksi kolom yang relevan berdasarkan data yang tersedia
  const memilikiPanjangBadan = daftarDimensi?.some((d) => d.panjangBadan !== undefined);
  const memilikiLebarDada = daftarDimensi?.some((d) => d.lebarDada !== undefined);
  const memilikiPanjangLengan = daftarDimensi?.some((d) => d.panjangLengan !== undefined);
  const memilikiPanjangCelana = daftarDimensi?.some((d) => d.panjangCelana !== undefined);
  const memilikiLingkarPinggang = daftarDimensi?.some((d) => d.lingkarPinggang !== undefined);
  const memilikiLebarPaha = daftarDimensi?.some((d) => d.lebarPaha !== undefined);
  const memilikiLingkarKepala = daftarDimensi?.some((d) => d.lingkarKepala !== undefined);

  return (
    <>
      <button
        ref={tombolPemicuRef}
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
            ref={kontainerDialogRef}
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
                  Tabel Dimensi Ukuran {namaProduk ? `// ${namaProduk}` : ""}
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
              <strong className="font-semibold text-white">Panduan Fitting VOID Supply:</strong> Dimensi
              diukur pada bidang datar (toleransi jahit 1-2 cm). Untuk tampilan oversized streetwear,
              gunakan ukuran asli. Turun satu ukuran untuk siluet lebih pas di tubuh.
            </div>

            {/* Tabel Dimensi Pengukuran Nyata atau Unverified State */}
            {daftarDimensi ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400">
                      <th scope="col" className="py-2.5 pr-4 font-semibold uppercase">
                        Ukuran
                      </th>
                      {memilikiPanjangBadan && (
                        <th scope="col" className="py-2.5 px-3 font-semibold uppercase">
                          Panjang (cm)
                        </th>
                      )}
                      {memilikiLebarDada && (
                        <th scope="col" className="py-2.5 px-3 font-semibold uppercase">
                          Lebar Dada (cm)
                        </th>
                      )}
                      {memilikiPanjangLengan && (
                        <th scope="col" className="py-2.5 px-3 font-semibold uppercase">
                          Lengan (cm)
                        </th>
                      )}
                      {memilikiPanjangCelana && (
                        <th scope="col" className="py-2.5 px-3 font-semibold uppercase">
                          Panjang Celana (cm)
                        </th>
                      )}
                      {memilikiLingkarPinggang && (
                        <th scope="col" className="py-2.5 px-3 font-semibold uppercase">
                          Pinggang (cm)
                        </th>
                      )}
                      {memilikiLebarPaha && (
                        <th scope="col" className="py-2.5 px-3 font-semibold uppercase">
                          Lebar Paha (cm)
                        </th>
                      )}
                      {memilikiLingkarKepala && (
                        <th scope="col" className="py-2.5 px-3 font-semibold uppercase">
                          Lingkar Kepala (cm)
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-neutral-200">
                    {daftarDimensi.map((item) => (
                      <tr key={item.ukuran} className="hover:bg-neutral-900/40">
                        <td className="py-3 pr-4 font-bold text-white">{item.ukuran}</td>
                        {memilikiPanjangBadan && <td className="py-3 px-3">{item.panjangBadan ?? "-"}</td>}
                        {memilikiLebarDada && <td className="py-3 px-3">{item.lebarDada ?? "-"}</td>}
                        {memilikiPanjangLengan && <td className="py-3 px-3">{item.panjangLengan ?? "-"}</td>}
                        {memilikiPanjangCelana && <td className="py-3 px-3">{item.panjangCelana ?? "-"}</td>}
                        {memilikiLingkarPinggang && <td className="py-3 px-3">{item.lingkarPinggang ?? "-"}</td>}
                        {memilikiLebarPaha && <td className="py-3 px-3">{item.lebarPaha ?? "-"}</td>}
                        {memilikiLingkarKepala && <td className="py-3 px-3">{item.lingkarKepala ?? "-"}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-dashed border-neutral-800 p-6 text-center text-xs text-neutral-400">
                <p className="font-mono text-neutral-300 uppercase">DATA UKURAN SEDANG DIVERIFIKASI</p>
                <p className="mt-1">
                  Pengukuran garmen fisik untuk artikel ini sedang ditinjau ulang oleh tim QC agar akurasi tetap terjaga.
                </p>
              </div>
            )}

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

