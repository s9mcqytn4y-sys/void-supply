"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

export function BilahPersetujuanCookie() {
  const [terlihat, setTerlihat] = useState(false);

  useEffect(() => {
    // Periksa status persetujuan yang tersimpan di browser
    try {
      const tersimpan = localStorage.getItem("void_cookie_consent");
      if (!tersimpan) {
        // Tampilkan banner jika belum ada pilihan yang dibuat
        setTerlihat(true);
      }
    } catch {
      // Abaikan bila storage terblokir
    }
  }, []);

  const simpanPilihan = (tipe: "semua" | "esensial") => {
    try {
      localStorage.setItem("void_cookie_consent", tipe);
      document.cookie = `void_consent=${tipe}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Abaikan error pada browser restricted mode
    }
    setTerlihat(false);
  };

  if (!terlihat) return null;

  return (
    <aside
      aria-label="Persetujuan Privasi dan Cookie"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-xl border border-zinc-800 bg-zinc-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:right-6 sm:left-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cookie className="h-4 w-4 text-zinc-400 shrink-0" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            PREFERENSI PRIVASI // COOKIE
          </span>
        </div>
        <button
          type="button"
          onClick={() => simpanPilihan("esensial")}
          className="text-zinc-500 hover:text-white transition-colors"
          aria-label="Tutup banner cookie"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
        VOID Supply menggunakan cookie esensial untuk menjaga integritas sesi checkout dan keamanan transaksi. Cookie
        analitik anonim hanya aktif jika disetujui guna menyempurnakan performa platform.
      </p>

      <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <Link
          href="/kebijakan-privasi"
          className="font-mono text-[11px] text-zinc-400 underline underline-offset-4 hover:text-white transition-colors text-center sm:text-left py-1"
        >
          KEBIJAKAN PRIVASI
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => simpanPilihan("esensial")}
            className="flex-1 sm:flex-none inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-colors hover:border-zinc-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            HANYA ESENSIAL
          </button>
          <button
            type="button"
            onClick={() => simpanPilihan("semua")}
            className="flex-1 sm:flex-none inline-flex min-h-11 items-center justify-center gap-1.5 border border-white bg-white px-4 py-2 font-mono text-xs font-semibold tracking-wider text-black uppercase transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Check className="h-3.5 w-3.5" />
            TERIMA SEMUA
          </button>
        </div>
      </div>
    </aside>
  );
}
