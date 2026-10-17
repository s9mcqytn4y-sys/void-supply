"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Search, Package, MapPin, ExternalLink, AlertCircle, ArrowRight } from "lucide-react";
import { TimelinePengiriman } from "./TimelinePengiriman";
import { DevToolsSandboxDrawer } from "@/features/checkout/components/DevToolsSandboxDrawer";
import {
  lacakPengirimanPublikAction,
  type HasilPelacakanPublik,
} from "../actions/lacak.action";

interface PropsHalamanLacakClient {
  initialQuery?: string;
  initialData?: HasilPelacakanPublik["data"] | null;
}

export function HalamanLacakClient({
  initialQuery = "",
  initialData = null,
}: PropsHalamanLacakClient) {
  const [query, setQuery] = useState(initialQuery);
  const [dataHasil, setDataHasil] = useState<HasilPelacakanPublik["data"] | null>(
    initialData
  );
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCari = (keyword: string) => {
    const q = keyword.trim();
    if (!q) return;

    setPesanError(null);
    startTransition(async () => {
      const res = await lacakPengirimanPublikAction(q);
      if (res.sukses && res.data) {
        setDataHasil(res.data);
      } else {
        setDataHasil(null);
        setPesanError(res.pesan);
      }
    });
  };

  useEffect(() => {
    if (initialQuery && !initialData) {
      handleCari(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header Halaman */}
      <div className="border-b border-neutral-800 pb-8 text-center sm:text-left">
        <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">
          // PELACAKAN PENGIRIMAN LOGISTIK
        </span>
        <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
          LACAK STATUS PESANAN RESMI
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl">
          Pantau status penjemputan, pergerakan kurir, nomor resi, dan estimasi tiba pesanan merchandise VOID Supply Anda secara real-time.
        </p>
      </div>

      {/* Form Input Pencarian */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCari(query);
        }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan Nomor Pesanan (VOID-...) atau Nomor Resi..."
            className="w-full border border-neutral-800 bg-neutral-950 px-4 py-3 font-mono text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          <span>{isPending ? "MEMERIKSA..." : "LACAK SEKARANG"}</span>
        </button>
      </form>

      {/* Pesan Kesalahan */}
      {pesanError && (
        <div className="mt-6 flex items-start gap-3 border border-rose-900/60 bg-rose-950/20 p-4 font-mono text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p>{pesanError}</p>
        </div>
      )}

      {/* Hasil Pelacakan */}
      {dataHasil && (
        <div className="mt-10 space-y-8">
          {/* Ringkasan Header Pesanan */}
          <div className="grid grid-cols-1 gap-4 border border-neutral-800 bg-neutral-950 p-6 sm:grid-cols-4">
            <div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase">
                NOMOR PESANAN
              </span>
              <p className="mt-1 font-mono text-xs font-bold text-white">
                {dataHasil.nomorPesanan}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase">
                KURIR & LAYANAN
              </span>
              <p className="mt-1 font-mono text-xs font-bold text-white">
                {dataHasil.kurir} - {dataHasil.layanan}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase">
                PENERIMA & KOTA
              </span>
              <p className="mt-1 font-mono text-xs text-neutral-200">
                {dataHasil.namaPenerimaMasked} ({dataHasil.kotaTujuan})
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase">
                ESTIMASI TIBA
              </span>
              <p className="mt-1 font-mono text-xs font-bold text-emerald-400">
                {dataHasil.estimasiHari}
              </p>
            </div>
          </div>

          {/* Stepper Timeline Pengiriman */}
          <TimelinePengiriman
            nomorPesanan={dataHasil.nomorPesanan}
            statusPesanan={dataHasil.statusPesanan}
            pelacakan={dataHasil.pelacakan}
            onUpdate={() => handleCari(dataHasil.nomorPesanan)}
          />

          {/* Tautan Cepat & Aksi */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 pt-6 font-mono text-xs">
            <Link
              href={`/pesanan/${dataHasil.nomorPesanan}`}
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white"
            >
              <span>Lihat Detail Lengkap Pesanan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {dataHasil.linkTrackingResmi && (
              <a
                href={dataHasil.linkTrackingResmi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white"
              >
                <span>Halaman Live Tracking Ekspedisi</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Floating DevTools Sandbox Drawer (Poin 12) */}
          <DevToolsSandboxDrawer
            nomorPesanan={dataHasil.nomorPesanan}
            statusPesanan={dataHasil.statusPesanan}
            statusPembayaran="berhasil"
            statusPengiriman={dataHasil.pelacakan.statusPengiriman}
            nomorResi={dataHasil.pelacakan.nomorResi}
            onSinkronUlang={async () => handleCari(dataHasil.nomorPesanan)}
          />
        </div>
      )}
    </div>
  );
}
