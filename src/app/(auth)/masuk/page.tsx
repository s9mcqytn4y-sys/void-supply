import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayoutSplit } from "@/features/auth/components/AuthLayoutSplit";
import { FormMasuk } from "@/features/auth/components/FormMasuk";

export const metadata: Metadata = {
  title: "Masuk Akun Pelanggan | VOID Supply",
  description: "Masuk ke portal akun pelanggan VOID Supply untuk mengelola pesanan, alamat pengiriman, dan checkout cepat.",
};

export default function HalamanMasuk() {
  return (
    <AuthLayoutSplit
      judul="MASUK KE AKUN"
      subjudul="Gunakan alamat email terverifikasi untuk mengakses pesanan dan checkout."
      badge="AUTENTIKASI PELANGGAN // V2"
    >
      <Suspense fallback={<div className="h-48 animate-pulse bg-neutral-900" />}>
        <FormMasuk />
      </Suspense>
    </AuthLayoutSplit>
  );
}
