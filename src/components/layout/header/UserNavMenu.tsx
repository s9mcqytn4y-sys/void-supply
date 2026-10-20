"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Shield, ChevronDown, Package, LogOut, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

export function UserNavMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuTerbuka(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tutup dropdown dengan tombol Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuTerbuka) {
        setMenuTerbuka(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuTerbuka]);

  if (isPending) {
    return (
      <div className="h-9 w-20 animate-pulse border border-neutral-800 bg-neutral-900/60" />
    );
  }

  // State: Belum Masuk / Guest
  if (!session?.user) {
    return (
      <Link
        href="/masuk"
        data-testid="tombol-nav-masuk"
        className="inline-flex min-h-11 items-center gap-1.5 border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Masuk ke Akun Pelanggan VOID Supply"
      >
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">MASUK</span>
      </Link>
    );
  }

  const user = session.user;
  const isAdmin = (user as { peran?: string }).peran === "admin";
  const namaPanggilan = user.name ? user.name.split(" ")[0] : "AKUN";

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        {/* Tombol Akses Cepat Admin Console (Hanya untuk Role Admin) */}
        {isAdmin && (
          <Link
            href="/admin"
            data-testid="link-header-admin"
            className="hidden sm:inline-flex min-h-11 items-center gap-1.5 border border-amber-500/40 bg-amber-950/30 px-2.5 py-1 font-mono text-[11px] font-bold tracking-widest text-amber-400 uppercase transition-colors hover:border-amber-400 hover:bg-amber-950/60"
            title="Buka Konsol Administrator VOID Supply"
          >
            <Shield className="h-3 w-3" />
            <span>ADMIN</span>
          </Link>
        )}

        {/* Tombol Dropdown Profil Akun */}
        <button
          type="button"
          onClick={() => setMenuTerbuka((prev) => !prev)}
          data-testid="tombol-menu-akun"
          aria-expanded={menuTerbuka}
          aria-haspopup="menu"
          className="inline-flex min-h-11 items-center gap-1.5 border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-neutral-200 uppercase transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <User className="h-3.5 w-3.5 text-zinc-400" />
          <span className="max-w-25 truncate">{namaPanggilan}</span>
          <ChevronDown
            className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${
              menuTerbuka ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Menu Dropdown Akses Akun & Administrasi */}
      {menuTerbuka && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-56 border border-neutral-800 bg-neutral-950 p-2 font-mono text-xs shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header Identitas Pengguna */}
          <div className="border-b border-neutral-800 pb-2 mb-2 px-2">
            <span className="text-[10px] text-zinc-500 block uppercase">MASUK SEBAGAI</span>
            <p className="font-bold text-white truncate text-xs">{user.name}</p>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">{user.email}</p>
            {isAdmin && (
              <span className="mt-1.5 inline-block border border-amber-500/40 bg-amber-950/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 uppercase">
                ADMINISTRATOR
              </span>
            )}
          </div>

          {/* Tautan Navigasi Internal */}
          <div className="flex flex-col space-y-0.5">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuTerbuka(false)}
                role="menuitem"
                className="flex items-center justify-between px-2.5 py-2 text-amber-400 hover:bg-neutral-900 rounded-xs transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  KONSOL ADMIN
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            <Link
              href="/akun"
              onClick={() => setMenuTerbuka(false)}
              role="menuitem"
              className="flex items-center justify-between px-2.5 py-2 text-zinc-300 hover:bg-neutral-900 hover:text-white rounded-xs transition-colors"
            >
              <span className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                RINGKASAN AKUN
              </span>
            </Link>

            <Link
              href="/akun/pesanan"
              onClick={() => setMenuTerbuka(false)}
              role="menuitem"
              className="flex items-center justify-between px-2.5 py-2 text-zinc-300 hover:bg-neutral-900 hover:text-white rounded-xs transition-colors"
            >
              <span className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-zinc-400" />
                RIWAYAT PESANAN
              </span>
            </Link>
          </div>

          {/* Tombol Logout Sesi */}
          <div className="border-t border-neutral-800 pt-2 mt-2">
            <button
              type="button"
              onClick={async () => {
                setMenuTerbuka(false);
                await authClient.signOut();
                router.push("/");
                router.refresh();
              }}
              role="menuitem"
              className="flex w-full items-center gap-2 px-2.5 py-2 text-rose-400 hover:bg-rose-950/30 rounded-xs transition-colors text-left font-bold"
            >
              <LogOut className="h-3.5 w-3.5" />
              KELUAR DARI SESI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
