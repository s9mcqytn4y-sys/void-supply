"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GridProduk } from "./GridProduk";
import type { ProdukRingkasan } from "../types/product.type";
import { Button } from "@/components/ui/button";

export interface PropertiKatalogExplorer {
  produkAwal: ProdukRingkasan[];
}

const DAFTAR_KATEGORI = [
  { slug: "semua", label: "SEMUA" },
  { slug: "tshirt", label: "T-SHIRT" },
  { slug: "outerwear", label: "OUTERWEAR" },
  { slug: "pants", label: "PANTS" },
  { slug: "accessories", label: "ACCESSORIES" },
];

export function KatalogExplorer({ produkAwal }: PropertiKatalogExplorer) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Ambil state awal dari URL SearchParams
  const paramKategori = searchParams.get("kategori") || "semua";
  const paramKoleksi = searchParams.get("koleksi") || "";
  const initialCari = searchParams.get("q") || (paramKoleksi === "cybernetic" ? "cybernetic" : "");
  const paramUrutan = searchParams.get("sort") || "terbaru";
  const paramHanyaReady = searchParams.get("ready") === "1";

  const [kategoriTerpilih, setKategoriTerpilih] = useState(paramKategori);
  const [kataKunciCari, setKataKunciCari] = useState(initialCari);
  const [debouncedCari, setDebouncedCari] = useState(initialCari);
  const [pilihanUrutan, setPilihanUrutan] = useState(paramUrutan);
  const [hanyaReadyStock, setHanyaReadyStock] = useState(paramHanyaReady);

  // Debounce kata kunci pencarian (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCari(kataKunciCari);
    }, 300);

    return () => clearTimeout(handler);
  }, [kataKunciCari]);

  // Sinkronisasi URL search params secara halus
  useEffect(() => {
    const params = new URLSearchParams();
    if (kategoriTerpilih !== "semua") params.set("kategori", kategoriTerpilih);
    if (debouncedCari.trim()) params.set("q", debouncedCari.trim());
    if (pilihanUrutan !== "terbaru") params.set("sort", pilihanUrutan);
    if (hanyaReadyStock) params.set("ready", "1");

    const queryStr = params.toString();
    const urlTujuan = queryStr ? `${pathname}?${queryStr}` : pathname;

    startTransition(() => {
      router.replace(urlTujuan, { scroll: false });
    });
  }, [kategoriTerpilih, debouncedCari, pilihanUrutan, hanyaReadyStock, pathname, router]);

  // Kalkulasi Filter & Urutan secara responsif
  const hasilProduk = useMemo(() => {
    return produkAwal.filter((item) => {
      // 1. Filter Kategori
      if (kategoriTerpilih !== "semua") {
        const itemKategoriSlug = item.kategori.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (kategoriTerpilih === "tshirt" && !itemKategoriSlug.includes("tshirt") && !itemKategoriSlug.includes("tee")) {
          return false;
        }
        if (kategoriTerpilih === "outerwear" && !itemKategoriSlug.includes("outerwear") && !itemKategoriSlug.includes("jacket") && !itemKategoriSlug.includes("hoodie")) {
          return false;
        }
        if (kategoriTerpilih === "pants" && !itemKategoriSlug.includes("pants") && !itemKategoriSlug.includes("cargo") && !itemKategoriSlug.includes("trouser")) {
          return false;
        }
        if (kategoriTerpilih === "accessories" && !itemKategoriSlug.includes("accessories") && !itemKategoriSlug.includes("balaclava") && !itemKategoriSlug.includes("cap")) {
          return false;
        }
      }

      // 2. Filter Ketersediaan Stok
      if (hanyaReadyStock && item.apakahHabis) {
        return false;
      }

      // 3. Filter Kata Kunci
      if (debouncedCari.trim()) {
        const query = debouncedCari.toLowerCase().trim();
        const namaCocok = item.nama.toLowerCase().includes(query);
        const slugCocok = item.slug.toLowerCase().includes(query);
        const kategoriCocok = item.kategori.toLowerCase().includes(query);
        if (!namaCocok && !slugCocok && !kategoriCocok) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (pilihanUrutan === "harga-rendah") {
        return a.hargaDasar - b.hargaDasar;
      }
      if (pilihanUrutan === "harga-tinggi") {
        return b.hargaDasar - a.hargaDasar;
      }
      // Default: urutan bawaan database (terbaru)
      return 0;
    });
  }, [produkAwal, kategoriTerpilih, hanyaReadyStock, debouncedCari, pilihanUrutan]);

  const apakahFilterAktif =
    kategoriTerpilih !== "semua" ||
    Boolean(kataKunciCari.trim()) ||
    pilihanUrutan !== "terbaru" ||
    hanyaReadyStock;

  const tanganiResetFilter = () => {
    setKategoriTerpilih("semua");
    setKataKunciCari("");
    setDebouncedCari("");
    setPilihanUrutan("terbaru");
    setHanyaReadyStock(false);
  };

  return (
    <div className="space-y-8">
      {/* Kontrol Navigasi & Filter */}
      <div className="border border-neutral-800 bg-neutral-900/40 p-4 sm:p-6">
        {/* Kategori Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-4">
          <span className="mr-2 font-mono text-[11px] font-bold text-neutral-400 uppercase">
            KATEGORI:
          </span>
          {DAFTAR_KATEGORI.map((kat) => {
            const apakahAktif = kategoriTerpilih === kat.slug;
            return (
              <button
                key={kat.slug}
                type="button"
                onClick={() => setKategoriTerpilih(kat.slug)}
                className={`min-h-9 px-3.5 font-mono text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                  apakahAktif
                    ? "border border-white bg-white text-black"
                    : "border border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-white"
                }`}
              >
                {kat.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar Pencarian, Urutan & Switch Ready Stock */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Kolom Pencarian */}
          <div className="relative flex-1">
            <label htmlFor="pencarian-katalog" className="sr-only">
              Cari artikel produk
            </label>
            <input
              id="pencarian-katalog"
              type="text"
              value={kataKunciCari}
              onChange={(e) => setKataKunciCari(e.target.value)}
              placeholder="CARI ARTIKEL... (CONTOH: OVERSIZED TEE, BOMBER)"
              className="min-h-11 w-full border border-neutral-800 bg-neutral-950 px-4 pr-10 font-mono text-xs text-white uppercase placeholder:text-neutral-500 focus:border-white focus:outline-none"
            />
            {kataKunciCari && (
              <button
                type="button"
                onClick={() => setKataKunciCari("")}
                aria-label="Bersihkan pencarian"
                className="absolute inset-y-0 right-0 flex items-center pr-3 font-mono text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Opsi Urutan & Ketersediaan */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sakelar Ready Stock */}
            <label className="flex min-h-11 cursor-pointer select-none items-center gap-2.5 border border-neutral-800 bg-neutral-950 px-3.5 font-mono text-xs font-semibold text-neutral-300 transition-colors hover:border-neutral-700">
              <input
                type="checkbox"
                checked={hanyaReadyStock}
                onChange={(e) => setHanyaReadyStock(e.target.checked)}
                className="h-4 w-4 rounded-none border-neutral-700 bg-neutral-900 accent-white"
              />
              <span className="uppercase">HANYA READY STOCK</span>
            </label>

            {/* Dropdown Urutan */}
            <div className="flex items-center border border-neutral-800 bg-neutral-950">
              <label htmlFor="pilihan-urutan" className="sr-only">
                Urutan Katalog
              </label>
              <select
                id="pilihan-urutan"
                value={pilihanUrutan}
                onChange={(e) => setPilihanUrutan(e.target.value)}
                className="min-h-11 cursor-pointer bg-neutral-950 px-3.5 font-mono text-xs font-semibold text-neutral-200 uppercase focus:border-white focus:outline-none"
              >
                <option value="terbaru">URUTKAN: TERBARU</option>
                <option value="harga-rendah">HARGA: TERENDAH</option>
                <option value="harga-tinggi">HARGA: TERTINGGI</option>
              </select>
            </div>
          </div>
        </div>

        {/* Indikator Hasil & Tombol Reset */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-3">
          <p className="font-mono text-xs text-neutral-400">
            Menampilkan <strong className="text-white">{hasilProduk.length}</strong> dari{" "}
            {produkAwal.length} artikel busana
          </p>

          {apakahFilterAktif && (
            <button
              type="button"
              onClick={tanganiResetFilter}
              className="font-mono text-xs font-semibold text-neutral-400 underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              RESET SEMUA FILTER
            </button>
          )}
        </div>
      </div>

      {/* Render Grid atau Empty State */}
      {hasilProduk.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-neutral-800 bg-neutral-900/30 p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center border border-neutral-700 font-mono text-base text-neutral-400">
            [Ø]
          </div>
          <h2 className="font-mono text-base font-bold text-white uppercase sm:text-lg">
            TIDAK ADA ARTIKEL DITEMUKAN
          </h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            Tidak ada produk yang memenuhi kriteria pencarian atau filter yang Anda terapkan.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={tanganiResetFilter}
            className="mt-6 min-h-11 border-neutral-700 font-mono text-xs uppercase hover:border-white hover:text-white"
          >
            TAMPILKAN SEMUA KOLEKSI
          </Button>
        </div>
      ) : (
        <GridProduk produk={hasilProduk} />
      )}
    </div>
  );
}
