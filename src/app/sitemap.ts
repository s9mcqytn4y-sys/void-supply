import type { MetadataRoute } from "next";
import { ambilDaftarKatalog } from "@/features/catalog/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voidsupply.com";

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
    console.warn("Gagal memuat katalog untuk sitemap:", err);
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
  ];

  return [...ruteStatis, ...ruteProduk];
}
