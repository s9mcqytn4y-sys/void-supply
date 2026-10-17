import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JOURNAL_ARCHIVE } from "@/features/journal/data/journal-archive";

export const metadata: Metadata = {
  title: "Editorial Journal | VOID Supply",
  description:
    "Arsip narasi desain, dokumentasi kampanye editorial, dan kronologi perilisan batch studio VOID Supply.",
  openGraph: {
    title: "Editorial Journal | VOID Supply",
    description: "Arsip narasi desain dan dokumentasi kampanye editorial VOID Supply.",
    images: [
      {
        url: "/images/lookbook/journal-editorial-archive.jpg",
        width: 1920,
        height: 1080,
        alt: "Arsip Kampanye Editorial VOID Supply",
      },
    ],
  },
};

export default function HalamanJournal() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header Section */}
      <section className="border-b border-neutral-800 bg-neutral-900/40 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              DOKUMENTASI STUDIO // JOURNAL
            </span>
            <h1 className="mt-4 font-sans text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              EDITORIAL JOURNAL
            </h1>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-300">
              Catatan kronologis setiap babak perilisan batch dan eksplorasi bentuk pakaian teknikal dari studio VOID Supply.
            </p>
          </div>
        </div>
      </section>

      {/* Hero Editorial Campaign Image */}
      <section className="border-b border-neutral-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video w-full overflow-hidden border border-neutral-800 bg-neutral-900">
            <Image
              src="/images/lookbook/journal-editorial-archive.jpg"
              alt="Kampanye editorial busana teknikal VOID Supply Drop 04 Night Transmission"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-4 left-4 border border-neutral-700 bg-black/80 px-3 py-1 font-mono text-[11px] text-neutral-200 backdrop-blur-sm sm:bottom-6 sm:left-6">
              <span>EDITORIAL CAMPAIGN // NIGHT TRANSMISSION</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Entries */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              KRONOLOGI BATCH RILISAN ({JOURNAL_ARCHIVE.length} BATCH)
            </h2>
            <span className="font-mono text-[11px] text-neutral-500">
              JAKARTA PUSAT // 2025:2026
            </span>
          </div>

          <div className="space-y-8">
            {JOURNAL_ARCHIVE.map((entry) => (
              <article
                key={entry.slug}
                className="group border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8 transition-colors hover:border-neutral-600"
              >
                <div className="flex flex-col justify-between sm:flex-row sm:items-baseline gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-neutral-400">
                      {entry.nomorDrop}
                    </span>
                    <span className="text-neutral-700" aria-hidden="true">
                      |
                    </span>
                    <h3 className="font-sans text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200">
                      {entry.judul}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
                    <span>{entry.periode}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        entry.status === "AKTIF"
                          ? "bg-white text-black"
                          : "border border-neutral-700 text-neutral-400"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                </div>

                <p className="mt-2 font-mono text-xs text-neutral-400 uppercase tracking-wide">
                  {entry.subjudul}
                </p>

                <p className="mt-4 text-xs leading-relaxed text-neutral-300 max-w-3xl font-sans">
                  {entry.ringkasan}
                </p>

                {/* Historical Colorway Preview */}
                <div className="mt-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mr-2">
                    PALET:
                  </span>
                  {entry.paletWarna.map((swatch) => (
                    <span
                      key={swatch.nama}
                      title={`${swatch.nama} (${swatch.hex})`}
                      className="inline-block h-4 w-4 rounded-xs border border-neutral-700"
                      style={{ backgroundColor: swatch.hex }}
                    />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-800/80">
                  <Link
                    href={`/journal/${entry.slug}`}
                    className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-5 py-2 font-mono text-xs font-semibold text-white uppercase transition-colors hover:border-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    BACA DOKUMENTASI LENGKAP
                  </Link>

                  {entry.status === "AKTIF" && (
                    <Link
                      href="/katalog"
                      className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-5 py-2 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      LIHAT ARTIKEL DROP 04
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
