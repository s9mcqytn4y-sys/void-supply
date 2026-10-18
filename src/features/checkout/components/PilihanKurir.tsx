"use client";

import { useMemo } from "react";
import { formatRupiah } from "@/lib/utils";
import type { OpsiKurir } from "@/lib/services/biteship.service";
import { useShippingRates } from "../hooks/useCheckoutSubHooks";

type KategoriLayanan = "semua" | "reguler" | "next_day" | "instant" | "kargo";

interface InfoKategori {
  id: KategoriLayanan;
  label: string;
  badge: string;
  keterangan: string;
}

const DAFTAR_KATEGORI: InfoKategori[] = [
  {
    id: "semua",
    label: "SEMUA",
    badge: "LENGKAP",
    keterangan: "Seluruh penawaran kurir resmi",
  },
  {
    id: "reguler",
    label: "REGULER",
    badge: "1-3 HARI",
    keterangan: "Standar pengiriman nasional",
  },
  {
    id: "next_day",
    label: "KILAT",
    badge: "1 HARI",
    keterangan: "Jaminan tiba esok hari kerja",
  },
  {
    id: "instant",
    label: "INSTANT",
    badge: "3-8 JAM",
    keterangan: "Pengiriman cepat area terdekat",
  },
  {
    id: "kargo",
    label: "KARGO",
    badge: "HEMAT",
    keterangan: "Tarif ekonomis untuk paket berat",
  },
];

