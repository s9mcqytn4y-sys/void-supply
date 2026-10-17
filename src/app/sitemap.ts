import type { MetadataRoute } from "next";
import { ambilDaftarKatalog } from "@/features/catalog/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://voidsupply.com";

  let ruteProduk: MetadataRoute.Sitemap = [];
  try {
    const produkList = await ambilDaftarKatalog();
    ruteProduk = produkList.map((p) => ({
      url: `${baseUrl}/katalog/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("Gagal memuat katalog untuk sitemap dari database, menggunakan daftar statis Drop 04:", err);
    // Fallback katalog statis Drop 04 agar proses build static generator Vercel selalu sukses
    const slugStatisDrop04 = [
      "oversized-heavyweight-t-shirt-black",
      "tactical-cargo-pants-dark-grey",
      "cyberpunk-graphic-hoodie-black",
      "minimalist-coach-jacket-black",
      "technical-crossbody-bag-black",
      "embroidered-distressed-cap-black",
    ];
    ruteProduk = slugStatisDrop04.map((slug) => ({
      url: `${baseUrl}/katalog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  const ruteStatis: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lacak`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/material`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  return [...ruteStatis, ...ruteProduk];
}
