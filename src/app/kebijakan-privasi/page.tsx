import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi Data // VOID Supply",
  description: "Prinsip perlindungan data pribadi, enkripsi informasi transaksi, dan proteksi IDOR pelanggan VOID Supply.",
};

export default function HalamanKebijakanPrivasi() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-12">
        <div className="border-b border-neutral-800 pb-6">
          <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase">
            PROTOKOL KEAMANAN DATA // ENKRIPSI SISTEM
          </span>
          <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            KEBIJAKAN PRIVASI PENGGUNA
          </h1>
          <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-400">
            Prinsip privasi data, perlindungan identitas pembeli, dan mitigasi risiko kebocoran informasi pada platform VOID Supply.
          </p>
        </div>

        <div className="mt-8 space-y-8 font-mono text-xs text-neutral-300">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. PENGUMPULAN DATA TRANSAKSI MINIMAL
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Kami mematuhi asas minimisasi data: hanya mengumpulkan data yang esensial untuk penyelesaian kontrak pengiriman dan kewajiban perpajakan, mencakup nama lengkap, alamat email aktif, nomor kontak penerima, serta alamat domisili pengiriman.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. PROTEKSI DOKUMEN & ISOLASI IDOR (SEC-02)
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Dokumen faktur, riwayat pesanan, dan label resi thermal dilindungi dengan token akses berentropi tinggi (UUID v4 122-bit). Permintaan akses publik tanpa token otorisasi yang sah ditolak langsung oleh server (fail-closed) guna melindungi data pribadi pelanggan dari pemindaian URL acak.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. KETIADAAN PENYIMPANAN DATA KARTU KREDIT
            </h2>
            <p className="leading-relaxed text-neutral-400">
              VOID Supply tidak pernah mencatat atau menyimpan nomor kartu kredit atau detail perbankan sensitif pada server internal kami. Seluruh proses pengolahan kartu dan autentikasi token pembayaran dikelola langsung oleh infrastruktur Midtrans yang tersertifikasi PCI-DSS Level 1.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. INTEGRASI LOGISTIK DAN MITRA KURIR
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Data alamat dan nomor telepon penerima diteruskan secara terenkripsi ke Biteship Logistics API hanya pada saat instruksi penjemputan paket (dispatch order) diterbitkan secara resmi oleh sistem outbox kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              5. HAK PENGHAPUSAN DAN PERBAIKAN DATA
            </h2>
            <p className="leading-relaxed text-neutral-400">
              Pelanggan berhak meminta klarifikasi, pembetulan, atau penghapusan data kontak setelah masa retensi transaksi hukum selesai dengan menghubungi meja bantuan resmi di privacy@voidsupply.com.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/syarat-ketentuan"
            className="font-mono text-xs text-neutral-400 underline hover:text-white"
          >
            &larr; Syarat & Ketentuan Layanan
          </Link>
          <Link
            href="/pengembalian"
            className="font-mono text-xs text-neutral-400 underline hover:text-white"
          >
            Ketentuan Pengembalian Barang &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
