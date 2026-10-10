"use client";

import { useState } from "react";
import type { VarianProdukItem, DimensiUkuranGarmen } from "../types/product.type";
import { dapatDibeli } from "../types/product.type";
import { Button } from "@/components/ui/button";
import { PanduanUkuran } from "./PanduanUkuran";

export interface PropertiPemilihVarian {
  kategori: string;
  namaProduk?: string;
  panduanUkuran?: readonly DimensiUkuranGarmen[] | null;
  varian: readonly VarianProdukItem[];
  apakahHabisTotal: boolean;
}

export function PemilihVarian({
  kategori,
  namaProduk,
  panduanUkuran,
  varian,
  apakahHabisTotal,
}: PropertiPemilihVarian) {
  // Cari varian default pertama yang memiliki stok
  const varianPertamaTersedia = varian.find((v) => v.stok > 0);
  const [varianTerpilihId, setVarianTerpilihId] = useState<string | null>(
    varianPertamaTersedia ? varianPertamaTersedia.id : varian[0]?.id ?? null
  );

  const varianAktif = varian.find((v) => v.id === varianTerpilihId);
  const stokMaksimal = varianAktif ? Math.min(10, varianAktif.stok) : 0;
  const apakahVarianHabis = !varianAktif || varianAktif.stok <= 0;

  // Client State: Kuantitas Pembelian
  const [kuantitas, setKuantitas] = useState<number>(apakahVarianHabis ? 0 : 1);
  const [pesanStatus, setPesanStatus] = useState<string | null>(null);

  // Penanganan perubahan seleksi varian
  const tanganiPilihVarian = (idVarian: string) => {
    setVarianTerpilihId(idVarian);
    setPesanStatus(null);
    const targetVarian = varian.find((v) => v.id === idVarian);
    if (targetVarian && targetVarian.stok > 0) {
      setKuantitas(1);
    } else {
      setKuantitas(0);
    }
  };

  const kurangiKuantitas = () => {
    setPesanStatus(null);
    setKuantitas((prev) => Math.max(1, prev - 1));
  };

  const tambahKuantitas = () => {
    setPesanStatus(null);
    setKuantitas((prev) => Math.min(stokMaksimal, prev + 1));
  };

  const apakahBisaBeli = varianAktif ? dapatDibeli(varianAktif.stok, kuantitas) : false;

  const tanganiTambahKeranjang = () => {
    if (!varianAktif || !apakahBisaBeli) return;

    setPesanStatus(
      `${kuantitas}x ${namaProduk ?? "Artikel"} (Ukuran: ${varianAktif.ukuran}, SKU: ${varianAktif.sku}) siap ditambahkan. Arsitektur keranjang belanja Zustand sedang dipersiapkan untuk Modul 02.12.`
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Pemilihan Ukuran + Link Modal Panduan Ukuran */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            PILIH UKURAN {varianAktif ? `// [${varianAktif.ukuran} - ${varianAktif.warna}]` : ""}
          </label>
          <PanduanUkuran
            kategori={kategori}
            namaProduk={namaProduk}
            panduanUkuran={panduanUkuran}
          />
        </div>

        {/* Grid Ukuran Buttons (Berdasarkan ID Unik Varian) */}
        <div
          role="radiogroup"
          aria-label="Pilihan ukuran produk"
          className="grid grid-cols-5 gap-2 sm:gap-3"
        >
          {varian.map((v) => {
            const isTersedia = v.stok > 0;
            const isSelected = v.id === varianTerpilihId;

            const buttonStateClass =
              isSelected && isTersedia
                ? "border-white bg-white text-black ring-1 ring-white"
                : isTersedia
                  ? "border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:text-white active:scale-98"
                  : "cursor-not-allowed border-neutral-900 bg-neutral-950 text-neutral-600 line-through opacity-50";

            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!isTersedia}
                onClick={() => tanganiPilihVarian(v.id)}
                className={`flex min-h-11 flex-col items-center justify-center border font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${buttonStateClass}`}
              >
                <span>{v.ukuran}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Quantity Selector + Batas Stok (Module 02.11) */}
      <div className="flex items-center justify-between border-t border-b border-neutral-800/80 py-4">
        <div>
          <span className="block font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            KUANTITAS
          </span>
          <span className="font-mono text-[10px] text-neutral-400">
            {apakahVarianHabis ? "Stok habis" : `Maksimal ${stokMaksimal} unit / pesanan`}
          </span>
        </div>

        <div className="flex items-center border border-neutral-800 bg-neutral-900">
          <button
            type="button"
            onClick={kurangiKuantitas}
            disabled={kuantitas <= 1 || apakahVarianHabis}
            aria-label="Kurangi satu unit kuantitas"
            className="flex h-11 w-11 items-center justify-center font-mono text-base text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            -
          </button>
          <span
            aria-live="polite"
            className="flex h-11 min-w-12 items-center justify-center border-x border-neutral-800 px-3 font-mono text-xs font-bold text-white"
          >
            {kuantitas}
          </span>
          <button
            type="button"
            onClick={tambahKuantitas}
            disabled={kuantitas >= stokMaksimal || apakahVarianHabis}
            aria-label="Tambah satu unit kuantitas"
            className="flex h-11 w-11 items-center justify-center font-mono text-base text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            +
          </button>
        </div>
      </div>

      {/* 3. Indikator Status Stok Aktual Real-time */}
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-neutral-400">STATUS INVENTARIS:</span>
        {apakahHabisTotal ? (
          <span className="font-semibold text-rose-400">SELURUH VARIAN TELAH HABIS</span>
        ) : apakahVarianHabis ? (
          <span className="font-semibold text-neutral-500">UKURAN INI HABIS</span>
        ) : varianAktif && varianAktif.stok < 10 ? (
          <span className="font-semibold text-amber-400">
            SISA {varianAktif.stok} UNIT DI GUDANG
          </span>
        ) : (
          <span className="font-semibold text-emerald-400">STOK TERSEDIA (SIAP KIRIM)</span>
        )}
      </div>

      {/* 4. Notifikasi Jujur Feedback Tambah Keranjang */}
      {pesanStatus && (
        <div
          role="status"
          aria-live="polite"
          className="border-l-2 border-emerald-400 bg-neutral-900/90 p-3 font-mono text-xs text-neutral-200"
        >
          {pesanStatus}
        </div>
      )}

      {/* 5. Tombol Aksi Tambah ke Keranjang */}
      <Button
        type="button"
        variant={apakahVarianHabis || apakahHabisTotal ? "secondary" : "primary"}
        size="lg"
        disabled={!apakahBisaBeli}
        onClick={tanganiTambahKeranjang}
        className="min-h-11 w-full text-xs tracking-widest sm:text-sm"
      >
        {apakahHabisTotal
          ? "PRODUK DIARSIPKAN // HABIS"
          : apakahVarianHabis
            ? "UKURAN TIDAK TERSEDIA"
            : "TAMBAH KE KERANJANG"}
      </Button>
    </div>
  );
}