function tentukanKategoriLayanan(kurir: OpsiKurir): Exclude<KategoriLayanan, "semua"> {
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

export function PilihanKurir() {
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
  } = useShippingRates();

  // Cari tarif terendah untuk penanda [ TARIF TERBAIK ]
  const tarifTerendah = useMemo(() => {
    if (opsiKurir.length === 0) return 0;
    return Math.min(...opsiKurir.map((k) => k.tarifIdr));
  }, [opsiKurir]);

  // Filter kurir berdasarkan kategori aktif
  const kurirTersaring = useMemo(() => {
    if (kategoriKurirAktif === "semua") {
      return opsiKurir;
    }
    return opsiKurir.filter(
      (k) => tentukanKategoriLayanan(k) === kategoriKurirAktif
    );
  }, [opsiKurir, kategoriKurirAktif]);

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <h2 className="font-mono text-xs font-bold text-white uppercase">
          03 // PILIHAN KURIR PENGIRIMAN
        </h2>
        {opsiKurir.length > 0 && (
          <span className="font-mono text-[11px] text-neutral-400">
            {opsiKurir.length} LAYANAN TERVERIFIKASI
          </span>
        )}
      </div>

      {/* Loading State Skeleton */}
      {sedangHitungOngkir && (
        <div className="mt-4 border border-neutral-800 bg-neutral-900/40 p-6 text-center">
          <p className="font-mono text-xs text-neutral-300 uppercase animate-pulse">
            MEMVERIFIKASI TARIF RESMI LOGISTIK DARI JOHAR BARU (10560)...
          </p>
        </div>
      )}

      {/* Error State: Kendala Logistik Biteship dengan Tombol Retry */}
      {!sedangHitungOngkir && errorLogistik && (
        <div
          role="alert"
          className="mt-4 border border-rose-900/80 bg-rose-950/20 p-4 font-mono text-xs text-rose-300"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-rose-400 uppercase">
                [ KENDALA LOGISTIK ]
              </p>
              <p className="mt-1 text-[11px] text-neutral-300">
                {errorLogistik}
              </p>
            </div>
            <button
              type="button"
              onClick={cobaHitungUlangOngkir}
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-4 font-mono text-xs font-bold text-black uppercase transition-all hover:bg-neutral-200 active:scale-[0.98]"
            >
              COBA HITUNG ULANG
            </button>
          </div>
        </div>
      )}

      {/* Empty State: Belum input kode pos */}
      {!sedangHitungOngkir && !errorLogistik && opsiKurir.length === 0 && (
        <div className="mt-4 border border-dashed border-neutral-800 p-8 text-center">
          <p className="font-mono text-xs text-neutral-400 uppercase">
            MASUKKAN 5 DIGIT KODE POS TUJUAN PADA FORMULIR DI ATAS UNTUK MENAMPILKAN PILIHAN KURIR.
          </p>
        </div>
      )}

      {/* Tab Kategori Brutalist */}
      {!sedangHitungOngkir && opsiKurir.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
            {DAFTAR_KATEGORI.map((kat) => {
              const aktif = kategoriKurirAktif === kat.id;
              const jumlahOpsi =
                kat.id === "semua"
                  ? opsiKurir.length
                  : opsiKurir.filter(
                      (k) => tentukanKategoriLayanan(k) === kat.id
                    ).length;

              return (
                <button
                  key={kat.id}
                  type="button"
                  onClick={() => setKategoriKurirAktif(kat.id)}
                  className={`inline-flex min-h-9 items-center gap-1.5 border px-3 font-mono text-[11px] uppercase transition-all active:scale-[0.98] ${
                    aktif
                      ? "border-white bg-white text-black font-bold"
                      : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  <span>{kat.label}</span>
                  <span
                    className={`text-[9px] ${
                      aktif ? "text-neutral-700" : "text-neutral-500"
                    }`}
                  >
                    ({jumlahOpsi})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Callout Khusus Kategori Instant bila Belum Ada GPS */}
          {kategoriKurirAktif === "instant" && !koordinat && (
            <div className="border border-amber-900/60 bg-amber-950/20 p-4 font-mono text-xs text-amber-300">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-amber-400 uppercase">
                    SEMATKAN TITIK GPS PRESISI
                  </p>
                  <p className="text-[11px] text-neutral-300">
                    Kurir motor instant (Gojek / Grab) mewajibkan koordinat titik penjemputan presisi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={deteksiLokasiGps}
                  disabled={statusGps === "mencari"}
                  className="inline-flex min-h-9 items-center justify-center border border-amber-400 bg-amber-400 px-3 font-mono text-[11px] font-bold text-black uppercase transition-all hover:bg-amber-300 active:scale-[0.98] disabled:opacity-50"
                >
                  PINPOINT GPS SEKARANG
                </button>
              </div>
            </div>
          )}

          {/* Daftar Kartu Opsi Kurir */}
          {kurirTersaring.length === 0 ? (
            <div className="border border-neutral-800 bg-neutral-900/30 p-6 text-center">
              <p className="font-mono text-xs text-neutral-400 uppercase">
                TIDAK ADA LAYANAN TERSEDIA UNTUK KATEGORI INI. SILAKAN PILIH TAB KATEGORI LAIN.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {kurirTersaring.map((kurir) => {
                const terpilih =
                  kurirTerpilih?.kodeKurir === kurir.kodeKurir &&
                  kurirTerpilih?.layanan === kurir.layanan;
                const adalahTarifTerbaik = kurir.tarifIdr === tarifTerendah;

                return (
                  <button
                    key={`${kurir.kodeKurir}_${kurir.layanan}`}
                    type="button"
                    onClick={() => setKurirTerpilih(kurir)}
                    className={`flex flex-col justify-between border p-4 text-left transition-all active:scale-[0.98] ${
                      terpilih
                        ? "border-white bg-neutral-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                        : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold uppercase text-white">
                          {kurir.namaKurir} // {kurir.layanan}
                        </span>
                        {adalahTarifTerbaik && (
                          <span className="border border-emerald-800 bg-emerald-950/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400 uppercase">
                            TARIF TERBAIK
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-neutral-400 uppercase">
                        ESTIMASI: {kurir.estimasiHari}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-neutral-900 pt-2">
                      <span className="font-mono text-[11px] text-neutral-500 uppercase">
                        BIAYA
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {formatRupiah(kurir.tarifIdr)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
