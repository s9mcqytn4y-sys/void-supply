"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth/auth-client";
import { toast } from "sonner";

interface NavigasiAkunProps {
  email: string;
  nama: string;
  emailVerified: boolean;
}

export function NavigasiAkun({ email, nama, emailVerified }: NavigasiAkunProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuList = [
    {
      label: "RINGKASAN",
      href: "/akun",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "RIWAYAT PESANAN",
      href: "/akun/pesanan",
      icon: Package,
      exact: false,
    },
    {
      label: "BUKU ALAMAT",
      href: "/akun/alamat",
      icon: MapPin,
      exact: false,
    },
    {
      label: "PROFIL AKUN",
      href: "/akun/profil",
      icon: User,
      exact: false,
    },
    {
      label: "PUSAT KEAMANAN",
      href: "/akun/keamanan",
      icon: ShieldCheck,
      exact: false,
    },
  ];

  const handleKeluar = async () => {
    try {
      await signOut();
      toast.success("Anda berhasil keluar dari akun.");
      router.push("/masuk");
      router.refresh();
    } catch {
      toast.error("Gagal keluar. Silakan coba kembali.");
    }
  };

  return (
    <aside aria-label="Navigasi Akun Pelanggan" className="w-full">
      {/* Header Info Akun */}
      <div className="border border-zinc-800 bg-zinc-950 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-zinc-700 bg-zinc-900 font-mono text-sm font-bold text-white uppercase">
            {nama ? nama.slice(0, 2).toUpperCase() : "VS"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs font-bold text-white uppercase tracking-wider">
              {nama || "Pelanggan VOID"}
            </p>
            <p className="truncate font-mono text-[11px] text-zinc-400">
              {email}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  emailVerified ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                {emailVerified ? "TERVERIFIKASI" : "BELUM VERIFIKASI"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi: Mobile Horizontal Scrollable Tabs */}
      <nav
        aria-label="Tab Menu Akun Mobile"
        className="flex md:hidden overflow-x-auto no-scrollbar border-b border-zinc-800 bg-zinc-950 mb-6 -mx-4 px-4 gap-2 py-2"
      >
        {menuList.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 min-h-11 items-center gap-2 px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors border ${
                isActive
                  ? "border-white bg-white text-black"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Navigasi: Desktop Vertical Sidebar */}
      <nav
        aria-label="Menu Akun Desktop"
        className="hidden md:flex flex-col space-y-1.5 border border-zinc-800 bg-zinc-950 p-2"
      >
        {menuList.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-11 items-center gap-3 px-3.5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all border ${
                isActive
                  ? "border-white bg-zinc-900 text-white shadow-xs"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/60 hover:text-zinc-200"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-white" : "text-zinc-500"
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
              )}
            </Link>
          );
        })}

        <div className="pt-2 border-t border-zinc-800/80 mt-2">
          <button
            type="button"
            onClick={handleKeluar}
            className="flex w-full min-h-11 items-center gap-3 px-3.5 py-2.5 font-mono text-xs font-semibold text-rose-400 uppercase tracking-wider hover:bg-rose-950/30 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-900/40 text-left"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>KELUAR DARI AKUN</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
