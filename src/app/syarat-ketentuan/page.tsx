import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Layanan // VOID Supply",
  description: "Ketentuan operasional, transaksi pembayaran, reservasi stok, dan pemenuhan pesanan merchandise resmi VOID Supply.",
};

export default function HalamanSyaratKetentuan() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-12">
        <div className="border-b border-neutral-800 pb-6">
          <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase">
            DOKUMEN KONTRAK TRANSAKSI // REVISI OKTOBER 2026
          </span>
          <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            SYARAT DAN KETENTUAN LAYANAN
          </h1>
          <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-400">
            Peraturan resmi pembelian merchandise, reservasi inventaris, dan pemenuhan pesanan pada platform VOID Supply.
          </p>
        </div>

        <div className="mt-8 space-y-8 font-mono text-xs text-neutral-300">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. KETENTUAN UMUM DAN IDENTITAS ENTITAS
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Platform toko online VOID Supply beroperasi sebagai kanal distribusi merchandise streetwear resmi yang berpusat di Johar Baru, Jakarta Pusat, Indonesia. Dengan menempatkan pesanan pada sistem kami, pembeli menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan operasional ini tanpa pengecualian.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. RESERVASI STOK DAN BATAS WAKTU PEMBAYARAN
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Setiap pembuatan pesanan mengalokasikan stok varian produk secara bersyarat atomik selama 15 menit. Jika pembayaran tidak diverifikasi oleh gerbang pembayaran resmi dalam jendela waktu tersebut, sistem secara otomatis membatalkan pesanan dan mengembalikan unit inventaris ke etalase publik.
            </p>
            <p className="leading-relaxed text-neutral-400">
              Maksimal kuantitas pembelian dibatasi 10 unit per artikel SKU untuk mencegah aksi spekulatif penimbunan barang (anti-scalping policy).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. METODE PEMBAYARAN DAN OTENTIKASI
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Transaksi diproses melalui mitra resmi Midtrans Snap dengan opsi Virtual Account (BCA, Mandiri, BNI, BRI), QRIS Nasional, dan dompet digital GoPay. Status pembayaran dinyatakan sah hanya setelah sistem menerima notifikasi terverifikasi dengan tanda tangan kriptografis SHA-512 resmi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. PENGIRIMAN DAN ASURANSI LOGISTIK
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Ongkos kirim dikalkulasikan secara real-time berdasarkan bobot gram riil produk dan kode pos tujuan melalui Biteship Logistics API. Seluruh paket diberangkatkan dari Fulfillment Center Jakarta Pusat menggunakan ekspedisi terdaftar (JNE, SiCepat, J&T) dan dilindungi klausul asuransi barang.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              5. HAK KEKAYAAN INTELEKTUAL
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Seluruh tipografi, rancangan grafis apparel, logo emblem VOID, dan aset visual editorial merupakan hak cipta eksklusif yang dilindungi undang-undang. Reproduksi atau pembajakan dalam bentuk apa pun akan diproses secara hukum.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/katalog"
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase hover:bg-neutral-200"
          >
            KEMBALI KE KATALOG
          </Link>
          <Link
            href="/kebijakan-privasi"
            className="font-mono text-xs text-neutral-400 underline hover:text-white"
          >
            Baca Kebijakan Privasi Data &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
