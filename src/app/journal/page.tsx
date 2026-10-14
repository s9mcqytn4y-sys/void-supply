import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Journal | VOID Supply",
  description:
    "Arsip narasi desain, dokumentasi kampanye editorial, dan kronologi perilisan batch VOID Supply.",
  openGraph: {
    title: "Editorial Journal | VOID Supply",
    description: "Arsip narasi desain dan dokumentasi kampanye editorial VOID Supply.",
  },
};

const entries = [
  {
    drop: "DROP 04",
    title: "NIGHT TRANSMISSION",
    date: "Oktober 2026",
    status: "AKTIF",
    desc: "Eksplorasi siluet pelindung perkotaan dengan fokus pada balaclava hooded fleece, overcoat modular, dan celana cargo lipit ganda berbahan katun ripstop.",
  },
  {
    drop: "DROP 03",
    title: "CONCRETE MONOLITH",
    date: "Juni 2026",
    status: "ARSIP",
    desc: "Penelitian mendalam mengenai struktur siluet boxy 500 GSM French Terry tanpa jahitan samping untuk menciptakan struktur jatuh pakaian yang kokoh.",
  },
  {
    drop: "DROP 02",
    title: "NOCTURNAL DYNAMICS",
    date: "Januari 2026",
    status: "ARSIP",
    desc: "Perkenalan pertama sistem ribbing leher elastan 330 GSM dan finishing benang doff pada kaos lengan panjang katun combed.",
  },
  {
    drop: "DROP 01",
    title: "INITIAL PROTOCOL",
    date: "Agustus 2025",
    status: "ARSIP",
    desc: "Rilisan foundational pertama studio: pengujian awal daya tahan kain katun terhadap kelembaban udara malam hari di Jakarta Pusat.",
  },
];

export default function HalamanJournal() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header Section */}
      <section className="border-b border-neutral-800 bg-neutral-900/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              DOKUMENTASI STUDIO // JOURNAL
            </span>
            <h1 className="mt-4 font-sans text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
              EDITORIAL JOURNAL
            </h1>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-300">
              Catatan kronologis setiap batch rilisan dan eksplorasi bentuk pakaian teknikal dari studio VOID Supply.
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
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-8">
            KRONOLOGI BATCH RILISAN
          </h2>

          <div className="space-y-6">
            {entries.map((entry) => (
              <article
                key={entry.drop}
                className="border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8 transition-colors hover:border-neutral-700"
              >
                <div className="flex flex-col justify-between sm:flex-row sm:items-baseline gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-neutral-400">
                      {entry.drop}
                    </span>
                    <span className="text-neutral-700">|</span>
                    <h3 className="font-sans text-lg font-bold text-white uppercase tracking-wider">
                      {entry.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
                    <span>{entry.date}</span>
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

                <p className="mt-4 text-xs leading-relaxed text-neutral-300 max-w-3xl">
                  {entry.desc}
                </p>

                {entry.status === "AKTIF" && (
                  <div className="mt-6">
                    <Link
                      href="/katalog"
                      className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-4 py-2 font-mono text-xs font-semibold text-white uppercase transition-colors hover:border-neutral-500 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      LIHAT ARTIKEL DROP 04
                    </Link>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
