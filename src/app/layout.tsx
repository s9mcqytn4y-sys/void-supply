import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HeaderToko } from "@/components/layout/HeaderToko";
import { FooterToko } from "@/components/layout/FooterToko";
import { RingkasanKeranjang, CartHydrationProvider } from "@/features/cart";
import { I18nProvider } from "@/lib/i18n";
import { SonnerToaster } from "@/components/ui/SonnerToaster";

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
      { url: "/assets/brand/logo-mark.webp", type: "image/webp" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/assets/brand/logo-mark.webp",
    apple: "/assets/brand/logo-mark.webp",
  },
  openGraph: {
    title: "VOID Supply | Curated Heavyweight Streetwear",
    description: "Drop 04: Night Transmission. High-density urban streetwear with verified material specs.",
    url: "/",
    siteName: "VOID Supply",
    images: [
      {
        url: "/assets/brand/og-image.webp",
        width: 1920,
        height: 1080,
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
    images: ["/assets/brand/og-image.webp"],
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
        <I18nProvider>
          <CartHydrationProvider>
            <HeaderToko />
            <div className="flex-1">{children}</div>
            <FooterToko />
            <RingkasanKeranjang />
            <SonnerToaster />
          </CartHydrationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
