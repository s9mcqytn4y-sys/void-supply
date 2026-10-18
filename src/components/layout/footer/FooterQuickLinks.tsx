"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function FooterQuickLinks() {
  const { t } = useI18n();

  const links = [
    { href: "/katalog", label: `${t.nav.catalog} // DROP 04` },
    { href: "/material", label: t.nav.material },
    { href: "/journal", label: t.nav.journal },
    { href: "/tentang", label: t.nav.about },
    { href: "/kontak", label: t.nav.contact },
    { href: "/lacak", label: "LACAK PENGIRIMAN" },
    { href: "/demo/inbox", label: "DEV MAILBOX" },
  ];

  return (
    <div>
      <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase block mb-3">
        {t.footer.explore}
      </span>
      <ul className="space-y-2.5 font-mono text-xs">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
