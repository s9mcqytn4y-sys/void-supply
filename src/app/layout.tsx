import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HeaderToko } from "@/components/layout/HeaderToko";
import { FooterToko } from "@/components/layout/FooterToko";
import { RingkasanKeranjang, CartHydrationProvider } from "@/features/cart";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
  openGraph: {
    title: "VOID Supply | Curated Heavyweight Streetwear",
    description: "Drop 04: Night Transmission. High-density urban streetwear with verified material specs.",
    url: "/",
    siteName: "VOID Supply",
    images: [
      {
        url: "/images/brand/void-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VOID Supply Drop 04 Night Transmission",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VOID Supply | Curated Heavyweight Streetwear",
    description: "Drop 04: Night Transmission. High-density urban streetwear with verified material specs.",
    images: ["/images/brand/void-og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${archivo.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-neutral-950 font-sans text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white">
        <CartHydrationProvider>
          <HeaderToko />
          <div className="flex-1">{children}</div>
          <FooterToko />
          <RingkasanKeranjang />
        </CartHydrationProvider>
      </body>
    </html>
  );
}
