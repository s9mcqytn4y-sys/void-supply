"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  ambilStatusPesanan,
  type DetailStatusPesanan,
} from "../actions/status-pesanan.action";
import { TimelinePengiriman } from "@/features/shipping/components/TimelinePengiriman";

interface PropsKartuStatusPesanan {
  pesananAwal: DetailStatusPesanan;
  tokenAkses?: string;
}

export function KartuStatusPesanan({
  pesananAwal,
  tokenAkses,
}: PropsKartuStatusPesanan) {
  const [pesanan, setPesanan] = useState<DetailStatusPesanan>(pesananAwal);
  const [sedangMenyinkronkan, setSedangMenyinkronkan] = useState(false);
  const [sisaWaktuDetik, setSisaWaktuDetik] = useState<number>(() => {
    if (!pesananAwal.kedaluwarsaPada) return 0;
    const sisa = Math.floor(
      (new Date(pesananAwal.kedaluwarsaPada).getTime() - Date.now()) / 1000
    );
    return Math.max(0, sisa);
  });

  // Countdown Timer Interval
  useEffect(() => {
    if (pesanan.statusPesanan !== "menunggu_pembayaran" || sisaWaktuDetik <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSisaWaktuDetik((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Batas waktu habis: Segera sinkronkan ulang ke server
          sinkronkanStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pesanan.statusPesanan, sisaWaktuDetik]);

  // Fungsi Sinkronisasi Status Pesanan
  const sinkronkanStatus = useCallback(async () => {
    setSedangMenyinkronkan(true);
    try {
      const hasil = await ambilStatusPesanan(pesanan.nomorPesanan, tokenAkses);
      if (hasil.sukses && hasil.data) {
        setPesanan(hasil.data);
      }
    } catch (err) {
      console.error("Gagal menyinkronkan status pesanan:", err);
    } finally {
      setSedangMenyinkronkan(false);
    }
  }, [pesanan.nomorPesanan, tokenAkses]);

  // Polling Status Otomatis setiap 5 detik (maksimal 2 menit = 24 polling)
  useEffect(() => {
    if (pesanan.statusPesanan !== "menunggu_pembayaran") {
      return;
    }

    let hitungan = 0;
    const intervalPolling = setInterval(async () => {
      hitungan += 1;
      if (hitungan > 24) {
        clearInterval(intervalPolling);
        return;
      }

      const hasil = await ambilStatusPesanan(pesanan.nomorPesanan, tokenAkses);
      if (hasil.sukses && hasil.data) {
        setPesanan(hasil.data);
        if (hasil.data.statusPesanan !== "menunggu_pembayaran") {
          clearInterval(intervalPolling);
        }
      }
    }, 5000);

    return () => clearInterval(intervalPolling);
  }, [pesanan.nomorPesanan, pesanan.statusPesanan, tokenAkses]);

  const menit = Math.floor(sisaWaktuDetik / 60);
  const detik = sisaWaktuDetik % 60;
  const stringCountdown = `${menit.toString().padStart(2, "0")}:${detik
    .toString()
    .padStart(2, "0")}`;

  const isMenungguBayar = pesanan.statusPesanan === "menunggu_pembayaran";
  const isSukses =
    pesanan.statusPesanan === "diproses" ||
    pesanan.statusPesanan === "dikirim" ||
    pesanan.statusPesanan === "selesai";
  const isBatal =
    pesanan.statusPesanan === "dibatalkan" ||
    pesanan.statusPembayaran === "kadaluarsa";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Kartu Status Utama */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
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
            onClick={sinkronkanStatus}
            disabled={sedangMenyinkronkan}
            className="inline-flex min-h-9 items-center justify-center border border-neutral-700 bg-neutral-900 px-3 py-1 font-mono text-[11px] text-neutral-300 transition-colors hover:border-white hover:text-white disabled:opacity-50"
          >
            {sedangMenyinkronkan ? "MEMERIKSA..." : "REFRESH STATUS"}
          </button>
        </div>

        {/* Banner Instruksi Pembayaran & Countdown */}
        {isMenungguBayar && (
          <div className="mt-6 border border-amber-900/40 bg-amber-950/20 p-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="font-mono text-xs font-bold text-amber-300 uppercase">
                  BATAS WAKTU SELESAIKAN PEMBAYARAN
                </p>
                <p className="mt-1 text-xs text-neutral-300">
                  Selesaikan transaksi sebelum waktu habis agar stok varian tidak
                  dilepaskan otomatis ke katalog.
                </p>
              </div>
              <div className="flex h-12 min-w-28 items-center justify-center border border-amber-500/40 bg-neutral-950 px-4 font-mono text-xl font-black text-amber-400">
                {stringCountdown}
              </div>
            </div>

            {pesanan.isAuthorized && pesanan.pembayaran?.snapRedirectUrl && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={pesanan.pembayaran.snapRedirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 flex-1 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
                >
                  BAYAR SEKARANG (MIDTRANS SNAP)
                </a>
              </div>
            )}

            {!pesanan.isAuthorized && (
              <div className="mt-4 border border-neutral-800 bg-neutral-900/60 p-3 font-mono text-[11px] text-neutral-400">
                DATA PRIBADI TERPROTEKSI: Informasi pelanggan dan link pembayaran disamarkan demi privasi. Akses melalui tautan checkout resmi untuk otorisasi penuh.
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
            Pembayaran telah diverifikasi secara resmi. Pesanan Anda saat ini sedang
            dipersiapkan oleh tim operasional untuk pengiriman.
          </div>
        )}

        {/* Rincian Artikel & Pengiriman (Hanya Ditampilkan Jika Terotorisasi Penuh) */}
        {pesanan.isAuthorized ? (
          <>
            {/* Rincian Artikel Pesanan */}
            <div className="mt-8">
              <h2 className="border-b border-neutral-800 pb-2 font-mono text-xs font-bold text-white uppercase">
                ARTIKEL PESANAN ({pesanan.items.reduce((acc, i) => acc + i.jumlah, 0)}{" "}
                UNIT)
              </h2>
              <ul className="mt-3 divide-y divide-neutral-900 font-mono text-xs">
                {pesanan.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-bold text-white">{item.namaProduk}</p>
                      <p className="text-[11px] text-neutral-400">
                        {item.namaVarian} // SKU: {item.sku} x {item.jumlah}
                      </p>
                    </div>
                    <span className="font-bold text-white">
                      {formatRupiah(item.subtotalItem)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informasi Logistik & Penerima */}
            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-neutral-800 pt-6 sm:grid-cols-2">
              <div>
                <h3 className="font-mono text-xs font-bold text-white uppercase">
                  PENERIMA & ALAMAT
                </h3>
                <p className="mt-2 font-mono text-xs text-neutral-300">
                  {pesanan.namaPelanggan}
                </p>
                <p className="text-xs text-neutral-400">{pesanan.teleponPelanggan}</p>
                <p className="text-xs text-neutral-400">{pesanan.emailPelanggan}</p>
              </div>

              <div>
                <h3 className="font-mono text-xs font-bold text-white uppercase">
                  PENGIRIMAN
                </h3>
                <p className="mt-2 font-mono text-xs text-neutral-300">
                  {pesanan.kurir?.nama} - {pesanan.kurir?.layanan}
                </p>
                <p className="text-xs text-neutral-400">
                  Estimasi: {pesanan.kurir?.estimasiHari}
                </p>
                {pesanan.kurir?.nomorResi && (
                  <p className="mt-1 font-mono text-xs font-bold text-emerald-400">
                    Resi: {pesanan.kurir.nomorResi}
                  </p>
                )}
              </div>
            </div>

            {/* Rincian Finansial & Total */}
            <div className="mt-6 border-t border-neutral-800 pt-4 font-mono text-xs">
              <div className="flex justify-between py-1 text-neutral-400">
                <span>SUBTOTAL:</span>
                <span className="text-white">{formatRupiah(pesanan.subtotal)}</span>
              </div>
              {pesanan.totalDiskon && pesanan.totalDiskon > 0 ? (
                <div className="flex justify-between py-1 text-emerald-400">
                  <span>POTONGAN DISKON {pesanan.kodeVoucher ? `(${pesanan.kodeVoucher})` : ""}:</span>
                  <span className="font-bold">-{formatRupiah(pesanan.totalDiskon)}</span>
                </div>
              ) : null}
              <div className="flex justify-between py-1 text-neutral-400">
                <span>ONGKOS KIRIM:</span>
                <span className="text-white">{formatRupiah(pesanan.totalOngkir)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm text-white">
                <span className="font-bold">TOTAL TAGIHAN:</span>
                <span className="font-black text-emerald-400">
                  {formatRupiah(pesanan.totalAkhir)}
                </span>
              </div>
            </div>

            {/* Tombol Faktur & Pelacakan Logistik Resmi (Phase 4) */}
            {isSukses && (
              <div className="mt-6 flex flex-col gap-2 border-t border-neutral-800 pt-4 sm:flex-row">
                <Link
                  href={`/pesanan/${encodeURIComponent(pesanan.nomorPesanan)}/faktur`}
                  className="flex min-h-11 flex-1 items-center justify-center border border-emerald-500/50 bg-emerald-950/20 px-4 font-mono text-xs font-bold text-emerald-300 uppercase transition-colors hover:bg-emerald-900/30"
                >
                  FAKTUR RESMI (E-RECEIPT)
                </Link>
                <Link
                  href={`/track/${encodeURIComponent(pesanan.nomorPesanan)}`}
                  className="flex min-h-11 flex-1 items-center justify-center border border-neutral-700 bg-neutral-900 px-4 font-mono text-xs font-bold text-white uppercase transition-colors hover:border-white"
                >
                  LACAK PENGIRIMAN LIVE
                </Link>
                <Link
                  href={`/pesanan/${encodeURIComponent(pesanan.nomorPesanan)}/resi`}
                  target="_blank"
                  className="flex min-h-11 flex-1 items-center justify-center border border-neutral-800 bg-neutral-950 px-4 font-mono text-xs font-bold text-neutral-300 uppercase transition-colors hover:border-neutral-600 hover:text-white"
                >
                  LABEL RESI (100x150)
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 border border-neutral-800/80 bg-neutral-900/30 p-5">
            <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              PROTEKSI PRIVASI PUBLIK (SEC-03)
            </span>
            <p className="mt-1 font-mono text-xs text-neutral-300">
              Rincian artikel pemesanan, data alamat penerima, dan nominal tagihan disembunyikan.
            </p>
            <p className="mt-2 font-mono text-[11px] text-neutral-500">
              Gunakan perangkat atau browser yang sama saat Anda melakukan proses checkout untuk memuat rincian transaksi secara lengkap.
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-neutral-800 pt-6">
          <Link
            href="/katalog"
            className="inline-flex min-h-11 items-center justify-center border border-neutral-800 bg-neutral-900 px-6 font-mono text-xs font-semibold text-white uppercase transition-colors hover:border-neutral-700"
          >
            KEMBALI KE KATALOG TOKO
          </Link>
        </div>
      </div>

      {/* Komponen Pelacakan Kurir Biteship (Fase 2) */}
      {pesanan.isAuthorized && (
        <TimelinePengiriman
          nomorPesanan={pesanan.nomorPesanan}
          statusPesanan={pesanan.statusPesanan}
          pelacakan={pesanan.pelacakan}
          tampilkanSimulator={process.env.NODE_ENV !== "production"}
          onUpdate={sinkronkanStatus}
        />
      )}
    </div>
  );
}
