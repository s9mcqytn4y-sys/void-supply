import type { Metadata } from "next";
import Image from "next/image";
import { ambilDaftarKatalog } from "@/features/catalog/server";
import { GridProduk } from "@/features/catalog";

export const metadata: Metadata = {
  title: "Katalog | Drop 04: Night Transmission | VOID Supply",
  description: "Jelajahi seluruh koleksi rilis terbatas Drop 04: Night Transmission.",
};

export const dynamic = "force-dynamic";

export default async function HalamanKatalog() {
  const daftarProduk = await ambilDaftarKatalog();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Koleksi Editorial */}
      <header className="mb-10 border-b border-neutral-800 pb-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="mb-2 block font-mono text-xs tracking-widest text-neutral-400 uppercase">
              KATALOG // DROP 04
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase md:text-5xl">
              NIGHT TRANSMISSION
            </h1>
          </div>
          <div className="text-left md:text-right">
            <p className="font-mono text-xs tracking-wider text-neutral-400 uppercase">
              {daftarProduk.length} Artikel Rilis Terbatas
            </p>
          </div>
        </div>

        {/* Hero Editorial Banner Lookbook */}
        <div className="relative aspect-video w-full overflow-hidden border border-neutral-800 bg-neutral-900 md:aspect-21/9">
          <Image
            src="/images/lookbook/drop-04-editorial-hero.webp"
            alt="Drop 04 Night Transmission Lookbook Editorial"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 flex items-end bg-linear-to-t from-neutral-950/80 via-transparent to-transparent p-6 md:p-8">
            <span className="border border-neutral-700/60 bg-neutral-900/80 px-3 py-1.5 font-mono text-xs tracking-widest text-neutral-300 uppercase backdrop-blur-sm">
              EDITORIAL LOOKBOOK // ARCHIVE 2026
            </span>
          </div>
        </div>
      </header>

      {/* Grid Katalog Produk */}
      <GridProduk produk={daftarProduk} />
    </main>
  );
}
