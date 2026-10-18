"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Check, Star } from "lucide-react";
import { useCheckoutForm } from "../hooks/useCheckoutSubHooks";
import { ambilBukuAlamatAction, type AlamatPelangganItem } from "@/features/account";

export function FormulirPengiriman() {
  const { form, session, koordinat, statusGps, deteksiLokasiGps } =
    useCheckoutForm();
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  const [daftarAlamat, setDaftarAlamat] = useState<AlamatPelangganItem[]>([]);
  const [alamatTerpilihId, setAlamatTerpilihId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      ambilBukuAlamatAction().then((res) => {
        if (res.sukses && res.alamat.length > 0) {
          setDaftarAlamat(res.alamat);
          const utama = res.alamat.find((a) => a.apakahUtama) || res.alamat[0];
          if (utama) {
            setAlamatTerpilihId(utama.id);
          }
        }
      });
    }
  }, [session]);

  const pilihAlamatTersimpan = (alamat: AlamatPelangganItem) => {
    setAlamatTerpilihId(alamat.id);
    setValue("namaLengkap", alamat.namaPenerima, { shouldValidate: true });
    setValue("telepon", alamat.teleponPenerima, { shouldValidate: true });
    setValue("alamatLengkap", alamat.alamatLengkap, { shouldValidate: true });
    setValue("kota", alamat.kota, { shouldValidate: true });
    setValue("provinsi", alamat.provinsi, { shouldValidate: true });
    setValue("kodePos", alamat.kodePos, { shouldValidate: true });
    if (alamat.catatanKurir) {
      setValue("catatan", alamat.catatanKurir);
    }
  };

  return (
    <div className="space-y-6">
      {/* 01 // Informasi Penerima */}
      <div className="border border-neutral-800 bg-neutral-950 p-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="font-mono text-xs font-bold text-white uppercase">
            01 // INFORMASI PENERIMA
          </h2>
          {session?.user && (
            <span className="font-mono text-[10px] text-emerald-400">
              AKUN TERVERIFIKASI
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="input-nama"
              className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
            >
              NAMA LENGKAP
            </label>
            <input
              id="input-nama"
              type="text"
              {...register("namaLengkap")}
              required
              placeholder="Masukkan nama lengkap Anda"
              aria-invalid={!!errors.namaLengkap}
              aria-describedby={
                errors.namaLengkap ? "error-namaLengkap" : undefined
              }
              className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                errors.namaLengkap
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {errors.namaLengkap && (
              <p
                id="error-namaLengkap"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {errors.namaLengkap.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="input-email"
              className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
            >
              EMAIL
            </label>
            <input
              id="input-email"
              type="email"
              {...register("email")}
              required
              placeholder="nama@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "error-email" : undefined}
              className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                errors.email
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {errors.email && (
              <p
                id="error-email"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="input-telepon"
              className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
            >
              NOMOR TELEPON (WHATSAPP)
            </label>
            <input
              id="input-telepon"
              type="tel"
              {...register("telepon")}
              required
              placeholder="081234567890"
              aria-invalid={!!errors.telepon}
              aria-describedby={errors.telepon ? "error-telepon" : undefined}
              className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                errors.telepon
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {errors.telepon && (
              <p
                id="error-telepon"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {errors.telepon.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 02 // Alamat Pengiriman */}
      <div className="border border-neutral-800 bg-neutral-950 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <h2 className="font-mono text-xs font-bold text-white uppercase">
            02 // ALAMAT PENGIRIMAN
          </h2>
          <button
            type="button"
            onClick={deteksiLokasiGps}
            disabled={statusGps === "mencari"}
            className="inline-flex min-h-9 items-center justify-center border border-neutral-700 bg-neutral-900 px-3 font-mono text-[11px] text-neutral-300 uppercase transition-all hover:border-white hover:text-white active:scale-[0.98] disabled:opacity-50"
          >
            {statusGps === "mencari"
              ? "MEMINDAI LOKASI..."
              : statusGps === "berhasil"
                ? "TITIK GPS TERHUBUNG"
                : "PINPOINT GPS // KURIR INSTANT"}
          </button>
        </div>

        {koordinat && (
          <div className="mt-3 border border-emerald-950 bg-emerald-950/20 px-3 py-2 font-mono text-[11px] text-emerald-400">
            KOORDINAT TERVERIFIKASI: {koordinat.latitude}, {koordinat.longitude}
          </div>
        )}

        {/* Quick Switcher Buku Alamat untuk Pengguna Terotentikasi */}
        {daftarAlamat.length > 0 && (
          <div className="mt-4 pt-1">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                PILIH DARI BUKU ALAMAT TERSIMPAN
              </span>
              <Link
                href="/akun/alamat"
                className="font-mono text-[11px] text-neutral-400 hover:text-white underline transition-colors"
              >
                [ KELOLA BUKU ALAMAT ]
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {daftarAlamat.map((item) => {
                const isSelected = item.id === alamatTerpilihId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pilihAlamatTersimpan(item)}
                    className={`min-h-11 p-3 text-left border transition-all active:scale-[0.99] ${
                      isSelected
                        ? "border-white bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.apakahUtama && (
                          <span className="inline-flex items-center gap-0.5 border border-emerald-400/80 bg-emerald-950/50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300 uppercase">
                            <Star className="h-2 w-2 fill-current" />
                            UTAMA
                          </span>
                        )}
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="font-mono text-[11px] text-neutral-300 truncate mt-1">
                      {item.namaPenerima} ({item.teleponPenerima})
                    </p>
                    <p className="font-mono text-[10px] text-neutral-400 truncate">
                      {item.alamatLengkap}, {item.kota} {item.kodePos}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="input-alamat"
              className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
            >
              ALAMAT LENGKAP & NOMOR BANGUNAN
            </label>
            <textarea
              id="input-alamat"
              rows={3}
              {...register("alamatLengkap")}
              required
              placeholder="Nama jalan, nomor rumah/kantor, RT/RW, kelurahan, kecamatan"
              aria-invalid={!!errors.alamatLengkap}
              aria-describedby={
                errors.alamatLengkap ? "error-alamatLengkap" : undefined
              }
              className={`mt-1 w-full border bg-neutral-900 p-3 font-mono text-xs text-white focus:outline-none ${
                errors.alamatLengkap
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {errors.alamatLengkap && (
              <p
                id="error-alamatLengkap"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {errors.alamatLengkap.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="input-kota"
                className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
              >
                KOTA / KABUPATEN
              </label>
              <input
                id="input-kota"
                type="text"
                {...register("kota")}
                required
                placeholder="Jakarta Selatan"
                aria-invalid={!!errors.kota}
                aria-describedby={errors.kota ? "error-kota" : undefined}
                className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                  errors.kota
                    ? "border-rose-500"
                    : "border-neutral-800 focus:border-white"
                }`}
              />
              {errors.kota && (
                <p
                  id="error-kota"
                  className="mt-1 font-mono text-[11px] text-rose-400"
                >
                  {errors.kota.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="input-provinsi"
                className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
              >
                PROVINSI
              </label>
              <input
                id="input-provinsi"
                type="text"
                {...register("provinsi")}
                required
                placeholder="DKI Jakarta"
                aria-invalid={!!errors.provinsi}
                aria-describedby={
                  errors.provinsi ? "error-provinsi" : undefined
                }
                className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                  errors.provinsi
                    ? "border-rose-500"
                    : "border-neutral-800 focus:border-white"
                }`}
              />
              {errors.provinsi && (
                <p
                  id="error-provinsi"
                  className="mt-1 font-mono text-[11px] text-rose-400"
                >
                  {errors.provinsi.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="input-kodepos"
                className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
              >
                KODE POS (5 DIGIT)
              </label>
              <input
                id="input-kodepos"
                type="text"
                maxLength={5}
                {...register("kodePos")}
                required
                placeholder="12345"
                aria-invalid={!!errors.kodePos}
                aria-describedby={errors.kodePos ? "error-kodePos" : undefined}
                className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                  errors.kodePos
                    ? "border-rose-500"
                    : "border-neutral-800 focus:border-white"
                }`}
              />
              {errors.kodePos && (
                <p
                  id="error-kodePos"
                  className="mt-1 font-mono text-[11px] text-rose-400"
                >
                  {errors.kodePos.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="input-catatan"
              className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase"
            >
              CATATAN KURIR (OPSIONAL)
            </label>
            <input
              id="input-catatan"
              type="text"
              {...register("catatan")}
              placeholder="Contoh: Titipkan di pos satpam / pagar hitam"
              className="mt-1 min-h-11 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
            />
          </div>

          {/* Checkbox Simpan Alamat Default untuk Akun Terotentikasi */}
          <div className="pt-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                {...register("simpanAlamatSebagaiDefault")}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0"
              />
              <span className="font-mono text-xs text-neutral-300">
                Simpan sebagai alamat default akun untuk pesanan berikutnya
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
