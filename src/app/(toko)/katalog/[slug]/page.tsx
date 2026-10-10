import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ambilDetailProduk } from "@/features/catalog/server";
import {
  GaleriProduk,
  InformasiProduk,
  PemilihVarian,
  TransparansiMaterial,
} from "@/features/catalog";

interface PropertiHalamanDetail {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generator per Produk
export async function generateMetadata({
  params,
}: PropertiHalamanDetail): Promise<Metadata> {
  const { slug } = await params;
  const produk = await ambilDetailProduk(slug);

  if (!produk) {
    return {
      title: "Produk Tidak Ditemukan | VOID Supply",
      description: "Artikel streetwear yang Anda cari tidak tersedia atau telah dihapus.",
    };
  }

  return {
    title: `${produk.nama} | VOID Supply`,
    description: produk.deskripsi,
    openGraph: {
      title: `${produk.nama} | Drop 04 VOID Supply`,
      description: produk.deskripsi,
      images: [
        {
          url: produk.gambarUtama,
          alt: `Foto artikel ${produk.nama}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${produk.nama} | VOID Supply`,
      description: produk.deskripsi,
      images: [produk.gambarUtama],
    },
  };
}

// 2. Server Component Halaman Detail Produk (PDP)
export default async function HalamanDetailProduk({
  params,
}: PropertiHalamanDetail) {
  const { slug } = await params;
  const produk = await ambilDetailProduk(slug);

  // Jika produk tidak ditemukan di basis data, delegasikan ke not-found.tsx (404)
  if (!produk) {
    notFound();
  }

  const totalStok = produk.varian.reduce((acc, v) => acc + v.stok, 0);
  const apakahHabis = totalStok === 0;
  const apakahStokMenipis = totalStok > 0 && totalStok < 15;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8">
      <article className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Kolom Kiri: Galeri Foto Multi-Angle */}
        <section aria-label={`Galeri foto ${produk.nama}`}>
          <GaleriProduk
            namaProduk={produk.nama}
            gambarUtama={produk.gambarUtama}
            galeriGambar={produk.galeriGambar}
          />
        </section>

        {/* Kolom Kanan: Informasi, Pemilihan Ukuran & Transparansi Material */}
        <section aria-label="Informasi dan Pembelian Produk" className="flex flex-col gap-8">
          <InformasiProduk
            nama={produk.nama}
            kategori={produk.kategori}
            hargaDasar={produk.hargaDasar}
            deskripsi={produk.deskripsi}
            totalStok={totalStok}
            apakahHabis={apakahHabis}
            apakahStokMenipis={apakahStokMenipis}
          />

          <PemilihVarian
            kategori={produk.kategori}
            varian={produk.varian}
            apakahHabisTotal={apakahHabis}
          />

          <TransparansiMaterial kategori={produk.kategori} />
        </section>
      </article>
    </main>
  );
}
