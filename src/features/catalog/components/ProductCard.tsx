import Link from "next/link";
import Image from "next/image";
import { formatRupiah, cn } from "@/lib/utils";
import type { ProdukRingkasan } from "../types/product.type";

interface ProductCardProps {
  product: ProdukRingkasan;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group relative flex flex-col border border-neutral-800 bg-neutral-950 transition-all duration-300 hover:border-neutral-600">
      {/* 1. Wadah Gambar Rasio 4:5 */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-neutral-900"
        aria-label={`Lihat detail ${product.nama}`}
      >
        {/* Badge Koleksi Drop di Kiri Atas */}
        <span className="absolute top-3 left-3 z-10 border border-neutral-700/80 bg-black/80 px-2.5 py-1 font-mono text-[11px] tracking-widest text-neutral-200 uppercase backdrop-blur-sm">
          DROP 04
        </span>

        {/* Badge Urgensi Stok di Kanan Atas */}
        {product.apakahHabis ? (
          <span className="absolute top-3 right-3 z-10 border border-red-800/80 bg-red-950/90 px-2.5 py-1 font-mono text-[11px] tracking-widest text-red-300 uppercase backdrop-blur-sm">
            HABIS TERJUAL
          </span>
        ) : product.apakahStokMenipis ? (
          <span className="absolute top-3 right-3 z-10 border border-amber-800/80 bg-amber-950/90 px-2.5 py-1 font-mono text-[11px] tracking-widest text-amber-300 uppercase backdrop-blur-sm">
            HAMPIR HABIS
          </span>
        ) : null}

        {/* Gambar Produk */}
        <div className="relative h-full w-full">
          <Image
            src={product.gambarUtama}
            alt={product.nama}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              product.apakahHabis && "opacity-40 grayscale"
            )}
          />
        </div>

        {/* Quick Size Selector Overlay saat Hover (Desktop) / Tap (Mobile) */}
        {!product.apakahHabis && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-2 flex-wrap justify-center gap-1.5 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {product.varian.map((v) => {
              const isTersedia = v.stok > 0;
              return (
                <span
                  key={v.id}
                  className={cn(
                    "min-w-[32px] border px-2 py-1 text-center font-mono text-[10px] tracking-wider transition-colors",
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
      <div className="flex flex-grow flex-col justify-between gap-2 border-t border-neutral-800/80 p-4">
        <div>
          <span className="mb-1 block font-mono text-[11px] tracking-wider text-neutral-400 uppercase">
            {product.kategori}
          </span>
          <h2 className="line-clamp-1 text-sm font-semibold tracking-tight text-neutral-100 uppercase transition-colors group-hover:text-white">
            <Link href={`/product/${product.slug}`}>{product.nama}</Link>
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
