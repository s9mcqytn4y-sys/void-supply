"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  simulasikanPembayaranBerhasilAction,
  simulasikanStatusLogistikBiteshipAction,
} from "../actions/demo-simulator.action";

interface PropsDemoSandboxController {
  nomorPesanan: string;
  tokenAkses?: string;
  statusPesanan: string;
  statusPembayaran: string;
  statusPengiriman?: string;
  nomorResi?: string | null;
  snapToken?: string | null;
  onSinkronUlang: () => Promise<void>;
}

export function DemoSandboxController({
  nomorPesanan,
  tokenAkses,
  statusPesanan,
  statusPembayaran,
  statusPengiriman,
  nomorResi,
  onSinkronUlang,
}: PropsDemoSandboxController) {
  const [sedangMemproses, setSedangMemproses] = useState(false);
  const [sudahDisalin, setSudahDisalin] = useState(false);

  const isMenungguBayar = statusPesanan === "menunggu_pembayaran";
  const isSudahDibayar = statusPesanan !== "menunggu_pembayaran" && statusPesanan !== "dibatalkan";

  const salinNomorPesanan = async () => {
    try {
      await navigator.clipboard.writeText(nomorPesanan);
      setSudahDisalin(true);
      toast.success("Nomor pesanan disalin ke clipboard", {
        description: nomorPesanan,
      });
      setTimeout(() => setSudahDisalin(false), 2000);
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  };

  const tanganiSimulasiBayar = async () => {
    setSedangMemproses(true);
    try {
      const hasil = await simulasikanPembayaranBerhasilAction(nomorPesanan, tokenAkses);
      if (hasil.sukses) {
        toast.success("Simulasi Pelunasan Berhasil!", {
          description: hasil.pesan,
        });
        await onSinkronUlang();
      } else {
        toast.error("Gagal Simulasi Pembayaran", {
          description: hasil.pesan,
        });
      }
    } catch (err) {
      toast.error("Terjadi galat pada simulator pelunasan.");
      console.error(err);
    } finally {
      setSedangMemproses(false);
    }
  };

  const tanganiSimulasiLogistik = async (
    event: "picking_up" | "dropping_off" | "delivered"
  ) => {
    setSedangMemproses(true);
    try {
      const hasil = await simulasikanStatusLogistikBiteshipAction(nomorPesanan, event, tokenAkses);
      if (hasil.sukses) {
        toast.success(`Simulasi Biteship: ${event.toUpperCase()}`, {
          description: hasil.pesan,
        });
        await onSinkronUlang();
      } else {
        toast.error("Gagal Simulasi Logistik", {
          description: hasil.pesan,
        });
      }
    } catch (err) {
      toast.error("Terjadi galat pada simulator logistik.");
      console.error(err);
    } finally {
      setSedangMemproses(false);
    }
  };

  return (
    <div className="border border-neutral-700 bg-neutral-900/90 p-5 font-mono text-xs shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-widest uppercase">
            SANDBOX DEMO CONTROLLER // SIMULATOR MODE
          </span>
        </div>
        <span className="text-[10px] text-neutral-400">
          PORTFOLIO VERIFICATION GATE
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kolom Kiri: Midtrans Sandbox Simulator & VA Info */}
        <div className="flex flex-col justify-between border border-neutral-800 bg-neutral-950 p-4">
          <div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
              <span>SIMULASI PEMBAYARAN MIDTRANS</span>
              <span className="text-emerald-400">SANDBOX</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Anda dapat menguji transaksi via Midtrans Simulator resmi atau menggunakan trigger webhook instan.
            </p>

            <div className="mt-3 flex items-center justify-between border border-neutral-800 bg-neutral-900 px-3 py-2">
              <span className="text-neutral-400 text-[10px]">ORDER ID:</span>
              <span className="text-white font-bold">{nomorPesanan}</span>
              <button
                type="button"
                onClick={salinNomorPesanan}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline underline-offset-2 ml-2"
              >
                {sudahDisalin ? "TERSALIN" : "SALIN"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <a
              href="https://simulator.sandbox.midtrans.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-9 items-center justify-center border border-neutral-700 bg-neutral-900 px-3 py-1 text-center font-bold text-white hover:border-neutral-400 hover:bg-neutral-800 transition-colors"
            >
              BUKA MIDTRANS SIMULATOR ↗
            </a>

            {isMenungguBayar && (
              <button
                type="button"
                disabled={sedangMemproses}
                onClick={tanganiSimulasiBayar}
                className="flex min-h-9 items-center justify-center border border-emerald-500 bg-emerald-950/40 px-3 py-1 font-bold text-emerald-300 hover:bg-emerald-900/60 disabled:opacity-50 transition-colors"
              >
                {sedangMemproses ? "MEMPROSES WEBHOOK..." : "⚡ TRIGGER PELUNASAN INSTAN (SETTLEMENT)"}
              </button>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Biteship Logistics Simulator */}
        <div className="flex flex-col justify-between border border-neutral-800 bg-neutral-950 p-4">
          <div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
              <span>SIMULASI LOGISTIK BITESHIP</span>
              <span className="text-cyan-400">TRACKING API</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Simulasikan event kurir logistik (pickup, on-delivery, delivered) untuk memvalidasi timeline tracking pesanan.
            </p>

            <div className="mt-3 flex items-center justify-between border border-neutral-800 bg-neutral-900 px-3 py-2">
              <span className="text-neutral-400 text-[10px]">NO. RESI KURIR:</span>
              <span className="text-white font-bold">{nomorResi || "(Menunggu Pickup)"}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={sedangMemproses || !isSudahDibayar}
                onClick={() => tanganiSimulasiLogistik("dropping_off")}
                className="flex min-h-9 items-center justify-center border border-cyan-800 bg-cyan-950/30 px-2 py-1 text-center font-bold text-cyan-300 hover:bg-cyan-900/50 disabled:opacity-40 transition-colors"
              >
                PAKET DIJALAN
              </button>

              <button
                type="button"
                disabled={sedangMemproses || !isSudahDibayar}
                onClick={() => tanganiSimulasiLogistik("delivered")}
                className="flex min-h-9 items-center justify-center border border-purple-800 bg-purple-950/30 px-2 py-1 text-center font-bold text-purple-300 hover:bg-purple-900/50 disabled:opacity-40 transition-colors"
              >
                PAKET TERKIRIM
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 text-center">
              Event logistik otomatis mengupdate database dan timeline pelacakan di /lacak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
