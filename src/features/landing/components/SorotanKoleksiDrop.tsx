import Link from "next/link";
import { KartuProduk, type ProdukRingkasan } from "@/features/catalog";

interface SorotanKoleksiDropProps {
  produkUnggulan: ProdukRingkasan[];
  totalKatalog: number;
}

export function SorotanKoleksiDrop({
  produkUnggulan,
  totalKatalog,
}: SorotanKoleksiDropProps) {
  return (
    <section
      aria-label="Artikel Unggulan Drop 04"
      className="mx-auto max-w-7xl border-t border-zinc-800 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
            KURASI TERPILIH // EDISI TERBATAS
          </span>
          <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
            ARTIKEL UNGGULAN
          </h2>
        </div>
        <Link
          href="/katalog"
          className="inline-flex min-h-11 items-center font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          LIHAT SEMUA ({totalKatalog} ARTIKEL) →
        </Link>
      </div>

      {produkUnggulan.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <p className="font-mono text-xs text-zinc-400 uppercase">
            Katalog artikel sedang diperbarui. Silakan periksa kembali beberapa saat lagi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {produkUnggulan.map((item, index) => (
            <KartuProduk key={item.id} produk={item} priority={index < 2} />
          ))}
        </div>
      )}
    </section>
  );
}
