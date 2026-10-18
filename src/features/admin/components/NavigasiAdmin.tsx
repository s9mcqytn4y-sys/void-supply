"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  History,
  Activity,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

interface NavigasiAdminProps {
  namaStaf: string;
  peran: string;
}

export function NavigasiAdmin({ namaStaf, peran }: NavigasiAdminProps) {
  const pathname = usePathname();

  const menu = [
    {
      href: "/admin",
      label: "DASBOR OPERASIONAL",
      ikon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/pesanan",
      label: "MANAJEMEN PESANAN",
      ikon: Package,
      exact: false,
    },
    {
      href: "/admin/inventaris",
      label: "INVENTARIS & STOK",
      ikon: Boxes,
      exact: true,
    },
    {
      href: "/admin/inventaris/mutasi",
      label: "BUKU BESAR MUTASI",
      ikon: History,
      exact: false,
    },
    {
      href: "/admin/aktivitas",
      label: "AUDIT LOG & GATEWAY",
      ikon: Activity,
      exact: false,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950 p-4 lg:p-6 flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-widest text-white uppercase">
              VOID SUPPLY
            </span>
            <span className="border border-emerald-500/40 bg-emerald-950/40 px-1.5 py-0.2 font-mono text-[9px] text-emerald-400 font-bold uppercase">
              OPS
            </span>
          </div>
          <p className="font-mono text-[10px] text-zinc-500 mt-1">
            CONTROL CENTER // JOHAR BARU
          </p>

          {/* Staf Info */}
          <div className="mt-4 flex items-center gap-2.5 border border-zinc-850 bg-zinc-900/40 p-2.5">
            <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center font-mono text-[10px] font-bold text-white shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="overflow-hidden">
              <p className="font-mono text-[11px] font-bold text-white truncate">
                {namaStaf}
              </p>
              <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                PERAN: {peran}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav aria-label="Navigasi Internal Admin" className="mt-6 space-y-1">
          {menu.map((item) => {
            const apakahAktif = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const IconComponent = item.ikon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 px-3 py-2 font-mono text-xs font-semibold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                  apakahAktif
                    ? "border-l-2 border-white bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                <IconComponent className={`h-4 w-4 ${apakahAktif ? "text-white" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tautan Kembali ke Toko Publik */}
      <div className="mt-8 pt-4 border-t border-zinc-850">
        <Link
          href="/katalog"
          className="inline-flex min-h-11 w-full items-center justify-between border border-zinc-800 bg-zinc-900/40 px-3 font-mono text-xs font-semibold text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
        >
          <span>LIHAT ETALASE TOKO</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
