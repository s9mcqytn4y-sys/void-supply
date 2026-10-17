"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
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
      <span className="text-neutral-700" aria-hidden="true">
        |
      </span>
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
  );
}
