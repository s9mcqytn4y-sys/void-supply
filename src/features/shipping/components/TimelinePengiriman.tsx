"use client";

import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  MapPin,
  AlertCircle,
} from "lucide-react";
import type { DetailPelacakan } from "@/features/checkout/actions/status-pesanan.action";
import {
  simulasiPergerakanKurirAction,
  type TahapSimulasiKurir,
} from "../actions/simulasi-resi.action";

interface PropsTimelinePengiriman {
  nomorPesanan: string;
  statusPesanan: "menunggu_pembayaran" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
  pelacakan?: DetailPelacakan;
  tampilkanSimulator?: boolean;
  onUpdate?: () => void;
}

interface TahapVisual {
  id: "allocated" | "picking_up" | "dropping_off" | "delivered";
  label: string;
  deskripsi: string;
}

const DAFTAR_TAHAP: TahapVisual[] = [
  {
    id: "allocated",
    label: "PESANAN DIPROSES",
    deskripsi: "Pesanan disiapkan oleh tim gudang dan resi diterbitkan.",
  },
  {
    id: "picking_up",
    label: "KURIR MENUJU LOKASI",
    deskripsi: "Kurir ditugaskan dan menuju fasilitas gudang penjemputan.",
  },
  {
    id: "dropping_off",
    label: "SEDANG DIANTAR",
    deskripsi: "Paket dalam perjalanan menuju alamat tujuan pengiriman.",
  },
  {
    id: "delivered",
    label: "PAKET DITERIMA",
    deskripsi: "Paket telah berhasil diserahkan kepada penerima.",
  },
];

