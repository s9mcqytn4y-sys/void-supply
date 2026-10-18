"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

interface BilahKendaliCetakBulkProps {
  totalResi: number;
}

export function BilahKendaliCetakBulk({ totalResi }: BilahKendaliCetakBulkProps) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-zinc-700 bg-zinc-950/95 px-6 py-4 shadow-xl backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            // VOID SUPPLY CONTROL CENTER : LOGISTIK THERMAL
          </p>
          <h1 className="font-mono text-base font-bold uppercase text-white">
            Cetak Bulk Resi Thermal ({totalResi} Lembar Label)
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 border border-white bg-white px-5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-zinc-200 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>CETAK SEMUA ({totalResi})</span>
          </button>

          <Link
            href="/admin/pesanan"
            className="inline-flex min-h-11 items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 font-mono text-xs font-semibold uppercase text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>KEMBALI</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
