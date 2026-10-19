"use client";

import React from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export function FooterBrand() {
  const { t } = useI18n();

  return (
    <div className="md:col-span-2">
      <div className="flex items-center gap-3">
        <div className="relative h-7 w-7 overflow-hidden rounded bg-zinc-900 border border-zinc-800">
          <Image
            src="/icon.svg"
            alt="VOID Supply Icon"
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
  );
}
