import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ambilDaftarKatalog } from "@/features/catalog/server";
import { KartuProduk } from "@/features/catalog";

export const metadata: Metadata = {
  title: "VOID Supply | Curated Streetwear & Technical Apparel",
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
      {/* 1. Hero Editorial Streetwear */}
      <section
        aria-label="Highlight Koleksi Drop 04"
        className="relative mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col justify-end px-4 pt-20 pb-12 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/lookbook/drop-04-editorial-hero.webp"
            alt="Lookbook Editorial VOID Supply Drop 04 Night Transmission"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 border border-neutral-700/80 bg-neutral-900/90 px-3 py-1 font-mono text-[11px] tracking-widest text-neutral-300 uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            RILISAN TERBATAS // DROP 04 : NIGHT TRANSMISSION
          </div>

          <h1 className="type-display text-white">
            FUNCTIONAL <br />
            RESISTANCE.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            Eksplorasi garmen streetwear perkotaan berbobot berat. Konstruksi combed 16s 235 GSM,
            ripstop tahan cuaca, dan siluet boxy terstruktur untuk mobilitas tanpa kompromi.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-black uppercase transition-colors hover:bg-neutral-200 active:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              JELAJAHI KATALOG // DROP 04
            </Link>
            <Link
              href="#manifesto"
              className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900/80 px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase backdrop-blur-sm transition-colors hover:border-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              BACA MANIFESTO
            </Link>
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
          <p className="mt-6 text-sm leading-relaxed text-neutral-300 sm:text-base">
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
