"use client";

import Link from "next/link";
import {
  CheckoutProvider,
  useCheckoutContext,
  FormulirPengiriman,
  PilihanKurir,
  RingkasanPesananCheckout,
} from "@/features/checkout";

function KontenCheckout() {
  const {
    session,
    sessionLoading,
    items,
    sedangMemuat,
    pesanNotifikasi,
    pesanErrorGlobal,
    form,
    handleSubmitCheckout,
  } = useCheckoutContext();

  return (
    <main className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Checkout Bebas Distraksi */}
      <div className="mb-8 border-b border-neutral-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            CHECKOUT AMAN // ALAMAT & PEMBAYARAN
          </span>
          {session?.user ? (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
              <span className="inline-block h-1.5 w-1.5 bg-emerald-500" />
              <span>SESI AKTIF:</span>
              <span className="font-bold text-white">{session.user.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
              <span>Sudah punya akun?</span>
              <Link
                href="/masuk?next=/checkout"
                className="font-bold text-neutral-200 underline hover:text-white transition-colors"
              >
                Masuk di sini
              </Link>
            </div>
          )}
        </div>
        <h1 className="mt-1 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
          INFORMASI PEMESANAN
        </h1>

        {pesanNotifikasi && (
          <div className="mt-3 border border-amber-900/60 bg-amber-950/20 p-3 font-mono text-xs text-amber-300">
            {pesanNotifikasi}
          </div>
        )}

        {pesanErrorGlobal && (
          <div
            role="alert"
            className="mt-3 border border-rose-900/60 bg-rose-950/20 p-3 font-mono text-xs text-rose-300"
          >
            {pesanErrorGlobal}
          </div>
        )}
      </div>

      {items.length === 0 && !sedangMemuat ? (
        <div className="border border-neutral-800 bg-neutral-950 p-12 text-center">
          <p className="font-mono text-xs text-neutral-400">
            KERANJANG BELANJA ANDA KOSONG
          </p>
          <Link
            href="/katalog"
            className="mt-6 inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 active:scale-[0.98]"
          >
            JELAJAHI KATALOG DROP 04
          </Link>
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(handleSubmitCheckout)}
          noValidate
          className="grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          {/* Kolom Kiri: Informasi Penerima, Alamat & Pilihan Kurir */}
          <div className="space-y-6 lg:col-span-7">
            <FormulirPengiriman />
            <PilihanKurir />
          </div>

          {/* Kolom Kanan: Ringkasan Biaya, Voucher & Eksekusi Pembayaran */}
          <div className="lg:col-span-5">
            <RingkasanPesananCheckout />
          </div>
        </form>
      )}
    </main>
  );
}

export default function HalamanCheckout() {
  return (
    <CheckoutProvider>
      <KontenCheckout />
    </CheckoutProvider>
  );
}
