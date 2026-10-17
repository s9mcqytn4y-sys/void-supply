"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function NavLinks() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: "/katalog", label: t.nav.catalog },
    { href: "/material", label: t.nav.material },
    { href: "/journal", label: t.nav.journal },
    { href: "/tentang", label: t.nav.about },
    { href: "/kontak", label: t.nav.contact },
  ];

  return (
    <nav aria-label="Navigasi Utama Toko" className="hidden md:flex items-center gap-6">
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`font-mono text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isActive
                ? "text-white border-b-2 border-white pb-1"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
