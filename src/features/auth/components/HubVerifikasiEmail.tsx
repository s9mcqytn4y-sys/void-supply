"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, Clock, RefreshCw, ArrowRight, ExternalLink } from "lucide-react";

export function HubVerifikasiEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";
  const nextParam = searchParams.get("next") || "/checkout";

  const [cooldown, setCooldown] = useState(60);
  const [sedangKirimUlang, setSedangKirimUlang] = useState(false);
  const [pesanKirimUlang, setPesanKirimUlang] = useState<string | null>(null);
  const [tokenTerverifikasi, setTokenTerverifikasi] = useState(Boolean(tokenParam));

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleKirimUlang = async () => {
    if (cooldown > 0 || sedangKirimUlang) return;
    setSedangKirimUlang(true);
    setPesanKirimUlang(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPesanKirimUlang("Tautan verifikasi baru berhasil dikirimkan ke kotak masuk Anda.");
      setCooldown(60);
    } catch {
      setPesanKirimUlang("Gagal mengirim ulang email. Silakan coba kembali sesaat lagi.");
    } finally {
      setSedangKirimUlang(false);
    }
  };

  const isDemo = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_APP_ENV !== "production";

  if (tokenTerverifikasi) {
    return (
      <div className="border border-neutral-800 bg-neutral-900/60 p-6 text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-neutral-700 bg-neutral-950 text-neutral-100">
          <CheckCircle2 className="h-6 w-6 text-neutral-100" />
        </div>
        <div>
          <span className="border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
            STATUS IDENTITAS: DIVERIFIKASI
          </span>
          <h2 className="mt-2 text-xl font-bold text-neutral-100 uppercase tracking-tight">
            EMAIL BERHASIL DIVERIFIKASI
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400">
            Akun pelanggan Anda telah aktif dan terotentikasi penuh. Anda kini dapat melanjutkan
            transaksi checkout dengan reservasi kuota stok resmi.
          </p>
        </div>

        <button
          onClick={() => {
            router.push(nextParam);
            router.refresh();
          }}
          className="flex w-full min-h-11 items-center justify-center gap-2 border border-neutral-100 bg-neutral-100 px-4 text-xs font-bold text-neutral-950 uppercase tracking-wider transition-colors hover:bg-neutral-300 cursor-pointer"
        >
          <span>LANJUT KE CHECKOUT</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kartu Status Instruksi */}
      <div className="border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-neutral-800 bg-neutral-950 text-neutral-100">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
              PERIKSA KOTAK MASUK EMAIL
            </h3>
            <p className="text-xs text-neutral-400">
              {emailParam ? `Tautan aktivasi dikirim ke ${emailParam}` : "Tautan aktivasi telah dikirim ke email Anda"}
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-neutral-400 border-t border-neutral-800/60 pt-3">
          Klik tombol verifikasi di dalam email untuk mengaktifkan akun. Jika tidak ditemukan di kotak
          masuk utama, silakan periksa folder spam atau promosi.
        </p>

        {pesanKirimUlang && (
          <p className="text-xs text-emerald-400 border border-emerald-950 bg-emerald-950/20 p-2.5">
            {pesanKirimUlang}
          </p>
        )}

        {/* Cooldown Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleKirimUlang}
            disabled={cooldown > 0 || sedangKirimUlang}
            className="flex w-full min-h-11 items-center justify-center gap-2 border border-neutral-800 bg-neutral-950 px-4 text-xs font-bold text-neutral-200 uppercase tracking-wider transition-colors hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
          >
            {sedangKirimUlang ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>MENGIRIM ULANG...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>KIRIM ULANG DALAM {cooldown}S</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>KIRIM ULANG TAUTAN VERIFIKASI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Dev Mailbox Shortcut (Hanya untuk Mode Demo / Sandbox) */}
      {isDemo && (
        <div className="border border-neutral-800/80 bg-neutral-900/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase">
                LINGKUNGAN PENGUJIAN LOKAL / VERCEL HOBBY
              </span>
              <p className="mt-0.5 text-xs text-neutral-300">
                Buka Dev Mailbox untuk melihat simulasi email aktivasi tanpa SMTP server.
              </p>
            </div>
          </div>
          <Link
            href="/demo/inbox?key=void-operator-key"
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 border border-neutral-700 bg-neutral-900 px-3 text-xs font-bold text-neutral-200 uppercase hover:bg-neutral-800"
          >
            <span>BUKA DEV MAILBOX INBOX</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Navigasi Pembatalan */}
      <div className="border-t border-neutral-800 pt-4 text-center text-xs text-neutral-500">
        <Link href="/masuk" className="underline hover:text-neutral-300">
          Gunakan alamat email berbeda
        </Link>
      </div>
    </div>
  );
}
