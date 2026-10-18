"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { skemaMasukAkun, type DtoMasukAkun } from "../schemas/auth.schema";
import { signIn } from "@/lib/auth/auth-client";

export function FormMasuk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/akun";
  const pesanQuery = searchParams.get("pesan");

  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [capsLockAktif, setCapsLockAktif] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(pesanQuery);
  const [sedangMemproses, setSedangMemproses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DtoMasukAkun>({
    resolver: zodResolver(skemaMasukAkun),
    defaultValues: {
      email: "",
      kataSandi: "",
      ingatSaya: true,
      next: nextUrl,
    },
  });

  const onSubmit = async (data: DtoMasukAkun) => {
    setErrorGlobal(null);
    setSedangMemproses(true);

    try {
      const hasil = await signIn.email({
        email: data.email,
        password: data.kataSandi,
        rememberMe: data.ingatSaya,
      });

      if (hasil.error) {
        if (hasil.error.message?.toLowerCase().includes("verify")) {
          router.push(`/verifikasi-email?email=${encodeURIComponent(data.email)}&next=${encodeURIComponent(nextUrl)}`);
          return;
        }
        setErrorGlobal("Email atau kata sandi tidak sesuai. Periksa kembali kredensial Anda.");
        setSedangMemproses(false);
        return;
      }

      // Pastikan target redirect merupakan path internal aman
      const targetAman = nextUrl.startsWith("/") && !nextUrl.startsWith("//") ? nextUrl : "/akun";
      router.push(targetAman);
      router.refresh();
    } catch {
      setErrorGlobal("Layanan autentikasi sedang sibuk. Coba beberapa saat lagi.");
      setSedangMemproses(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLockAktif(true);
    } else {
      setCapsLockAktif(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {errorGlobal && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p>{errorGlobal}</p>
        </div>
      )}

      {/* Input Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
        >
          ALAMAT EMAIL
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "error-email" : undefined}
            disabled={sedangMemproses}
            placeholder="nama@domain.com"
            {...register("email")}
            className="w-full border border-neutral-800 bg-neutral-900 py-2.5 pr-3 pl-10 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-100 focus:outline-none disabled:opacity-50 min-h-11"
          />
        </div>
        {errors.email && (
          <p id="error-email" className="mt-1 text-xs text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Input Kata Sandi */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="kataSandi"
            className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
          >
            KATA SANDI
          </label>
          <Link
            href="/lupa-password"
            className="text-xs text-neutral-400 underline hover:text-neutral-100"
          >
            Lupa kata sandi?
          </Link>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="kataSandi"
            type={tampilkanPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.kataSandi)}
            aria-describedby={errors.kataSandi ? "error-kata-sandi" : undefined}
            disabled={sedangMemproses}
            placeholder="Minimal 12 karakter"
            onKeyDown={handleKeyDown}
            {...register("kataSandi")}
            className="w-full border border-neutral-800 bg-neutral-900 py-2.5 pr-10 pl-10 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-100 focus:outline-none disabled:opacity-50 min-h-11"
          />
          <button
            type="button"
            onClick={() => setTampilkanPassword(!tampilkanPassword)}
            aria-label={tampilkanPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-300 min-h-11 min-w-11 justify-center"
          >
            {tampilkanPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {capsLockAktif && (
          <p className="mt-1 text-[11px] text-amber-400">Peringatan: Tombol Caps Lock sedang aktif.</p>
        )}
        {errors.kataSandi && (
          <p id="error-kata-sandi" className="mt-1 text-xs text-red-400">
            {errors.kataSandi.message}
          </p>
        )}
      </div>

      {/* Checkbox Ingat Saya */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("ingatSaya")}
            className="h-4 w-4 rounded-none border-neutral-800 bg-neutral-900 accent-neutral-100"
          />
          <span>Pertahankan sesi login (Remember Me)</span>
        </label>
      </div>

      {/* Tombol Submit */}
      <button
        type="submit"
        disabled={sedangMemproses}
        className="flex w-full min-h-11 items-center justify-center gap-2 border border-neutral-100 bg-neutral-100 px-4 text-xs font-bold text-neutral-950 uppercase tracking-wider transition-colors hover:bg-neutral-300 disabled:opacity-50 cursor-pointer"
      >
        <span>{sedangMemproses ? "MEMVERIFIKASI SESI..." : "MASUK KE AKUN"}</span>
        {!sedangMemproses && <ArrowRight className="h-4 w-4" />}
      </button>

      {/* Switch ke Daftar */}
      <div className="border-t border-neutral-800 pt-4 text-center text-xs text-neutral-400">
        <span>Belum memiliki akun pelanggan? </span>
        <Link
          href={`/daftar${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
          className="font-bold text-neutral-100 underline hover:text-neutral-300"
        >
          Daftar Akun Baru
        </Link>
      </div>
    </form>
  );
}
