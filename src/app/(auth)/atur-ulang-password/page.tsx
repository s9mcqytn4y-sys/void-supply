import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayoutSplit } from "@/features/auth/components/AuthLayoutSplit";
import { FormResetPassword } from "@/features/auth/components/FormResetPassword";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi | VOID Supply",
  description: "Tetapkan kata sandi baru untuk akun pelanggan VOID Supply Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HalamanAturUlangPassword() {
  return (
    <AuthLayoutSplit
      judul="ATUR ULANG KATA SANDI"
      subjudul="Gunakan kombinasi minimal 12 karakter yang belum pernah digunakan sebelumnya."
      badge="ATUR ULANG KATA SANDI // TOKEN"
    >
      <Suspense fallback={<div className="h-48 animate-pulse bg-neutral-900" />}>
        <FormResetPassword />
      </Suspense>
    </AuthLayoutSplit>
  );
}
