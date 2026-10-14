"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useKeranjangStore } from "@/features/cart/stores/keranjang.store";
import { useI18n } from "@/lib/i18n";

export function HeaderToko() {
  const toggleBuka = useKeranjangStore((state) => state.toggleBuka);
  const totalItem = useKeranjangStore((state) =>
    state.items.reduce((total, item) => total + item.jumlah, 0)
  );
  const { locale, setLocale, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/90 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Kembali ke Beranda VOID Supply"
        >
          <div className="relative h-7 w-36 sm:h-8 sm:w-44">
            <Image
              src="/images/brand/void-logo.svg"
              alt="VOID Supply Logo"
              fill
              priority
              className="object-contain object-left transition-opacity group-hover:opacity-90"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navigasi Utama Toko"
          className="hidden md:flex items-center gap-6"
        >
          <Link
            href="/katalog"
            className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {t.nav.catalog}
          </Link>
          <Link
            href="/material"
            className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {t.nav.material}
          </Link>
          <Link
            href="/journal"
            className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {t.nav.journal}
          </Link>
          <Link
            href="/tentang"
            className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {t.nav.about}
          </Link>
          <Link
            href="/kontak"
            className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {t.nav.contact}
          </Link>
        </nav>

        {/* Action Controls: Language Toggle + Bag Button + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center border border-neutral-800 bg-neutral-900 font-mono text-[11px] font-bold select-none">
            <button
              type="button"
              onClick={() => setLocale("id")}
              aria-label="Ubah bahasa ke Bahasa Indonesia"
              aria-pressed={locale === "id"}
              className={`min-h-9 px-2.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                locale === "id"
                  ? "bg-white text-black font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              ID
            </button>
            <span className="text-neutral-700">|</span>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-label="Switch language to English"
              aria-pressed={locale === "en"}
              className={`min-h-9 px-2.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                locale === "en"
                  ? "bg-white text-black font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={toggleBuka}
            aria-label={`Buka keranjang belanja, terdapat ${totalItem} artikel`}
            className="relative inline-flex min-h-11 items-center gap-2 border border-neutral-800 bg-neutral-900 px-3.5 py-2 font-mono text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:border-neutral-600 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>{t.nav.bag}</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center px-1 font-mono text-[11px] font-bold ${
                totalItem > 0 ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {totalItem}
            </span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
            className="flex md:hidden min-h-11 min-w-11 items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="square" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-4 md:hidden">
          <nav className="flex flex-col space-y-3 font-mono text-xs">
            <Link
              href="/katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center px-2 font-semibold text-neutral-200 hover:bg-neutral-900 hover:text-white"
            >
              {t.nav.catalog}
            </Link>
            <Link
              href="/material"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center px-2 font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {t.nav.material}
            </Link>
            <Link
              href="/journal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center px-2 font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {t.nav.journal}
            </Link>
            <Link
              href="/tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center px-2 font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {t.nav.about}
            </Link>
            <Link
              href="/kontak"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center px-2 font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {t.nav.contact}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
