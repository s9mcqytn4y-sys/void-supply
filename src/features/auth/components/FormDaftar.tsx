"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, ArrowRight } from "lucide-react";
import { skemaDaftarAkun, type DtoDaftarAkun } from "../schemas/auth.schema";
import { signUp } from "@/lib/auth/auth-client";

export function FormDaftar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/checkout";

  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [sedangMemproses, setSedangMemproses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DtoDaftarAkun>({
    resolver: zodResolver(skemaDaftarAkun),
    defaultValues: {
      namaLengkap: "",
      email: "",
      kataSandi: "",
      setujuKetentuan: true,
      setujuMarketing: false,
    },
  });

  const onSubmit = async (data: DtoDaftarAkun) => {
    setErrorGlobal(null);
    setSedangMemproses(true);

    try {
      const hasil = await signUp.email({
        email: data.email,
        password: data.kataSandi,
        name: data.namaLengkap,
      });

      if (hasil.error) {
        if (hasil.error.message?.toLowerCase().includes("exists") || hasil.error.code === "USER_ALREADY_EXISTS") {
          setErrorGlobal("Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.");
        } else {
          setErrorGlobal(hasil.error.message || "Gagal mendaftarkan akun. Periksa data Anda.");
        }
        setSedangMemproses(false);
        return;
      }

      // Berhasil: Arahkan ke Hub Verifikasi Email
      router.push(`/verifikasi-email?email=${encodeURIComponent(data.email)}&next=${encodeURIComponent(nextUrl)}`);
    } catch {
      setErrorGlobal("Layanan pendaftaran sedang tidak tersedia. Coba beberapa saat lagi.");
      setSedangMemproses(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {errorGlobal && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p>{errorGlobal}</p>
        </div>
      )}

      {/* Nama Lengkap */}
      <div>
        <label
          htmlFor="namaLengkap"
          className="mb-1.5 block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
        >
          NAMA LENGKAP
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
            <User className="h-4 w-4" />
          </div>
          <input
            id="namaLengkap"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.namaLengkap)}
            aria-describedby={errors.namaLengkap ? "error-nama" : undefined}
            disabled={sedangMemproses}
            placeholder="Contoh: Rian Pratama"
            {...register("namaLengkap")}
            className="w-full border border-neutral-800 bg-neutral-900 py-2.5 pr-3 pl-10 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-100 focus:outline-none disabled:opacity-50 min-h-11"
          />
        </div>
        {errors.namaLengkap && (
          <p id="error-nama" className="mt-1 text-xs text-red-400">
            {errors.namaLengkap.message}
          </p>
        )}
      </div>

      {/* Alamat Email */}
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

      {/* Kata Sandi */}
      <div>
        <label
          htmlFor="kataSandi"
          className="mb-1.5 block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
        >
          KATA SANDI (MIN. 12 KARAKTER)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="kataSandi"
            type={tampilkanPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.kataSandi)}
            aria-describedby={errors.kataSandi ? "error-kata-sandi" : undefined}
            disabled={sedangMemproses}
            placeholder="Kombinasi panjang dan unik"
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
        {errors.kataSandi && (
          <p id="error-kata-sandi" className="mt-1 text-xs text-red-400">
            {errors.kataSandi.message}
          </p>
        )}
      </div>

      {/* Persetujuan Ketentuan */}
      <div className="space-y-2 pt-1">
        <label className="flex items-start gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("setujuKetentuan")}
            className="mt-0.5 h-4 w-4 rounded-none border-neutral-800 bg-neutral-900 accent-neutral-100"
          />
          <span className="leading-tight">
            Saya menyetujui syarat layanan transaksi dan kebijakan privasi data pelanggan VOID Supply.
          </span>
        </label>
        {errors.setujuKetentuan && (
          <p className="text-xs text-red-400">{errors.setujuKetentuan.message}</p>
        )}

        <label className="flex items-start gap-2.5 text-xs text-neutral-400 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("setujuMarketing")}
            className="mt-0.5 h-4 w-4 rounded-none border-neutral-800 bg-neutral-900 accent-neutral-100"
          />
          <span className="leading-tight">
            Kirimkan pemberitahuan rilis koleksi terbatas (Drop) mendatang melalui email (opsional).
          </span>
        </label>
      </div>

      {/* Tombol Submit */}
      <button
        type="submit"
        disabled={sedangMemproses}
        className="flex w-full min-h-11 items-center justify-center gap-2 border border-neutral-100 bg-neutral-100 px-4 text-xs font-bold text-neutral-950 uppercase tracking-wider transition-colors hover:bg-neutral-300 disabled:opacity-50 cursor-pointer pt-2"
      >
        <span>{sedangMemproses ? "MENDAFTARKAN IDENTITAS..." : "DAFTAR AKUN PELANGGAN"}</span>
        {!sedangMemproses && <ArrowRight className="h-4 w-4" />}
      </button>

      {/* Switch ke Masuk */}
      <div className="border-t border-neutral-800 pt-4 text-center text-xs text-neutral-400">
        <span>Sudah memiliki akun terdaftar? </span>
        <Link
          href={`/masuk${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
          className="font-bold text-neutral-100 underline hover:text-neutral-300"
        >
          Masuk Sekarang
        </Link>
      </div>
    </form>
  );
}
