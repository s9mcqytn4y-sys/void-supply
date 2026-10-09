import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
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
