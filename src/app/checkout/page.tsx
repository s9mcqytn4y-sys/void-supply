"use client";

import Link from "next/link";
import {
  useCheckout,
  FormulirPengiriman,
  PilihanKurir,
  RingkasanPesananCheckout,
} from "@/features/checkout";

export default function HalamanCheckout() {
  const {
    items,
    isPending,
    sedangMemuat,
    sedangHitungOngkir,
    pesanNotifikasi,
    pesanErrorGlobal,
    opsiKurir,
    kurirTerpilih,
    setKurirTerpilih,
    formData,
    formErrors,
    handleInputChange,
    handleSubmitPesanan,
    subtotal,
    totalOngkir,
    totalDiskon,
    totalAkhir,
    kodeVoucherInput,
    setKodeVoucherInput,
    voucherDiterapkan,
    sedangValidasiVoucher,
    handleTerapkanVoucher,
    handleHapusVoucher,
  } = useCheckout();

  return (
    <main className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Checkout Bebas Distraksi */}
      <div className="mb-8 border-b border-neutral-800 pb-4">
        <span className="font-mono text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
          CHECKOUT AMAN // ALAMAT & PEMBAYARAN
        </span>
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
            className="mt-6 inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
          >
            JELAJAHI KATALOG DROP 04
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmitPesanan}
          noValidate
          className="grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          {/* Kolom Kiri: Informasi Penerima, Alamat & Pilihan Kurir */}
          <div className="space-y-6 lg:col-span-7">
            <FormulirPengiriman
              formData={formData}
              formErrors={formErrors}
              onInputChange={handleInputChange}
            />

            <PilihanKurir
              opsiKurir={opsiKurir}
              kurirTerpilih={kurirTerpilih}
              onPilihKurir={setKurirTerpilih}
              sedangHitungOngkir={sedangHitungOngkir}
              errorKurir={formErrors.kurir}
            />
          </div>

          {/* Kolom Kanan: Ringkasan Biaya & Eksekusi Pembayaran */}
          <div className="lg:col-span-5">
            <RingkasanPesananCheckout
              items={items}
              subtotal={subtotal}
              totalOngkir={totalOngkir}
              totalDiskon={totalDiskon}
              totalAkhir={totalAkhir}
              sedangHitungOngkir={sedangHitungOngkir}
              isPending={isPending}
              sedangMemuat={sedangMemuat}
              kurirDipilih={!!kurirTerpilih}
              kodeVoucherInput={kodeVoucherInput}
              onKodeVoucherChange={setKodeVoucherInput}
              voucherDiterapkan={voucherDiterapkan}
              sedangValidasiVoucher={sedangValidasiVoucher}
              onTerapkanVoucher={handleTerapkanVoucher}
              onHapusVoucher={handleHapusVoucher}
            />
          </div>
        </form>
      )}
    </main>
  );
}
