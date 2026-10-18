"use client";

import Link from "next/link";
import { Package, MapPin, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import type { PesananAkunItem } from "../actions/pesanan-akun.action";
import type { AlamatPelangganItem } from "../actions/alamat-akun.action";

interface KartuRingkasanAkunProps {
  daftarPesanan: PesananAkunItem[];
  daftarAlamat: AlamatPelangganItem[];
  email: string;
  nama: string;
  emailVerified: boolean;
}

export function KartuRingkasanAkun({
  daftarPesanan,
  daftarAlamat,
  emailVerified,
}: KartuRingkasanAkunProps) {
  const pesananAktif = daftarPesanan.filter(
    (p) =>
      p.statusPesanan === "menunggu_pembayaran" ||
      p.statusPesanan === "diproses" ||
      p.statusPesanan === "dikirim"
  );

  const alamatUtama = daftarAlamat.find((a) => a.apakahUtama) || daftarAlamat[0];
  const pesananTerbaru = daftarPesanan[0];

  return (
    <div className="space-y-6">
      {/* Banner status verifikasi jika belum verified */}
      {!emailVerified && (
        <div className="border border-amber-800/80 bg-amber-950/20 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
                AKUN BELUM TERVERIFIKASI
              </p>
              <p className="font-mono text-xs text-amber-200/80 mt-1">
                Silakan periksa kotak masuk email Anda dan klik tautan aktivasi untuk mengamankan transaksi checkout.
              </p>
            </div>
            <Link
              href="/verifikasi-email"
              className="inline-flex min-h-11 items-center justify-center border border-amber-400 bg-amber-400 px-4 py-2 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0"
            >
              KIRIM ULANG VERIFIKASI
            </Link>
          </div>
        </div>
      )}

      {/* Grid Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Kartu 1: Total Pesanan */}
        <div className="border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">TOTAL PESANAN</span>
            <Package className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {daftarPesanan.length}
          </div>
          <div className="mt-2 font-mono text-[11px] text-zinc-400">
            {pesananAktif.length} pesanan aktif dalam proses
          </div>
        </div>

        {/* Kartu 2: Buku Alamat */}
        <div className="border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">BUKU ALAMAT</span>
            <MapPin className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {daftarAlamat.length}
          </div>
          <div className="mt-2 font-mono text-[11px] text-zinc-400 truncate">
            {alamatUtama ? `Utama: ${alamatUtama.label}` : "Belum ada alamat"}
          </div>
        </div>

        {/* Kartu 3: Status Proteksi */}
        <div className="border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">PROTEKSI AKUN</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-mono text-xl font-bold text-emerald-400 uppercase mt-1">
            {emailVerified ? "TERLINDUNGI" : "STANDAR"}
          </div>
          <div className="mt-2 font-mono text-[11px] text-zinc-400">
            Compare-and-Set atomik aktif
          </div>
        </div>
      </div>

      {/* Bagian: Pesanan Terbaru */}
      <div className="border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              PESANAN TERAKHIR
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-0.5">
              Pantau status pemrosesan dan pengiriman artikel pesanan Anda
            </p>
          </div>
          <Link
            href="/akun/pesanan"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <span>SEMUA PESANAN</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pesananTerbaru ? (
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/60 pb-3 mb-3">
              <div>
                <p className="font-mono text-xs font-bold text-white uppercase">
                  #{pesananTerbaru.nomorPesanan}
                </p>
                <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-zinc-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(pesananTerbaru.dibuatPada).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block border border-zinc-700 bg-zinc-800 px-2.5 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                  {pesananTerbaru.statusPesanan.replace("_", " ")}
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  Rp {pesananTerbaru.totalAkhir.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Cuplikan Item */}
            <div className="space-y-2 mb-4">
              {pesananTerbaru.daftarItem.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between font-mono text-xs text-zinc-300"
                >
                  <span className="truncate pr-4">
                    {item.namaProduk} ({item.ukuran}) &times; {item.jumlah}
                  </span>
                  <span className="shrink-0 text-zinc-400">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/pesanan/${pesananTerbaru.nomorPesanan}?token=${pesananTerbaru.tokenAkses}`}
                className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-5 py-2 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                LIHAT DETAIL & STATUS
              </Link>
              <Link
                href={`/pesanan/${pesananTerbaru.nomorPesanan}/faktur?token=${pesananTerbaru.tokenAkses}`}
                className="inline-flex min-h-11 items-center justify-center border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-xs font-semibold text-zinc-200 uppercase tracking-wider hover:border-zinc-500 hover:text-white transition-colors"
              >
                UNDUH FAKTUR
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="font-mono text-xs text-zinc-400">
              Belum ada pesanan yang tercatat dalam akun Anda.
            </p>
            <div className="mt-4">
              <Link
                href="/katalog"
                className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                JELAJAHI KATALOG DROP 04
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/akun/alamat"
          className="border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-600 transition-colors flex items-center justify-between group"
        >
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              PENGATURAN BUKU ALAMAT
            </h3>
            <p className="font-mono text-xs text-zinc-400 mt-1">
              Kelola alamat pengiriman untuk proses checkout instan
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/akun/keamanan"
          className="border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-600 transition-colors flex items-center justify-between group"
        >
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              PUSAT KEAMANAN AKUN
            </h3>
            <p className="font-mono text-xs text-zinc-400 mt-1">
              Ganti kata sandi dan pantau sesi perangkat yang terhubung
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
