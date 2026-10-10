"use client";

import { useState } from "react";

export interface PropertiTransparansiMaterial {
  kategori: string;
}

export function TransparansiMaterial({ kategori }: PropertiTransparansiMaterial) {
  const [tabAktif, setTabAktif] = useState<"material" | "konstruksi" | "perawatan">("material");

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-5">
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
          TRANSPARANSI GARMEN // {kategori}
        </h3>
        <span className="font-mono text-[10px] text-neutral-400">SPEK NYATA</span>
      </div>

      {/* Tab Buttons */}
      <div className="flex border-b border-neutral-900" role="tablist" aria-label="Spesifikasi teknis garmen">
        <button
          type="button"
          role="tab"
          aria-selected={tabAktif === "material"}
          onClick={() => setTabAktif("material")}
          className={`flex-1 pb-2.5 text-center font-mono text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
            tabAktif === "material"
              ? "border-b-2 border-white font-bold text-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          MATERIAL
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tabAktif === "konstruksi"}
          onClick={() => setTabAktif("konstruksi")}
          className={`flex-1 pb-2.5 text-center font-mono text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
            tabAktif === "konstruksi"
              ? "border-b-2 border-white font-bold text-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          KONSTRUKSI
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tabAktif === "perawatan"}
          onClick={() => setTabAktif("perawatan")}
          className={`flex-1 pb-2.5 text-center font-mono text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
            tabAktif === "perawatan"
              ? "border-b-2 border-white font-bold text-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          PERAWATAN
        </button>
      </div>

      {/* Tab Panel Content */}
      <div className="pt-4 text-xs leading-relaxed text-neutral-300">
        {tabAktif === "material" && (
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Komposisi Benang</span>
              <span className="font-mono font-medium text-white">100% Katun Combed 16s</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Gramasi Kain</span>
              <span className="font-mono font-medium text-white">235 GSM (Heavyweight)</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Pewarnaan</span>
              <span className="font-mono font-medium text-white">Reactive Dye (Anti Luntur)</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-neutral-400">Finishing</span>
              <span className="font-mono font-medium text-white">Pre-shrunk Enzyme Wash</span>
            </li>
          </ul>
        )}

        {tabAktif === "konstruksi" && (
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Jahitan Bahu</span>
              <span className="font-mono font-medium text-white">Rantai Ganda (Chainstitch)</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Rib Kerah</span>
              <span className="font-mono font-medium text-white">1x1 Rib Spandex 2.5 cm</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Teknik Grafis</span>
              <span className="font-mono font-medium text-white">High-Density Plastisol Curing</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-neutral-400">Label Leher</span>
              <span className="font-mono font-medium text-white">Woven Satin Halus Non-Iritasi</span>
            </li>
          </ul>
        )}

        {tabAktif === "perawatan" && (
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Suhu Pencucian</span>
              <span className="font-mono font-medium text-white">Air Dingin (Maks 30°C)</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Bahan Kimia</span>
              <span className="font-mono font-medium text-white">Dilarang Pemutih Klorin</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Pengeringan</span>
              <span className="font-mono font-medium text-white">Jemur Terbalik di Tempat Teduh</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-neutral-400">Penyetrikaan</span>
              <span className="font-mono font-medium text-white">Suhu Sedang, Balik Area Sablon</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
