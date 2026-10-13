"use client";

import type { DataFormulirCheckout } from "../hooks/useCheckout";

interface PropsFormulirPengiriman {
  formData: DataFormulirCheckout;
  formErrors: Record<string, string>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export function FormulirPengiriman({
  formData,
  formErrors,
  onInputChange,
}: PropsFormulirPengiriman) {
  return (
    <div className="space-y-6">
      {/* 01 // Informasi Penerima */}
      <div className="border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
          01 // INFORMASI PENERIMA
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="input-nama"
              className="block font-mono text-[11px] text-neutral-300"
            >
              NAMA LENGKAP
            </label>
            <input
              id="input-nama"
              type="text"
              name="namaLengkap"
              required
              placeholder="Masukkan nama lengkap Anda"
              aria-invalid={!!formErrors.namaLengkap}
              aria-describedby={
                formErrors.namaLengkap ? "error-namaLengkap" : undefined
              }
              value={formData.namaLengkap}
              onChange={onInputChange}
              className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                formErrors.namaLengkap
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {formErrors.namaLengkap && (
              <p
                id="error-namaLengkap"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {formErrors.namaLengkap}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="input-email"
              className="block font-mono text-[11px] text-neutral-300"
            >
              EMAIL
            </label>
            <input
              id="input-email"
              type="email"
              name="email"
              required
              placeholder="nama@email.com"
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? "error-email" : undefined}
              value={formData.email}
              onChange={onInputChange}
              className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                formErrors.email
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {formErrors.email && (
              <p
                id="error-email"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {formErrors.email}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="input-telepon"
              className="block font-mono text-[11px] text-neutral-300"
            >
              NOMOR TELEPON
            </label>
            <input
              id="input-telepon"
              type="tel"
              name="telepon"
              required
              placeholder="08xxxxxxxxxx"
              aria-invalid={!!formErrors.telepon}
              aria-describedby={formErrors.telepon ? "error-telepon" : undefined}
              value={formData.telepon}
              onChange={onInputChange}
              className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                formErrors.telepon
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {formErrors.telepon && (
              <p
                id="error-telepon"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {formErrors.telepon}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 02 // Alamat Pengiriman */}
      <div className="border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
          02 // ALAMAT PENGIRIMAN
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="input-alamat"
              className="block font-mono text-[11px] text-neutral-300"
            >
              ALAMAT LENGKAP
            </label>
            <textarea
              id="input-alamat"
              name="alamatLengkap"
              rows={2}
              required
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"
              aria-invalid={!!formErrors.alamatLengkap}
              aria-describedby={
                formErrors.alamatLengkap ? "error-alamatLengkap" : undefined
              }
              value={formData.alamatLengkap}
              onChange={onInputChange}
              className={`mt-1 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                formErrors.alamatLengkap
                  ? "border-rose-500"
                  : "border-neutral-800 focus:border-white"
              }`}
            />
            {formErrors.alamatLengkap && (
              <p
                id="error-alamatLengkap"
                className="mt-1 font-mono text-[11px] text-rose-400"
              >
                {formErrors.alamatLengkap}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="input-kota"
                className="block font-mono text-[11px] text-neutral-300"
              >
                KOTA / KABUPATEN
              </label>
              <input
                id="input-kota"
                type="text"
                name="kota"
                required
                placeholder="Contoh: Jakarta Pusat"
                aria-invalid={!!formErrors.kota}
                aria-describedby={formErrors.kota ? "error-kota" : undefined}
                value={formData.kota}
                onChange={onInputChange}
                className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                  formErrors.kota
                    ? "border-rose-500"
                    : "border-neutral-800 focus:border-white"
                }`}
              />
              {formErrors.kota && (
                <p
                  id="error-kota"
                  className="mt-1 font-mono text-[11px] text-rose-400"
                >
                  {formErrors.kota}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="input-provinsi"
                className="block font-mono text-[11px] text-neutral-300"
              >
                PROVINSI
              </label>
              <input
                id="input-provinsi"
                type="text"
                name="provinsi"
                required
                placeholder="Contoh: DKI Jakarta"
                aria-invalid={!!formErrors.provinsi}
                aria-describedby={
                  formErrors.provinsi ? "error-provinsi" : undefined
                }
                value={formData.provinsi}
                onChange={onInputChange}
                className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                  formErrors.provinsi
                    ? "border-rose-500"
                    : "border-neutral-800 focus:border-white"
                }`}
              />
              {formErrors.provinsi && (
                <p
                  id="error-provinsi"
                  className="mt-1 font-mono text-[11px] text-rose-400"
                >
                  {formErrors.provinsi}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="input-kodepos"
                className="block font-mono text-[11px] text-neutral-300"
              >
                KODE POS
              </label>
              <input
                id="input-kodepos"
                type="text"
                name="kodePos"
                maxLength={5}
                required
                placeholder="5 digit angka"
                aria-invalid={!!formErrors.kodePos}
                aria-describedby={formErrors.kodePos ? "error-kodePos" : undefined}
                value={formData.kodePos}
                onChange={onInputChange}
                className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                  formErrors.kodePos
                    ? "border-rose-500"
                    : "border-neutral-800 focus:border-white"
                }`}
              />
              {formErrors.kodePos && (
                <p
                  id="error-kodePos"
                  className="mt-1 font-mono text-[11px] text-rose-400"
                >
                  {formErrors.kodePos}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
