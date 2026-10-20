"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Zap, Clock, PackageCheck } from "lucide-react";

interface SisaWaktuDrop {
  hari: number;
  jam: number;
  menit: number;
  detik: number;
}

export function KampanyePreOrderBundling() {
  const [sudahHidrasi, setSudahHidrasi] = useState(false);
  const [sisaWaktu, setSisaWaktu] = useState<SisaWaktuDrop>({
    hari: 2,
    jam: 14,
    menit: 45,
    detik: 30,
  });

  useEffect(() => {
    setSudahHidrasi(true);

    // Target tanggal penutupan batch pre-order (72 jam dari sekarang)
    const targetWaktu = new Date().getTime() + (2 * 86400 + 14 * 3600 + 45 * 60) * 1000;

    const interval = setInterval(() => {
      const sekarang = new Date().getTime();
      const selisih = targetWaktu - sekarang;

      if (selisih <= 0) {
        clearInterval(interval);
        setSisaWaktu({ hari: 0, jam: 0, menit: 0, detik: 0 });
      } else {
        setSisaWaktu({
          hari: Math.floor(selisih / (1000 * 60 * 60 * 24)),
          jam: Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          menit: Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60)),
          detik: Math.floor((selisih % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      aria-label="Kampanye Pre-Order Bundling Cybernetic Division"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="relative overflow-hidden border border-zinc-800 bg-zinc-950 p-6 sm:p-8 lg:p-12">
        {/* Latar Belakang Garis Grid Dekoratif */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center">
          {/* Sisi Kiri: Visual Editorial Kampanye */}
          <div className="lg:col-span-7">
            <div className="group relative overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
              <div className="relative aspect-video w-full">
                <Image
                  src="/images/lookbook/cybernetic-division-campaign.jpg"
                  alt="Kampanye Streetwear Cybernetic Division Drop 04 VOID Supply"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-103"
                  priority={false}
                  loading="lazy"
                />
              </div>

              {/* Label Status Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 border border-zinc-700 bg-black/85 px-3 py-1 font-mono text-[10px] tracking-widest text-zinc-200 uppercase backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                BATCH PRE-ORDER 01 : ESTIMASI 14 HARI KERJA
              </div>

              <div className="absolute right-3 bottom-3 border border-zinc-800 bg-zinc-950/90 px-2.5 py-1 font-mono text-[10px] tracking-wider text-zinc-300 uppercase">
                CYBERNETIC DIVISION // 2026
              </div>
            </div>

            {/* List 3 Item Bundling Cepat */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4 font-mono text-[11px]">
              <div className="border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                <span className="text-zinc-500 block text-[9px] uppercase">ARTIKEL 01</span>
                <p className="font-semibold text-zinc-200 truncate mt-0.5">Heavy Hoodie</p>
                <span className="text-zinc-400 text-[10px]">420 GSM</span>
              </div>
              <div className="border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                <span className="text-zinc-500 block text-[9px] uppercase">ARTIKEL 02</span>
                <p className="font-semibold text-zinc-200 truncate mt-0.5">Modular Cargo</p>
                <span className="text-zinc-400 text-[10px]">Ripstop Nilon</span>
              </div>
              <div className="border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                <span className="text-zinc-500 block text-[9px] uppercase">ARTIKEL 03</span>
                <p className="font-semibold text-zinc-200 truncate mt-0.5">Storm Balaclava</p>
                <span className="text-zinc-400 text-[10px]">Tahan Cuaca</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Spesifikasi Promo, Countdown, dan Transparansi */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-1.5 border border-amber-900/40 bg-amber-950/20 px-2.5 py-1 font-mono text-[10px] tracking-widest text-amber-400 uppercase">
              <Zap className="h-3 w-3" />
              SPECIAL BUNDLE RELEASE
            </div>

            <h2 className="mt-3 font-mono text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
              CYBERNETIC TRINITY SET.
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:text-sm">
              Satu paket komprehensif perlengkapan urban nocturne. Mengombinasikan proteksi thermal fleece 420 GSM,
              fleksibilitas saku modular cargo, dan balaclava antibakterial. Kuota batch perdana dibatasi hanya 50 paket.
            </p>

            {/* Countdown Timer */}
            <div className="mt-5 border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono tracking-wider uppercase mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-zinc-400" />
                  WAKTU TERSISA BATCH 01
                </span>
                <span className="text-amber-400 font-bold">HEMAT IDR 268.000</span>
              </div>

              <div className="grid grid-cols-4 gap-2 font-mono text-center">
                <div className="bg-black/70 border border-zinc-800 py-2">
                  <span className="text-lg font-bold text-white sm:text-xl">
                    {sudahHidrasi ? String(sisaWaktu.hari).padStart(2, "0") : "02"}
                  </span>
                  <span className="block text-[9px] text-zinc-500 uppercase mt-0.5">HARI</span>
                </div>
                <div className="bg-black/70 border border-zinc-800 py-2">
                  <span className="text-lg font-bold text-white sm:text-xl">
                    {sudahHidrasi ? String(sisaWaktu.jam).padStart(2, "0") : "14"}
                  </span>
                  <span className="block text-[9px] text-zinc-500 uppercase mt-0.5">JAM</span>
                </div>
                <div className="bg-black/70 border border-zinc-800 py-2">
                  <span className="text-lg font-bold text-white sm:text-xl">
                    {sudahHidrasi ? String(sisaWaktu.menit).padStart(2, "0") : "45"}
                  </span>
                  <span className="block text-[9px] text-zinc-500 uppercase mt-0.5">MENIT</span>
                </div>
                <div className="bg-black/70 border border-zinc-800 py-2">
                  <span className="text-lg font-bold text-amber-400 sm:text-xl">
                    {sudahHidrasi ? String(sisaWaktu.detik).padStart(2, "0") : "30"}
                  </span>
                  <span className="block text-[9px] text-zinc-500 uppercase mt-0.5">DETIK</span>
                </div>
              </div>
            </div>

            {/* Skema Harga Transparan */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-mono text-2xl font-black text-white sm:text-3xl">
                Rp 1.199.000
              </span>
              <span className="font-mono text-sm text-zinc-500 line-through">
                Rp 1.467.000
              </span>
              <span className="border border-emerald-900/60 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                DISKON 18%
              </span>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/katalog/cybernetic-trinity-set"
                data-testid="tombol-klaim-bundling"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-white bg-white px-5 py-2.5 font-mono text-xs font-semibold tracking-wider text-black uppercase transition-all hover:bg-zinc-200 active:scale-[0.98] active:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                KLAIM PAKET BUNDLING
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/katalog"
                className="inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-5 py-2.5 font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-all hover:border-zinc-600 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                LIHAT ARTIKEL SATUAN
              </Link>
            </div>

            {/* Jaminan & Kepastian Layanan */}
            <div className="mt-5 flex items-center gap-4 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span>GARANSI TUKAR SIZE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PackageCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span>ORIGIN JAKARTA PUSAT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
