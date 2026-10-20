"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { authClient } from "@/lib/auth/auth-client";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  // Handle ESC key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { peran?: string } | undefined)?.peran === "admin";

  const links = [
    { href: "/katalog", label: t.nav.catalog },
    { href: "/material", label: t.nav.material },
    { href: "/journal", label: t.nav.journal },
    { href: "/tentang", label: t.nav.about },
    { href: "/kontak", label: t.nav.contact },
    { href: "/lacak", label: "Lacak Pesanan" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu Navigasi Mobile"
      className="fixed inset-x-0 top-16 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <nav className="flex flex-col space-y-1 p-4 font-mono text-xs">
        {links.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex min-h-11 items-center px-3 font-semibold uppercase transition-colors rounded-sm ${
                isActive
                  ? "bg-neutral-900 text-white border-l-2 border-white pl-2.5"
                  : "text-neutral-300 hover:bg-neutral-900/60 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Pemisah Bagian Akun & Administrasi */}
        <div className="pt-2 mt-2 border-t border-neutral-800/80">
          {session?.user ? (
            <div className="flex flex-col space-y-1">
              <div className="px-3 py-1 text-[10px] text-zinc-500 uppercase tracking-wider">
                MASUK: {session.user.name}
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex min-h-11 items-center px-3 font-bold uppercase text-amber-400 bg-amber-950/20 border border-amber-500/30 rounded-sm"
                >
                  KONSOL ADMIN
                </Link>
              )}

              <Link
                href="/akun"
                onClick={onClose}
                className="flex min-h-11 items-center px-3 font-semibold uppercase text-zinc-200 hover:bg-neutral-900 rounded-sm"
              >
                AKUN SAYA
              </Link>

              <Link
                href="/akun/pesanan"
                onClick={onClose}
                className="flex min-h-11 items-center px-3 font-semibold uppercase text-zinc-300 hover:bg-neutral-900 rounded-sm"
              >
                RIWAYAT PESANAN
              </Link>
            </div>
          ) : (
            <Link
              href="/masuk"
              onClick={onClose}
              className="flex min-h-11 items-center justify-center border border-white bg-white text-black font-bold uppercase tracking-wider text-center"
            >
              MASUK / DAFTAR AKUN
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
