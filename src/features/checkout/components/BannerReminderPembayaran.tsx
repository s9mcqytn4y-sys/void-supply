"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { usePesananAktifStore } from "../stores/pesanan-aktif.store";

export function BannerReminderPembayaran() {
  const pesananAktif = usePesananAktifStore((state) => state.pesananAktif);
  const tersembunyi = usePesananAktifStore((state) => state.tersembunyi);
  const sembunyikanBanner = usePesananAktifStore((state) => state.sembunyikanBanner);
  const bersihkanPesananAktif = usePesananAktifStore((state) => state.bersihkanPesananAktif);

  // Hydration safety check
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [sisaDetik, setSisaDetik] = useState<number>(0);

  useEffect(() => {
    if (!pesananAktif) {
      setSisaDetik(0);
      return;
    }

    const hitungSisa = () => {
      const sisa = Math.floor((pesananAktif.kedaluwarsaPada - Date.now()) / 1000);
      return Math.max(0, sisa);
    };

    setSisaDetik(hitungSisa());

    const interval = setInterval(() => {
      const sisa = hitungSisa();
      setSisaDetik(sisa);
      if (sisa <= 0) {
        clearInterval(interval);
        bersihkanPesananAktif();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pesananAktif, bersihkanPesananAktif]);

  if (!isHydrated || !pesananAktif || tersembunyi || sisaDetik <= 0) {
    return null;
  }

  const menit = Math.floor(sisaDetik / 60);
  const detik = sisaDetik % 60;
  const stringCountdown = `${menit.toString().padStart(2, "0")}:${detik.toString().padStart(2, "0")}`;

  const linkPembayaran = pesananAktif.tokenAkses
    ? `/pesanan/${encodeURIComponent(pesananAktif.nomorPesanan)}?token=${encodeURIComponent(pesananAktif.tokenAkses)}`
    : `/pesanan/${encodeURIComponent(pesananAktif.nomorPesanan)}`;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full border-b border-amber-500/50 bg-neutral-950 px-3 py-2 text-white shadow-xl transition-all sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
        {/* Kolom Informasi & Waktu */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            MENUNGGU PEMBAYARAN
          </span>

          <span className="hidden text-neutral-600 sm:inline">|</span>

          <span className="font-mono text-[11px] text-neutral-300">
            Pesanan <strong className="text-white">#{pesananAktif.nomorPesanan}</strong>
          </span>

          <span className="hidden text-neutral-600 sm:inline">|</span>

          <span className="font-mono text-[11px] text-neutral-300">
            Total: <strong className="text-amber-300">{formatRupiah(pesananAktif.totalAkhir)}</strong>
          </span>
        </div>

        {/* Kolom Countdown & Tombol Aksi */}
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-neutral-400 uppercase">SISA:</span>
            <span
              className={`font-mono text-sm font-black tracking-wider ${
                sisaDetik < 180 ? "text-rose-400 animate-pulse" : "text-amber-400"
              }`}
            >
              {stringCountdown}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={linkPembayaran}
              className="inline-flex min-h-11 items-center justify-center border border-amber-400 bg-amber-400 px-4 font-mono text-[11px] font-black uppercase text-black transition-colors hover:bg-amber-300 active:scale-98"
            >
              BAYAR SEKARANG
            </Link>

            <button
              type="button"
              onClick={sembunyikanBanner}
              aria-label="Tutup pengingat pembayaran"
              className="inline-flex min-h-11 min-w-11 items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
