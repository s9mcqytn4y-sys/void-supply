import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/katalog",
        permanent: true,
      },
      {
        source: "/product/:slug*",
        destination: "/katalog/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
