import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifikasiStafAdmin } from "@/features/admin/actions/auth-guard";
import { NavigasiAdmin } from "@/features/admin/components/NavigasiAdmin";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin & Operations Control Center | VOID Supply",
  description: "Portal operasional internal inventaris, pesanan, dan fulfillment VOID Supply.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cek = await verifikasiStafAdmin();

  // 1. Jika sesi tidak ada, arahkan ke login
  if (!cek.sesi?.pengguna?.id) {
    redirect("/masuk?next=/admin");
  }

  // 2. Jika bukan peran staf (misal 'pelanggan' biasa), tampilkan 403 Forbidden
  if (!cek.sah || !cek.staf) {
    return (
      <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-rose-500/40 bg-zinc-950 p-8 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="font-mono text-lg font-bold text-white uppercase tracking-wider">
            403 // AKSES DITOLAK
          </h1>
          <p className="font-mono text-xs text-zinc-400 leading-relaxed">
            Akun Anda (<span className="text-white">{cek.sesi.pengguna.email}</span>) tidak memiliki otorisasi operasional internal VOID Supply.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-4 font-mono text-xs font-bold text-black uppercase hover:bg-zinc-200 transition-colors"
            >
              KEMBALI KE BERANDA
            </Link>
            <Link
              href="/akun"
              className="inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-4 font-mono text-xs font-semibold text-zinc-300 uppercase hover:border-zinc-600 transition-colors"
            >
              PUSAT AKUN SAYA
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col lg:flex-row">
      <NavigasiAdmin namaStaf={cek.staf.nama} peran={cek.staf.peran} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
