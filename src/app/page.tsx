import type { Metadata } from "next";
import { ambilDaftarKatalog } from "@/features/catalog/server";
import {
  HeroEditorial,
  MarqueeTicker,
  SorotanKoleksiDrop,
  FiturUtamaMaterial,
  ManifestoBrand,
  NewsletterVIP,
} from "@/features/landing";
import { safeJsonLdStringify } from "@/lib/utils/jsonld";

export const metadata: Metadata = {
  title: "VOID Supply | Curated Heavyweight Streetwear",
  description:
    "Etalase busana streetwear independen dan apparel teknikal. Rilisan terbatas Drop 04: Night Transmission dengan transparansi material dan konstruksi presisi.",
};

export const dynamic = "force-dynamic";

export default async function HalamanBeranda() {
  const seluruhProduk = await ambilDaftarKatalog();
  // Ambil 4 artikel kurasi unggulan untuk highlight beranda
  const artikelUnggulan = seluruhProduk.slice(0, 4);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voidsupply.com";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VOID Supply",
    url: baseUrl,
    logo: `${baseUrl}/images/brand/void-logo.svg`,
    description:
      "Heavyweight technical streetwear brand based in Johar Baru, Central Jakarta, Indonesia.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Johar Baru",
      addressLocality: "Jakarta Pusat",
      postalCode: "10560",
      addressRegion: "DKI Jakarta",
      addressCountry: "ID",
    },
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(orgJsonLd) }}
      />

      {/* 1. Hero Section: Split Editorial Streetwear */}
      <HeroEditorial />

      {/* 2. Marquee Ticker: Pengumuman Berjalan Spesifikasi & Status */}
      <MarqueeTicker />

      {/* 3. Artikel Unggulan (Direct Link ke Katalog / PDP) */}
      <SorotanKoleksiDrop
        produkUnggulan={artikelUnggulan}
        totalKatalog={seluruhProduk.length}
      />

      {/* 4. Drop 04 Editorial Campaign & Garment Craftsmanship */}
      <FiturUtamaMaterial />

      {/* 5. Brand Manifesto & Transparansi Rekayasa */}
      <ManifestoBrand />

      {/* 6. VIP Newsletter / Transmisi Akses Awal Drop 05 */}
      <NewsletterVIP />
    </main>
  );
}
