"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { PaymentLogosRow, CourierLogosRow } from "@/components/ui/PaymentCourierBadges";

export function FooterToko() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Kolom 1: Brand & Origin */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative h-7 w-7 overflow-hidden rounded bg-zinc-900 border border-zinc-800">
                <Image
                  src="/assets/brand/logo-mark.webp"
                  alt="VOID Emblem"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">
                VOID SUPPLY
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-400 max-w-sm">
              {t.footer.brand_desc}
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-900 font-mono text-[11px] text-neutral-400">
              <span className="text-neutral-500 block uppercase tracking-wider text-[10px]">
                {t.footer.origin_title}
              </span>
              <p className="mt-1 leading-normal">{t.footer.origin_desc}</p>
            </div>

            {/* Social Media Links */}
            <div className="mt-4 pt-3 flex items-center gap-4 text-xs font-mono">
              <a
                href="https://instagram.com/voidsupply"
                target="_blank"
                rel="noreferrer noopener"
                className="text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                aria-label="Instagram VOID Supply"
              >
                Instagram
              </a>
              <span className="text-neutral-700">/</span>
              <a
                href="https://tiktok.com/@voidsupply"
                target="_blank"
                rel="noreferrer noopener"
                className="text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                aria-label="TikTok VOID Supply"
              >
                TikTok
              </a>
              <span className="text-neutral-700">/</span>
              <a
                href="https://x.com/voidsupply"
                target="_blank"
                rel="noreferrer noopener"
                className="text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                aria-label="X Twitter VOID Supply"
              >
                Twitter/X
              </a>
              <span className="text-neutral-700">/</span>
              <a
                href="https://pinterest.com/voidsupply"
                target="_blank"
                rel="noreferrer noopener"
                className="text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                aria-label="Pinterest VOID Supply"
              >
                Pinterest
              </a>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase block mb-3">
              {t.footer.explore}
            </span>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <Link
                  href="/katalog"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {t.nav.catalog} // DROP 04
                </Link>
              </li>
              <li>
                <Link
                  href="/material"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {t.nav.material}
                </Link>
              </li>
              <li>
                <Link
                  href="/journal"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {t.nav.journal}
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/kontak"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link
                  href="/lacak"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  LACAK PENGIRIMAN
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan Pembayaran & Pengiriman */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase block mb-3">
                {t.footer.payment_methods}
              </span>
              <PaymentLogosRow />
            </div>

            <div>
              <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase block mb-3">
                {t.footer.courier_partners}
              </span>
              <CourierLogosRow />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-neutral-900 pt-8 sm:flex-row gap-4">
          <p className="font-mono text-[11px] text-neutral-400">
            &copy; 2026 VOID SUPPLY. {t.footer.copyright}
          </p>
          <div className="flex items-center gap-6 font-mono text-[11px] text-neutral-400">
            <Link
              href="/tentang"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              Kebijakan Privasi
            </Link>
            <span className="text-neutral-700">|</span>
            <Link
              href="/kontak"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              Syarat & Ketentuan Layanan
            </Link>
            <span className="text-neutral-700">|</span>
            <span>{t.footer.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
