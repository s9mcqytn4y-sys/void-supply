import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayoutSplit } from "@/features/auth/components/AuthLayoutSplit";
import { FormDaftar } from "@/features/auth/components/FormDaftar";

export const metadata: Metadata = {
  title: "Daftar Akun Baru | VOID Supply",
  description: "Daftarkan identitas pelanggan resmi VOID Supply untuk akses rilis terbatas Drop 04 dan kemudahan checkout.",
};

export default function HalamanDaftar() {
  return (
    <AuthLayoutSplit
      judul="REGISTRASI PELANGGAN"
      subjudul="Daftarkan satu identitas resmi untuk seluruh transaksi dan benefit keanggotaan VOID."
      badge="PENDAFTARAN RESMI // DROP 04"
    >
      <Suspense fallback={<div className="h-64 animate-pulse bg-neutral-900" />}>
        <FormDaftar />
      </Suspense>
    </AuthLayoutSplit>
  );
}
