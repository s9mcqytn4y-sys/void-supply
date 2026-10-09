"use client";

import { useEffect } from "react";

interface PropertiGalat {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function KatalogError({ error, reset }: PropertiGalat) {
  useEffect(() => {
    // Pencatatan galat ke sistem monitoring analitik
    console.error("Katalog Error Boundary:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md border border-neutral-800 bg-neutral-950 p-8 sm:p-10">
        <span className="mb-3 block font-mono text-xs tracking-widest text-red-400 uppercase">
          SYSTEM NOTICE // 500
        </span>
        <h1 className="mb-4 text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
          Gagal Memuat Katalog
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-neutral-400">
          Terjadi gangguan saat mengambil data koleksi dari server. Silakan coba muat ulang halaman
          atau periksa koneksi internet Anda.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 w-full items-center justify-center border border-neutral-700 bg-neutral-900 px-6 font-mono text-xs tracking-widest text-white uppercase transition-colors hover:border-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Coba Muat Ulang
        </button>
      </div>
    </main>
  );
}
