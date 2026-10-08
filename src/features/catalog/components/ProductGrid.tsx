import { ProductCard } from "./ProductCard";
import type { ProdukRingkasan } from "../types/product.type";

interface ProductGridProps {
  products: ProdukRingkasan[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
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
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </section>
  );
}
