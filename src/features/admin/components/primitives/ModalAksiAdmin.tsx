"use client";

import { useEffect, type ReactNode } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ModalAksiAdminProps {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  deskripsi?: string;
  children: ReactNode;
  tombolKonfirmasi?: {
    teks: string;
    onKlik: () => void;
    sedangProses?: boolean;
    bahaya?: boolean;
  };
}

export function ModalAksiAdmin({
  terbuka,
  onTutup,
  judul,
  deskripsi,
  children,
  tombolKonfirmasi,
}: ModalAksiAdminProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && terbuka) {
        onTutup();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [terbuka, onTutup]);

  if (!terbuka) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-admin-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onTutup}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="space-y-1 pr-6">
            <h2
              id="modal-admin-title"
              className="font-mono text-sm font-bold text-white uppercase tracking-wider"
            >
              {judul}
            </h2>
            {deskripsi && (
              <p className="font-mono text-xs text-zinc-400">{deskripsi}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-zinc-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="py-4 font-mono text-xs text-zinc-300">{children}</div>

        {tombolKonfirmasi && (
          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={onTutup}
              disabled={tombolKonfirmasi.sedangProses}
              className="inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-5 font-mono text-xs font-semibold text-zinc-300 uppercase transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-50"
            >
              BATAL
            </button>
            <button
              type="button"
              onClick={tombolKonfirmasi.onKlik}
              disabled={tombolKonfirmasi.sedangProses}
              className={`inline-flex min-h-11 items-center justify-center gap-2 border px-6 font-mono text-xs font-bold uppercase transition-colors disabled:opacity-50 ${
                tombolKonfirmasi.bahaya
                  ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-500"
                  : "border-white bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {tombolKonfirmasi.sedangProses ? (
                "MEMPROSES..."
              ) : (
                <>
                  {tombolKonfirmasi.bahaya && (
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{tombolKonfirmasi.teks}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
