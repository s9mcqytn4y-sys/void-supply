"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalDialogBrutalisProps {
  terbuka: boolean;
  padaTutup: () => void;
  judul: string;
  deskripsi?: string;
  children: React.ReactNode;
  lebarMaksimal?: string;
  className?: string;
}

export function ModalDialogBrutalis({
  terbuka,
  padaTutup,
  judul,
  deskripsi,
  children,
  lebarMaksimal = "max-w-md",
  className,
}: ModalDialogBrutalisProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && terbuka) {
        padaTutup();
      }
    }
    if (terbuka) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [terbuka, padaTutup]);

  if (!terbuka) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-judul"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={cn(
          "w-full border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative animate-in zoom-in-95 duration-150",
          lebarMaksimal,
          className
        )}
      >
        {/* Tombol Tutup */}
        <button
          onClick={padaTutup}
          aria-label="Tutup dialog"
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Dialog */}
        <div className="pr-8">
          <h2
            id="modal-judul"
            className="font-mono text-sm font-bold tracking-wider text-white uppercase"
          >
            {judul}
          </h2>
          {deskripsi && (
            <p className="mt-1 font-mono text-xs text-zinc-400 leading-relaxed">
              {deskripsi}
            </p>
          )}
        </div>

        {/* Isi Dialog */}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
