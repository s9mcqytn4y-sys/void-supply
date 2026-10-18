import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { ambilDetailPesananAdminAction } from "@/features/admin/actions/pesanan-admin.action";
import { BadgeStatusOperasional } from "@/features/admin/components/primitives";
import { PanelOperasionalPesanan } from "@/features/admin/components/PanelOperasionalPesanan";
import { ArrowLeft, Clock, ShieldCheck, MapPin, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HalamanDetailPesananAdmin({
  params,
}: {
  params: Promise<{ nomorPesanan: string }>;
}) {
  const { nomorPesanan } = await params;
  const res = await ambilDetailPesananAdminAction(nomorPesanan);

  if (!res.sukses || !res.data) {
    notFound();
  }

  const { pesanan: p, pembayaran: bayar, pengiriman: kirim, daftarItem, catatanOperasional } = res.data;

  return (
    <div className="space-y-6">
      {/* Top Bar Navigasi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <Link
            href="/admin/pesanan"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>KEMBALI KE DAFTAR PESANAN</span>
          </Link>
          <div className="flex items-center gap-3 pt-1">
            <h1 className="font-mono text-2xl font-black text-white uppercase tracking-tight">
              PESANAN #{p.nomorPesanan}
            </h1>
            <BadgeStatusOperasional status={p.statusPesanan} />
          </div>
        </div>

        <div className="font-mono text-xs text-zinc-400">
          DIBUAT: {new Date(p.dibuatPada).toLocaleString("id-ID")}
        </div>
      </div>

      {/* Grid 2 Kolom Operasional */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Rincian Produk, Pengiriman, & Pembayaran (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daftar Item Pesanan */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-4">
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              ARTIKEL YANG DIPESAN ({daftarItem.length} SKU)
            </h2>

            <div className="divide-y divide-zinc-850">
              {daftarItem.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between font-mono text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white uppercase">{item.namaProduk}</p>
                    <p className="text-[11px] text-zinc-400">
                      {item.namaVarian} // SKU: {item.sku}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {item.jumlah} unit × {formatRupiah(item.hargaSatuan)}
                    </p>
                  </div>
                  <span className="font-bold text-white">
                    {formatRupiah(item.subtotalItem)}
                  </span>
                </div>
              ))}
            </div>

            {/* Rincian Finansial */}
            <div className="border-t border-zinc-800 pt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal Produk</span>
                <span>{formatRupiah(p.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(p.totalOngkir)}</span>
              </div>
              {p.totalDiskon > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Diskon Voucher</span>
                  <span>-{formatRupiah(p.totalDiskon)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-zinc-850 text-sm font-bold text-white">
                <span>TOTAL AKHIR TAGIHAN</span>
                <span>{formatRupiah(p.totalAkhir)}</span>
              </div>
            </div>
          </div>

          {/* Rincian Pengiriman & Alamat Tujuan */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3 font-mono text-xs">
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span>LOGISTIK & ALAMAT TUJUAN</span>
            </h2>

            {kirim ? (
              <div className="space-y-2 text-zinc-300">
                <p>
                  <span className="text-zinc-500 uppercase">PENERIMA:</span>{" "}
                  <strong className="text-white">{kirim.namaPenerima}</strong> ({kirim.teleponPenerima})
                </p>
                <p>
                  <span className="text-zinc-500 uppercase">ALAMAT:</span> {kirim.alamatTujuan},{" "}
                  {kirim.kotaTujuan}, {kirim.provinsiTujuan} ({kirim.kodePosTujuan})
                </p>
                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500">EKSPEDISI:</span>{" "}
                    <strong className="text-white uppercase">{kirim.kurir}</strong> ({kirim.layanan})
                  </div>
                  <div>
                    <span className="text-zinc-500">NO. RESI:</span>{" "}
                    <strong className="text-emerald-400">{kirim.nomorResi || "MENUNGGU RESI"}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 uppercase">Data logistik belum tercatat.</p>
            )}
          </div>

          {/* Rincian Status Pembayaran */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3 font-mono text-xs">
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-zinc-400" />
              <span>STATUS PEMBAYARAN GATEWAY</span>
            </h2>

            {bayar ? (
              <div className="space-y-2 text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">STATUS GATEWAY:</span>
                  <BadgeStatusOperasional status={bayar.statusPembayaran} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">METODE PEMBAYARAN:</span>
                  <span className="text-white uppercase">{bayar.metodePembayaran || "Belum Dipilih"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">NOMINAL DIVERIFIKASI:</span>
                  <span className="text-white font-bold">{formatRupiah(bayar.jumlahBayar)}</span>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 uppercase">Data gateway pembayaran belum dibuat.</p>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Aksi Operasional & Catatan Internal (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6">
          <PanelOperasionalPesanan
            pesananId={p.id}
            nomorPesanan={p.nomorPesanan}
            statusPesanan={p.statusPesanan}
          />

          {/* Timeline Catatan Operasional Internal */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              RIWAYAT CATATAN INTERNAL ({catatanOperasional.length})
            </h3>

            {catatanOperasional.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500 uppercase text-center py-4">
                Belum ada catatan operasional.
              </p>
            ) : (
              <div className="space-y-3">
                {catatanOperasional.map((c) => (
                  <div
                    key={c.id}
                    className="border border-zinc-850 bg-zinc-900/40 p-3 space-y-1 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-zinc-300">{c.adminNama}</span>
                      <span>{new Date(c.dibuatPada).toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-zinc-200 mt-1">{c.isiCatatan}</p>
                    {c.tingkatUrgensi !== "normal" && (
                      <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold border border-rose-500/40 text-rose-400 uppercase mt-1">
                        URGENSI: {c.tingkatUrgensi}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
