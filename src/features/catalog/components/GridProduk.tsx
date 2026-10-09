import { KartuProduk } from "./KartuProduk";
import type { ProdukRingkasan } from "../types/product.type";

export interface PropertiGridProduk {
  produk: ProdukRingkasan[];
}

export function GridProduk({ produk }: PropertiGridProduk) {
  if (produk.length === 0) {
    return (
      <div className="border border-neutral-800 bg-neutral-950 p-8 py-24 text-center">
        <p className="font-mono text-sm tracking-widest text-neutral-400 uppercase">
          Koleksi saat ini belum tersedia.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Daftar Katalog Produk"
      className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
    >
      {produk.map((item, index) => (
        <KartuProduk key={item.id} produk={item} priority={index < 4} />
      ))}
    </section>
  );
}

// Alias untuk kompatibilitas
export const ProductGrid = ({ products }: { products: ProdukRingkasan[] }) => (
  <GridProduk produk={products} />
);
export type ProductGridProps = { products: ProdukRingkasan[] };
