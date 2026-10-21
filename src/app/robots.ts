import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isStagingOrPreview =
    process.env.APP_ENV === "staging" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_APP_ENV === "staging";

  if (isStagingOrPreview) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://voidsupply.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/katalog", "/katalog/*", "/material", "/journal", "/tentang", "/kontak"],
      disallow: ["/api/*", "/checkout", "/_next/*", "/admin/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
