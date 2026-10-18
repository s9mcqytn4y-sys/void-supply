"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { skemaLupaPassword, type DtoLupaPassword } from "../schemas/auth.schema";

export function FormLupaPassword() {
  const [berhasilTerkirim, setBerhasilTerkirim] = useState(false);
  const [sedangMemproses, setSedangMemproses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DtoLupaPassword>({
    resolver: zodResolver(skemaLupaPassword),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async () => {
    setSedangMemproses(true);

    try {
      // Panggil simulasi pengiriman instruksi reset kata sandi
      await new Promise((resolve) => setTimeout(resolve, 600));
      setBerhasilTerkirim(true);
    } catch {
      setBerhasilTerkirim(true);
    } finally {
      setSedangMemproses(false);
    }
  };

  if (berhasilTerkirim) {
    return (
      <div className="space-y-6">
        <div className="border border-neutral-800 bg-neutral-900/60 p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-950 text-neutral-100">
            <CheckCircle2 className="h-5 w-5 text-neutral-100" />
          </div>
          <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
            PERMINTAAN DITERIMA
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400">
            Jika alamat email Anda terdaftar dalam sistem VOID Supply, tautan aman untuk mengatur ulang
            kata sandi telah dikirimkan. Tautan hanya berlaku selama 15 menit.
          </p>
        </div>

        <Link
          href="/masuk"
          className="flex w-full min-h-11 items-center justify-center gap-2 border border-neutral-800 bg-neutral-900 px-4 text-xs font-bold text-neutral-200 uppercase tracking-wider transition-colors hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>KEMBALI KE HALAMAN MASUK</span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <p className="text-xs leading-relaxed text-neutral-400">
        Masukkan alamat email terdaftar Anda. Kami akan mengirimkan tautan verifikasi sekali pakai
        untuk memulihkan akses akun pelanggan Anda.
      </p>

      {/* Input Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
        >
          ALAMAT EMAIL TERDAFTAR
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

      {/* Tombol Submit */}
      <button
        type="submit"
        disabled={sedangMemproses}
        className="flex w-full min-h-11 items-center justify-center gap-2 border border-neutral-100 bg-neutral-100 px-4 text-xs font-bold text-neutral-950 uppercase tracking-wider transition-colors hover:bg-neutral-300 disabled:opacity-50 cursor-pointer"
      >
        <span>{sedangMemproses ? "MENGIRIMKAN TAUTAN..." : "KIRIM TAUTAN PEMULIHAN"}</span>
        {!sedangMemproses && <ArrowRight className="h-4 w-4" />}
      </button>

      {/* Link Kembali */}
      <div className="border-t border-neutral-800 pt-4 text-center text-xs text-neutral-400">
        <Link
          href="/masuk"
          className="inline-flex items-center gap-1.5 font-bold text-neutral-300 hover:text-neutral-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </form>
  );
}
