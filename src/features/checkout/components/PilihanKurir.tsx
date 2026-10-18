"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import type { OpsiKurir } from "@/lib/services/biteship.service";

interface PropsPilihanKurir {
  opsiKurir: OpsiKurir[];
  kurirTerpilih: OpsiKurir | null;
  onPilihKurir: (kurir: OpsiKurir) => void;
  sedangHitungOngkir: boolean;
  errorKurir?: string;
}

type KategoriLayanan = "reguler" | "next_day" | "instant" | "kargo";

interface InfoKategori {
  id: KategoriLayanan;
  label: string;
  badge: string;
  keterangan: string;
}

const DAFTAR_KATEGORI: InfoKategori[] = [
  {
    id: "reguler",
    label: "REGULER",
    badge: "1-3 HARI",
    keterangan: "Pengiriman standar nasional",
  },
  {
    id: "next_day",
    label: "NEXT DAY / KILAT",
    badge: "1 HARI",
    keterangan: "Jaminan tiba esok hari kerja",
  },
  {
    id: "instant",
    label: "INSTANT / SAME DAY",
    badge: "3-8 JAM",
    keterangan: "Pengiriman cepat area terdekat",
  },
  {
    id: "kargo",
    label: "KARGO / HEMAT",
    badge: "EKONOMIS",
    keterangan: "Tarif hemat untuk paket berat",
  },
];

function tentukanKategoriLayanan(kurir: OpsiKurir): KategoriLayanan {
  const code = (kurir.kodeLayananKurir || kurir.layanan || "").toLowerCase();
  const nama = kurir.layanan.toLowerCase();

  if (
    code.includes("instant") ||
    nama.includes("instant") ||
    code.includes("same_day") ||
    nama.includes("same day")
  ) {
    return "instant";
  }
  if (
    code.includes("best") ||
    code.includes("yes") ||
    code.includes("next") ||
    code.includes("ons") ||
    nama.includes("besok") ||
    nama.includes("esok")
  ) {
    return "next_day";
  }
  if (
    code.includes("cargo") ||
    code.includes("kargo") ||
    code.includes("gokil") ||
    code.includes("jtr") ||
    code.includes("trucking")
  ) {
    return "kargo";
  }
  return "reguler";
}

export function PilihanKurir({
  opsiKurir,
  kurirTerpilih,
  onPilihKurir,
  sedangHitungOngkir,
  errorKurir,
}: PropsPilihanKurir) {
  // Kelompokkan kurir berdasarkan kategori
  const kurirTerkelompok = useMemo(() => {
    const kelompok = new Map<KategoriLayanan, OpsiKurir[]>();

    for (const k of opsiKurir) {
      const kat = tentukanKategoriLayanan(k);
      const list = kelompok.get(kat) || [];
      list.push(k);
      kelompok.set(kat, list);
    }

    return kelompok;
  }, [opsiKurir]);

  // Cari kategori kurir yang sedang terpilih
  const kategoriAktifSaatIni = useMemo(() => {
    if (!kurirTerpilih) return "reguler";
    return tentukanKategoriLayanan(kurirTerpilih);
  }, [kurirTerpilih]);

  const [tabKategori, setTabKategori] = useState<KategoriLayanan>("reguler");

  // Filter kategori yang memiliki kurir
  const kategoriTersedia = DAFTAR_KATEGORI.filter(
    (k) => (kurirTerkelompok.get(k.id) || []).length > 0
  );

  // Kategori yang sedang ditampilkan
  const kategoriAktif =
    kategoriTersedia.find((k) => k.id === tabKategori)?.id ||
    kategoriTersedia.find((k) => k.id === kategoriAktifSaatIni)?.id ||
    kategoriTersedia[0]?.id ||
    "reguler";

  const daftarKurirAktif = kurirTerkelompok.get(kategoriAktif) || [];

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-mono text-xs font-bold text-white uppercase">
          03 // OPSI KURIR PENGIRIMAN
        </h2>
        {sedangHitungOngkir && (
          <span className="font-mono text-[10px] text-neutral-400 animate-pulse">
            MENGHITUNG ONGKOS KIRIM...
          </span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {opsiKurir.length === 0 ? (
          <p className="font-mono text-xs text-neutral-400">
            {sedangHitungOngkir
              ? "Memeriksa tarif pengiriman ekspedisi..."
              : "Masukkan kode pos 5 digit untuk memuat opsi pengiriman."}
          </p>
        ) : (
          <>
            {/* Tab Navigasi Kategori Layanan */}
            {kategoriTersedia.length > 1 && (
              <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
                {kategoriTersedia.map((kat) => {
                  const isTabActive = kategoriAktif === kat.id;
                  const itemKurirCount = (kurirTerkelompok.get(kat.id) || []).length;
                  const hasSelectedKurir =
                    kurirTerpilih && tentukanKategoriLayanan(kurirTerpilih) === kat.id;

                  return (
                    <button
                      key={kat.id}
                      type="button"
                      onClick={() => setTabKategori(kat.id)}
                      className={`inline-flex min-h-9 items-center gap-2 border px-3 py-1 font-mono text-xs transition-colors ${
                        isTabActive
                          ? "border-white bg-white text-black font-bold"
                          : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      <span>{kat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded ${
                          isTabActive
                            ? "bg-black text-white"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {kat.badge}
                      </span>
                      {hasSelectedKurir && !isTabActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Daftar Layanan Kurir dalam Kategori Aktif */}
            <div className="space-y-2">
              {daftarKurirAktif.map((kurir) => {
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
                        : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase">
                            {kurir.namaKurir}
                          </span>
                          <span className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-300">
                            {kurir.layanan}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          Estimasi: {kurir.estimasiHari}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      {formatRupiah(kurir.tarifIdr)}
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}

        {errorKurir && (
          <p className="mt-2 font-mono text-[11px] text-rose-400">{errorKurir}</p>
        )}
      </div>
    </div>
  );
}
