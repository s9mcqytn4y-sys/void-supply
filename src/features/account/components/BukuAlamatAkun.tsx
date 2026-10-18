"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Check,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";
import type { AlamatPelangganItem } from "../actions/alamat-akun.action";
import {
  simpanAlamatAction,
  hapusAlamatAction,
  aturAlamatUtamaAction,
} from "../actions/alamat-akun.action";
import {
  skemaAlamatPelanggan,
  type InputAlamatPelanggan,
} from "../schemas/account.schema";

interface BukuAlamatAkunProps {
  daftarAlamatAwal: AlamatPelangganItem[];
}

export function BukuAlamatAkun({ daftarAlamatAwal }: BukuAlamatAkunProps) {
  const [daftarAlamat, setDaftarAlamat] = useState<AlamatPelangganItem[]>(
    daftarAlamatAwal
  );
  const [modeForm, setModeForm] = useState<"tutup" | "tambah" | "edit">("tutup");
  const [sedangMemproses, setSedangMemproses] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputAlamatPelanggan>({
    resolver: zodResolver(skemaAlamatPelanggan),
    defaultValues: {
      label: "",
      namaPenerima: "",
      teleponPenerima: "",
      alamatLengkap: "",
      provinsi: "",
      kota: "",
      kecamatan: "",
      kodePos: "",
      apakahUtama: false,
      catatanKurir: "",
    },
  });

  const bukaFormTambah = () => {
    reset({
      label: "Rumah",
      namaPenerima: "",
      teleponPenerima: "",
      alamatLengkap: "",
      provinsi: "",
      kota: "",
      kecamatan: "",
      kodePos: "",
      apakahUtama: daftarAlamat.length === 0,
      catatanKurir: "",
    });
    setModeForm("tambah");
  };

  const bukaFormEdit = (item: AlamatPelangganItem) => {
    reset({
      id: item.id,
      label: item.label,
      namaPenerima: item.namaPenerima,
      teleponPenerima: item.teleponPenerima,
      alamatLengkap: item.alamatLengkap,
      provinsi: item.provinsi,
      kota: item.kota,
      kecamatan: item.kecamatan || "",
      kodePos: item.kodePos,
      apakahUtama: item.apakahUtama,
      catatanKurir: item.catatanKurir || "",
    });
    setModeForm("edit");
  };

  const onSubmit = async (data: InputAlamatPelanggan) => {
    setSedangMemproses(true);
    try {
      const res = await simpanAlamatAction(data);
      if (res.sukses) {
        toast.success(res.pesan);
        setModeForm("tutup");
        window.location.reload();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal menyimpan alamat. Silakan periksa kembali formulir.");
    } finally {
      setSedangMemproses(false);
    }
  };

  const handleJadikanUtama = async (id: string) => {
    setSedangMemproses(true);
    try {
      const res = await aturAlamatUtamaAction(id);
      if (res.sukses) {
        toast.success(res.pesan);
        setDaftarAlamat((prev) =>
          prev.map((a) => ({
            ...a,
            apakahUtama: a.id === id,
          }))
        );
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal mengatur alamat utama.");
    } finally {
      setSedangMemproses(false);
    }
  };

  const handleHapus = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alamat ini dari Buku Alamat?")) {
      return;
    }
    setSedangMemproses(true);
    try {
      const res = await hapusAlamatAction(id);
      if (res.sukses) {
        toast.success(res.pesan);
        setDaftarAlamat((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal menghapus alamat.");
    } finally {
      setSedangMemproses(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="font-mono text-lg font-bold text-white uppercase tracking-wider">
            BUKU ALAMAT PENGIRIMAN
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Simpan beberapa lokasi pengiriman untuk kalkulasi tarif Biteship instan saat checkout
          </p>
        </div>

        {modeForm === "tutup" && (
          <button
            type="button"
            onClick={bukaFormTambah}
            className="inline-flex min-h-11 items-center gap-2 border border-white bg-white px-5 py-2 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>TAMBAH ALAMAT BARU</span>
          </button>
        )}
      </div>

      {/* Form Tambah/Edit Alamat */}
      {modeForm !== "tutup" && (
        <div className="border border-zinc-700 bg-zinc-950 p-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {modeForm === "tambah"
                ? "TAMBAH ALAMAT PENGIRIMAN BARU"
                : "PERBARUI ALAMAT PENGIRIMAN"}
            </h2>
            <button
              type="button"
              onClick={() => setModeForm("tutup")}
              className="font-mono text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              [ BATAL ]
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                  LABEL ALAMAT
                </label>
                <input
                  type="text"
                  placeholder="Rumah, Kantor, Studio..."
                  className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                  {...register("label")}
                />
                {errors.label && (
                  <p className="mt-1 font-mono text-xs text-rose-400">
                    {errors.label.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                  NAMA PENERIMA
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap penerima..."
                  className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                  {...register("namaPenerima")}
                />
                {errors.namaPenerima && (
                  <p className="mt-1 font-mono text-xs text-rose-400">
                    {errors.namaPenerima.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                  TELEPON / WHATSAPP
                </label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                  {...register("teleponPenerima")}
                />
                {errors.teleponPenerima && (
                  <p className="mt-1 font-mono text-xs text-rose-400">
                    {errors.teleponPenerima.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                ALAMAT LENGKAP
              </label>
              <textarea
                rows={3}
                placeholder="Nama jalan, nomor bangunan, RT/RW, kelurahan, detail patokan..."
                className="w-full border border-zinc-700 bg-zinc-900 p-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                {...register("alamatLengkap")}
              />
              {errors.alamatLengkap && (
                <p className="mt-1 font-mono text-xs text-rose-400">
                  {errors.alamatLengkap.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                  PROVINSI
                </label>
                <input
                  type="text"
                  placeholder="DKI Jakarta"
                  className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                  {...register("provinsi")}
                />
                {errors.provinsi && (
                  <p className="mt-1 font-mono text-xs text-rose-400">
                    {errors.provinsi.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                  KOTA / KABUPATEN
                </label>
                <input
                  type="text"
                  placeholder="Jakarta Pusat"
                  className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                  {...register("kota")}
                />
                {errors.kota && (
                  <p className="mt-1 font-mono text-xs text-rose-400">
                    {errors.kota.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                  KECAMATAN
                </label>
                <input
                  type="text"
                  placeholder="Johar Baru"
                  className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                  {...register("kecamatan")}
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                  KODE POS (5 DIGIT)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="10560"
                  className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                  {...register("kodePos")}
                />
                {errors.kodePos && (
                  <p className="mt-1 font-mono text-xs text-rose-400">
                    {errors.kodePos.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
                CATATAN KURIR (OPSIONAL)
              </label>
              <input
                type="text"
                placeholder="Contoh: Titipkan di pos satpam, pagar hitam..."
                className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                {...register("catatanKurir")}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-none border-zinc-700 bg-zinc-900 text-white focus:ring-0"
                  {...register("apakahUtama")}
                />
                <span className="font-mono text-xs text-zinc-300">
                  Jadikan sebagai alamat default utama untuk checkout
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={sedangMemproses}
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {sedangMemproses ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>MENYIMPAN...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>SIMPAN ALAMAT</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setModeForm("tutup")}
                className="inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-5 py-2.5 font-mono text-xs font-semibold text-zinc-400 uppercase tracking-wider hover:text-white transition-colors"
              >
                BATAL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Kartu Alamat Eksis */}
      {daftarAlamat.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daftarAlamat.map((alamat) => (
            <div
              key={alamat.id}
              className={`border p-5 flex flex-col justify-between transition-colors ${
                alamat.apakahUtama
                  ? "border-white bg-zinc-950 shadow-xs"
                  : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {alamat.label}
                    </span>
                    {alamat.apakahUtama && (
                      <span className="inline-flex items-center gap-1 border border-emerald-400 bg-emerald-950/60 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        UTAMA
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs text-zinc-300">
                  <p className="font-bold text-white">{alamat.namaPenerima}</p>
                  <p className="text-zinc-400">{alamat.teleponPenerima}</p>
                  <p className="text-zinc-300 leading-relaxed pt-1">
                    {alamat.alamatLengkap}
                  </p>
                  <p className="text-zinc-400">
                    {alamat.kecamatan ? `${alamat.kecamatan}, ` : ""}
                    {alamat.kota}, {alamat.provinsi} {alamat.kodePos}
                  </p>
                  {alamat.catatanKurir && (
                    <p className="text-zinc-500 italic pt-1">
                      Catatan: {alamat.catatanKurir}
                    </p>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Kartu */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-zinc-900">
                {!alamat.apakahUtama && (
                  <button
                    type="button"
                    onClick={() => handleJadikanUtama(alamat.id)}
                    disabled={sedangMemproses}
                    className="inline-flex min-h-9 items-center border border-zinc-700 bg-zinc-900 px-3 py-1 font-mono text-[11px] font-semibold text-zinc-300 uppercase hover:border-zinc-500 hover:text-white transition-colors"
                  >
                    JADIKAN UTAMA
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => bukaFormEdit(alamat)}
                  className="inline-flex min-h-9 items-center gap-1 border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[11px] font-semibold text-zinc-300 uppercase hover:border-zinc-600 hover:text-white transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>EDIT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleHapus(alamat.id)}
                  disabled={sedangMemproses}
                  className="inline-flex min-h-9 items-center gap-1 border border-transparent px-2.5 py-1 font-mono text-[11px] font-semibold text-rose-400 uppercase hover:bg-rose-950/30 transition-colors ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>HAPUS</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
          <MapPin className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            BELUM ADA ALAMAT TERSIMPAN
          </p>
          <p className="font-mono text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Tambahkan alamat pengiriman pertama Anda untuk mengaktifkan perhitungan tarif logistik instan.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={bukaFormTambah}
              className="inline-flex min-h-11 items-center gap-2 border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>TAMBAH ALAMAT PERTAMA</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
