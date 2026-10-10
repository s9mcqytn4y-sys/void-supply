import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voidsupply.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/katalog", "/katalog/*"],
      disallow: ["/api/*", "/checkout", "/_next/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
