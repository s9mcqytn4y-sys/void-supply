import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pengguna } from "@/lib/db/auth.schema";
import { ambilSesiPengguna } from "@/lib/auth/session";
import { NavigasiAkun } from "@/features/account/components/NavigasiAkun";

export const metadata: Metadata = {
  title: "Pusat Akun Pelanggan | VOID Supply",
  description:
    "Pusat pengelolaan akun terdaftar, riwayat transaksi, buku alamat pengiriman, dan keamanan sesi VOID Supply.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AkunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesi = await ambilSesiPengguna();
  if (!sesi?.pengguna?.id) {
    redirect("/masuk?next=/akun");
  }

  // Ambil data verifikasi pengguna
  const [dataUser] = await db
    .select({
      id: pengguna.id,
      name: pengguna.name,
      email: pengguna.email,
      emailVerified: pengguna.emailVerified,
    })
    .from(pengguna)
    .where(eq(pengguna.id, sesi.pengguna.id))
    .limit(1);

  const nama = dataUser?.name || sesi.pengguna.nama || "Pelanggan";
  const email = dataUser?.email || sesi.pengguna.email || "";
  const emailVerified = Boolean(dataUser?.emailVerified);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigasi */}
        <nav
          aria-label="Breadcrumb Akun"
          className="flex items-center gap-2 font-mono text-xs text-zinc-400 mb-6"
        >
          <Link href="/" className="hover:text-white transition-colors">
            BERANDA
          </Link>
          <span className="text-zinc-600">//</span>
          <span className="text-white font-semibold uppercase">PUSAT AKUN</span>
        </nav>

        {/* Layout Grid: Sidebar Desktop (4 Kolom) & Konten (8 Kolom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 xl:col-span-3">
            <NavigasiAkun
              nama={nama}
              email={email}
              emailVerified={emailVerified}
            />
          </div>

          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
