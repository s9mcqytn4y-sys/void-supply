import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang Kami | VOID Supply Atelier",
  description:
    "Eksplorasi filosofi konstruksi, transparansi manufaktur, dan studio independen VOID Supply di Johar Baru, Jakarta Pusat.",
  openGraph: {
    title: "Tentang Kami | VOID Supply Atelier",
    description: "Eksplorasi filosofi konstruksi dan transparansi manufaktur VOID Supply.",
  },
};

export default function HalamanTentang() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero Section */}
      <section className="relative border-b border-neutral-800 bg-neutral-900/40 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              STUDIO IDENTITAS // ATELIER
            </span>
            <h1 className="mt-4 font-sans text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
              VOID SUPPLY
            </h1>
            <p className="mt-6 font-mono text-sm leading-relaxed text-neutral-300 sm:text-base">
              Berbasis di Johar Baru, Jakarta Pusat, VOID Supply beroperasi sebagai studio eksperimen busana teknikal. Kami memfokuskan seluruh proses kerja pada rasio berat kain, ketahanan jahitan, dan utilitas nyata tanpa ornamen yang tidak memiliki fungsi.
            </p>
          </div>
        </div>
      </section>

      {/* Atelier Visual & Studio Narrative */}
      <section className="border-b border-neutral-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-video w-full overflow-hidden border border-neutral-800 bg-neutral-900">
              <Image
                src="/images/brand/about-studio-atelier.jpg"
                alt="Studio kerja perancangan pola busana teknikal VOID Supply di Jakarta"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <span className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                MANUFAKTUR & METODOLOGI
              </span>
              <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                REDUKSI ORNAMEN, FOKUS KONSTRUKSI
              </h2>
              <p className="text-sm leading-relaxed text-neutral-300">
                Setiap pola dipotong dengan presisi anatomi gerak. Kami memilih katun rajut tebal 500 GSM French Terry dan katun combed 24s berdensitas tinggi untuk menciptakan siluet kokoh yang bertahan melalui penggunaan harian di iklim urban tropis.
              </p>
              <div className="border-t border-neutral-900 pt-6">
                <dl className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <dt className="text-neutral-500 uppercase">Lokasi Studio</dt>
                    <dd className="mt-1 font-semibold text-neutral-200">Johar Baru, Jakarta Pusat</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500 uppercase">Format Rilisan</dt>
                    <dd className="mt-1 font-semibold text-neutral-200">Siklus Batch Terjadwal</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Blocks */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-8">
            TIGA PILAR STANDAR KERJA
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="border border-neutral-800 bg-neutral-900/30 p-6">
              <span className="font-mono text-xs font-bold text-neutral-500">01</span>
              <h3 className="mt-3 font-mono text-sm font-bold tracking-wider text-white uppercase">
                TRANSPARANSI BERAT KAIN
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                Kami mempublikasikan gramasi riil setiap kain di setiap halaman produk. Tidak ada angka fiktif atau istilah marketing tanpa bukti fisik.
              </p>
            </article>

            <article className="border border-neutral-800 bg-neutral-900/30 p-6">
              <span className="font-mono text-xs font-bold text-neutral-500">02</span>
              <h3 className="mt-3 font-mono text-sm font-bold tracking-wider text-white uppercase">
                JAHITAN GANDA BERTENAGA
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                Poin stres pada bahu, leher, dan saku menggunakan teknik bar-tack dan benang poliester berkekuatan tarik tinggi.
              </p>
            </article>

            <article className="border border-neutral-800 bg-neutral-900/30 p-6">
              <span className="font-mono text-xs font-bold text-neutral-500">03</span>
              <h3 className="mt-3 font-mono text-sm font-bold tracking-wider text-white uppercase">
                LOGISTIK ASURANSI PENUH
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                Seluruh pesanan dikemas dengan segel pengaman tahan air dan diverifikasi melalui resi pelacakan kurir terintegrasi.
              </p>
            </article>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              JELAJAHI RILISAN TERKINI
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
