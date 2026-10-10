import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "VOID Supply | Heavyweight Streetwear Merchandise",
  description: "Limited edition high-density urban streetwear engineered for nocturnal climates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
