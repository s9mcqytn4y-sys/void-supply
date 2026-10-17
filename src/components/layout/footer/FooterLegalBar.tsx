"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function FooterLegalBar() {
  const { t } = useI18n();

  return (
    <div className="mt-12 flex flex-col items-center justify-between border-t border-neutral-900 pt-8 sm:flex-row gap-4">
      <p className="font-mono text-[11px] text-neutral-400">
        &copy; 2026 VOID SUPPLY. {t.footer.copyright}
      </p>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-[11px] text-neutral-400">
        <Link
          href="/kebijakan-privasi"
          className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          Kebijakan Privasi
        </Link>
        <span className="text-neutral-700" aria-hidden="true">
          |
        </span>
        <Link
          href="/syarat-ketentuan"
          className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          Syarat & Ketentuan
        </Link>
        <span className="text-neutral-700" aria-hidden="true">
          |
        </span>
        <Link
          href="/pengembalian"
          className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          Ketentuan Pengembalian
        </Link>
        <span className="text-neutral-700" aria-hidden="true">
          |
        </span>
        <span>{t.footer.tagline}</span>
      </div>
    </div>
  );
}
