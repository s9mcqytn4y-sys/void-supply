import Link from "next/link";
import { formatRupiah, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GambarProduk } from "./GambarProduk";
import type { ProdukRingkasan } from "../types/product.type";

export interface PropertiKartuProduk {
  produk: ProdukRingkasan;
  priority?: boolean;
}

export function KartuProduk({ produk, priority = false }: PropertiKartuProduk) {
  return (
    <Card className="group relative flex flex-col border-neutral-800 bg-neutral-950 transition-all duration-300 hover:border-neutral-600">
      {/* 1. Image Dominance: Wadah Rasio Editorial 4:5 */}
      <Link
        href={`/katalog/${produk.slug}`}
        className="relative block w-full focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label={`Lihat detail artikel ${produk.nama}`}
      >
        <GambarProduk
          src={produk.gambarUtama}
          alt={`Foto produk ${produk.nama}`}
          apakahHabis={produk.apakahHabis}
          apakahStokMenipis={produk.apakahStokMenipis}
          priority={priority}
          labelBadge="DROP 04"
        />

        {/* Quick Size Selector Overlay: Tampak di mobile, hover & keyboard focus di desktop */}
        {!produk.apakahHabis && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap justify-center gap-1.5 bg-linear-to-t from-black/95 via-black/80 to-transparent p-3 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            {produk.varian.map((v) => {
              const isTersedia = v.stok > 0;
              const pillStateClass = isTersedia
                ? "border-neutral-600 bg-neutral-900/90 text-neutral-200"
                : "border-neutral-800 bg-neutral-950/80 text-neutral-500 line-through";

              return (
                <span
                  key={v.id}
                  className={`min-w-8 border px-2 py-1 text-center font-mono text-[10px] tracking-wider transition-colors ${pillStateClass}`}
                >
                  {v.ukuran}
                </span>
              );
            })}
          </div>
        )}
      </Link>

      {/* 2. Informasi Metadata & Tipografi */}
      <div className="flex grow flex-col justify-between gap-3 border-t border-neutral-800/80 p-4">
        <div>
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

          <h2 className="line-clamp-1 text-sm font-semibold tracking-tight text-neutral-100 uppercase transition-colors group-hover:text-white">
            <Link
              href={`/katalog/${produk.slug}`}
              className="focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              {produk.nama}
            </Link>
          </h2>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-900 pt-2">
          <span className="font-mono text-sm font-semibold text-neutral-200">
            {formatRupiah(produk.hargaDasar)}
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            {produk.apakahHabis ? "0 Unit" : `${produk.totalStok} Tersedia`}
          </span>
        </div>
      </div>

      {/* 3. Decisive Call To Action: 44px Minimum Tap Target dengan affordance konsisten */}
      <Link
        href={`/katalog/${produk.slug}`}
        aria-label={`Buka halaman produk ${produk.nama}`}
        className={cn(
          "flex min-h-11 w-full items-center justify-between border-t border-neutral-800 px-4 py-2.5 font-mono text-xs font-semibold tracking-wider uppercase transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
          produk.apakahHabis
            ? "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            : "bg-neutral-950 text-neutral-200 hover:bg-white hover:text-black group-hover:border-neutral-700"
        )}
      >
        <span>{produk.apakahHabis ? "LIHAT ARSIP // HABIS" : "DETAIL PRODUK"}</span>
        <span aria-hidden="true">→</span>
      </Link>
    </Card>
  );
}

// Alias untuk kompatibilitas
export const ProductCard = KartuProduk;
export type ProductCardProps = {
  product: ProdukRingkasan;
  priority?: boolean;
};
