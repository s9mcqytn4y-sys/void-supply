"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavLinks } from "./NavLinks";
import { LanguageSelector } from "./LanguageSelector";
import { CartButton } from "./CartButton";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { UserNavMenu } from "./UserNavMenu";

export function HeaderToko() {
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
        <NavLinks />

        {/* Action Controls: User Account + Language Toggle + Bag Button + Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <UserNavMenu />
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <CartButton />

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
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

      {/* Accessible Mobile Nav Drawer */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
