"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

interface PropsRincianPembayaranPesanan {
  nomorPesanan: string;
  subtotal: number;
  totalOngkir: number;
  totalAkhir: number;
  totalDiskon?: number | null;
  kodeVoucher?: string | null;
  isSukses: boolean;
}

export function RincianPembayaranPesanan({
  nomorPesanan,
  subtotal,
  totalOngkir,
  totalAkhir,
  totalDiskon,
  kodeVoucher,
  isSukses,
}: PropsRincianPembayaranPesanan) {
  return (
    <>
      <div className="mt-6 border-t border-neutral-800 pt-4 font-mono text-xs">
        <div className="flex justify-between py-1 text-neutral-400">
          <span>SUBTOTAL:</span>
          <span className="text-white">{formatRupiah(subtotal)}</span>
        </div>
        {totalDiskon && totalDiskon > 0 ? (
          <div className="flex justify-between py-1 text-emerald-400">
            <span>POTONGAN DISKON {kodeVoucher ? `(${kodeVoucher})` : ""}:</span>
            <span className="font-bold">-{formatRupiah(totalDiskon)}</span>
          </div>
        ) : null}
        <div className="flex justify-between py-1 text-neutral-400">
          <span>ONGKOS KIRIM:</span>
          <span className="text-white">{formatRupiah(totalOngkir)}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm text-white">
          <span className="font-bold">TOTAL TAGIHAN:</span>
          <span className="font-black text-emerald-400">
            {formatRupiah(totalAkhir)}
          </span>
        </div>
      </div>

      {/* Aksi Dokumen Resmi (E-Receipt, Live Tracking, Label Resi) */}
      {isSukses && (
        <div className="mt-6 flex flex-col gap-2 border-t border-neutral-800 pt-4 sm:flex-row">
          <Link
            href={`/pesanan/${encodeURIComponent(nomorPesanan)}/faktur`}
            className="flex min-h-11 flex-1 items-center justify-center border border-emerald-500/50 bg-emerald-950/20 px-4 font-mono text-xs font-bold text-emerald-300 uppercase transition-colors hover:bg-emerald-900/30 text-center"
          >
            FAKTUR ELEKTRONIK (E-RECEIPT)
          </Link>
          <Link
            href={`/lacak?pesanan=${encodeURIComponent(nomorPesanan)}`}
            className="flex min-h-11 flex-1 items-center justify-center border border-neutral-700 bg-neutral-900 px-4 font-mono text-xs font-bold text-white uppercase transition-colors hover:border-white text-center"
          >
            LACAK PENGIRIMAN LIVE
          </Link>
          <Link
            href={`/pesanan/${encodeURIComponent(nomorPesanan)}/resi`}
            target="_blank"
            className="flex min-h-11 flex-1 items-center justify-center border border-neutral-800 bg-neutral-950 px-4 font-mono text-xs font-bold text-neutral-300 uppercase transition-colors hover:border-neutral-600 hover:text-white text-center"
          >
            LABEL RESI (100x150)
          </Link>
        </div>
      )}
    </>
  );
}
