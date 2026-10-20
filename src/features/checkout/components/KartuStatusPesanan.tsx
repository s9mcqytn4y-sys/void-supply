"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ambilStatusPesanan,
  type DetailStatusPesanan,
} from "../actions/status-pesanan.action";
import { TimelinePengiriman } from "@/features/shipping/components/TimelinePengiriman";
import { DevToolsSandboxDrawer } from "./DevToolsSandboxDrawer";
import { konfirmasiPesananDiterimaAction } from "../actions/konfirmasi-diterima.action";
import { toast } from "sonner";
import { usePesananAktifStore } from "../stores/pesanan-aktif.store";
import { RingkasanHeaderPesanan } from "./status/RingkasanHeaderPesanan";
import { DaftarItemPesanan } from "./status/DaftarItemPesanan";
import { InformasiPengirimanPesanan } from "./status/InformasiPengirimanPesanan";
import { RincianPembayaranPesanan } from "./status/RincianPembayaranPesanan";

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

  // Bersihkan Banner Reminder jika pesanan sudah dibayar / diproses / batal
  useEffect(() => {
    if (pesanan.statusPesanan !== "menunggu_pembayaran") {
      usePesananAktifStore.getState().bersihkanPesananAktif();
    }
  }, [pesanan.statusPesanan]);

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

  // Konfirmasi Penerimaan Paket oleh Pembeli
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

  // Polling Status Otomatis dengan Dynamic Backoff
  useEffect(() => {
    if (pesanan.statusPesanan !== "menunggu_pembayaran") {
      return;
    }

    let terpasang = true;
    let timerId: NodeJS.Timeout | null = null;
    let sedangMemproses = false;
    let hitungan = 0;
    const batasMaksimal = 20;

    const jadwalkanPollingBerikutnya = (jedaMs: number) => {
      if (!terpasang) return;
      timerId = setTimeout(eksekusiPolling, jedaMs);
    };

    const eksekusiPolling = async () => {
      if (!terpasang || sedangMemproses) return;
      sedangMemproses = true;
      hitungan += 1;

      try {
        const hasil = await ambilStatusPesanan(pesanan.nomorPesanan, tokenAkses);
        if (terpasang && hasil.sukses && hasil.data) {
          setPesanan(hasil.data);
          if (hasil.data.statusPesanan !== "menunggu_pembayaran") {
            return;
          }
        }
      } catch (err) {
        console.error("Kesalahan saat polling status pesanan:", err);
      } finally {
        sedangMemproses = false;
        if (terpasang && hitungan < batasMaksimal) {
          const jedaMs = hitungan <= 3 ? 3000 : hitungan <= 10 ? 5000 : 10000;
          jadwalkanPollingBerikutnya(jedaMs);
        }
      }
    };

    jadwalkanPollingBerikutnya(3000);

    return () => {
      terpasang = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [pesanan.nomorPesanan, pesanan.statusPesanan, tokenAkses]);

  const menit = Math.floor(sisaWaktuDetik / 60);
  const detik = sisaWaktuDetik % 60;
  const stringCountdown = `${menit.toString().padStart(2, "0")}:${detik
    .toString()
    .padStart(2, "0")}`;

  const jamGaransi = Math.floor(sisaGaransiDetik / 3600);
  const menitGaransi = Math.floor((sisaGaransiDetik % 3600) / 60);
  const detikGaransi = sisaGaransiDetik % 60;
  const formatSisaGaransi = `${jamGaransi} jam ${menitGaransi} mnt ${detikGaransi} dtk`;

  const isSukses =
    pesanan.statusPesanan === "diproses" ||
    pesanan.statusPesanan === "dikirim" ||
    pesanan.statusPesanan === "selesai";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Kartu Status Utama Terdekomposisi */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
        <RingkasanHeaderPesanan
          pesanan={pesanan}
          sisaWaktuDetik={sisaWaktuDetik}
          stringCountdown={stringCountdown}
          sisaGaransiDetik={sisaGaransiDetik}
          formatSisaGaransi={formatSisaGaransi}
          sedangMenyinkronkan={sedangMenyinkronkan}
          sedangKonfirmasiDiterima={sedangKonfirmasiDiterima}
          onSinkronkan={sinkronkanStatus}
          onKonfirmasiDiterima={tanganiKonfirmasiDiterima}
        />

        {/* Rincian Artikel & Logistik (Hanya Ditampilkan Jika Terotorisasi Penuh) */}
        {pesanan.isAuthorized ? (
          <>
            <DaftarItemPesanan items={pesanan.items} />

            <InformasiPengirimanPesanan
              namaPelanggan={pesanan.namaPelanggan}
              teleponPelanggan={pesanan.teleponPelanggan}
              emailPelanggan={pesanan.emailPelanggan}
              kurir={pesanan.kurir}
            />

            <RincianPembayaranPesanan
              nomorPesanan={pesanan.nomorPesanan}
              subtotal={pesanan.subtotal}
              totalOngkir={pesanan.totalOngkir}
              totalAkhir={pesanan.totalAkhir}
              totalDiskon={pesanan.totalDiskon}
              kodeVoucher={pesanan.kodeVoucher}
              isSukses={isSukses}
            />
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

      {/* Interactive Sandbox DevTools Drawer */}
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

      {/* Komponen Pelacakan Kurir Biteship */}
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
