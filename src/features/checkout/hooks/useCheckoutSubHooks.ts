"use client";

import { useCheckoutContext } from "../context/CheckoutContext";

export function useCheckoutForm() {
  const { form, session, sessionLoading, koordinat, statusGps, deteksiLokasiGps } =
    useCheckoutContext();
  return {
    form,
    session,
    sessionLoading,
    koordinat,
    statusGps,
    deteksiLokasiGps,
  };
}

export function useShippingRates() {
  const {
    opsiKurir,
    kurirTerpilih,
    setKurirTerpilih,
    sedangHitungOngkir,
    errorLogistik,
    cobaHitungUlangOngkir,
    kategoriKurirAktif,
    setKategoriKurirAktif,
    koordinat,
    statusGps,
    deteksiLokasiGps,
  } = useCheckoutContext();

  return {
    opsiKurir,
    kurirTerpilih,
    setKurirTerpilih,
    sedangHitungOngkir,
    errorLogistik,
    cobaHitungUlangOngkir,
    kategoriKurirAktif,
    setKategoriKurirAktif,
    koordinat,
    statusGps,
    deteksiLokasiGps,
  };
}

export function useCheckoutVoucher() {
  const {
    kodeVoucherInput,
    setKodeVoucherInput,
    voucherDiterapkan,
    sedangValidasiVoucher,
    handleTerapkanVoucher,
    handleHapusVoucher,
  } = useCheckoutContext();

  return {
    kodeVoucherInput,
    setKodeVoucherInput,
    voucherDiterapkan,
    sedangValidasiVoucher,
    handleTerapkanVoucher,
    handleHapusVoucher,
  };
}

export function useCheckoutOrder() {
  const {
    items,
    subtotal,
    totalOngkir,
    totalDiskon,
    totalAkhir,
    isPending,
    sedangMemuat,
    pesanNotifikasi,
    pesanErrorGlobal,
    handleSubmitCheckout,
    form,
    kurirTerpilih,
  } = useCheckoutContext();

  return {
    items,
    subtotal,
    totalOngkir,
    totalDiskon,
    totalAkhir,
    isPending,
    sedangMemuat,
    pesanNotifikasi,
    pesanErrorGlobal,
    handleSubmitCheckout,
    form,
    kurirTerpilih,
  };
}
