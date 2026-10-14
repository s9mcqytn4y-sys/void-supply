"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PaymentLogosRow, CourierLogosRow } from "@/components/ui/PaymentCourierBadges";

export function FooterToko() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Kolom 1: Brand & Origin */}
          <div className="md:col-span-1">
            <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">
              VOID SUPPLY
            </span>
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">
              {t.footer.brand_desc}
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-900 font-mono text-[11px] text-neutral-400">
              <span className="text-neutral-500 block uppercase tracking-wider text-[10px]">{t.footer.origin_title}</span>
              <p className="mt-1 leading-normal">{t.footer.origin_desc}</p>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              {t.footer.explore}
            </span>
            <ul className="mt-4 space-y-2.5 font-mono text-xs">
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

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-neutral-900 pt-8 sm:flex-row">
          <p className="font-mono text-[11px] text-neutral-400">
            &copy; 2026 VOID SUPPLY. {t.footer.copyright}
          </p>
          <div className="mt-4 flex gap-4 font-mono text-[11px] text-neutral-400 sm:mt-0">
            <span>{t.footer.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
