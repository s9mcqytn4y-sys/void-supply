import Link from "next/link";
import { formatRupiah, cn } from "@/lib/utils";
import { ProductImage } from "./ProductImage";
import type { ProdukRingkasan } from "../types/product.type";

interface ProductCardProps {
  product: ProdukRingkasan;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group relative flex flex-col border border-neutral-800 bg-neutral-950 transition-all duration-300 hover:border-neutral-600">
      {/* 1. Wadah Gambar Rasio 4:5 via ProductImage Component */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block w-full focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label={`Lihat detail artikel ${product.nama}`}
      >
        <ProductImage
          src={product.gambarUtama}
          alt={`Foto produk ${product.nama}`}
          apakahHabis={product.apakahHabis}
          apakahStokMenipis={product.apakahStokMenipis}
          priority={priority}
          labelBadge="DROP 04"
        />

        {/* Quick Size Selector Overlay saat Hover (Desktop) / Tap (Mobile) */}
        {!product.apakahHabis && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-2 flex-wrap justify-center gap-1.5 bg-linear-to-t from-black/95 via-black/80 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {product.varian.map((v) => {
              const isTersedia = v.stok > 0;
              return (
                <span
                  key={v.id}
                  className={cn(
                    "min-w-8 border px-2 py-1 text-center font-mono text-[10px] tracking-wider transition-colors",
                    isTersedia
                      ? "border-neutral-600 bg-neutral-900/90 text-neutral-200 hover:border-white hover:text-white"
                      : "cursor-not-allowed border-neutral-800 bg-neutral-950/80 text-neutral-600 line-through"
                  )}
                >
                  {v.ukuran}
                </span>
              );
            })}
          </div>
        )}
      </Link>

      {/* 2. Informasi Metadata & Tipografi */}
      <div className="flex grow flex-col justify-between gap-2 border-t border-neutral-800/80 p-4">
        <div>
          <span className="mb-1 block font-mono text-[11px] tracking-wider text-neutral-400 uppercase">
            {product.kategori}
          </span>
          <h2 className="line-clamp-1 text-sm font-semibold tracking-tight text-neutral-100 uppercase transition-colors group-hover:text-white">
            <Link
              href={`/shop/${product.slug}`}
              className="focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              {product.nama}
            </Link>
          </h2>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-900 pt-1">
          <span className="font-mono text-sm font-medium text-neutral-200">
            {formatRupiah(product.hargaDasar)}
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            {product.apakahHabis ? "0 Stok" : `${product.totalStok} Tersedia`}
          </span>
        </div>
      </div>
    </article>
  );
}
