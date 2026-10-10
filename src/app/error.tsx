"use client";

import { useEffect } from "react";
import Link from "next/link";

interface PropertiGalatRoot {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: PropertiGalatRoot) {
  useEffect(() => {
    console.error("Root Application Error Boundary:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[75vh] w-full max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md border border-neutral-800 bg-neutral-950 p-8 sm:p-10">
        <span className="mb-3 block font-mono text-xs tracking-widest text-rose-400 uppercase">
          ERROR 500 // SERVER RESILIENCE NOTICE
        </span>
        <h1 className="mb-3 text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
          Layanan Sedang Mengalami Kendala
        </h1>
        <p className="mb-6 text-xs leading-relaxed text-neutral-400 sm:text-sm">
          Terjadi kegagalan komunikasi sementara dengan kluster layanan kami. Sistem pemulihan
          otomatis sedang bekerja untuk menormalkan koneksi.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 w-full items-center justify-center border border-white bg-white px-6 font-mono text-xs font-semibold tracking-wider text-black uppercase transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            COBA LAGI
          </button>
          <Link
            href="/katalog"
            className="inline-flex min-h-11 w-full items-center justify-center border border-neutral-800 bg-neutral-900 px-6 font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase transition-colors hover:border-neutral-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            KEMBALI KE KATALOG
          </Link>
        </div>
      </div>
    </main>
  );
}
