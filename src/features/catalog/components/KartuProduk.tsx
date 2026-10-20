"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { formatRupiah, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GambarProduk } from "./GambarProduk";
import type { ProdukRingkasan } from "../types/product.type";
import { useKeranjangStore } from "@/features/cart/stores/keranjang.store";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";

export interface PropertiKartuProduk {
  produk: ProdukRingkasan;
  priority?: boolean;
}

export function KartuProduk({ produk, priority = false }: PropertiKartuProduk) {
  // Selective Zustand Store Subscriptions (Mencegah re-render yang tidak perlu di grid katalog)
  const tambahItem = useKeranjangStore((state) => state.tambahItem);
  const setBuka = useKeranjangStore((state) => state.setBuka);

  // 1. Ekstraksi ragam warna unik dari varian fisik
  const daftarWarna = useMemo(() => {
    return Array.from(new Set(produk.varian.map((v) => v.warna)));
  }, [produk.varian]);

  // Warna default yang memiliki stok, atau opsi pertama
  const warnaDefault = useMemo(() => {
    const varianAdaStok = produk.varian.find((v) => v.stok > 0);
    return varianAdaStok?.warna || daftarWarna[0] || "Hitam";
  }, [produk.varian, daftarWarna]);

  // Colocated React Local State untuk interaksi kartu
  const [warnaTerpilih, setWarnaTerpilih] = useState<string>(warnaDefault);
  const [sedangMenambah, setSedangMenambah] = useState(false);

  // Varian yang cocok dengan warna terpilih
  const varianWarnaAktif = useMemo(() => {
    return produk.varian.filter((v) => v.warna === warnaTerpilih);
  }, [produk.varian, warnaTerpilih]);

  // Daftar ukuran untuk warna terpilih
  const daftarUkuranWarna = useMemo(() => {
    return varianWarnaAktif.map((v) => ({
      ukuran: v.ukuran,
      stok: v.stok,
      id: v.id,
      sku: v.sku,
    }));
  }, [varianWarnaAktif]);

  // Ukuran aktif default
  const ukuranDefault = useMemo(() => {
    const varianTersedia = varianWarnaAktif.find((v) => v.stok > 0);
    return varianTersedia?.ukuran || varianWarnaAktif[0]?.ukuran || "M";
  }, [varianWarnaAktif]);

  const [ukuranTerpilih, setUkuranTerpilih] = useState<string>(ukuranDefault);

  // Sinkronkan ukuran terpilih jika berganti warna dan ukuran lama tidak ada di warna baru
  const varianAktif = useMemo(() => {
    const cocok = varianWarnaAktif.find((v) => v.ukuran === ukuranTerpilih);
    if (cocok) return cocok;
    return varianWarnaAktif[0] || produk.varian[0];
  }, [varianWarnaAktif, ukuranTerpilih]);

  // Gambar aktif (jika varian memiliki foto khusus sudut warna)
  const gambarAktif = varianAktif?.gambar || produk.gambarUtama;
  const apakahVarianHabis = !varianAktif || varianAktif.stok <= 0;

  // Handler Quick Add to Cart
  const handleTambahKeKeranjang = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!varianAktif || varianAktif.stok <= 0) {
        toast.error("Varian terpilih sedang habis.");
        return;
      }

      setSedangMenambah(true);

      const hasil = tambahItem({
        varianId: varianAktif.id,
        produkId: produk.id,
        nama: produk.nama,
        slug: produk.slug,
        gambar: gambarAktif,
        sku: varianAktif.sku,
        ukuran: varianAktif.ukuran,
        warna: varianAktif.warna,
        hargaTampilanIdr: varianAktif.harga || produk.hargaDasar,
        beratGram: varianAktif.beratGram || 500,
        jumlah: 1,
      });

      if (hasil.sukses) {
        toast.success(
          `${produk.nama} (${varianAktif.warna} / ${varianAktif.ukuran}) ditambahkan ke keranjang.`
        );
        setBuka(true);
      } else {
        toast.error(hasil.pesan || "Gagal menambahkan item ke keranjang.");
      }

      setTimeout(() => {
        setSedangMenambah(false);
      }, 700);
    },
    [varianAktif, gambarAktif, produk, tambahItem, setBuka]
  );

  return (
    <article className="group relative flex flex-col border border-neutral-800 bg-neutral-950 transition-all duration-300 hover:border-neutral-600">
      {/* 1. Image Dominance: Wadah Rasio Editorial 4:5 dengan affordance link PDP */}
      <Link
        href={`/katalog/${produk.slug}`}
        className="relative block w-full focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label={`Lihat detail artikel ${produk.nama}`}
      >
        <GambarProduk
          src={gambarAktif}
          alt={`Foto produk ${produk.nama} - Varian ${varianAktif?.warna || ""}`}
          apakahHabis={produk.apakahHabis}
          apakahStokMenipis={produk.apakahStokMenipis}
          priority={priority}
          labelBadge="DROP 04"
        />

        {/* Quick Size Pills Overlay di Mobile & Hover Desktop */}
        {!produk.apakahHabis && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-1.5 bg-linear-to-t from-black/95 via-black/85 to-transparent p-2.5 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            {daftarUkuranWarna.map((item) => {
              const isTersedia = item.stok > 0;
              const isDipilih = item.ukuran === (varianAktif?.ukuran || ukuranTerpilih);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isTersedia) {
                      setUkuranTerpilih(item.ukuran);
                    }
                  }}
                  disabled={!isTersedia}
                  aria-label={`Pilih ukuran ${item.ukuran}${isTersedia ? "" : " (Habis)"}`}
                  className={cn(
                    "min-h-7 min-w-7 border px-2 py-0.5 text-center font-mono text-[11px] tracking-wider transition-colors",
                    isDipilih
                      ? "border-white bg-white font-bold text-black shadow-sm"
                      : isTersedia
                        ? "border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-neutral-400 hover:text-white"
                        : "cursor-not-allowed border-neutral-900 bg-neutral-950/80 text-neutral-600 line-through"
                  )}
                >
                  {item.ukuran}
                </button>
              );
            })}
          </div>
        )}
      </Link>

      {/* 2. Informasi Metadata & Tipografi */}
      <div className="flex grow flex-col justify-between gap-3 border-t border-neutral-800/80 p-4">
        <div>
          {/* Baris Kategori & Badges */}
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="type-caption font-mono text-[11px] text-neutral-400">
              {produk.kategori} // DROP 04
            </span>
            {produk.apakahHabis ? (
              <Badge variant="soldout">SOLD OUT</Badge>
            ) : produk.apakahStokMenipis ? (
              <Badge variant="scarcity">LOW STOCK</Badge>
            ) : null}
          </div>

          {/* Judul Produk */}
          <h2 className="line-clamp-1 text-sm font-semibold tracking-tight text-neutral-100 uppercase transition-colors group-hover:text-white">
            <Link
              href={`/katalog/${produk.slug}`}
              className="focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              {produk.nama}
            </Link>
          </h2>

          {/* Multi-Color Swatch Selector */}
          {daftarWarna.length > 1 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Pilihan variasi warna">
              <span className="font-mono text-[10px] text-neutral-500 uppercase">Warna:</span>
              {daftarWarna.map((warna) => {
                const isWarnaAktif = warna === warnaTerpilih;
                return (
                  <button
                    key={warna}
                    type="button"
                    onClick={() => {
                      setWarnaTerpilih(warna);
                      const varianWarna = produk.varian.filter((v) => v.warna === warna);
                      const ukuranCocok = varianWarna.find((v) => v.ukuran === ukuranTerpilih && v.stok > 0);
                      if (ukuranCocok) {
                        setUkuranTerpilih(ukuranCocok.ukuran);
                      } else {
                        const firstReady = varianWarna.find((v) => v.stok > 0);
                        if (firstReady) setUkuranTerpilih(firstReady.ukuran);
                      }
                    }}
                    aria-label={`Ganti ke warna ${warna}`}
                    className={cn(
                      "min-h-6 border px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
                      isWarnaAktif
                        ? "border-neutral-200 bg-neutral-800 text-white font-medium"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                    )}
                  >
                    {warna}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Harga & Ketersediaan Stok */}
        <div className="flex items-center justify-between border-t border-neutral-900 pt-2">
          <span className="font-mono text-sm font-semibold text-neutral-200">
            {formatRupiah(produk.hargaDasar)}
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            {produk.apakahHabis
              ? "0 Unit"
              : varianAktif
                ? `${varianAktif.stok} Unit (${varianAktif.warna})`
                : `${produk.totalStok} Tersedia`}
          </span>
        </div>
      </div>

      {/* 3. Decisive Split Call To Action: Minimum Tap Target 44px (min-h-11) */}
      <div className="flex border-t border-neutral-800 bg-neutral-950">
        <Link
          href={`/katalog/${produk.slug}`}
          aria-label={`Buka halaman detail produk ${produk.nama}`}
          className="flex min-h-11 flex-1 items-center justify-center border-r border-neutral-800 px-3 py-2 font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase transition-colors hover:bg-neutral-900 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <span>DETAIL</span>
        </Link>

        {produk.apakahHabis || apakahVarianHabis ? (
          <button
            type="button"
            disabled
            className="flex min-h-11 flex-1 items-center justify-center bg-neutral-900 px-3 py-2 font-mono text-xs font-semibold tracking-wider text-neutral-500 uppercase cursor-not-allowed"
          >
            <span>HABIS</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleTambahKeKeranjang}
            disabled={sedangMenambah}
            aria-label={`Tambahkan ${produk.nama} varian ${varianAktif?.ukuran} ke keranjang`}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-1.5 px-3 py-2 font-mono text-xs font-bold tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
              sedangMenambah
                ? "bg-white text-black"
                : "bg-neutral-950 text-neutral-100 hover:bg-white hover:text-black active:bg-neutral-200"
            )}
          >
            {sedangMenambah ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>MASUK</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>+ KERANJANG</span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

// Alias untuk kompatibilitas
export const ProductCard = KartuProduk;
export type ProductCardProps = {
  product: ProdukRingkasan;
  priority?: boolean;
};
