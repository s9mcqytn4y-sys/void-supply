import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDropBySlug,
  getAllDropSlugs,
  type JournalDropEntry,
} from "@/features/journal/data/journal-archive";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllDropSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getDropBySlug(slug);

  if (!entry) {
    return {
      title: "Arsip Tidak Ditemukan | VOID Supply",
    };
  }

  return {
    title: `${entry.nomorDrop} ${entry.judul} | Editorial Journal VOID Supply`,
    description: entry.ringkasan,
    openGraph: {
      title: `${entry.nomorDrop} ${entry.judul} // VOID SUPPLY`,
      description: entry.ringkasan,
      images: [
        {
          url: entry.bannerLookbook,
          width: 1920,
          height: 1080,
          alt: `${entry.nomorDrop} ${entry.judul} Campaign Lookbook`,
        },
      ],
    },
  };
}

export default async function HalamanDetailJournal({ params }: PageProps) {
  const { slug } = await params;
  const entry = getDropBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Breadcrumb & Navigation Bar */}
      <section className="border-b border-neutral-800 bg-neutral-900/40 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
            <Link
              href="/journal"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              EDITORIAL JOURNAL
            </Link>
            <span className="text-neutral-700" aria-hidden="true">
              /
            </span>
            <span className="text-white font-bold">{entry.nomorDrop}</span>
          </div>
        </div>
      </section>

      {/* Hero Header Section */}
      <section className="border-b border-neutral-800 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase">
                {entry.nomorDrop} // {entry.periode}
              </span>
              <span
                className={`px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                  entry.status === "AKTIF"
                    ? "bg-white text-black"
                    : "border border-neutral-700 text-neutral-400"
                }`}
              >
                {entry.status}
              </span>
            </div>

            <h1 className="mt-4 font-sans text-4xl font-extrabold uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
              {entry.judul}
            </h1>
            <p className="mt-3 font-mono text-sm tracking-wide text-neutral-400 sm:text-base uppercase">
              {entry.subjudul}
            </p>
            <p className="mt-6 font-mono text-sm leading-relaxed text-neutral-300 max-w-3xl">
              {entry.ringkasan}
            </p>
          </div>
        </div>
      </section>

      {/* Lookbook Campaign Banner */}
      <section className="border-b border-neutral-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video w-full overflow-hidden border border-neutral-800 bg-neutral-900">
            <Image
              src={entry.bannerLookbook}
              alt={`${entry.nomorDrop} ${entry.judul} Editorial Lookbook`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <div className="absolute bottom-4 left-4 border border-neutral-700 bg-black/85 px-3 py-1.5 font-mono text-[11px] text-neutral-200 backdrop-blur-sm sm:bottom-6 sm:left-6">
              <span>EDITORIAL ARCHIVE // {entry.nomorDrop} {entry.judul}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Curatorial Essay Section */}
      <section className="border-b border-neutral-800 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div>
              <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase block mb-3">
                MANIFESTO & RISET BENTUK
              </span>
              <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                FILOSOFI MATERIAL
              </h2>
            </div>

            <div className="space-y-6 lg:col-span-2">
              {entry.narasiFilosofis.map((paragraf, idx) => (
                <p
                  key={idx}
                  className="text-sm leading-relaxed text-neutral-300 font-sans sm:text-base"
                >
                  {paragraf}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Colorway Swatches Section */}
      <section className="border-b border-neutral-800 py-16 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase block mb-2">
            SPEKTRUM PIGMEN HISTORIS
          </span>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-white mb-8">
            PALET WARNA {entry.nomorDrop}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {entry.paletWarna.map((swatch) => (
              <div
                key={swatch.nama}
                className="border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-700"
              >
                <div
                  className="h-16 w-full border border-neutral-700 mb-4 rounded-xs shadow-inner"
                  style={{ backgroundColor: swatch.hex }}
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-sm font-bold text-white uppercase">
                    {swatch.nama}
                  </h3>
                  <span className="font-mono text-xs text-neutral-400">{swatch.hex}</span>
                </div>
                <p className="mt-2 font-mono text-xs text-neutral-400 leading-normal">
                  {swatch.keterangan}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Textile Specifications Table */}
      <section className="border-b border-neutral-800 py-16 bg-neutral-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase block mb-2">
            STANDAR KUALITAS STUDIO
          </span>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-white mb-8">
            SPESIFIKASI TEKSTIL
          </h2>

          <div className="overflow-x-auto border border-neutral-800 bg-neutral-900/50">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Tipe Material</th>
                  <th scope="col" className="px-6 py-4">Kerapatan / Gramasi</th>
                  <th scope="col" className="px-6 py-4">Teknik Pewarnaan</th>
                  <th scope="col" className="px-6 py-4">Konstruksi Jahitan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {entry.spesifikasiTekstil.map((spec, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                      {spec.tipe}
                    </td>
                    <td className="px-6 py-4 text-neutral-300">{spec.gramasi}</td>
                    <td className="px-6 py-4 text-neutral-300">{spec.pewarnaan}</td>
                    <td className="px-6 py-4 text-neutral-300">{spec.konstruksi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Archival Release Products */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase block mb-2">
            KATALOG ARSIP RESMI
          </span>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-white mb-8">
            ARTIKEL RILISAN {entry.nomorDrop}
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {entry.artikelRilisan.map((item) => (
              <div
                key={item.sku}
                className="border border-neutral-800 bg-neutral-900/30 p-6 flex flex-col justify-between transition-colors hover:border-neutral-700"
              >
                <div>
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px] mb-2">
                    <span>{item.sku}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        item.status === "TERSEDIA"
                          ? "bg-white text-black"
                          : "border border-neutral-700 text-neutral-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wide">
                    {item.nama}
                  </h3>
                  <p className="mt-2 font-mono text-xs text-neutral-400 leading-relaxed">
                    {item.deskripsiSingkat}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-500">Harga Rilis</span>
                  <span className="font-bold text-white">
                    Rp {item.hargaRilis.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="mt-12 flex flex-col items-center justify-between border-t border-neutral-800 pt-8 sm:flex-row gap-4">
            <Link
              href="/journal"
              className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-transparent px-6 py-2.5 font-mono text-xs font-semibold uppercase text-neutral-300 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              KEMBALI KE INDEKS JOURNAL
            </Link>

            {entry.status === "AKTIF" && (
              <Link
                href="/katalog"
                className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold uppercase text-black transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                BELANJA ARTIKEL DROP 04
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
