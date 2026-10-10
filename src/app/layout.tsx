import type { Metadata } from "next";
import "./globals.css";
import { HeaderToko } from "@/components/layout/HeaderToko";
import { FooterToko } from "@/components/layout/FooterToko";
import { RingkasanKeranjang } from "@/features/cart";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "VOID Supply | Heavyweight Streetwear Merchandise",
  description: "Limited edition high-density urban streetwear engineered for nocturnal climates.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white">
        <HeaderToko />
        <main className="flex-1">{children}</main>
        <FooterToko />
        <RingkasanKeranjang />
      </body>
    </html>
  );
}
