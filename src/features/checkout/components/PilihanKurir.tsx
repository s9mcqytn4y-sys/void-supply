"use client";

import { formatRupiah } from "@/lib/utils";
import type { OpsiKurir } from "@/lib/services/biteship.service";

interface PropsPilihanKurir {
  opsiKurir: OpsiKurir[];
  kurirTerpilih: OpsiKurir | null;
  onPilihKurir: (kurir: OpsiKurir) => void;
  sedangHitungOngkir: boolean;
  errorKurir?: string;
}

export function PilihanKurir({
  opsiKurir,
  kurirTerpilih,
  onPilihKurir,
  sedangHitungOngkir,
  errorKurir,
}: PropsPilihanKurir) {
  return (
    <div className="border border-neutral-800 bg-neutral-950 p-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-mono text-xs font-bold text-white uppercase">
          03 // OPSI KURIR PENGIRIMAN
        </h2>
        {sedangHitungOngkir && (
          <span className="font-mono text-[10px] text-neutral-400 animate-pulse">
            MENGHITUNG TARIF RESMI...
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {opsiKurir.length === 0 ? (
          <p className="font-mono text-xs text-neutral-400">
            {sedangHitungOngkir
              ? "Memverifikasi tarif kurir ke server..."
              : "Masukkan kode pos 5 digit untuk memuat opsi kurir resmi."}
          </p>
        ) : (
          opsiKurir.map((kurir) => {
            const isSelected =
              kurirTerpilih?.kodeKurir === kurir.kodeKurir &&
              kurirTerpilih?.layanan === kurir.layanan;

            return (
              <label
                key={`${kurir.kodeKurir}-${kurir.layanan}`}
                data-testid="opsi-kurir-item"
                onClick={() => onPilihKurir(kurir)}
                className={`flex min-h-11 cursor-pointer items-center justify-between border p-3 font-mono text-xs transition-colors ${
                  isSelected
                    ? "border-white bg-neutral-900 text-white"
                    : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="kurir"
                    checked={isSelected}
                    onChange={() => onPilihKurir(kurir)}
                    className="accent-white"
                  />
                  <div>
                    <span className="font-bold text-white uppercase">
                      {kurir.namaKurir}
                    </span>
                    <span className="text-neutral-400">
                      {" "}
                      - {kurir.layanan} ({kurir.estimasiHari})
                    </span>
                  </div>
                </div>
                <span className="font-bold text-white">
                  {formatRupiah(kurir.tarifIdr)}
                </span>
              </label>
            );
          })
        )}

        {errorKurir && (
          <p className="mt-2 font-mono text-[11px] text-rose-400">{errorKurir}</p>
        )}
      </div>
    </div>
  );
}
