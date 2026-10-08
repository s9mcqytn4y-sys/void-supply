import type { Metadata } from "next";
import { catalogService, ProductGrid } from "@/features/catalog";

export const metadata: Metadata = {
  title: "Shop | Drop 04: Night Transmission | VOID Supply",
  description: "Jelajahi seluruh koleksi rilis terbatas Drop 04: Night Transmission.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await catalogService.ambilDaftarKatalog();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Koleksi Editorial */}
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="mb-2 block font-mono text-xs tracking-widest text-neutral-400 uppercase">
              CATALOG // DROP 04
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase md:text-5xl">
              NIGHT TRANSMISSION
            </h1>
          </div>
          <div className="text-left md:text-right">
            <p className="font-mono text-xs tracking-wider text-neutral-400 uppercase">
              {products.length} Artikel Rilis Terbatas
            </p>
          </div>
        </div>
      </header>

      {/* Grid Katalog Produk */}
      <ProductGrid products={products} />
    </main>
  );
}
