import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayoutSplit } from "@/features/auth/components/AuthLayoutSplit";
import { FormLupaPassword } from "@/features/auth/components/FormLupaPassword";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi | VOID Supply",
  description: "Pulihkan akses akun pelanggan VOID Supply melalui tautan verifikasi sekali pakai.",
};

export default function HalamanLupaPassword() {
  return (
    <AuthLayoutSplit
      judul="PEMULIHAN AKSES"
      subjudul="Dapatkan tautan pemulihan kata sandi akun pelanggan yang aman."
      badge="PEMULIHAN KEAMANAN // PROKOL"
    >
      <Suspense fallback={<div className="h-48 animate-pulse bg-neutral-900" />}>
        <FormLupaPassword />
      </Suspense>
    </AuthLayoutSplit>
  );
}
