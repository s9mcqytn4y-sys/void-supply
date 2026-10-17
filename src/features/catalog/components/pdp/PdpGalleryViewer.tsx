"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export interface PdpGalleryViewerProps {
  namaProduk: string;
  gambarUtama: string;
  galeriGambar: readonly string[];
}

export function PdpGalleryViewer({
  namaProduk,
  gambarUtama,
  galeriGambar,
}: PdpGalleryViewerProps) {
  const daftarGambar = Array.from(new Set([gambarUtama, ...galeriGambar])).filter(Boolean);
  const [indeksAktif, setIndeksAktif] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const gambarTerpilih = daftarGambar[indeksAktif] || gambarUtama;

  // Handle ESC key for modal zoom
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isZoomOpen) {
        setIsZoomOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen]);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-6">
      {/* Thumbnail Bar */}
      {daftarGambar.length > 1 && (
        <div
          role="tablist"
          aria-label="Sudut pandang foto produk"
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
                aria-label={`Tampilan foto ke-${idx + 1} dari ${namaProduk}`}
                onClick={() => setIndeksAktif(idx)}
                className={`relative aspect-4/5 w-16 shrink-0 overflow-hidden border bg-neutral-900 transition-all duration-200 md:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isAktif
                    ? "border-white opacity-100 ring-1 ring-white"
                    : "border-neutral-800 opacity-60 hover:border-neutral-600 hover:opacity-90"
                }`}
              >
                <Image
                  src={gambar}
                  alt={`Thumbnail ${idx + 1} ${namaProduk}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Focus Canvas 4:5 with Zoom Trigger */}
      <div className="group relative aspect-4/5 w-full flex-1 overflow-hidden border border-neutral-800 bg-neutral-900">
        <Image
          src={gambarTerpilih}
          alt={`Foto utama ${namaProduk} sudut ${indeksAktif + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-102"
        />

        {/* Zoom Button Trigger */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          aria-label="Perbesar foto produk layar penuh"
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center border border-neutral-700 bg-black/80 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="square" strokeWidth="2" d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7" />
          </svg>
        </button>

        {/* Counter Badge */}
        <div className="absolute right-3 bottom-3 border border-neutral-800/80 bg-neutral-950/80 px-2.5 py-1 font-mono text-[10px] tracking-widest text-neutral-300 uppercase backdrop-blur-sm">
          FOTO {indeksAktif + 1} / {daftarGambar.length}
        </div>
      </div>

      {/* Fullscreen Zoom Modal Lightbox */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau detail foto produk resolusi tinggi"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Tutup pratinjau foto"
            className="absolute top-6 right-6 flex min-h-11 min-w-11 items-center justify-center border border-neutral-700 bg-neutral-900 font-mono text-sm text-white hover:border-white"
          >
            TUTUP [ESC]
          </button>
          <div className="relative aspect-4/5 h-[85vh] max-w-full">
            <Image
              src={gambarTerpilih}
              alt={`Foto layar penuh ${namaProduk}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