export function TimelinePengiriman({
  nomorPesanan,
  statusPesanan,
  pelacakan,
  tampilkanSimulator = false,
  onUpdate,
}: PropsTimelinePengiriman) {
  const [tersalin, setTersalin] = useState(false);
  const [sedangSimulasi, setSedangSimulasi] = useState(false);
  const [pesanSimulasi, setPesanSimulasi] = useState<string | null>(null);

  const kurirNama = (pelacakan?.kurir || "Ekspedisi").toUpperCase();
  const kurirLayanan = (pelacakan?.layanan || "Standar").toUpperCase();
  const nomorResi = pelacakan?.nomorResi || null;
  const statusPengiriman = pelacakan?.statusPengiriman || "menunggu_resi";
  const riwayat = pelacakan?.riwayat || [];

  // Tentukan indeks tahap aktif (0 s.d. 3)
  const tentukanIndeksTahap = (): number => {
    if (statusPesanan === "selesai" || statusPengiriman === "terkirim") return 3;
    if (statusPesanan === "dikirim") {
      // Periksa riwayat checkpoint terkini
      const checkpointTerakhir = riwayat[0]?.statusPelacakan?.toLowerCase();
      if (checkpointTerakhir === "dropping_off" || checkpointTerakhir === "in_transit") {
        return 2;
      }
      return 1;
    }
    if (statusPesanan === "diproses") return 0;
    return -1; // Masih menunggu pembayaran atau dibatalkan
  };

  const indeksTahapAktif = tentukanIndeksTahap();
  const isMenungguBayar = statusPesanan === "menunggu_pembayaran";
  const isBatal = statusPesanan === "dibatalkan";

  const salinNomorResi = async () => {
    if (!nomorResi) return;
    try {
      await navigator.clipboard.writeText(nomorResi);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      // Fallback manual jika clipboard API diblokir
    }
  };

  const jalankanSimulasi = async (tahap: TahapSimulasiKurir) => {
    setSedangSimulasi(true);
    setPesanSimulasi(null);
    try {
      const res = await simulasiPergerakanKurirAction(nomorPesanan, tahap);
      setPesanSimulasi(res.pesan);
      if (res.sukses && onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setPesanSimulasi(
        err instanceof Error ? err.message : "Gagal menjalankan simulasi kurir."
      );
    } finally {
      setSedangSimulasi(false);
    }
  };

  return (
    <section
      aria-label="Informasi Pelacakan Pengiriman"
      className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8"
    >
      {/* Header Logistik & Resi */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block border border-neutral-700 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
              {kurirNama}
            </span>
            <span className="font-mono text-xs text-neutral-400">
              {kurirLayanan} ({pelacakan?.estimasiHari || "1-3 hari"})
            </span>
          </div>
          <h2 className="mt-2 font-mono text-lg font-black text-white uppercase tracking-tight sm:text-xl">
            PELACAKAN PENGIRIMAN
          </h2>
        </div>

        {nomorResi ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 font-mono text-xs text-neutral-300">
              <span className="text-[10px] text-neutral-500 uppercase block">
                Nomor Resi
              </span>
              <span className="font-bold tracking-wider text-white">
                {nomorResi}
              </span>
            </div>
            <button
              type="button"
              onClick={salinNomorResi}
              className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-3.5 font-mono text-xs font-bold text-white transition-colors hover:border-white hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-white"
              title="Salin nomor resi pengiriman"
            >
              {tersalin ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                  <span>TERSALIN</span>
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5 text-neutral-400" />
                  <span>SALIN</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="self-start sm:self-auto border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 font-mono text-[11px] text-neutral-400">
            Resi akan diterbitkan setelah paket diserahkan ke kurir.
          </div>
        )}
      </div>

      {/* State Menunggu Pembayaran */}
      {isMenungguBayar && (
        <div className="mt-6 border border-neutral-800 bg-neutral-900/30 p-4 font-mono text-xs text-neutral-400">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="font-bold text-neutral-300 uppercase">
                Menunggu Penyelesaian Pembayaran
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">
                Logistik pesanan akan segera dialokasikan dan nomor resi diterbitkan otomatis begitu transaksi berhasil diverifikasi oleh payment gateway.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* State Pesanan Dibatalkan */}
      {isBatal && (
        <div className="mt-6 border border-rose-950/40 bg-rose-950/10 p-4 font-mono text-xs text-rose-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold text-rose-300 uppercase">
                Pengiriman Tidak Diproses
              </p>
              <p className="mt-1 text-[11px] text-rose-400/80">
                Pesanan telah dibatalkan sehingga alokasi kurir ditiadakan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Progress 4 Tahap */}
      <div className="mt-8">
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {DAFTAR_TAHAP.map((tahap, idx) => {
            const isSelesai = indeksTahapAktif > idx;
            const isAktif = indeksTahapAktif === idx;

            return (
              <li
                key={tahap.id}
                className={`relative border p-4 transition-colors ${
                  isAktif
                    ? "border-white bg-neutral-900/90 text-white"
                    : isSelesai
                    ? "border-emerald-800/80 bg-emerald-950/20 text-neutral-300"
                    : "border-neutral-800 bg-neutral-950/50 text-neutral-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                    TAHAP 0{idx + 1}
                  </span>
                  {isSelesai ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isAktif ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    </span>
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-neutral-800" />
                  )}
                </div>

                <h3 className="mt-2 font-mono text-xs font-bold uppercase tracking-tight text-white">
                  {tahap.label}
                </h3>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-neutral-400">
                  {tahap.deskripsi}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Riwayat Checkpoint Real-Time */}
      <div className="mt-8 border-t border-neutral-800 pt-6">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          RIWAYAT PERJALANAN PAKET ({riwayat.length} PERISTIWA)
        </h3>

        {riwayat.length > 0 ? (
          <ul className="mt-4 space-y-4 font-mono text-xs">
            {riwayat.map((event, i) => (
              <li
                key={event.id || i}
                className="relative flex items-start gap-3 border-l-2 border-neutral-800 pl-4 pb-1"
              >
                <div className="absolute -left-1.25 top-1.5 h-2 w-2 rounded-full bg-neutral-400" />
                <div className="flex-1">
                  <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                    <p className="font-bold text-white uppercase">
                      {event.keterangan}
                    </p>
                    <time className="text-[11px] text-neutral-400">
                      {new Date(event.waktuPeristiwa).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                  {event.lokasi && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-400">
                      <MapPin className="h-3 w-3 text-neutral-500" />
                      <span>{event.lokasi}</span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 border border-dashed border-neutral-800 p-4 text-center font-mono text-xs text-neutral-400">
            {isMenungguBayar
              ? "Riwayat perjalanan paket akan tercatat begitu pesanan diserahkan ke kurir."
              : isBatal
              ? "Tidak ada riwayat pergerakan karena pesanan dibatalkan."
              : "Menunggu pembaharuan status manifes pertama dari kurir rekanan."}
          </div>
        )}
      </div>

      {/* Simulator Kontrol Sandbox (Hanya Aktif di Lingkungan Non-Prod / ALLOW_PAYMENT_MOCK) */}
      {tampilkanSimulator && !isBatal && (
        <aside
          aria-label="Panel Simulator Kurir Sandbox"
          className="mt-8 border border-neutral-700 bg-neutral-900/60 p-4"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <span className="font-mono text-xs font-bold text-white uppercase">
                SIMULATOR KURIR SANDBOX (DEV TOOLS)
              </span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 uppercase">
              Biteship Webhook Mock
            </span>
          </div>

          <p className="mt-2 font-mono text-[11px] text-neutral-300">
            Majukan status pergerakan paket secara langsung untuk memverifikasi transisi UI dan pembaruan database tanpa kurir fisik:
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={sedangSimulasi}
              onClick={() => jalankanSimulasi("picking_up")}
              className="inline-flex min-h-9 items-center justify-center border border-neutral-600 bg-neutral-800 px-3 py-1 font-mono text-[11px] font-bold text-white transition-colors hover:border-white hover:bg-neutral-700 disabled:opacity-50"
            >
              <Package className="mr-1.5 h-3.5 w-3.5 text-neutral-300" />
              <span>02. KURIR JEMPUT</span>
            </button>

            <button
              type="button"
              disabled={sedangSimulasi}
              onClick={() => jalankanSimulasi("in_transit")}
              className="inline-flex min-h-9 items-center justify-center border border-neutral-600 bg-neutral-800 px-3 py-1 font-mono text-[11px] font-bold text-white transition-colors hover:border-white hover:bg-neutral-700 disabled:opacity-50"
            >
              <Truck className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
              <span>03. PERJALANAN</span>
            </button>

            <button
              type="button"
              disabled={sedangSimulasi}
              onClick={() => jalankanSimulasi("delivered")}
              className="inline-flex min-h-9 items-center justify-center border border-emerald-700 bg-emerald-950/40 px-3 py-1 font-mono text-[11px] font-bold text-emerald-300 transition-colors hover:border-emerald-500 hover:bg-emerald-900/50 disabled:opacity-50"
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
              <span>04. DITERIMA</span>
            </button>
          </div>

          {pesanSimulasi && (
            <p className="mt-2 font-mono text-[11px] text-emerald-400">
              {pesanSimulasi}
            </p>
          )}
        </aside>
      )}
    </section>
  );
}
