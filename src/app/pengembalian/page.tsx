import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ketentuan Pengembalian & Garansi // VOID Supply",
  description: "Prosedur penukaran produk, klaim cacat produksi garmen, dan garansi keaslian merchandise VOID Supply.",
};

export default function HalamanPengembalian() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-12">
        <div className="border-b border-neutral-800 pb-6">
          <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase">
            JAMINAN MUTU PRODUK // GARANSI KUALITAS MATERIAL
          </span>
          <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            KETENTUAN PENGEMBALIAN & PENUKARAN
          </h1>
          <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-400">
            Prosedur resmi pengajuan klaim cacat produksi, penukaran ukuran, dan garansi keaslian merchandise VOID Supply.
          </p>
        </div>

        <div className="mt-8 space-y-8 font-mono text-xs text-neutral-300">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. PERSYARATAN WAJIB VIDEO UNBOXING
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Demi transparansi bersama dan keabsahan klaim asuransi logistik, setiap pengajuan komplain wajib menyertakan rekaman video unboxing utuh tanpa jeda (no-cut) sejak paket tersegel rapat hingga seluruh artikel dikeluarkan dan diperiksa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. KATEGORI CACAT PRODUKSI YANG DITANGGUNG
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Garansi penggantian 100% berlaku untuk: jahitan sobek struktural, sablon rusak atau luntur sebelum pencucian pertama, resleting YKK macet parah, serta noda kimia dari proses manufaktur. Kerusakan akibat kelalaian pemakaian pribadi atau pencucian yang melanggar petunjuk label tidak ditanggung.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. BATAS WAKTU PENGAJUAN (SLA 3 HARI)
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Laporan penukaran wajib dikirimkan maksimal 3 x 24 jam sejak paket tercatat tiba (delivered) oleh kurir ekspedisi. Pengajuan di luar batas waktu tersebut tidak dapat diproses oleh sistem pergudangan kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. KEBIJAKAN PENUKARAN UKURAN (SIZE EXCHANGE)
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Penukaran ukuran diperkenankan selama ketersediaan stok varian pengganti masih ada dan artikel belum pernah dipakai atau dicuci (hangtag barcode masih terpasang sempurna). Ongkos kirim bolak-balik untuk penukaran ukuran ditanggung oleh pembeli.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              5. PROSEDUR PENGEMBALIAN DANA (REFUND)
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Jika artikel pengganti untuk cacat manufaktur telah habis total (out of stock), pembeli berhak menerima pengembalian dana 100% ke rekening asal dalam 2 hingga 5 hari kerja setelah barang retur lolos inspeksi fisik di Fulfillment Hub Jakarta Pusat.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/kontak"
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase hover:bg-neutral-200"
          >
            HUBUNGI MEJA BANTUAN
          </Link>
          <Link
            href="/katalog"
            className="font-mono text-xs text-neutral-400 underline hover:text-white"
          >
            Kembali ke Katalog Belanja &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
