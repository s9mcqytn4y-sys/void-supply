import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayoutSplit } from "@/features/auth/components/AuthLayoutSplit";
import { HubVerifikasiEmail } from "@/features/auth/components/HubVerifikasiEmail";

export const metadata: Metadata = {
  title: "Verifikasi Alamat Email | VOID Supply",
  description: "Verifikasi kepemilikan alamat email untuk mengaktifkan akun dan melanjutkan checkout pesanan.",
};

export default function HalamanVerifikasiEmail() {
  return (
    <AuthLayoutSplit
      judul="VERIFIKASI EMAIL"
      subjudul="Pastikan kepemilikan alamat email untuk mengamankan akun dan transaksi Anda."
      badge="AKTIVASI AKUN // SINGLE-USE TOKEN"
    >
      <Suspense fallback={<div className="h-48 animate-pulse bg-neutral-900" />}>
        <HubVerifikasiEmail />
      </Suspense>
    </AuthLayoutSplit>
  );
}
