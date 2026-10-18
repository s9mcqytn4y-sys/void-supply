"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { kirimPesanKontakAction } from "@/features/contact/actions/kontak.action";

export default function HalamanKontak() {
  const { t } = useI18n();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [subjek, setSubjek] = useState("");
  const [pesan, setPesan] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pesanSukses, setPesanSukses] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !pesan.trim()) {
      setStatus("error");
      setErrorMessage("Harap lengkapi semua kolom yang wajib diisi.");
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");
      setPesanSukses("");

      const hasil = await kirimPesanKontakAction({
        nama,
        email,
        subjek: subjek.trim() ? subjek : undefined,
        pesan,
      });

      if (!hasil.sukses) {
        setStatus("error");
        setErrorMessage(hasil.pesan);
        return;
      }

      setStatus("success");
      setPesanSukses(hasil.pesan);
      setNama("");
      setEmail("");
      setSubjek("");
      setPesan("");
    } catch {
      setStatus("error");
      setErrorMessage("Gagal mengirim pesan. Silakan hubungi kami langsung via email support@voidsupply.com.");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <section className="border-b border-neutral-800 bg-neutral-900/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              KOMUNIKASI STUDIO // KONTAK
            </span>
            <h1 className="mt-4 font-sans text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
              {t.contact.title}
            </h1>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-300">
              {t.contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8">
              <h2 className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-6">
                FORMULIR PESAN STUDIO
              </h2>

              {status === "success" && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-6 border border-emerald-500/50 bg-emerald-950/40 p-4 font-mono text-xs text-emerald-300"
                >
                  {pesanSukses || t.contact.success}
                </div>
              )}

              {status === "error" && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 border border-rose-500/50 bg-rose-950/40 p-4 font-mono text-xs text-rose-300"
                >
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="nama" className="block font-mono text-xs font-semibold text-neutral-300 uppercase mb-2">
                    {t.contact.name} *
                  </label>
                  <input
                    id="nama"
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full min-h-11 border border-neutral-800 bg-neutral-900 px-3.5 py-2 font-mono text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                    placeholder="Contoh: Rian Dirgantara"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-mono text-xs font-semibold text-neutral-300 uppercase mb-2">
                    {t.contact.email} *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-11 border border-neutral-800 bg-neutral-900 px-3.5 py-2 font-mono text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                    placeholder="nama@domain.com"
                  />
                </div>

                <div>
                  <label htmlFor="subjek" className="block font-mono text-xs font-semibold text-neutral-300 uppercase mb-2">
                    {t.contact.subject}
                  </label>
                  <input
                    id="subjek"
                    type="text"
                    value={subjek}
                    onChange={(e) => setSubjek(e.target.value)}
                    className="w-full min-h-11 border border-neutral-800 bg-neutral-900 px-3.5 py-2 font-mono text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                    placeholder="Pertanyaan Pesanan / Kolaborasi"
                  />
                </div>

                <div>
                  <label htmlFor="pesan" className="block font-mono text-xs font-semibold text-neutral-300 uppercase mb-2">
                    {t.contact.message} *
                  </label>
                  <textarea
                    id="pesan"
                    required
                    rows={5}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    className="w-full border border-neutral-800 bg-neutral-900 p-3.5 font-mono text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                    placeholder="Tuliskan pesan Anda secara lengkap..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full min-h-11 inline-flex items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-neutral-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {status === "loading" ? "MENGIRIMKAN..." : t.contact.send}
                </button>
              </form>
            </div>

            {/* Studio Info Details */}
            <div className="space-y-8">
              <div className="border border-neutral-800 bg-neutral-900/20 p-6 sm:p-8">
                <span className="font-mono text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                  LOKASI ATELIER & LOGISTIK
                </span>
                <h3 className="mt-2 font-sans text-xl font-bold uppercase tracking-wider text-white">
                  STUDIO JOHAR BARU
                </h3>
                <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-300">
                  Johar Baru, Jakarta Pusat 10560<br />
                  DKI Jakarta, Indonesia
                </p>
                <div className="mt-6 border-t border-neutral-800 pt-4 font-mono text-xs space-y-2 text-neutral-400">
                  <p><strong className="text-neutral-200">Jam Operasional Studio:</strong> Senin - Jumat, 10:00 - 18:00 WIB</p>
                  <p><strong className="text-neutral-200">Email Korespondensi:</strong> support@voidsupply.com</p>
                </div>
              </div>

              <div className="border border-neutral-800 bg-neutral-900/20 p-6 sm:p-8 font-mono text-xs space-y-3 text-neutral-400">
                <span className="font-semibold text-neutral-200 uppercase tracking-wider block">
                  PROSEDUR PENGEMBALIAN & PERTUKARAN
                </span>
                <p className="leading-relaxed">
                  Pertukaran ukuran diizinkan dalam kurun 3 x 24 jam setelah paket diterima pembeli berdasarkan catatan tracking kurir, dengan kondisi hangtag utuh dan belum pernah dicuci.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
