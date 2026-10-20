"use client";

import React from "react";

interface PropsInformasiPengirimanPesanan {
  namaPelanggan: string;
  teleponPelanggan: string;
  emailPelanggan: string;
  kurir?: {
    nama: string;
    layanan: string;
    estimasiHari: string;
    nomorResi?: string | null;
  } | null;
}

export function InformasiPengirimanPesanan({
  namaPelanggan,
  teleponPelanggan,
  emailPelanggan,
  kurir,
}: PropsInformasiPengirimanPesanan) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 border-t border-neutral-800 pt-6 sm:grid-cols-2">
      <div>
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          PENERIMA & ALAMAT
        </h3>
        <p className="mt-2 font-mono text-xs font-semibold text-neutral-200">
          {namaPelanggan}
        </p>
        <p className="font-mono text-xs text-neutral-400">{teleponPelanggan}</p>
        <p className="font-mono text-xs text-neutral-400">{emailPelanggan}</p>
      </div>

      <div>
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          EKSPEDISI & PENGIRIMAN
        </h3>
        <p className="mt-2 font-mono text-xs font-semibold text-neutral-200">
          {kurir?.nama || "Kurir Standar"} &bull; {kurir?.layanan || "Reguler"}
        </p>
        <p className="font-mono text-xs text-neutral-400">
          Estimasi Tiba: {kurir?.estimasiHari || "1-3 hari kerja"}
        </p>
        {kurir?.nomorResi && (
          <p className="mt-1 font-mono text-xs font-bold text-emerald-400">
            Nomor Resi: {kurir.nomorResi}
          </p>
        )}
      </div>
    </div>
  );
}
