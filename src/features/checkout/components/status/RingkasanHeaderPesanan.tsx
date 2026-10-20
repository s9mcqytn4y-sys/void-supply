"use client";

import React from "react";
import { InAppPaymentViewer } from "../InAppPaymentViewer";
import type { DetailStatusPesanan } from "../../actions/status-pesanan.action";

interface PropsRingkasanHeaderPesanan {
  pesanan: DetailStatusPesanan;
  sisaWaktuDetik: number;
  stringCountdown: string;
  sisaGaransiDetik: number;
  formatSisaGaransi: string;
  sedangMenyinkronkan: boolean;
  sedangKonfirmasiDiterima: boolean;
  onSinkronkan: () => void;
  onKonfirmasiDiterima: () => void;
}

export function RingkasanHeaderPesanan({
  pesanan,
  sisaWaktuDetik,
  stringCountdown,
  sisaGaransiDetik,
  formatSisaGaransi,
  sedangMenyinkronkan,
  sedangKonfirmasiDiterima,
  onSinkronkan,
  onKonfirmasiDiterima,
}: PropsRingkasanHeaderPesanan) {
  const isMenungguBayar = pesanan.statusPesanan === "menunggu_pembayaran";
  const isSukses =
    pesanan.statusPesanan === "diproses" ||
    pesanan.statusPesanan === "dikirim" ||
    pesanan.statusPesanan === "selesai";
  const isBatal =
    pesanan.statusPesanan === "dibatalkan" ||
    pesanan.statusPembayaran === "kadaluarsa";

  return (
    <div>
      {/* Header Utama Status */}
      <div className="flex flex-col items-center justify-between gap-4 border-b border-neutral-800 pb-6 text-center sm:flex-row sm:text-left">
        <div>
          <span
            className={`inline-block font-mono text-[11px] font-bold tracking-widest uppercase ${
              isSukses
                ? "text-emerald-400"
                : isBatal
                ? "text-rose-400"
                : "text-amber-400"
            }`}
          >
            {isSukses
              ? `STATUS: ${pesanan.statusPesanan.toUpperCase()}`
              : isBatal
              ? "STATUS: DIBATALKAN / KADALUARSA"
              : "STATUS: MENUNGGU PEMBAYARAN"}
          </span>
          <h1 className="mt-1 font-mono text-xl font-black text-white uppercase sm:text-2xl">
            PESANAN #{pesanan.nomorPesanan}
          </h1>
          <p className="mt-1 font-mono text-xs text-neutral-400">
            Dibuat pada:{" "}
            {new Date(pesanan.dibuatPada).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={onSinkronkan}
          disabled={sedangMenyinkronkan}
          className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-4 py-1.5 font-mono text-xs text-neutral-200 transition-colors hover:border-white hover:text-white disabled:opacity-50"
        >
          {sedangMenyinkronkan ? "MEMERIKSA..." : "REFRESH STATUS"}
        </button>
      </div>

      {/* In-App Native Payment UX: Virtual Account & QRIS */}
      {isMenungguBayar && (
        <div className="mt-6">
          {pesanan.isAuthorized ? (
            <InAppPaymentViewer
              nomorPesanan={pesanan.nomorPesanan}
              nominal={pesanan.totalAkhir}
              metodePembayaran={pesanan.pembayaran?.metode}
              nomorVa={pesanan.pembayaran?.nomorVa}
              bankVa={pesanan.pembayaran?.bankVa}
              qrString={pesanan.pembayaran?.qrString}
              snapRedirectUrl={pesanan.pembayaran?.snapRedirectUrl}
              sisaWaktuDetik={sisaWaktuDetik}
              stringCountdown={stringCountdown}
            />
          ) : (
            <div className="border border-neutral-800 bg-neutral-900/60 p-4 font-mono text-xs text-neutral-400">
              DATA PRIBADI TERPROTEKSI: Informasi pelanggan dan tagihan disamarkan demi privasi. Akses melalui tautan checkout resmi untuk otorisasi penuh.
            </div>
          )}
        </div>
      )}

      {isBatal && (
        <div className="mt-6 border border-rose-900/50 bg-rose-950/20 p-4 font-mono text-xs text-rose-300">
          Pesanan ini telah dibatalkan karena melewati batas waktu 15 menit atau
          transaksi ditolak. Kuota stok artikel telah dipulihkan secara aman ke
          katalog toko.
        </div>
      )}

      {isSukses && (
        <div className="mt-6 border border-emerald-900/50 bg-emerald-950/20 p-4 font-mono text-xs text-emerald-300">
          {pesanan.statusPesanan === "selesai"
            ? "Transaksi selesai. Pesanan telah berhasil diterima oleh pemesan."
            : pesanan.statusPesanan === "dikirim"
            ? "Paket pesanan Anda sedang dalam perjalanan oleh kurir ekspedisi menuju alamat tujuan."
            : "Pembayaran terverifikasi. Pesanan Anda saat ini sedang dipersiapkan untuk pengiriman."}
        </div>
      )}

      {/* Kartu Konfirmasi Penerimaan Barang (Dual-Trigger Progressive Acceptance) */}
      {pesanan.isAuthorized &&
        (pesanan.pelacakan?.statusPengiriman === "terkirim" ||
          pesanan.statusPesanan === "dikirim") &&
        pesanan.statusPesanan !== "selesai" && (
          <div className="mt-6 border border-emerald-500/50 bg-emerald-950/30 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    {pesanan.pelacakan?.statusPengiriman === "terkirim"
                      ? "STATUS LOGISTIK: PAKET TIBA DI TUJUAN"
                      : "KONFIRMASI PENERIMAAN BARANG"}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-neutral-300">
                  {pesanan.pelacakan?.statusPengiriman === "terkirim"
                    ? "Kurir telah mencatat paket sampai. Mohon periksa fisik paket dan lakukan konfirmasi penerimaan untuk mengaktifkan proteksi garansi unboxing 2x24 jam."
                    : "Jika paket pesanan fisik telah Anda terima dengan baik, lakukan konfirmasi penerimaan untuk mengaktifkan garansi unboxing 2x24 jam."}
                </p>
              </div>
              <button
                type="button"
                onClick={onKonfirmasiDiterima}
                disabled={sedangKonfirmasiDiterima}
                className="inline-flex min-h-11 shrink-0 items-center justify-center border border-emerald-400 bg-emerald-400 px-6 font-mono text-xs font-black text-black uppercase transition-colors hover:bg-emerald-300 disabled:opacity-50"
              >
                {sedangKonfirmasiDiterima
                  ? "MENYIMPAN..."
                  : "KONFIRMASI PESANAN DITERIMA"}
              </button>
            </div>
          </div>
        )}

      {/* Kartu Garansi Purna Jual 2x24 Jam (Aktif Setelah Status Selesai) */}
      {pesanan.statusPesanan === "selesai" && pesanan.garansiBerakhirPada && (
        <div className="mt-6 border border-neutral-700 bg-neutral-900/60 p-5 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                GARANSI PURNA JUAL 2X24 JAM AKTIF
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase mr-2">
                SISA WAKTU KLAIM:
              </span>
              <span
                className={`text-xs font-bold ${
                  sisaGaransiDetik > 0 ? "text-emerald-400" : "text-neutral-500"
                }`}
              >
                {sisaGaransiDetik > 0 ? formatSisaGaransi : "GARANSI BERAKHIR"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-neutral-400 leading-relaxed">
            Pastikan Anda merekam video proses unboxing paket tanpa jeda sejak label resi dibuka. Apabila terdapat cacat manufaktur atau kesalahan kirim varian, segera ajukan klaim retur sebelum masa garansi di atas berakhir.
          </p>
        </div>
      )}
    </div>
  );
}
