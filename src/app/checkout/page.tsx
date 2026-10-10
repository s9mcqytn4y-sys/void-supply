"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { useKeranjangStore } from "@/features/cart";

export default function HalamanCheckout() {
  const items = useKeranjangStore((state) => state.items);
  const hitungTotalItem = useKeranjangStore((state) => state.hitungTotalItem);
  const hitungSubtotalIdr = useKeranjangStore((state) => state.hitungSubtotalIdr);

  const totalItem = hitungTotalItem();
  const subtotal = hitungSubtotalIdr();

  return (
    <div className="mx-auto min-h-[70vh] max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
        <div className="border-b border-neutral-800 pb-4">
          <span className="font-mono text-[11px] tracking-widest text-emerald-400 uppercase">
            STATUS ARSITEKTUR // MODUL 02.12 TERHUBUNG
          </span>
          <h1 className="mt-1 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            CHECKOUT & PEMBAYARAN
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400">
            Arsitektur keranjang belanja Zustand berhasil menyimpan {totalItem} unit artikel.
            Integrasi alur checkout lengkap, validasi transaksi server, Midtrans Snap, dan kalkulasi kurir Biteship
            akan diimplementasikan pada Modul 03.0.
          </p>
        </div>

        {/* Ringkasan Item Terpilih */}
        <div className="mt-6">
          <h2 className="font-mono text-xs font-bold text-neutral-300 uppercase">
            RINGKASAN ITEM DALAM KERANJANG ({totalItem} UNIT)
          </h2>

          {items.length === 0 ? (
            <p className="mt-3 font-mono text-xs text-neutral-500">
              Keranjang masih kosong. Silakan pilih artikel di katalog.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-900 border border-neutral-800 bg-neutral-900/40 p-4 font-mono text-xs">
              {items.map((item) => (
                <li key={item.varianId} className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-bold text-white">{item.nama}</span>
                    <span className="text-neutral-400"> ({item.ukuran} / {item.warna}) x {item.jumlah}</span>
                  </div>
                  <span className="font-bold text-neutral-200">
                    {formatRupiah(item.hargaTampilanIdr * item.jumlah)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4 font-mono text-sm">
            <span className="text-neutral-400">SUBTOTAL SNAPSHOT:</span>
            <span className="font-bold text-white">{formatRupiah(subtotal)}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/katalog"
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-semibold text-black uppercase transition-colors hover:bg-neutral-200"
          >
            KEMBALI KE KATALOG
          </Link>
        </div>
      </div>
    </div>
  );
}
