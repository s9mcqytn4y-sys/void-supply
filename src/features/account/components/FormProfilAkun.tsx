"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Check, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import type { ProfilPenggunaData } from "../actions/profil-akun.action";
import {
  perbaruiProfilAkunAction,
  perbaruiPreferensiAction,
} from "../actions/profil-akun.action";
import {
  skemaProfilAkun,
  type InputProfilAkun,
} from "../schemas/account.schema";

interface FormProfilAkunProps {
  profil: ProfilPenggunaData;
}

export function FormProfilAkun({ profil }: FormProfilAkunProps) {
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [ukuranFavorit, setUkuranFavorit] = useState<string>(
    profil.preferensi?.ukuranFavorit || "L"
  );
  const [emailMarketing, setEmailMarketing] = useState<boolean>(
    Boolean(profil.preferensi?.emailMarketing)
  );

  const ukuranOptions = ["S", "M", "L", "XL", "XXL"];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputProfilAkun>({
    resolver: zodResolver(skemaProfilAkun),
    defaultValues: {
      nama: profil.nama || "",
      nomorTelepon: "",
    },
  });

  const onSubmit = async (data: InputProfilAkun) => {
    setSedangMenyimpan(true);
    try {
      const resProfil = await perbaruiProfilAkunAction(data);
      const resPref = await perbaruiPreferensiAction({
        ukuranFavorit,
        emailMarketing,
      });

      if (resProfil.sukses && resPref.sukses) {
        toast.success("Profil dan preferensi akun berhasil diperbarui.");
      } else {
        toast.error(resProfil.pesan || resPref.pesan || "Gagal memperbarui profil.");
      }
    } catch {
      toast.error("Terjadi kendala saat memperbarui profil.");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="font-mono text-lg font-bold text-white uppercase tracking-wider">
          PENGATURAN PROFIL PELANGGAN
        </h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">
          Identitas akun terdaftar dan preferensi kurasi busana streetwear Anda
        </p>
      </div>

      <div className="border border-zinc-800 bg-zinc-950 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Identitas Email (Read-Only) */}
          <div>
            <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
              ALAMAT EMAIL (TERDAFTAR)
            </label>
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-3.5 py-2.5">
              <span className="font-mono text-xs text-zinc-300 truncate">
                {profil.email}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    profil.emailVerified ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                  {profil.emailVerified ? "TERVERIFIKASI" : "BELUM AKTIF"}
                </span>
              </div>
            </div>
            <p className="font-mono text-[11px] text-zinc-400 mt-1">
              Alamat email terikat pada kredensial sesi dan tidak dapat diubah langsung demi alasan keamanan.
            </p>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label
              htmlFor="profil-nama"
              className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5"
            >
              NAMA LENGKAP
            </label>
            <input
              id="profil-nama"
              type="text"
              placeholder="Nama lengkap..."
              className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
              {...register("nama")}
            />
            {errors.nama && (
              <p className="mt-1 flex items-center gap-1 font-mono text-xs text-rose-400">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.nama.message}</span>
              </p>
            )}
          </div>

          {/* Preferensi Ukuran Artikel */}
          <div className="pt-2 border-t border-zinc-900">
            <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-2">
              PREFERENSI UKURAN TEKSTIL FAVORIT
            </label>
            <div className="flex flex-wrap gap-2">
              {ukuranOptions.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setUkuranFavorit(sz)}
                  className={`min-h-11 min-w-12 px-4 py-2 font-mono text-xs font-bold uppercase transition-colors border ${
                    ukuranFavorit === sz
                      ? "border-white bg-white text-black"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
            <p className="font-mono text-[11px] text-zinc-400 mt-1.5">
              Ukuran ini akan diprioritaskan saat Anda membuka halaman katalog dan artikel Drop 04.
            </p>
          </div>

          {/* Langganan Transmisi & Buletin */}
          <div className="pt-2 border-t border-zinc-900">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailMarketing}
                onChange={(e) => setEmailMarketing(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-none border-zinc-700 bg-zinc-900 text-white focus:ring-0"
              />
              <div>
                <span className="block font-mono text-xs font-semibold text-white uppercase tracking-wider">
                  TERIMA NOTIFIKASI DROP & RILISAN EKSKLUSIF
                </span>
                <span className="block font-mono text-[11px] text-zinc-400 mt-0.5">
                  Dapatkan transmisi awal mengenai jadwal peluncuran koleksi terbatas, restock garmen, dan lookbook atelier VOID Supply.
                </span>
              </div>
            </label>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={sedangMenyimpan}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 transition-colors"
            >
              {sedangMenyimpan ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>SIMPAN PERUBAHAN PROFIL</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
