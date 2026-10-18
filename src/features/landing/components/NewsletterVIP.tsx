"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export function NewsletterVIP() {
  const [email, setEmail] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);
  const [sudahTerdaftar, setSudahTerdaftar] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Silakan masukkan alamat email yang valid.");
      return;
    }

    setSedangKirim(true);
    // Simulasi atau panggil API langganan newsletter
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSudahTerdaftar(true);
      toast.success("Anda berhasil terdaftar di transmisi Drop 05!");
      setEmail("");
    } catch {
      toast.error("Gagal mendaftarkan email. Silakan coba kembali.");
    } finally {
      setSedangKirim(false);
    }
  };

  return (
    <section
      aria-label="Transmisi Akses Awal Drop 05"
      className="border-t border-zinc-800 bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-[10px] tracking-wider text-zinc-400 uppercase">
              <Mail className="h-3 w-3 text-zinc-300" aria-hidden="true" />
              TRANSMISI PRIORITAS // DROP 05
            </div>
            <h2 className="mt-3 font-mono text-xl font-black text-white uppercase sm:text-2xl">
              AKSES AWAL & NOTIFIKASI DROPS
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:text-sm">
              Dapatkan akses 30 menit sebelum peluncuran resmi katalog Drop 05. Tanpa pesan iklan berulang,
              hanya informasi perilisan garmen dan restock terbatas.
            </p>
          </div>

          <div className="lg:col-span-5">
            {sudahTerdaftar ? (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-3 border border-emerald-500/30 bg-emerald-950/20 p-4 text-emerald-400"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <div className="font-mono text-xs">
                  <p className="font-bold uppercase">TERDAFTAR DI TRANSMISI</p>
                  <p className="text-[11px] text-emerald-500/80 mt-0.5">
                    Notifikasi Drop 05 akan dikirim langsung ke kotak masuk Anda.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">
                    Alamat Email untuk Akses Awal Drop 05
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    disabled={sedangKirim}
                    className="w-full min-h-11 border border-zinc-800 bg-zinc-950 px-4 font-mono text-xs text-white placeholder-zinc-500 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sedangKirim}
                  className="inline-flex w-full min-h-11 items-center justify-center gap-2 border border-white bg-white px-6 font-mono text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>{sedangKirim ? "MENDAFTARKAN..." : "DAPATKAN AKSES PRIORITAS"}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
