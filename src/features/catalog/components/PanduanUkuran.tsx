"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { DimensiUkuranGarmen } from "../types/product.type";
import { toast } from "sonner";

export interface PropertiPanduanUkuran {
  kategori?: string;
  namaProduk?: string;
  panduanUkuran?: readonly DimensiUkuranGarmen[] | null;
  onPilihUkuran?: (ukuran: string) => void;
  ukuranTersedia?: readonly string[];
}

type TabPanduan = "tabel" | "kalkulator";
type PreferensiFitting = "regular" | "boxy" | "oversized";

export function PanduanUkuran({
  kategori = "T-Shirt",
  namaProduk,
  panduanUkuran,
  onPilihUkuran,
  ukuranTersedia = ["S", "M", "L", "XL", "XXL"],
}: PropertiPanduanUkuran) {
  const [apakahBuka, setApakahBuka] = useState(false);
  const [tabAktif, setTabAktif] = useState<TabPanduan>("tabel");
  const tombolPemicuRef = useRef<HTMLButtonElement>(null);
  const kontainerDialogRef = useRef<HTMLDivElement>(null);

  // State Kalkulator Postur
  const [tinggiCm, setTinggiCm] = useState<number>(172);
  const [beratKg, setBeratKg] = useState<number>(65);
  const [preferensiFit, setPreferensiFit] = useState<PreferensiFitting>("boxy");

  // Aksesibilitas: Focus Trap & Restore Focus saat modal buka/tutup (WCAG AA & R-32)
  useEffect(() => {
    if (!apakahBuka) return;

    document.body.style.overflow = "hidden";

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
      if (tombolPemicuRef.current) {
        tombolPemicuRef.current.focus();
      } else if (elemenFokusSebelumnya) {
        elemenFokusSebelumnya.focus();
      }
    };
  }, [apakahBuka]);

  // Algoritma Rekomendasi Ukuran Cerdas
  const hitungRekomendasiUkuran = (): { ukuran: string; alasan: string } => {
    const bmi = beratKg / ((tinggiCm / 100) * (tinggiCm / 100));
    let baseUkuran = "M";

    if (tinggiCm < 165 || beratKg < 55) {
      baseUkuran = "S";
    } else if (tinggiCm <= 174 && beratKg <= 68) {
      baseUkuran = "M";
    } else if (tinggiCm <= 182 && beratKg <= 80) {
      baseUkuran = "L";
    } else if (tinggiCm <= 188 && beratKg <= 92) {
      baseUkuran = "XL";
    } else {
      baseUkuran = "XXL";
    }

    // Penyesuaian preferensi
    const urutanUkuran = ["S", "M", "L", "XL", "XXL"];
    let indexFinal = urutanUkuran.indexOf(baseUkuran);

    if (preferensiFit === "oversized") {
      indexFinal = Math.min(urutanUkuran.length - 1, indexFinal + 1);
    } else if (preferensiFit === "regular" && bmi < 21) {
      indexFinal = Math.max(0, indexFinal - 1);
    }

    const ukuranFinal = urutanUkuran[indexFinal];

    let deskripsiFit = `Postur ${tinggiCm} cm / ${beratKg} kg dengan siluet ${preferensiFit.toUpperCase()}.`;
    if (preferensiFit === "boxy") {
      deskripsiFit += " Menghadirkan proporsi drape dada lebar khas streetwear VOID Supply.";
    } else if (preferensiFit === "oversized") {
      deskripsiFit += " Potongan ekstra longgar dengan dropped shoulder rileks.";
    } else {
      deskripsiFit += " Siluet proporsional dan pas di lekuk tubuh.";
    }

    return { ukuran: ukuranFinal, alasan: deskripsiFit };
  };

  const rekomendasi = hitungRekomendasiUkuran();

  const tanganiTerapkanUkuran = () => {
    if (onPilihUkuran) {
      onPilihUkuran(rekomendasi.ukuran);
      toast.success(`Ukuran ${rekomendasi.ukuran} berhasil dipilih`, {
        description: `Rekomendasi postur ${tinggiCm} cm / ${beratKg} kg telah diterapkan.`,
      });
      setApakahBuka(false);
    }
  };

  const daftarDimensi = panduanUkuran && panduanUkuran.length > 0 ? panduanUkuran : null;

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
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs text-neutral-400 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-haspopup="dialog"
        aria-expanded={apakahBuka}
      >
        <span>PANDUAN UKURAN (CM)</span>
      </button>

      {/* Modal Dialog Panduan Ukuran & Kalkulator */}
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
                  PANDUAN UKURAN {namaProduk ? `// ${namaProduk}` : ""}
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

            {/* Tab Bar: Tabel Dimensi vs Kalkulator Postur */}
            <div className="mt-4 flex border-b border-neutral-800">
              <button
                type="button"
                onClick={() => setTabAktif("tabel")}
                className={`min-h-11 flex-1 border-b-2 font-mono text-xs font-bold tracking-wider uppercase transition-colors focus-visible:outline-none ${
                  tabAktif === "tabel"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                TABEL DIMENSI (CM)
              </button>
              <button
                type="button"
                onClick={() => setTabAktif("kalkulator")}
                className={`min-h-11 flex-1 border-b-2 font-mono text-xs font-bold tracking-wider uppercase transition-colors focus-visible:outline-none ${
                  tabAktif === "kalkulator"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                KALKULATOR POSTUR (AI FIT)
              </button>
            </div>

            {tabAktif === "tabel" ? (
              <div className="mt-4">
                {/* Catatan Fit Karakteristik */}
                <div className="mb-4 border-l-2 border-neutral-500 bg-neutral-900/50 p-3 text-xs leading-relaxed text-neutral-300">
                  <strong className="font-semibold text-white">Panduan Fitting VOID Supply:</strong> Dimensi
                  diukur pada bidang datar (toleransi jahit 1-2 cm). Untuk tampilan oversized streetwear,
                  gunakan ukuran asli. Turun satu ukuran untuk siluet lebih pas di tubuh.
                </div>

                {/* Tabel Dimensi Pengukuran Nyata */}
                {daftarDimensi ? (
                  <div className="max-h-72 overflow-x-auto overflow-y-auto">
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
              </div>
            ) : (
              /* Tab 2: Interactive Size Confidence Calculator */
              <div className="mt-4 space-y-5">
                {/* Sliders Input: Tinggi & Berat Badan */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-mono text-xs">
                      <label htmlFor="slider-tinggi" className="text-neutral-300 uppercase">
                        TINGGI BADAN:
                      </label>
                      <span className="font-bold text-white">{tinggiCm} CM</span>
                    </div>
                    <input
                      id="slider-tinggi"
                      type="range"
                      min={150}
                      max={205}
                      value={tinggiCm}
                      onChange={(e) => setTinggiCm(Number(e.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer accent-white bg-neutral-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-xs">
                      <label htmlFor="slider-berat" className="text-neutral-300 uppercase">
                        BERAT BADAN:
                      </label>
                      <span className="font-bold text-white">{beratKg} KG</span>
                    </div>
                    <input
                      id="slider-berat"
                      type="range"
                      min={40}
                      max={125}
                      value={beratKg}
                      onChange={(e) => setBeratKg(Number(e.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer accent-white bg-neutral-800"
                    />
                  </div>
                </div>

                {/* Preferensi Fitting */}
                <div>
                  <span className="block font-mono text-xs text-neutral-300 uppercase">
                    PREFERENSI SILUET:
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "regular", label: "REGULAR", desc: "Pas Proporsional" },
                        { id: "boxy", label: "BOXY", desc: "Khas VOID" },
                        { id: "oversized", label: "OVERSIZED", desc: "Ekstra Longgar" },
                      ] as const
                    ).map((pref) => {
                      const apakahAktif = preferensiFit === pref.id;
                      return (
                        <button
                          key={pref.id}
                          type="button"
                          onClick={() => setPreferensiFit(pref.id)}
                          className={`min-h-11 border p-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                            apakahAktif
                              ? "border-white bg-white text-black"
                              : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-600"
                          }`}
                        >
                          <span className="block font-mono text-xs font-bold">{pref.label}</span>
                          <span className="block text-[10px] opacity-80">{pref.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Box Hasil Rekomendasi */}
                <div className="border border-neutral-700 bg-neutral-900/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] text-neutral-400 uppercase">
                        REKOMENDASI UKURAN ANDA:
                      </span>
                      <p className="mt-1 font-mono text-3xl font-black text-white">
                        {rekomendasi.ukuran}
                      </p>
                    </div>
                    {onPilihUkuran && (
                      <Button
                        type="button"
                        onClick={tanganiTerapkanUkuran}
                        className="min-h-11 border border-white bg-white px-5 font-mono text-xs font-bold text-black uppercase hover:bg-neutral-200"
                      >
                        TERAPKAN UKURAN {rekomendasi.ukuran}
                      </Button>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-neutral-300">
                    {rekomendasi.alasan}
                  </p>
                </div>
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
