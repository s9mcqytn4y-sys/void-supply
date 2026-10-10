import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ambilDaftarKatalog } from "@/features/catalog/server";
import { KartuProduk } from "@/features/catalog";

export const metadata: Metadata = {
  title: "VOID Supply | Curated Heavyweight Streetwear",
  description:
    "Etalase busana streetwear independen dan apparel teknikal. Rilisan terbatas Drop 04: Night Transmission dengan transparansi material dan konstruksi presisi.",
};

export const dynamic = "force-dynamic";

export default async function HalamanBeranda() {
  const seluruhProduk = await ambilDaftarKatalog();
  // Ambil 4 artikel kurasi unggulan untuk highlight beranda
  const artikelUnggulan = seluruhProduk.slice(0, 4);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* 1. Hero Section: Split Editorial Streetwear (Mobile Fit & Desktop Precision) */}
      <section
        aria-label="Highlight Koleksi Drop 04"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
      >
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Kolom Teks & Narasi Editorial (5 Kolom Desktop) */}
          <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-5">
            <div className="mb-4 inline-flex w-fit items-center gap-2 border border-neutral-800 bg-neutral-900/90 px-3 py-1 font-mono text-[11px] tracking-widest text-neutral-300 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              RILISAN TERBATAS // DROP 04
            </div>

            <h1 className="font-mono text-3xl font-black tracking-tighter text-white uppercase sm:text-5xl lg:text-5xl xl:text-6xl">
              FUNCTIONAL <br className="hidden sm:inline" />
              RESISTANCE.
            </h1>

            <p className="mt-4 max-w-lg text-xs leading-relaxed text-neutral-300 sm:text-sm">
              Eksplorasi garmen streetwear perkotaan berbobot berat. Katun combed 16s berdensitas tinggi 235 GSM,
              nilon ripstop tahan cuaca, serta fleece loopback 420 GSM berstruktur kokoh untuk mobilitas iklim nokturnal.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
              <Link
                href="/katalog"
                className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-black uppercase transition-colors hover:bg-neutral-200 active:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                JELAJAHI KATALOG
              </Link>
              <Link
                href="#manifesto"
                className="inline-flex min-h-11 items-center justify-center border border-neutral-800 bg-neutral-900 px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase transition-colors hover:border-neutral-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                BACA MANIFESTO
              </Link>
            </div>

            {/* Spek Cepat Grid */}
            <div className="mt-8 grid grid-cols-3 border-t border-neutral-900 pt-6 font-mono text-[11px]">
              <div>
                <span className="text-neutral-400">GRAMASI</span>
                <p className="font-bold text-white">235 - 420 GSM</p>
              </div>
              <div>
                <span className="text-neutral-400">KONSTRUKSI</span>
                <p className="font-bold text-white">DOUBLE CHAIN</p>
              </div>
              <div>
                <span className="text-neutral-400">STATUS DROP</span>
                <p className="font-bold text-emerald-400">TERSEDIA</p>
              </div>
            </div>
          </div>

          {/* Kolom Frame Editorial Visual (7 Kolom Desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="group relative overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
              <div className="relative aspect-4/3 w-full sm:aspect-16/10 lg:aspect-4/3">
                <Image
                  src="/images/lookbook/drop-04-editorial-hero.webp"
                  alt="Lookbook Editorial Model VOID Supply Drop 04 Night Transmission"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 55vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-102"
                />
              </div>

              {/* Tag Caption Editorial Brutalist */}
              <div className="absolute right-3 bottom-3 border border-neutral-800/90 bg-neutral-950/85 px-2.5 py-1 font-mono text-[10px] tracking-wider text-neutral-300 uppercase backdrop-blur-xs">
                LOOK 01 // NIGHT TRANSMISSION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Artikel Unggulan (Direct Link ke PDP) */}
      <section
        aria-label="Artikel Unggulan Drop 04"
        className="mx-auto max-w-7xl border-t border-neutral-800 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="type-caption text-neutral-400">
              KURASI TERPILIH // EDISI TERBATAS
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
              ARTIKEL UNGGULAN
            </h2>
          </div>
          <Link
            href="/katalog"
            className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            LIHAT SEMUA ({seluruhProduk.length} ARTIKEL) →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {artikelUnggulan.map((item, index) => (
            <KartuProduk key={item.id} produk={item} priority={index < 2} />
          ))}
        </div>
      </section>

      {/* 3. Brand Manifesto & Transparansi Rekayasa */}
      <section
        id="manifesto"
        aria-label="Manifesto Merek VOID Supply"
        className="border-t border-neutral-800 bg-neutral-900/40 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">
            VOID SUPPLY // FILOSOFI OPERASIONAL
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white uppercase sm:text-4xl">
            TANPA GIMMICK. HANYA MATERIAL BERMUTU TINGGI.
          </h2>
          <p className="mt-6 text-xs leading-relaxed text-neutral-300 sm:text-sm">
            Kami menolak fast-fashion yang lekas rusak. Setiap helai artikel VOID Supply dirancang
            dengan spesifikasi gramasi kain nyata, jahitan rantai berulang, dan ketahanan uji pakai
            panjang. Tidak ada testimoni rekaan, tidak ada klaim kosong.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <span className="font-mono text-xs font-semibold text-neutral-400">01 // GSM NYATA</span>
              <h3 className="mt-2 text-base font-bold text-white uppercase">235 - 420 GSM</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Katun combed 16s berbobot mantap serta fleece rajut rapat anti susut setelah pencucian.
              </p>
            </div>
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <span className="font-mono text-xs font-semibold text-neutral-400">02 // ATOMIK STOK</span>
              <h3 className="mt-2 text-base font-bold text-white uppercase">AKURASI INVENTARIS</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Pengecekan stok sinkron real-time langsung ke kluster basis data tanpa pembatalan sepihak.
              </p>
            </div>
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <span className="font-mono text-xs font-semibold text-neutral-400">03 // TRANSPARANSI</span>
              <h3 className="mt-2 text-base font-bold text-white uppercase">UKURAN PRESISI</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Tabel ukuran riil dalam sentimeter dengan panduan fitting terstandarisasi untuk kenyamanan Anda.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
