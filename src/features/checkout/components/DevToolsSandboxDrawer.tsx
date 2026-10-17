"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  simulasikanPembayaranBerhasilAction,
  simulasikanStatusLogistikBiteshipAction,
  simulasikanPembatalanPesananAction,
} from "../actions/demo-simulator.action";

interface PropsDevToolsSandboxDrawer {
  nomorPesanan: string;
  tokenAkses?: string;
  statusPesanan: string;
  statusPembayaran: string;
  statusPengiriman?: string;
  nomorResi?: string | null;
  nomorVa?: string | null;
  bankVa?: string | null;
  onSinkronUlang: () => Promise<void>;
}

export function DevToolsSandboxDrawer({
  nomorPesanan,
  tokenAkses,
  statusPesanan,
  statusPembayaran,
  statusPengiriman,
  nomorResi,
  nomorVa,
  bankVa,
  onSinkronUlang,
}: PropsDevToolsSandboxDrawer) {
  const [buka, setBuka] = useState(false);
  const [sedangMemproses, setSedangMemproses] = useState(false);
  const [sudahDisalin, setSudahDisalin] = useState(false);

  // Keyboard shortcut: ESC to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && buka) {
        setBuka(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [buka]);

  const isMenungguBayar = statusPesanan === "menunggu_pembayaran";
  const isSudahDibayar = statusPesanan !== "menunggu_pembayaran" && statusPesanan !== "dibatalkan";

  const salinTeks = async (teks: string, label: string) => {
    try {
      await navigator.clipboard.writeText(teks);
      setSudahDisalin(true);
      toast.success(`${label} berhasil disalin`, { description: teks });
      setTimeout(() => setSudahDisalin(false), 2000);
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  };

  const tanganiAksi = async (
    namaAksi: string,
    eksekusi: () => Promise<{ sukses: boolean; pesan: string }>
  ) => {
    setSedangMemproses(true);
    try {
      const hasil = await eksekusi();
      if (hasil.sukses) {
        toast.success(`Simulasi: ${namaAksi}`, { description: hasil.pesan });
        await onSinkronUlang();
      } else {
        toast.error(`Gagal: ${namaAksi}`, { description: hasil.pesan });
      }
    } catch (err) {
      toast.error(`Terjadi galat pada simulator: ${namaAksi}`);
      console.error(err);
    } finally {
      setSedangMemproses(false);
    }
  };

  const simulatorMidtransUrl = bankVa?.toLowerCase().includes("mandiri")
    ? "https://simulator.sandbox.midtrans.com/mandiri/bill/index"
    : bankVa?.toLowerCase().includes("bni")
    ? "https://simulator.sandbox.midtrans.com/bni/va/index"
    : bankVa?.toLowerCase().includes("bri")
    ? "https://simulator.sandbox.midtrans.com/bri/va/index"
    : "https://simulator.sandbox.midtrans.com/bca/va/index";

  return (
    <>
      {/* Tombol Mengambang (Floating Pill Button) di Pojok Kanan Bawah */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setBuka(true)}
          className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-neutral-700 bg-neutral-950/95 px-4 py-2 font-mono text-xs font-bold text-white shadow-2xl backdrop-blur-md transition-all hover:border-emerald-400 hover:bg-neutral-900 active:scale-95"
          aria-label="Buka Sandbox DevTools Drawer"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wider uppercase">DEVTOOLS SANDBOX</span>
          <span className="rounded-xs bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400 group-hover:text-emerald-300">
            F3
          </span>
        </button>
      </div>

      {/* Slide-over Drawer Panel & Backdrop */}
      {buka && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop gelap */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setBuka(false)}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md border-l border-neutral-800 bg-neutral-950 p-6 font-mono text-xs text-white shadow-2xl flex flex-col justify-between overflow-y-auto">
              {/* Header Panel */}
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="font-bold tracking-widest uppercase text-white">
                      SANDBOX DEVTOOLS
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBuka(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xs border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:border-white hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400">
                  Panel pengujian alur transaksi end-to-end bagi reviewer. Hanya aktif pada lingkungan sandbox/pengujian.
                </div>

                {/* Ringkasan Konteks Pesanan */}
                <div className="mt-5 border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 uppercase">NO. PESANAN:</span>
                    <button
                      type="button"
                      onClick={() => salinTeks(nomorPesanan, "Nomor Pesanan")}
                      className="font-bold text-white hover:text-emerald-300 transition-colors"
                    >
                      {nomorPesanan} {sudahDisalin ? "✓" : "📋"}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 uppercase">STATUS PESANAN:</span>
                    <span className="font-bold uppercase text-amber-400">{statusPesanan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 uppercase">STATUS BAYAR:</span>
                    <span className="font-bold uppercase text-emerald-400">{statusPembayaran}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 uppercase">LOGISTIK:</span>
                    <span className="font-bold uppercase text-neutral-300">
                      {statusPengiriman || "menunggu"}
                    </span>
                  </div>
                  {nomorResi && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-400 uppercase">RESI KURIR:</span>
                      <span className="font-bold text-emerald-400">{nomorResi}</span>
                    </div>
                  )}
                </div>

                {/* 5 Kontrol Aksi Simulasi */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    KONTROL SIMULASI SIKLUS TRANSAKSI
                  </h3>

                  {/* Aksi 1: Pelunasan Instan */}
                  <button
                    type="button"
                    onClick={() =>
                      tanganiAksi("Pelunasan Midtrans", () =>
                        simulasikanPembayaranBerhasilAction(nomorPesanan, tokenAkses)
                      )
                    }
                    disabled={sedangMemproses || !isMenungguBayar}
                    className="flex min-h-11 w-full items-center justify-between border border-emerald-500/50 bg-emerald-950/30 px-4 py-2 font-bold text-emerald-300 transition-colors hover:bg-emerald-900/40 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <span>1. SIMULASI LUNAS (SETTLEMENT)</span>
                    <span className="text-[10px] uppercase font-normal">Auto-Arsip Faktur &rarr;</span>
                  </button>

                  {/* Aksi 2: Biteship Kurir Mengambil Paket */}
                  <button
                    type="button"
                    onClick={() =>
                      tanganiAksi("Kurir Mengambil Paket", () =>
                        simulasikanStatusLogistikBiteshipAction(nomorPesanan, "picking_up", tokenAkses)
                      )
                    }
                    disabled={sedangMemproses || !isSudahDibayar}
                    className="flex min-h-11 w-full items-center justify-between border border-neutral-700 bg-neutral-900 px-4 py-2 font-bold text-neutral-200 transition-colors hover:border-white hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <span>2. BITESHIP: KURIR PICKUP</span>
                    <span className="text-[10px] uppercase font-normal">Status: Dikirim &rarr;</span>
                  </button>

                  {/* Aksi 3: Biteship Paket Tiba (Delivered) */}
                  <button
                    type="button"
                    onClick={() =>
                      tanganiAksi("Paket Tiba di Tujuan", () =>
                        simulasikanStatusLogistikBiteshipAction(nomorPesanan, "delivered", tokenAkses)
                      )
                    }
                    disabled={sedangMemproses || !isSudahDibayar}
                    className="flex min-h-11 w-full items-center justify-between border border-neutral-700 bg-neutral-900 px-4 py-2 font-bold text-neutral-200 transition-colors hover:border-white hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <span>3. BITESHIP: PAKET TIBA</span>
                    <span className="text-[10px] uppercase font-normal">Status: Terkirim &rarr;</span>
                  </button>

                  {/* Aksi 4: Pembatalan / Kedaluwarsa Pesanan */}
                  <button
                    type="button"
                    onClick={() =>
                      tanganiAksi("Pembatalan Pesanan", () =>
                        simulasikanPembatalanPesananAction(nomorPesanan, tokenAkses)
                      )
                    }
                    disabled={sedangMemproses || !isMenungguBayar}
                    className="flex min-h-11 w-full items-center justify-between border border-rose-900/50 bg-rose-950/20 px-4 py-2 font-bold text-rose-300 transition-colors hover:bg-rose-900/30 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <span>4. KEDALUWARSA / BATAL</span>
                    <span className="text-[10px] uppercase font-normal">Pulihkan Stok CAS &rarr;</span>
                  </button>

                  {/* Aksi 5: Deep-Link ke Portal Midtrans Simulator */}
                  <a
                    href={simulatorMidtransUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (nomorVa) {
                        salinTeks(nomorVa, "Nomor Virtual Account");
                      }
                    }}
                    className="flex min-h-11 w-full items-center justify-between border border-amber-500/50 bg-amber-950/30 px-4 py-2 font-bold text-amber-300 transition-colors hover:bg-amber-900/40"
                  >
                    <span>5. PORTAL SIMULATOR MIDTRANS</span>
                    <span className="text-[10px] uppercase font-normal">Eksternal &rarr;</span>
                  </a>
                </div>

                {/* Tautan Navigasi Dokumen Cepat */}
                <div className="mt-6 border-t border-neutral-800 pt-4 space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    DOKUMEN TRANSAKSI & LOGISTIK
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/pesanan/${encodeURIComponent(nomorPesanan)}/faktur${tokenAkses ? `?token=${encodeURIComponent(tokenAkses)}` : ""}`}
                      className="inline-flex min-h-9 items-center justify-center border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-center font-semibold text-neutral-300 hover:border-neutral-600 hover:text-white"
                    >
                      FAKTUR (A4)
                    </Link>
                    <Link
                      href={`/pesanan/${encodeURIComponent(nomorPesanan)}/resi${tokenAkses ? `?token=${encodeURIComponent(tokenAkses)}` : ""}`}
                      target="_blank"
                      className="inline-flex min-h-9 items-center justify-center border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-center font-semibold text-neutral-300 hover:border-neutral-600 hover:text-white"
                    >
                      LABEL RESI (100x150)
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer Panel */}
              <div className="border-t border-neutral-800 pt-4 mt-6 text-[10px] text-neutral-400">
                <p>
                  VOID SUPPLY DEV ENGINE // MODE: {process.env.NODE_ENV || "development"}
                </p>
                <p className="mt-1">
                  Seluruh perubahan status diverifikasi oleh basis data PostgreSQL melalui CAS atomik.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
