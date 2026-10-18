import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ambilStatistikDasborAction } from "@/features/admin/actions/dasbor-admin.action";
import {
  KartuMetrikBrutalis,
  BadgeStatusOperasional,
} from "@/features/admin/components/primitives";
import {
  DollarSign,
  Package,
  Clock,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HalamanAdminDasbor() {
  const res = await ambilStatistikDasborAction();
  const data = res.data;

  const totalOmset = data?.totalOmset || 0;
  const totalPesanan = data?.totalPesanan || 0;
  const pesananPerluProses = data?.pesananPerluProses || 0;
  const artikelKritis = data?.totalArtikelKritis || 0;

  return (
    <div className="space-y-8">
      {/* Header Dasbor */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] text-zinc-400 uppercase tracking-wider mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            STAGING DEMO // NEON POSTGRESQL + GMAIL SMTP
          </div>
          <h1 className="font-mono text-2xl font-black text-white uppercase tracking-tight sm:text-3xl">
            DASBOR OPERASIONAL INTERNAL
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Monitoring transaksi real-time, ketersediaan inventaris, dan status logistik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventaris"
            className="inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-4 font-mono text-xs font-semibold text-zinc-300 uppercase hover:border-zinc-600 hover:text-white transition-colors"
          >
            CEK INVENTARIS
          </Link>
          <Link
            href="/admin/pesanan"
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-5 font-mono text-xs font-bold text-black uppercase hover:bg-zinc-200 transition-colors"
          >
            KELOLA PESANAN
          </Link>
        </div>
      </div>

      {/* Grid 4 Kartu Metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KartuMetrikBrutalis
          label="TOTAL OMSET TERKUMPUL"
          nilai={formatRupiah(totalOmset)}
          keterangan="Akumulasi seluruh transaksi non-batal"
          warnaAksen="emerald"
          ikon={<DollarSign className="h-4 w-4" />}
        />
        <KartuMetrikBrutalis
          label="TOTAL TRANSAKSI"
          nilai={`${totalPesanan} Pesanan`}
          keterangan="Total transaksi masuk ke sistem"
          ikon={<Package className="h-4 w-4" />}
        />
        <KartuMetrikBrutalis
          label="PERLU TINDAKAN"
          nilai={`${pesananPerluProses} Pesanan`}
          keterangan="Menunggu pembayaran atau penjemputan"
          warnaAksen={pesananPerluProses > 0 ? "amber" : "default"}
          ikon={<Clock className="h-4 w-4" />}
        />
        <KartuMetrikBrutalis
          label="SKU STOK KRITIS"
          nilai={`${artikelKritis} SKU`}
          keterangan="Varian dengan kuantitas <= 5 unit"
          warnaAksen={artikelKritis > 0 ? "rose" : "default"}
          ikon={<AlertOctagon className="h-4 w-4" />}
        />
      </div>

      {/* Grid 2 Kolom Operasional: Pesanan Terbaru & Stok Menipis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Pesanan Terbaru (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              PESANAN TERBARU MASUK
            </h2>
            <Link
              href="/admin/pesanan"
              className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>SEMUA PESANAN</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!data?.pesananTerbaru || data.pesananTerbaru.length === 0 ? (
            <div className="border border-zinc-800 bg-zinc-950 p-8 text-center">
              <p className="font-mono text-xs text-zinc-500 uppercase">
                Belum ada transaksi pesanan yang tercatat.
              </p>
            </div>
          ) : (
            <div className="border border-zinc-800 bg-zinc-950 divide-y divide-zinc-850">
              {data.pesananTerbaru.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        #{p.nomorPesanan}
                      </span>
                      <BadgeStatusOperasional status={p.statusPesanan} />
                    </div>
                    <p className="font-mono text-xs text-zinc-400">
                      {p.namaPelanggan} {p.kurir && `// ${p.kurir.toUpperCase()}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="font-mono text-xs font-bold text-white">
                      {formatRupiah(p.totalAkhir)}
                    </span>
                    <Link
                      href={`/admin/pesanan/${p.nomorPesanan}`}
                      className="inline-flex min-h-9 items-center justify-center border border-zinc-700 bg-zinc-800 px-3 font-mono text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      DETAIL
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Peringatan Stok Kritis (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              PERINGATAN STOK MENIPIS
            </h2>
            <Link
              href="/admin/inventaris"
              className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>BUKU STOK</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!data?.stokKritis || data.stokKritis.length === 0 ? (
            <div className="border border-zinc-800 bg-zinc-950 p-8 text-center">
              <p className="font-mono text-xs text-zinc-500 uppercase">
                Seluruh varian produk berada di batas stok aman.
              </p>
            </div>
          ) : (
            <div className="border border-zinc-800 bg-zinc-950 divide-y divide-zinc-850">
              {data.stokKritis.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-bold text-white uppercase truncate max-w-50">
                      {item.namaProduk}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400">
                      {item.namaVarian} // SKU: {item.sku}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 border ${
                        item.stok === 0
                          ? "border-rose-500/50 bg-rose-950/40 text-rose-400"
                          : "border-amber-500/50 bg-amber-950/40 text-amber-400"
                      }`}
                    >
                      {item.stok === 0 ? "HABIS" : `${item.stok} UNIT`}
                    </span>
                    <Link
                      href="/admin/inventaris"
                      className="inline-flex min-h-9 items-center justify-center border border-zinc-700 bg-zinc-800 px-2.5 font-mono text-[10px] text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      RESTOCK
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
