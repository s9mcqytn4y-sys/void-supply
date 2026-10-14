import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transparansi Material | VOID Supply",
  description:
    "Spesifikasi komprehensif gramasi kain, arsitektur rajut 500 GSM French Terry, dan panduan perawatan busana VOID Supply.",
  openGraph: {
    title: "Transparansi Material | VOID Supply",
    description: "Spesifikasi komprehensif gramasi kain dan konstruksi teknikal busana VOID Supply.",
  },
};

export default function HalamanMaterial() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header Section */}
      <section className="border-b border-neutral-800 bg-neutral-900/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              STANDAR FABRIKASI // MATERIAL
            </span>
            <h1 className="mt-4 font-sans text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
              TRANSPARANSI MATERIAL
            </h1>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-300">
              Kami meyakini bahwa pakaian streetwear berkualitas dimulai dari pemilihan serat dan kerapatan rajutan. Di bawah ini adalah rincian teknis serat tekstil yang menjadi pondasi seluruh koleksi kami.
            </p>
          </div>
        </div>
      </section>

      {/* Hero Macro Detail */}
      <section className="border-b border-neutral-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-video w-full overflow-hidden border border-neutral-800 bg-neutral-900">
              <Image
                src="/images/brand/material-french-terry.jpg"
                alt="Foto makro tekstur rajutan katun 500 GSM French Terry VOID Supply"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <span className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                SPESIFIKASI KUNCI 01
              </span>
              <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                500 GSM HEAVYWEIGHT FRENCH TERRY
              </h2>
              <p className="text-sm leading-relaxed text-neutral-300">
                Dirancang khusus untuk memberikan drape tegas dan struktur siluet kotak (boxy silhouette). Sisi dalam menggunakan konstruksi loopback tanpa bulu sintesis, memberikan sirkulasi udara yang optimal untuk kenyamanan di malam hari.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-neutral-900 pt-4 font-mono text-xs">
                <div>
                  <span className="text-neutral-500 uppercase block">Kerapatan</span>
                  <span className="text-neutral-200 font-bold">500 Gram per Meter Persegi</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block">Perlakuan Awal</span>
                  <span className="text-neutral-200 font-bold">Pre-shrunk (Anti Susut)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breakdown Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-8">
            ARSITEKTUR MATERIAL LAINNYA
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border border-neutral-800 bg-neutral-900/30 p-8 space-y-4">
              <span className="font-mono text-xs font-bold text-neutral-400">02 // TEE CONSTRUCTION</span>
              <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                24S COMBED COTTON (210 GSM)
              </h3>
              <p className="text-xs leading-relaxed text-neutral-300">
                Dipintal dari serat kapas panjang yang disisir untuk membuang serat pendek. Hasilnya adalah permukaan kain halus dengan resistensi gesek tinggi dan kemampuan menyerap keringat yang andal.
              </p>
              <ul className="space-y-1 font-mono text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                <li>• Benang: 100% Ring Spun Combed Cotton</li>
                <li>• Ribbing Leher: 1x1 Rib dengan elastan 5% tahan melar</li>
              </ul>
            </div>

            <div className="border border-neutral-800 bg-neutral-900/30 p-8 space-y-4">
              <span className="font-mono text-xs font-bold text-neutral-400">03 // HARDWARE & ACCENTS</span>
              <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                YKK METAL ZIPPER & MATTE HARDWARE
              </h3>
              <p className="text-xs leading-relaxed text-neutral-300">
                Semua ritsleting menggunakan varian YKK VISLON dengan tarikan logam hitam doff. Tali penarik hoodie berbahan katun pipih dengan aglet paduan seng berlapis anti korosi.
              </p>
              <ul className="space-y-1 font-mono text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                <li>• Ritsleting: YKK No. 5 Reversible Slider</li>
                <li>• Finishing: Anodized Matte Black Hardware</li>
              </ul>
            </div>
          </div>

          {/* Panduan Perawatan Jujur */}
          <div className="mt-12 border border-neutral-800 bg-neutral-900/40 p-8">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              PANDUAN PERAWATAN GARMENT
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-300">
              Untuk mempertahankan bentuk rajutan dan ketajaman warna hitam:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 font-mono text-xs">
              <div className="border-l border-neutral-700 pl-4">
                <span className="font-bold text-neutral-200">1. CUCI AIR DINGIN</span>
                <p className="mt-1 text-neutral-400 text-[11px]">Gunakan air bersuhu ruang atau dingin. Balik pakaian sebelum dicuci.</p>
              </div>
              <div className="border-l border-neutral-700 pl-4">
                <span className="font-bold text-neutral-200">2. HINDARI PENGERING PANAS</span>
                <p className="mt-1 text-neutral-400 text-[11px]">Keringkan dengan cara digantung di tempat teduh untuk menjaga struktur serat.</p>
              </div>
              <div className="border-l border-neutral-700 pl-4">
                <span className="font-bold text-neutral-200">3. SETRIKA SUHU SEDANG</span>
                <p className="mt-1 text-neutral-400 text-[11px]">Setrika dari bagian dalam pakaian untuk melindungi permukaan rajut.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              LIHAT PRODUK DENGAN MATERIAL INI
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
