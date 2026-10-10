"use client";

import { useState } from "react";

import type { SpesifikasiGarmen } from "../types/product.type";

export interface PropertiTransparansiMaterial {
  kategori: string;
  spesifikasi?: SpesifikasiGarmen | null;
}

export function TransparansiMaterial({ kategori, spesifikasi }: PropertiTransparansiMaterial) {
  const [tabAktif, setTabAktif] = useState<"material" | "konstruksi" | "perawatan">("material");

  // Jika spesifikasi belum tercatat, tampilkan state unverified yang jujur (Anti-Slop R-17, R-36)
  if (!spesifikasi) {
    return (
      <div className="border border-neutral-800 bg-neutral-950 p-5">
        <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            TRANSPARANSI GARMEN // {kategori}
          </h3>
          <span className="font-mono text-[10px] text-amber-400">STATUS KURASI</span>
        </div>
        <div className="border border-dashed border-neutral-800 p-5 text-center text-xs text-neutral-400">
          <p className="font-mono font-semibold text-neutral-300 uppercase">
            SPESIFIKASI GARMEN SEDANG DIVERIFIKASI
          </p>
          <p className="mt-1 leading-relaxed">
            Data teknis uji material (gramasi kain, ketahanan pewarnaan, dan konstruksi perangkat keras)
            sedang diverifikasi oleh tim kurasi VOID Supply sebelum dirilis secara publik.
          </p>
        </div>
      </div>
    );
  }

  const dataMaterial = spesifikasi.material;
  const dataKonstruksi = spesifikasi.konstruksi;
  const dataPerawatan = spesifikasi.perawatan;

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-5">
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
          TRANSPARANSI GARMEN // {kategori}
        </h3>
        <span className="font-mono text-[10px] text-emerald-400">SPEK TERVERIFIKASI</span>
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
              <span className="font-mono font-medium text-white">{dataMaterial.komposisi}</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Gramasi Kain</span>
              <span className="font-mono font-medium text-white">{dataMaterial.gramasi}</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Pewarnaan</span>
              <span className="font-mono font-medium text-white">{dataMaterial.pewarnaan}</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-neutral-400">Finishing</span>
              <span className="font-mono font-medium text-white">{dataMaterial.finishing}</span>
            </li>
          </ul>
        )}

        {tabAktif === "konstruksi" && (
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Jahitan Utama</span>
              <span className="font-mono font-medium text-white">{dataKonstruksi.jahitan}</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Kerah / Hardware</span>
              <span className="font-mono font-medium text-white">{dataKonstruksi.kerahRib}</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Teknik Grafis / Fitur</span>
              <span className="font-mono font-medium text-white">{dataKonstruksi.teknikGrafis}</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-neutral-400">Identitas Garmen</span>
              <span className="font-mono font-medium text-white">{dataKonstruksi.label}</span>
            </li>
          </ul>
        )}

        {tabAktif === "perawatan" && (
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Suhu Pencucian</span>
              <span className="font-mono font-medium text-white">{dataPerawatan.suhuCuci}</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Bahan Kimia</span>
              <span className="font-mono font-medium text-white">{dataPerawatan.bahanKimia}</span>
            </li>
            <li className="flex justify-between border-b border-neutral-900/80 pb-1.5">
              <span className="text-neutral-400">Pengeringan</span>
              <span className="font-mono font-medium text-white">{dataPerawatan.pengeringan}</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-neutral-400">Penyetrikaan</span>
              <span className="font-mono font-medium text-white">{dataPerawatan.penyetrikaan}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

