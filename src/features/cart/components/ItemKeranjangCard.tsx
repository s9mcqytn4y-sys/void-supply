"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import type { ItemKeranjang } from "../types/cart.type";
import { useKeranjangStore, BATAS_MAKSIMAL_PER_SKU } from "../stores/keranjang.store";

export interface PropertiItemKeranjangCard {
  item: ItemKeranjang;
}

export function ItemKeranjangCard({ item }: PropertiItemKeranjangCard) {
  const ubahJumlah = useKeranjangStore((state) => state.ubahJumlah);
  const hapusItem = useKeranjangStore((state) => state.hapusItem);

  const tanganiKurang = () => {
    if (item.jumlah > 1) {
      ubahJumlah(item.varianId, item.jumlah - 1);
    }
  };

  const tanganiTambah = () => {
    if (item.jumlah < BATAS_MAKSIMAL_PER_SKU) {
      ubahJumlah(item.varianId, item.jumlah + 1);
    }
  };

  return (
    <div className="flex gap-4 border-b border-neutral-800/80 py-4 last:border-b-0">
      {/* Thumbnail Gambar Produk */}
      <Link
        href={`/katalog/${item.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden border border-neutral-800 bg-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
      >
        <Image
          src={item.gambar}
          alt={item.nama}
          fill
          sizes="80px"
          className="object-cover object-center"
        />
      </Link>

      {/* Rincian Varian & Harga */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/katalog/${item.slug}`}
              className="font-mono text-xs font-bold text-white uppercase hover:underline"
            >
              {item.nama}
            </Link>
            <button
              type="button"
              onClick={() => hapusItem(item.varianId)}
              className="font-mono text-[11px] text-neutral-400 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              aria-label={`Hapus ${item.nama} ukuran ${item.ukuran} dari keranjang`}
            >
              HAPUS
            </button>
          </div>

          <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
            Ukuran: {item.ukuran} // Warna: {item.warna}
          </p>
          <p className="font-mono text-[10px] text-neutral-400">SKU: {item.sku}</p>
        </div>

        {/* Kontrol Kuantitas & Subtotal Baris */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border border-neutral-800 bg-neutral-950">
            <button
              type="button"
              onClick={tanganiKurang}
              disabled={item.jumlah <= 1}
              aria-label={`Kurangi jumlah ${item.nama}`}
              className="flex h-7 w-7 items-center justify-center font-mono text-xs text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              -
            </button>
            <span className="flex h-7 min-w-8 items-center justify-center border-x border-neutral-800 px-2 font-mono text-xs font-semibold text-white">
              {item.jumlah}
            </span>
            <button
              type="button"
              onClick={tanganiTambah}
              disabled={item.jumlah >= BATAS_MAKSIMAL_PER_SKU}
              aria-label={`Tambah jumlah ${item.nama}`}
              className="flex h-7 w-7 items-center justify-center font-mono text-xs text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-bold text-white">
              {formatRupiah(item.hargaTampilanIdr * item.jumlah)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
