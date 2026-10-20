"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  CheckSquare,
  Square,
  Truck,
  Printer,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { BadgeStatusOperasional } from "./primitives";
import {
  batchRequestPickupBiteshipAction,
  type HasilBatchFulfillment,
} from "@/features/admin/actions/pesanan-admin.fulfillment";
import type { PesananAdminRow } from "@/features/admin/actions/pesanan-admin.query";

interface TabelPesananAdminClientProps {
  daftarPesanan: PesananAdminRow[];
}

export function TabelPesananAdminClient({
  daftarPesanan,
}: TabelPesananAdminClientProps) {
  const router = useRouter();
  const [pilihanPesanan, setPilihanPesanan] = useState<Set<string>>(new Set());
  const [sedangMemproses, setSedangMemproses] = useState(false);
  const [hasilBatch, setHasilBatch] = useState<HasilBatchFulfillment | null>(null);

  const totalItem = daftarPesanan.length;
  const semuaTerpilih =
    totalItem > 0 && pilihanPesanan.size === totalItem;

  function togglePilihSemua() {
    if (semuaTerpilih) {
      setPilihanPesanan(new Set());
    } else {
      const semuaNomor = new Set(daftarPesanan.map((p) => p.nomorPesanan));
      setPilihanPesanan(semuaNomor);
    }
  }

  function togglePilihPesanan(nomorPesanan: string) {
    const baru = new Set(pilihanPesanan);
    if (baru.has(nomorPesanan)) {
      baru.delete(nomorPesanan);
    } else {
      baru.add(nomorPesanan);
    }
    setPilihanPesanan(baru);
  }

  // Filter pesanan yang terpilih
  const pesananTerpilih = daftarPesanan.filter((p) =>
    pilihanPesanan.has(p.nomorPesanan)
  );

  // Pesanan yang siap diajukan pickup ke Biteship (status 'diproses')
  const pesananSiapPickup = pesananTerpilih.filter(
    (p) => p.statusPesanan === "diproses"
  );

  // Pesanan yang siap dicetak resinya (telah memiliki nomor resi)
  const pesananSiapCetakResi = pesananTerpilih.filter((p) =>
    Boolean(p.nomorResi)
  );

  async function handleBatchPickup() {
    if (pesananSiapPickup.length === 0) return;

    setSedangMemproses(true);
    try {
      const daftarNomor = pesananSiapPickup.map((p) => p.nomorPesanan);
      const res = await batchRequestPickupBiteshipAction(daftarNomor);
      setHasilBatch(res);
    } catch (err) {
      console.error("[BATCH PICKUP CLIENT] Gagal mengeksekusi batch pickup:", err);
      setHasilBatch({
        sukses: false,
        pesan: "Gagal mengeksekusi batch fulfillment karena kendala jaringan/server.",
        totalDiminta: pesananSiapPickup.length,
        totalBerhasil: 0,
        totalGagal: pesananSiapPickup.length,
        daftarSukses: [],
        daftarGagal: pesananSiapPickup.map((p) => ({
          nomorPesanan: p.nomorPesanan,
          alasan: "Kegagalan koneksi klien saat memanggil server action.",
        })),
      });
    } finally {
      setSedangMemproses(false);
    }
  }

  function handleBukaCetakBulk(daftarNomor: string[]) {
    if (daftarNomor.length === 0) return;
    const url = `/admin/pesanan/batch-resi?orders=${encodeURIComponent(
      daftarNomor.join(",")
    )}`;
    window.open(url, "_blank");
  }

  function handleTutupModalDanRefresh() {
    setHasilBatch(null);
    setPilihanPesanan(new Set());
    router.refresh();
  }

  return (
    <div className="relative">
      {/* Tabel Data Pesanan Interaktif */}
      <div className="border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-zinc-400">
              <tr>
                <th className="w-12 px-3 py-3 text-center">
                  <button
                    type="button"
                    onClick={togglePilihSemua}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    title={semuaTerpilih ? "Batalkan semua" : "Pilih semua"}
                    aria-label={semuaTerpilih ? "Batalkan semua" : "Pilih semua"}
                  >
                    {semuaTerpilih ? (
                      <CheckSquare className="h-4 w-4 text-white" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-600" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-300">NO. PESANAN</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">PELANGGAN</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">LOGISTIK</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">TOTAL AKHIR</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">STATUS TRANSAKSI</th>
                <th className="px-4 py-3 font-semibold text-zinc-300 text-right">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {daftarPesanan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    Tidak ada pesanan yang sesuai dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                daftarPesanan.map((item) => {
                  const terpilih = pilihanPesanan.has(item.nomorPesanan);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        terpilih ? "bg-zinc-800/30" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => togglePilihPesanan(item.nomorPesanan)}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center text-zinc-400 hover:text-white transition-colors"
                          aria-label={`Pilih pesanan ${item.nomorPesanan}`}
                        >
                          {terpilih ? (
                            <CheckSquare className="h-4 w-4 text-white" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-white uppercase">
                          #{item.nomorPesanan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">{item.namaPelanggan}</p>
                          <p className="text-[10px] text-zinc-400">
                            {item.emailPelanggan}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-zinc-300">
                            {item.kurir ? item.kurir.toUpperCase() : "BELUM DIPILIH"}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {item.nomorResi ? `RESI: ${item.nomorResi}` : "MENUNGGU RESI"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-bold text-white">
                            {formatRupiah(item.totalAkhir)}
                          </span>
                          <p className="text-[10px] text-zinc-500">
                            {item.jumlahItem} item
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <BadgeStatusOperasional status={item.statusPesanan} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/pesanan/${item.nomorPesanan}`}
                          className="inline-flex min-h-11 items-center gap-1 border border-zinc-700 bg-zinc-800 px-3 font-mono text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                        >
                          <span>INSPEKSI</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Brutalist Bottom Action Bar */}
      {pilihanPesanan.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl border-2 border-white/20 bg-zinc-950/95 px-6 py-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center bg-white font-mono text-xs font-bold text-black">
                {pilihanPesanan.size}
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Pesanan Terpilih
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tombol Request Pickup Biteship */}
              <button
                type="button"
                onClick={handleBatchPickup}
                disabled={sedangMemproses || pesananSiapPickup.length === 0}
                className="inline-flex min-h-11 items-center gap-2 border border-emerald-500/50 bg-emerald-950/80 px-4 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title={
                  pesananSiapPickup.length === 0
                    ? "Tidak ada pesanan berstatus 'diproses' yang dipilih."
                    : `Ajukan pickup ke Biteship untuk ${pesananSiapPickup.length} pesanan.`
                }
              >
                {sedangMemproses ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>MEMPROSES PICKUP...</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>REQUEST PICKUP ({pesananSiapPickup.length})</span>
                  </>
                )}
              </button>

              {/* Tombol Cetak Bulk Resi Thermal */}
              <button
                type="button"
                onClick={() =>
                  handleBukaCetakBulk(
                    pesananSiapCetakResi.map((p) => p.nomorPesanan)
                  )
                }
                disabled={pesananSiapCetakResi.length === 0}
                className="inline-flex min-h-11 items-center gap-2 border border-zinc-700 bg-zinc-800 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title={
                  pesananSiapCetakResi.length === 0
                    ? "Belum ada pesanan terpilih yang memiliki nomor resi."
                    : `Cetak stiker resi thermal untuk ${pesananSiapCetakResi.length} pesanan.`
                }
              >
                <Printer className="h-4 w-4" />
                <span>CETAK RESI BULK ({pesananSiapCetakResi.length})</span>
              </button>

              {/* Tombol Batalkan Seleksi */}
              <button
                type="button"
                onClick={() => setPilihanPesanan(new Set())}
                className="inline-flex min-h-11 items-center gap-1 border border-zinc-800 bg-zinc-900 px-3 font-mono text-xs font-semibold uppercase text-zinc-400 hover:text-white transition-colors"
                aria-label="Batalkan seleksi pesanan"
              >
                <X className="h-4 w-4" />
                <span>BATAL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Rekapitulasi Hasil Batch */}
      {hasilBatch && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl border-2 border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  // REKAPITULASI BATCH FULFILLMENT
                </p>
                <h3 className="font-mono text-lg font-bold uppercase text-white">
                  Laporan Hasil Pickup Biteship
                </h3>
              </div>
              <button
                type="button"
                onClick={handleTutupModalDanRefresh}
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                aria-label="Tutup dialog rekapitulasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Metrik Ringkasan */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-mono">TOTAL PERMINTAAN</p>
                <p className="text-xl font-bold font-mono text-white mt-1">
                  {hasilBatch.totalDiminta}
                </p>
              </div>
              <div className="border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
                <p className="text-[10px] text-emerald-400 uppercase font-mono">BERHASIL DIPROSES</p>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {hasilBatch.totalBerhasil}
                </p>
              </div>
              <div className="border border-rose-500/30 bg-rose-950/20 p-3 text-center">
                <p className="text-[10px] text-rose-400 uppercase font-mono">GAGAL / DITOLAK</p>
                <p className="text-xl font-bold font-mono text-rose-400 mt-1">
                  {hasilBatch.totalGagal}
                </p>
              </div>
            </div>

            {/* Daftar Pesanan Sukses */}
            {hasilBatch.daftarSukses.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  <span>Resi Berhasil Diterbitkan ({hasilBatch.daftarSukses.length})</span>
                </p>
                <div className="max-h-36 overflow-y-auto divide-y divide-zinc-800 border border-zinc-800 bg-zinc-900/40 p-2 font-mono text-xs">
                  {hasilBatch.daftarSukses.map((sukses) => (
                    <div
                      key={sukses.nomorPesanan}
                      className="flex items-center justify-between py-1.5 px-2 text-zinc-300"
                    >
                      <span className="font-bold text-white">#{sukses.nomorPesanan}</span>
                      <span className="text-zinc-400 text-[11px]">{sukses.kurir}</span>
                      <span className="text-emerald-400 font-semibold">{sukses.nomorResi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daftar Pesanan Gagal */}
            {hasilBatch.daftarGagal.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs font-bold uppercase text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Pesanan Kendala / Ditolak ({hasilBatch.daftarGagal.length})</span>
                </p>
                <div className="max-h-36 overflow-y-auto divide-y divide-zinc-800 border border-zinc-800 bg-zinc-900/40 p-2 font-mono text-xs">
                  {hasilBatch.daftarGagal.map((gagal) => (
                    <div
                      key={gagal.nomorPesanan}
                      className="flex flex-col py-1.5 px-2 text-zinc-400"
                    >
                      <span className="font-bold text-rose-300">#{gagal.nomorPesanan}</span>
                      <span className="text-[11px] text-rose-400/80">{gagal.alasan}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Aksi */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              {hasilBatch.daftarSukses.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    handleBukaCetakBulk(
                      hasilBatch.daftarSukses.map((s) => s.nomorPesanan)
                    )
                  }
                  className="inline-flex min-h-11 items-center gap-2 border border-emerald-500 bg-emerald-600 px-5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-500 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>CETAK RESI SUKSES ({hasilBatch.daftarSukses.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleTutupModalDanRefresh}
                className="inline-flex min-h-11 items-center border border-zinc-700 bg-zinc-800 px-5 font-mono text-xs font-semibold uppercase text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                TUTUP & MUAT ULANG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
