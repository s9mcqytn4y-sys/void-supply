"use client";

import { formatRupiah } from "@/lib/utils";
import {
  useCheckoutOrder,
  useCheckoutVoucher,
  useShippingRates,
} from "../hooks/useCheckoutSubHooks";

export function RingkasanPesananCheckout() {
  const {
    items,
    subtotal,
    totalOngkir,
    totalDiskon,
    totalAkhir,
    isPending,
    sedangMemuat,
    kurirTerpilih,
  } = useCheckoutOrder();

  const {
    kodeVoucherInput,
    setKodeVoucherInput,
    voucherDiterapkan,
    sedangValidasiVoucher,
    handleTerapkanVoucher,
    handleHapusVoucher,
  } = useCheckoutVoucher();

  const { sedangHitungOngkir } = useShippingRates();

  const totalJumlahArtikel = items.reduce((acc, i) => acc + i.jumlah, 0);
  const tombolNonaktif =
    isPending || sedangMemuat || sedangHitungOngkir || !kurirTerpilih;

  return (
    <div className="sticky top-24 border border-neutral-800 bg-neutral-950 p-6">
      <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
        RINGKASAN PESANAN ({totalJumlahArtikel} ARTIKEL)
      </h2>

      {/* Daftar Item Pesanan */}
      <ul className="mt-4 divide-y divide-neutral-900 border border-neutral-800 bg-neutral-900/30 p-3 font-mono text-xs">
        {items.map((item) => (
          <li
            key={item.varianId}
            className="flex items-center justify-between py-2"
          >
            <div className="pr-2">
              <p className="font-bold text-white">{item.nama}</p>
              <p className="text-[11px] text-neutral-400">
                {item.ukuran} // {item.warna} x {item.jumlah}
              </p>
            </div>
            <span className="font-bold text-white">
              {formatRupiah(item.hargaTampilanIdr * item.jumlah)}
            </span>
          </li>
        ))}
      </ul>

      {/* Bagian Voucher Diskon */}
      <div className="mt-4 border-t border-neutral-800 pt-4">
        {voucherDiterapkan?.sukses ? (
          <div className="flex items-center justify-between border border-emerald-900/60 bg-emerald-950/20 px-3 py-2 font-mono text-xs">
            <div>
              <span className="font-bold text-emerald-400">
                VOUCHER: {voucherDiterapkan.kode}
              </span>
              <p className="text-[11px] text-emerald-300/80">
                Hemat {formatRupiah(voucherDiterapkan.potonganIdr)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleHapusVoucher}
              className="text-[11px] font-bold text-neutral-400 uppercase transition-colors hover:text-white active:scale-[0.98]"
            >
              [HAPUS]
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <label
              htmlFor="input-voucher"
              className="block font-mono text-[10px] font-semibold text-neutral-400 uppercase"
            >
              VOUCHER DISKON / KODE PROMO
            </label>
            <div className="flex gap-2">
              <input
                id="input-voucher"
                type="text"
                placeholder="CONTOH: VOID10"
                value={kodeVoucherInput}
                onChange={(e) =>
                  setKodeVoucherInput(e.target.value.toUpperCase())
                }
                className="min-h-11 flex-1 border border-neutral-800 bg-neutral-900 px-3 font-mono text-xs text-white uppercase focus:border-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTerapkanVoucher}
                disabled={sedangValidasiVoucher || !kodeVoucherInput.trim()}
                className="min-h-11 border border-neutral-700 bg-neutral-900 px-4 font-mono text-xs font-bold text-white uppercase transition-all hover:border-white active:scale-[0.98] disabled:opacity-40"
              >
                {sedangValidasiVoucher ? "..." : "TERAPKAN"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rincian Kalkulasi Biaya */}
      <div className="mt-4 space-y-2 border-t border-neutral-800 pt-4 font-mono text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>SUBTOTAL PRODUK</span>
          <span className="font-bold text-white">{formatRupiah(subtotal)}</span>
        </div>

        <div className="flex justify-between text-neutral-400">
          <span>BIAYA PENGIRIMAN</span>
          {sedangHitungOngkir ? (
            <span className="text-[11px] text-neutral-500 animate-pulse">
              MENGHITUNG...
            </span>
          ) : (
            <span className="font-bold text-white">
              {kurirTerpilih ? formatRupiah(totalOngkir) : "PILIH KURIR"}
            </span>
          )}
        </div>

        {totalDiskon > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>POTONGAN VOUCHER</span>
            <span className="font-bold">-{formatRupiah(totalDiskon)}</span>
          </div>
        )}

        <div className="flex items-baseline justify-between border-t border-neutral-800 pt-3 text-sm">
          <span className="font-bold text-white uppercase">
            TOTAL PEMBAYARAN
          </span>
          <span className="text-base font-black text-white">
            {formatRupiah(totalAkhir)}
          </span>
        </div>
      </div>

      {/* Tombol Eksekusi Pembayaran */}
      <button
        type="submit"
        disabled={tombolNonaktif}
        className="mt-6 flex min-h-11 w-full items-center justify-center border border-white bg-white px-4 font-mono text-xs font-black text-black uppercase transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-500"
      >
        {isPending
          ? "MEMPROSES PESANAN..."
          : sedangHitungOngkir
            ? "MENUNGGU TARIF ONGKIR..."
            : !kurirTerpilih
              ? "PILIH KURIR TERLEBIH DAHULU"
              : "LANJUT KE PEMBAYARAN"}
      </button>

      <p className="mt-3 text-center font-mono text-[10px] text-neutral-500 uppercase">
        TRANSAKSI AMAN // MIDTRANS SNAP GATEWAY & COMPARE-AND-SET ATOMIK
      </p>
    </div>
  );
}
