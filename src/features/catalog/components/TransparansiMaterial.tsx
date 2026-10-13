"use client";

import Image from "next/image";
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

  const verifikasi = spesifikasi.verifikasi;
  const statusVerifikasi = verifikasi?.status || "standar_pabrik";
  const labelVerifikasi =
    statusVerifikasi === "terverifikasi"
      ? "SPEK TERVERIFIKASI"
      : statusVerifikasi === "dalam_pengujian"
      ? "UJI BATCH BERJALAN"
      : "STANDAR PRODUKSI PABRIK";
  const warnaVerifikasi =
    statusVerifikasi === "terverifikasi"
      ? "text-emerald-400"
      : statusVerifikasi === "dalam_pengujian"
      ? "text-amber-400"
      : "text-neutral-400";

  const tabs: Array<{ id: "material" | "konstruksi" | "perawatan"; label: string }> = [
    { id: "material", label: "MATERIAL" },
    { id: "konstruksi", label: "KONSTRUKSI" },
    { id: "perawatan", label: "PERAWATAN" },
  ];

  function handleTabKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      setTabAktif(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setTabAktif(tabs[prevIndex].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      setTabAktif(tabs[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      setTabAktif(tabs[tabs.length - 1].id);
    }
  }

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-5">
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
          TRANSPARANSI GARMEN // {kategori}
        </h3>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className={warnaVerifikasi}>{labelVerifikasi}</span>
          {verifikasi?.nomorBatch && (
            <span className="text-neutral-500">// BATCH {verifikasi.nomorBatch}</span>
          )}
        </div>
      </div>

      {/* Tab Buttons dengan navigasi keyboard ARIA accessible */}
      <div className="flex border-b border-neutral-900" role="tablist" aria-label="Spesifikasi teknis garmen">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={tabAktif === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={tabAktif === tab.id ? 0 : -1}
            onClick={() => setTabAktif(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, idx)}
            className={`flex-1 pb-2.5 text-center font-mono text-xs tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
              tabAktif === tab.id
                ? "border-b-2 border-white font-bold text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel Content */}
      <div
        id={`panel-${tabAktif}`}
        role="tabpanel"
        aria-labelledby={`tab-${tabAktif}`}
        className="pt-4 text-xs leading-relaxed text-neutral-300"
      >
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

      {/* Visual Inspeksi Tekstur & Segel Otentik (Dekoratif / Informasional) */}
      <div className="pointer-events-none mt-5 border-t border-neutral-900 pt-4 select-none">
        <div className="flex items-center gap-3 bg-neutral-900/40 p-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-neutral-800 bg-neutral-950">
            <Image
              src="/images/brand/fabric-density-macro.jpg"
              alt="Uji makro kerapatan kain garmen VOID Supply"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold text-white uppercase">
                INSPEKSI TEKSTUR MAKRO
              </span>
              <span className="font-mono text-[9px] text-neutral-400">BATCH 04</span>
            </div>
            <p className="truncate text-[11px] text-neutral-400">
              Kerapatan benang rapat tahan aus dengan jahitan pengunci presisi.
            </p>
          </div>
          <div className="relative h-8 w-8 shrink-0 opacity-80">
            <Image
              src="/images/brand/void-drop04-seal.jpg"
              alt="Segel VOID Supply"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

