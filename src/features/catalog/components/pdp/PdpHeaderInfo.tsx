"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface PdpHeaderInfoProps {
  nama: string;
  kategori: string;
  hargaDasar: number;
  deskripsi: string;
  totalStok: number;
  apakahHabis: boolean;
  apakahStokMenipis: boolean;
}

export function PdpHeaderInfo({
  nama,
  kategori,
  hargaDasar,
  deskripsi,
  totalStok,
  apakahHabis,
  apakahStokMenipis,
}: PdpHeaderInfoProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-neutral-800 pb-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-neutral-400">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              BERANDA
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-700">/</li>
          <li>
            <Link
              href="/katalog"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              KATALOG
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-700">/</li>
          <li className="text-neutral-300 font-bold uppercase">{kategori}</li>
        </ol>
      </nav>

      {/* Title & Status Badges */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            {kategori} // DROP 04
          </span>
          {apakahHabis ? (
            <Badge variant="soldout">HABIS TERJUAL</Badge>
          ) : apakahStokMenipis ? (
            <Badge variant="scarcity">SISA {totalStok} UNIT</Badge>
          ) : (
            <Badge variant="default">EDISI TERBATAS</Badge>
          )}
        </div>

        <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
          {nama}
        </h1>
      </div>

      {/* Price Display */}
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
          {formatRupiah(hargaDasar)}
        </span>
        <span className="font-mono text-xs text-neutral-400">IDR (Termasuk Pajak)</span>
      </div>

      {/* Editorial Narrative Description */}
      <p className="font-sans text-xs leading-relaxed text-neutral-300 sm:text-sm">
        {deskripsi}
      </p>
    </div>
  );
}
