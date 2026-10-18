"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useKeranjangStore,
  BATAS_MAKSIMAL_PER_SKU,
} from "../stores/keranjang.store";
import {
  validasiVoucherAction,
  type HasilValidasiVoucher,
} from "@/features/checkout/actions/voucher.action";

export function HalamanKeranjang() {
  const items = useKeranjangStore((state) => state.items);
  const ubahJumlah = useKeranjangStore((state) => state.ubahJumlah);
  const hapusItem = useKeranjangStore((state) => state.hapusItem);
  const kosongkan = useKeranjangStore((state) => state.kosongkan);
  const hitungTotalItem = useKeranjangStore((state) => state.hitungTotalItem);
  const hitungSubtotalIdr = useKeranjangStore((state) => state.hitungSubtotalIdr);

  const totalItem = hitungTotalItem();
  const subtotalIdr = hitungSubtotalIdr();

  // Berat fisik dihitung berdasarkan spesifikasi produk riil di database (fallback 300g untuk t-shirt standar)
  const totalBeratGram = items.reduce(
    (total, item) => total + item.jumlah * (item.beratGram || 300),
    0
  );
  const totalBeratKg = (totalBeratGram / 1000).toFixed(1);

  // State Voucher Promo
  const [kodeInputVoucher, setKodeInputVoucher] = useState("");
  const [sedangValidasiVoucher, setSedangValidasiVoucher] = useState(false);
  const [voucherDiterapkan, setVoucherDiterapkan] = useState<HasilValidasiVoucher | null>(null);

  const tanganiTerapkanVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const kodeBersih = kodeInputVoucher.trim().toUpperCase();
    if (!kodeBersih) {
      toast.error("Silakan masukkan kode voucher diskon.");
      return;
    }

    setSedangValidasiVoucher(true);
    try {
      const hasil = await validasiVoucherAction({
        kode: kodeBersih,
        subtotal: subtotalIdr,
      });

      if (hasil.sukses) {
        setVoucherDiterapkan(hasil);
        toast.success(hasil.pesan);
      } else {
        setVoucherDiterapkan(null);
        toast.error(hasil.pesan);
      }
    } catch (err) {
      console.error("Gagal memeriksa voucher:", err);
      toast.error("Terjadi gangguan saat memvalidasi voucher.");
    } finally {
      setSedangValidasiVoucher(false);
    }
  };

  const tanganiHapusVoucher = () => {
    setVoucherDiterapkan(null);
    setKodeInputVoucher("");
    toast.info("Voucher diskon dihapus.");
  };

  const potonganVoucher = voucherDiterapkan?.sukses ? voucherDiterapkan.potonganIdr : 0;
  const totalEstimasiAkhir = Math.max(0, subtotalIdr - potonganVoucher);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center border border-neutral-800 bg-neutral-900/40 p-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center border border-neutral-700 font-mono text-lg text-neutral-400">
            [Ø]
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
            KERANJANG BELANJA KOSONG
          </h1>
          <p className="mt-2 max-w-md text-sm text-neutral-400">
            Anda belum menambahkan artikel busana dari rilisan Drop 04 ke dalam keranjang.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-8 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              JELAJAHI KATALOG PRODUK
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb & Heading */}
      <div className="mb-8 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 uppercase">
          <Link href="/" className="hover:text-white">
            BERANDA
          </Link>
          <span>/</span>
          <span className="text-white">KERANJANG BELANJA</span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
            KERANJANG BELANJA ({totalItem})
          </h1>
          <span className="font-mono text-xs text-neutral-400">
            Maksimal kuota: 10 unit per SKU
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Tabel / Daftar Artikel */}
        <section aria-label="Daftar Artikel Belanja" className="lg:col-span-8">
          <div className="overflow-hidden border border-neutral-800 bg-neutral-900/30">
            {/* Header Kolom Desktop */}
            <div className="hidden border-b border-neutral-800 px-6 py-3 font-mono text-[11px] font-bold text-neutral-400 uppercase sm:grid sm:grid-cols-12 sm:gap-4">
              <span className="sm:col-span-6">ARTIKEL PRODUK</span>
              <span className="text-center sm:col-span-3">KUANTITAS</span>
              <span className="text-right sm:col-span-3">TOTAL HARGA</span>
            </div>

            {/* List Item */}
            <ul className="divide-y divide-neutral-800/80">
              {items.map((item) => {
                const totalHargaBaris = item.hargaTampilanIdr * item.jumlah;
                return (
                  <li key={item.varianId} className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
                      {/* Detail Produk */}
                      <div className="flex items-start gap-4 sm:col-span-6">
                        <Link
                          href={`/katalog/${item.slug}`}
                          className="relative h-24 w-24 shrink-0 overflow-hidden border border-neutral-800 bg-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                        >
                          <Image
                            src={item.gambar}
                            alt={item.nama}
                            fill
                            sizes="96px"
                            className="object-cover object-center"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/katalog/${item.slug}`}
                              className="font-mono text-sm font-bold text-white uppercase hover:underline"
                            >
                              {item.nama}
                            </Link>
                            <p className="mt-1 font-mono text-xs text-neutral-400">
                              Ukuran: <strong className="text-white">{item.ukuran}</strong> | Warna:{" "}
                              <strong className="text-white">{item.warna}</strong>
                            </p>
                            <p className="font-mono text-[11px] text-neutral-400">
                              SKU: {item.sku}
                            </p>
                            <p className="mt-1 font-mono text-xs text-neutral-300 sm:hidden">
                              {formatRupiah(item.hargaTampilanIdr)} per unit
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              hapusItem(item.varianId);
                              toast.info("Artikel dihapus dari keranjang", {
                                description: `${item.nama} (${item.ukuran})`,
                              });
                            }}
                            className="mt-3 w-fit font-mono text-[11px] text-neutral-400 underline transition-colors hover:text-rose-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                            aria-label={`Hapus ${item.nama} ukuran ${item.ukuran} dari keranjang`}
                          >
                            Hapus Artikel
                          </button>
                        </div>
                      </div>

                      {/* Stepper Kuantitas */}
                      <div className="flex items-center sm:col-span-3 sm:justify-center">
                        <div className="flex items-center border border-neutral-800 bg-neutral-950">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.jumlah > 1) {
                                ubahJumlah(item.varianId, item.jumlah - 1);
                              }
                            }}
                            disabled={item.jumlah <= 1}
                            aria-label={`Kurangi kuantitas ${item.nama}`}
                            className="flex min-h-11 min-w-11 items-center justify-center font-mono text-base text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                          >
                            -
                          </button>
                          <span className="flex min-h-11 min-w-12 items-center justify-center border-x border-neutral-800 px-3 font-mono text-sm font-semibold text-white">
                            {item.jumlah}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.jumlah < BATAS_MAKSIMAL_PER_SKU) {
                                ubahJumlah(item.varianId, item.jumlah + 1);
                              }
                            }}
                            disabled={item.jumlah >= BATAS_MAKSIMAL_PER_SKU}
                            aria-label={`Tambah kuantitas ${item.nama}`}
                            className="flex min-h-11 min-w-11 items-center justify-center font-mono text-base text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total Harga Baris */}
                      <div className="flex items-center justify-between sm:col-span-3 sm:justify-end">
                        <span className="font-mono text-xs text-neutral-400 sm:hidden">
                          Subtotal Item:
                        </span>
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold text-white sm:text-base">
                            {formatRupiah(totalHargaBaris)}
                          </p>
                          <p className="hidden font-mono text-[10px] text-neutral-400 sm:block">
                            @{formatRupiah(item.hargaTampilanIdr)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Aksi Bawah Tabel */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 bg-neutral-950 p-4 sm:px-6">
              <Link
                href="/katalog"
                className="inline-flex min-h-11 items-center font-mono text-xs font-semibold text-neutral-300 uppercase hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                &larr; TAMBAH ARTIKEL LAINNYA
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={kosongkan}
                className="min-h-11 border-neutral-800 font-mono text-xs text-neutral-400 hover:border-rose-900 hover:text-rose-400"
              >
                KOSONGKAN KERANJANG
              </Button>
            </div>
          </div>

          {/* Indikator Berat Logistik */}
          <div className="mt-4 border border-neutral-800 bg-neutral-900/20 p-4">
            <div className="flex items-start gap-3">
              <span className="font-mono text-sm text-neutral-400" aria-hidden="true">
                [⚖]
              </span>
              <div>
                <p className="font-mono text-xs font-bold text-neutral-200 uppercase">
                  ESTIMASI BERAT LOGISTIK: {totalBeratGram} GRAM (~{totalBeratKg} KG)
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Total berat aktual dihitung otomatis oleh sistem logistik Biteship di tahap checkout untuk menentukan tarif kurir resmi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kolom Kanan: Ringkasan Pesanan & Voucher */}
        <section aria-label="Ringkasan Belanja" className="lg:col-span-4">
          <div className="sticky top-24 border border-neutral-800 bg-neutral-900/40 p-6">
            <h2 className="border-b border-neutral-800 pb-3 font-mono text-sm font-bold text-white uppercase">
              RINGKASAN BELANJA
            </h2>

            {/* Input Voucher Diskon */}
            <div className="mt-4 border-b border-neutral-800 pb-5">
              <label
                htmlFor="input-kode-voucher"
                className="block font-mono text-xs font-semibold text-neutral-300 uppercase"
              >
                KODE VOUCHER PROMO
              </label>

              {voucherDiterapkan?.sukses ? (
                <div className="mt-2 flex items-center justify-between border border-emerald-800/80 bg-emerald-950/30 p-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                      {voucherDiterapkan.kode}
                    </span>
                    <p className="font-mono text-[11px] text-emerald-300">
                      Diskon {formatRupiah(voucherDiterapkan.potonganIdr)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={tanganiHapusVoucher}
                    aria-label="Batalkan voucher diskon"
                    className="font-mono text-xs text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <form onSubmit={tanganiTerapkanVoucher} className="mt-2 flex gap-2">
                  <input
                    id="input-kode-voucher"
                    type="text"
                    value={kodeInputVoucher}
                    onChange={(e) => setKodeInputVoucher(e.target.value.toUpperCase())}
                    placeholder="CONTOH: VOIDNIGHT"
                    className="min-h-11 flex-1 border border-neutral-800 bg-neutral-950 px-3 font-mono text-xs text-white uppercase placeholder:text-neutral-600 focus:border-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sedangValidasiVoucher || !kodeInputVoucher.trim()}
                    className="min-h-11 border border-neutral-700 bg-neutral-800 px-4 font-mono text-xs font-bold text-white uppercase transition-colors hover:border-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  >
                    {sedangValidasiVoucher ? "CEK..." : "PAKAI"}
                  </button>
                </form>
              )}
            </div>

            {/* Rincian Angka Biaya */}
            <div className="space-y-3 py-4 font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal ({totalItem} unit):</span>
                <span className="font-semibold text-white">{formatRupiah(subtotalIdr)}</span>
              </div>

              {potonganVoucher > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Diskon Voucher ({voucherDiterapkan?.kode}):</span>
                  <span>-{formatRupiah(potonganVoucher)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400">
                <span>Ongkos Kirim Kurir:</span>
                <span className="text-neutral-400">Dihitung di checkout</span>
              </div>

              <div className="border-t border-neutral-800 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm font-bold text-white uppercase">
                    ESTIMASI TOTAL:
                  </span>
                  <span className="font-mono text-lg font-bold text-white">
                    {formatRupiah(totalEstimasiAkhir)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-neutral-400">
                  Termasuk PPN. Bebas biaya layanan pembayaran gateway.
                </p>
              </div>
            </div>

            {/* Tombol Lanjut ke Checkout */}
            <div className="mt-4 space-y-3">
              <Link
                href="/checkout"
                className="flex min-h-11 w-full items-center justify-center border border-white bg-white font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                LANJUT KE CHECKOUT ({formatRupiah(totalEstimasiAkhir)})
              </Link>
              <Link
                href="/katalog"
                className="flex min-h-11 w-full items-center justify-center border border-neutral-800 bg-neutral-950 font-mono text-xs font-semibold text-neutral-300 uppercase transition-colors hover:border-neutral-600 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                KEMBALI KE KATALOG
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
