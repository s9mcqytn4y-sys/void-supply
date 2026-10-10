import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface PropertiInformasiProduk {
  nama: string;
  kategori: string;
  hargaDasar: number;
  deskripsi: string;
  totalStok: number;
  apakahHabis: boolean;
  apakahStokMenipis: boolean;
}

export function InformasiProduk({
  nama,
  kategori,
  hargaDasar,
  deskripsi,
  totalStok,
  apakahHabis,
  apakahStokMenipis,
}: PropertiInformasiProduk) {
  return (
    <section aria-label="Informasi Detail Produk" className="flex flex-col gap-5">
      {/* 1. Breadcrumb Navigasi Ramah Keyboard */}
      <nav aria-label="Jejak navigasi halaman" className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
        <Link
          href="/"
          className="hover:text-white focus-visible:outline-none focus-visible:underline"
        >
          BERANDA
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href="/katalog"
          className="hover:text-white focus-visible:outline-none focus-visible:underline"
        >
          KATALOG
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-200">{kategori.toUpperCase()}</span>
      </nav>

      {/* 2. Release Badge & Kategori */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">
          {kategori} // DROP 04 : NIGHT TRANSMISSION
        </span>
        {apakahHabis ? (
          <Badge variant="soldout">SOLD OUT</Badge>
        ) : apakahStokMenipis ? (
          <Badge variant="scarcity">LOW STOCK</Badge>
        ) : (
          <span className="font-mono text-[11px] text-neutral-400">
            {totalStok} UNIT TERSEDIA
          </span>
        )}
      </div>

      {/* 3. Judul Produk & Harga */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl md:text-4xl">
          {nama}
        </h1>
        <p className="mt-3 font-mono text-xl font-bold text-white sm:text-2xl">
          {formatRupiah(hargaDasar)}
        </p>
      </div>

      {/* 4. Deskripsi Material & Fitting */}
      <div className="border-t border-neutral-800/80 pt-4">
        <h2 className="sr-only">Deskripsi Artikel</h2>
        <p className="text-sm leading-relaxed text-neutral-300 sm:text-base">
          {deskripsi}
        </p>
      </div>
    </section>
  );
}
