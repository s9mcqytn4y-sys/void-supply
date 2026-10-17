"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  ambilStatusPesanan,
  type DetailStatusPesanan,
} from "../actions/status-pesanan.action";
import { TimelinePengiriman } from "@/features/shipping/components/TimelinePengiriman";
import { DevToolsSandboxDrawer } from "./DevToolsSandboxDrawer";
import { InAppPaymentViewer } from "./InAppPaymentViewer";
import { konfirmasiPesananDiterimaAction } from "../actions/konfirmasi-diterima.action";
import { toast } from "sonner";

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
  const [sedangKonfirmasiDiterima, setSedangKonfirmasiDiterima] = useState(false);
  const [sisaGaransiDetik, setSisaGaransiDetik] = useState<number>(() => {
    if (!pesananAwal.garansiBerakhirPada) return 0;
    const sisa = Math.floor(
      (new Date(pesananAwal.garansiBerakhirPada).getTime() - Date.now()) / 1000
    );
    return Math.max(0, sisa);
  });

  // Countdown Timer Interval Pembayaran
  useEffect(() => {
    if (pesanan.statusPesanan !== "menunggu_pembayaran" || sisaWaktuDetik <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSisaWaktuDetik((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sinkronkanStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pesanan.statusPesanan, sisaWaktuDetik]);

  // Countdown Timer Garansi Purna Jual 2x24 Jam
  useEffect(() => {
    if (!pesanan.garansiBerakhirPada) return;

    const timerGaransi = setInterval(() => {
      const sisa = Math.floor(
        (new Date(pesanan.garansiBerakhirPada!).getTime() - Date.now()) / 1000
      );
      setSisaGaransiDetik(Math.max(0, sisa));
      if (sisa <= 0) {
        clearInterval(timerGaransi);
      }
    }, 1000);

    return () => clearInterval(timerGaransi);
  }, [pesanan.garansiBerakhirPada]);

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

  // Konfirmasi Penerimaan Paket oleh Pembeli (Dual-State Progressive Acceptance)
  const tanganiKonfirmasiDiterima = async () => {
    if (!tokenAkses) {
      toast.error("Token akses otorisasi tidak ditemukan.");
      return;
    }
    setSedangKonfirmasiDiterima(true);
    try {
      const hasil = await konfirmasiPesananDiterimaAction({
        nomorPesanan: pesanan.nomorPesanan,
        tokenAkses,
      });
      if (hasil.sukses) {
        toast.success("Pesanan Diterima!", {
          description: hasil.pesan,
        });
        await sinkronkanStatus();
      } else {
        toast.error("Gagal Mengonfirmasi", {
          description: hasil.pesan,
        });
      }
    } catch (err) {
      toast.error("Terjadi galat saat mengonfirmasi penerimaan barang.");
      console.error(err);
    } finally {
      setSedangKonfirmasiDiterima(false);
    }
  };

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

  // Format Timer Garansi (Jam, Menit, Detik)
  const jamGaransi = Math.floor(sisaGaransiDetik / 3600);
  const menitGaransi = Math.floor((sisaGaransiDetik % 3600) / 60);
  const detikGaransi = sisaGaransiDetik % 60;
  const formatSisaGaransi = `${jamGaransi} jam ${menitGaransi} mnt ${detikGaransi} dtk`;

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
              ? "Transaksi telah diselesaikan. Seluruh artikel telah diterima secara resmi oleh pemesan."
              : pesanan.statusPesanan === "dikirim"
              ? "Paket pesanan Anda sedang dalam perjalanan oleh kurir ekspedisi menuju alamat tujuan."
              : "Pembayaran telah diverifikasi secara resmi. Pesanan Anda saat ini sedang dipersiapkan oleh tim operasional untuk pengiriman."}
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
                      ? "Kurir Biteship telah mencatat paket sampai. Mohon periksa fisik paket dan lakukan konfirmasi penerimaan untuk mengaktifkan proteksi garansi unboxing 2x24 jam."
                      : "Jika paket pesanan fisik telah Anda terima dengan baik, lakukan konfirmasi penerimaan untuk mengaktifkan garansi unboxing 2x24 jam."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={tanganiKonfirmasiDiterima}
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
                  href={`/lacak?pesanan=${encodeURIComponent(pesanan.nomorPesanan)}`}
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

      {/* Interactive Sandbox DevTools Drawer (Poin 12 & Fase 3) */}
      {pesanan.isAuthorized && (
        <DevToolsSandboxDrawer
          nomorPesanan={pesanan.nomorPesanan}
          tokenAkses={tokenAkses}
          statusPesanan={pesanan.statusPesanan}
          statusPembayaran={pesanan.statusPembayaran}
          statusPengiriman={pesanan.pelacakan?.statusPengiriman}
          nomorResi={pesanan.kurir?.nomorResi}
          nomorVa={pesanan.pembayaran?.nomorVa}
          bankVa={pesanan.pembayaran?.bankVa}
          onSinkronUlang={sinkronkanStatus}
        />
      )}

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
