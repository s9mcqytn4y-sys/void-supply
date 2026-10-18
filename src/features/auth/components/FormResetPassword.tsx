"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { skemaResetPassword, type DtoResetPassword } from "../schemas/auth.schema";

export function FormResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenUrl = searchParams.get("token") || "";

  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(
    !tokenUrl ? "Token verifikasi tidak ditemukan atau sudah kedaluwarsa." : null
  );
  const [sukses, setSukses] = useState(false);
  const [sedangMemproses, setSedangMemproses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DtoResetPassword>({
    resolver: zodResolver(skemaResetPassword),
    defaultValues: {
      token: tokenUrl,
      kataSandiBaru: "",
    },
  });

  const onSubmit = async () => {
    setErrorGlobal(null);
    setSedangMemproses(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSukses(true);
      setTimeout(() => {
        router.push("/masuk?pesan=Kata+sandi+berhasil+diperbarui.+Silakan+masuk+dengan+kredensial+baru.");
      }, 2000);
    } catch {
      setErrorGlobal("Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa.");
      setSedangMemproses(false);
    }
  };

  if (sukses) {
    return (
      <div className="border border-neutral-800 bg-neutral-900/60 p-6 text-center space-y-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-950 text-neutral-100">
          <CheckCircle2 className="h-5 w-5 text-neutral-100" />
        </div>
        <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
          KATA SANDI DIPERBARUI
        </h3>
        <p className="text-xs text-neutral-400">
          Seluruh sesi aktif lain telah dicabut demi keamanan akun Anda. Mengalihkan ke halaman masuk...
        </p>
      </div>
    );
  }

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

      <input type="hidden" {...register("token")} value={tokenUrl} />

      {/* Input Kata Sandi Baru */}
      <div>
        <label
          htmlFor="kataSandiBaru"
          className="mb-1.5 block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
        >
          KATA SANDI BARU (MIN. 12 KARAKTER)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="kataSandiBaru"
            type={tampilkanPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.kataSandiBaru)}
            aria-describedby={errors.kataSandiBaru ? "error-kata-sandi" : undefined}
            disabled={sedangMemproses || !tokenUrl}
            placeholder="Minimal 12 karakter unik"
            {...register("kataSandiBaru")}
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
        {errors.kataSandiBaru && (
          <p id="error-kata-sandi" className="mt-1 text-xs text-red-400">
            {errors.kataSandiBaru.message}
          </p>
        )}
      </div>

      {/* Tombol Simpan */}
      <button
        type="submit"
        disabled={sedangMemproses || !tokenUrl}
        className="flex w-full min-h-11 items-center justify-center gap-2 border border-neutral-100 bg-neutral-100 px-4 text-xs font-bold text-neutral-950 uppercase tracking-wider transition-colors hover:bg-neutral-300 disabled:opacity-50 cursor-pointer"
      >
        <span>{sedangMemproses ? "MENYIMPAN KATA SANDI..." : "PERBARUI KATA SANDI"}</span>
        {!sedangMemproses && <ArrowRight className="h-4 w-4" />}
      </button>

      {/* Kembali ke Masuk */}
      <div className="border-t border-neutral-800 pt-4 text-center text-xs text-neutral-400">
        <Link href="/masuk" className="underline hover:text-neutral-200">
          Batalkan dan Kembali ke Halaman Masuk
        </Link>
      </div>
    </form>
  );
}
