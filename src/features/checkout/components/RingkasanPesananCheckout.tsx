"use client";

import { formatRupiah } from "@/lib/utils";
import type { ItemKeranjang } from "@/features/cart";
import type { HasilValidasiVoucher } from "@/features/checkout/actions/voucher.action";

interface PropsRingkasanPesananCheckout {
  items: ItemKeranjang[];
  subtotal: number;
  totalOngkir: number;
  totalDiskon?: number;
  totalAkhir: number;
  sedangHitungOngkir: boolean;
  isPending: boolean;
  sedangMemuat: boolean;
  kurirDipilih: boolean;
  kodeVoucherInput?: string;
  onKodeVoucherChange?: (val: string) => void;
  voucherDiterapkan?: HasilValidasiVoucher | null;
  sedangValidasiVoucher?: boolean;
  onTerapkanVoucher?: (e: React.FormEvent) => void;
  onHapusVoucher?: () => void;
}

export function RingkasanPesananCheckout({
  items,
  subtotal,
  totalOngkir,
  totalDiskon = 0,
  totalAkhir,
  sedangHitungOngkir,
  isPending,
  sedangMemuat,
  kurirDipilih,
  kodeVoucherInput = "",
  onKodeVoucherChange,
  voucherDiterapkan,
  sedangValidasiVoucher = false,
  onTerapkanVoucher,
  onHapusVoucher,
}: PropsRingkasanPesananCheckout) {
  const totalJumlahArtikel = items.reduce((acc, i) => acc + i.jumlah, 0);

  return (
    <div className="sticky top-24 border border-neutral-800 bg-neutral-950 p-6">
      <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
        RINGKASAN PESANAN ({totalJumlahArtikel} ARTIKEL)
      </h2>

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

      {/* Bagian Voucher Diskon (Module 02.17) */}
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
            {onHapusVoucher && (
              <button
                type="button"
                onClick={onHapusVoucher}
                className="text-[11px] font-bold text-neutral-400 uppercase transition-colors hover:text-white"
              >
                [HAPUS]
              </button>
            )}
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
                value={kodeVoucherInput}
                onChange={(e) => onKodeVoucherChange?.(e.target.value.toUpperCase())}
                placeholder="CONTOH: DROP04 / WELCOME10"
                className="min-h-11 flex-1 border border-neutral-800 bg-neutral-900 px-3 font-mono text-xs text-white uppercase placeholder-neutral-600 focus:border-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={onTerapkanVoucher}
                disabled={sedangValidasiVoucher || !kodeVoucherInput.trim()}
                className="min-h-11 border border-neutral-700 bg-neutral-800 px-4 font-mono text-xs font-bold text-white uppercase transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sedangValidasiVoucher ? "..." : "TERAPKAN"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2 border-t border-neutral-800 pt-4 font-mono text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>SUBTOTAL PRODUK:</span>
          <span className="font-bold text-white">{formatRupiah(subtotal)}</span>
        </div>
        {totalDiskon > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>POTONGAN VOUCHER:</span>
            <span className="font-bold">-{formatRupiah(totalDiskon)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-400">
          <span>ONGKOS KIRIM:</span>
          <span className="font-bold text-white">
            {sedangHitungOngkir ? "Menghitung..." : formatRupiah(totalOngkir)}
          </span>
        </div>
        <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm text-white">
          <span className="font-bold">TOTAL PEMBAYARAN:</span>
          <span className="font-black text-emerald-400">
            {formatRupiah(totalAkhir)}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={
            isPending ||
            sedangMemuat ||
            sedangHitungOngkir ||
            items.length === 0 ||
            !kurirDipilih
          }
          className="flex min-h-12 w-full items-center justify-center border border-white bg-white font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "MENYIAPKAN PESANAN ANDA..."
            : `LANJUT KE PEMBAYARAN (${formatRupiah(totalAkhir)})`}
        </button>
        <p className="mt-2 text-center font-mono text-[10px] text-neutral-400">
          Pengiriman resmi dari Johar Baru, Jakarta Pusat // Checkout Terproteksi
        </p>
      </div>
    </div>
  );
}
