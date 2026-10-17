"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

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
      </nav>
    </div>
  );
}
