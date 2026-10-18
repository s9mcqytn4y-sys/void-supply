"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Laptop,
  AlertCircle,
  Loader2,
  Check,
  LogOut,
  Clock,
  Trash2,
} from "lucide-react";
import type { SesiAktifItem, LogKeamananItem } from "../actions/keamanan-akun.action";
import {
  ubahKataSandiAction,
  cabutSesiAction,
  cabutSemuaSesiLainAction,
  hapusAkunAction,
} from "../actions/keamanan-akun.action";
import { signOut } from "@/lib/auth/auth-client";
import {
  skemaUbahKataSandi,
  type InputUbahKataSandi,
} from "../schemas/account.schema";

interface PusatKeamananAkunProps {
  daftarSesiAwal: SesiAktifItem[];
  daftarLogAwal: LogKeamananItem[];
}

export function PusatKeamananAkun({
  daftarSesiAwal,
  daftarLogAwal,
}: PusatKeamananAkunProps) {
  const router = useRouter();
  const [daftarSesi, setDaftarSesi] = useState<SesiAktifItem[]>(daftarSesiAwal);
  const [sedangMemprosesSandi, setSedangMemprosesSandi] = useState(false);
  const [sedangCabutSesi, setSedangCabutSesi] = useState(false);
  const [sedangHapusAkun, setSedangHapusAkun] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputUbahKataSandi>({
    resolver: zodResolver(skemaUbahKataSandi),
    defaultValues: {
      kataSandiLama: "",
      kataSandiBaru: "",
      konfirmasiKataSandiBaru: "",
    },
  });

  const onSubmitSandi = async (data: InputUbahKataSandi) => {
    setSedangMemprosesSandi(true);
    try {
      const res = await ubahKataSandiAction(data);
      if (res.sukses) {
        toast.success(res.pesan);
        reset();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal memperbarui kata sandi. Silakan coba kembali.");
    } finally {
      setSedangMemprosesSandi(false);
    }
  };

  const handleCabutSesi = async (sessionId: string) => {
    setSedangCabutSesi(true);
    try {
      const res = await cabutSesiAction(sessionId);
      if (res.sukses) {
        toast.success(res.pesan);
        setDaftarSesi((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal mencabut sesi.");
    } finally {
      setSedangCabutSesi(false);
    }
  };

  const handleCabutSemuaLain = async () => {
    if (!confirm("Apakah Anda yakin ingin mengeluarkan seluruh sesi perangkat lain?")) {
      return;
    }
    setSedangCabutSesi(true);
    try {
      const res = await cabutSemuaSesiLainAction();
      if (res.sukses) {
        toast.success(res.pesan);
        setDaftarSesi((prev) => prev.filter((s) => s.apakahSesiIni));
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal mencabut sesi lain.");
    } finally {
      setSedangCabutSesi(false);
    }
  };

  const handleHapusAkun = async () => {
    const konfirmasi = window.prompt(
      'Ketik "HAPUS" untuk mengonfirmasi penghapusan permanen akun Anda. Seluruh kredensial dan sesi akan dihapus:'
    );
    if (konfirmasi !== "HAPUS") {
      if (konfirmasi !== null) {
        toast.error('Konfirmasi dibatalkan: Teks verifikasi tidak sesuai ("HAPUS").');
      }
      return;
    }

    setSedangHapusAkun(true);
    try {
      const res = await hapusAkunAction();
      if (res.sukses) {
        toast.success(res.pesan);
        await signOut();
        router.push("/masuk");
        router.refresh();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal menghapus akun. Silakan coba beberapa saat lagi.");
    } finally {
      setSedangHapusAkun(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="font-mono text-lg font-bold text-white uppercase tracking-wider">
          PUSAT KEAMANAN & MANAJEMEN SESI
        </h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">
          Kredensial proteksi akun, perangkat yang terhubung, dan riwayat aktivitas audit
        </p>
      </div>

      {/* 1. Formulir Perubahan Kata Sandi */}
      <section className="border border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Lock className="h-4 w-4 text-white" />
          <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            PERBARUI KATA SANDI AKUN
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmitSandi)} className="space-y-4 max-w-md">
          <div>
            <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
              KATA SANDI SAAT INI
            </label>
            <input
              type="password"
              placeholder="Masukkan kata sandi saat ini..."
              className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
              {...register("kataSandiLama")}
            />
            {errors.kataSandiLama && (
              <p className="mt-1 flex items-center gap-1 font-mono text-xs text-rose-400">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.kataSandiLama.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
              KATA SANDI BARU (MIN. 12 KARAKTER)
            </label>
            <input
              type="password"
              placeholder="Kombinasi huruf, angka & simbol..."
              className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
              {...register("kataSandiBaru")}
            />
            {errors.kataSandiBaru && (
              <p className="mt-1 flex items-center gap-1 font-mono text-xs text-rose-400">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.kataSandiBaru.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5">
              KONFIRMASI KATA SANDI BARU
            </label>
            <input
              type="password"
              placeholder="Ketik ulang kata sandi baru..."
              className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
              {...register("konfirmasiKataSandiBaru")}
            />
            {errors.konfirmasiKataSandiBaru && (
              <p className="mt-1 flex items-center gap-1 font-mono text-xs text-rose-400">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.konfirmasiKataSandiBaru.message}</span>
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={sedangMemprosesSandi}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 transition-colors"
            >
              {sedangMemprosesSandi ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>MEMPROSES...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>SIMPAN KATA SANDI BARU</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 2. Manajemen Sesi Perangkat Aktif */}
      <section className="border border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-white" />
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              SESI PERANGKAT AKTIF ({daftarSesi.length})
            </h2>
          </div>

          {daftarSesi.length > 1 && (
            <button
              type="button"
              onClick={handleCabutSemuaLain}
              disabled={sedangCabutSesi}
              className="inline-flex min-h-9 items-center gap-1.5 border border-rose-900/60 bg-rose-950/20 px-3 py-1.5 font-mono text-xs font-semibold text-rose-300 uppercase hover:bg-rose-900/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>KELUARKAN SEMUA PERANGKAT LAIN</span>
            </button>
          )}
        </div>

        <p className="font-mono text-xs text-zinc-400">
          Daftar peramban dan perangkat yang saat ini memiliki token sesi terotentikasi ke akun Anda.
        </p>

        <div className="space-y-3 pt-1">
          {daftarSesi.map((sesi) => (
            <div
              key={sesi.id}
              className={`border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                sesi.apakahSesiIni
                  ? "border-emerald-500/60 bg-emerald-950/10"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">
                    {sesi.userAgent ? sesi.userAgent.split(" ")[0] : "Peramban Web"}
                  </span>
                  {sesi.apakahSesiIni && (
                    <span className="inline-block border border-emerald-400 bg-emerald-950/60 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                      PERANGKAT SAAT INI
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 font-mono text-[11px] text-zinc-400">
                  <span>IP: {sesi.ipAddress || "Lokal / Proxy"}</span>
                  <span>
                    Masuk:{" "}
                    {new Date(sesi.dibuatPada).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {!sesi.apakahSesiIni && (
                <button
                  type="button"
                  onClick={() => handleCabutSesi(sesi.id)}
                  disabled={sedangCabutSesi}
                  className="inline-flex min-h-9 items-center justify-center border border-zinc-700 bg-zinc-800 px-3 py-1 font-mono text-xs text-zinc-300 uppercase hover:border-rose-700 hover:text-rose-300 transition-colors shrink-0"
                >
                  CABUT SESI
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Riwayat Aktivitas Audit Keamanan */}
      <section className="border border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Clock className="h-4 w-4 text-white" />
          <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            LOG AKTIVITAS KEAMANAN AKUN
          </h2>
        </div>

        {daftarLogAwal.length > 0 ? (
          <div className="border border-zinc-800/80 divide-y divide-zinc-800/60 font-mono text-xs">
            {daftarLogAwal.map((log) => (
              <div
                key={log.id}
                className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 bg-zinc-900/30"
              >
                <div>
                  <span className="text-white font-bold uppercase">
                    {log.jenis.replace(/_/g, " ")}
                  </span>
                  {log.ipAddress && (
                    <span className="text-zinc-500 ml-2">
                      (IP: {log.ipAddress})
                    </span>
                  )}
                </div>
                <span className="text-zinc-400 text-[11px]">
                  {new Date(log.waktu).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-zinc-400 py-3">
            Belum ada catatan aktivitas keamanan kritis pada akun ini.
          </p>
        )}
      </section>

      {/* 4. Zona Bahaya: Penghapusan Akun Permanen */}
      <section className="border border-rose-900/60 bg-rose-950/20 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-rose-900/50 pb-3">
          <Trash2 className="h-4 w-4 text-rose-400" />
          <h2 className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wider">
            ZONA BAHAYA: HAPUS AKUN PERMANEN
          </h2>
        </div>

        <div className="space-y-3 font-mono text-xs text-zinc-300">
          <p className="leading-relaxed">
            Menghapus akun akan mencabut seluruh akses masuk, menghapus profil, buku alamat, daftar preferensi, serta membatalkan seluruh sesi aktif di semua perangkat.
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Sesuai kepatuhan regulasi perpajakan dan transparansi transaksi, pesanan historis akan dianonimkan (pengguna_id dikosongkan) dan faktur tetap diarsipkan secara aman.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleHapusAkun}
            disabled={sedangHapusAkun}
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-rose-600 bg-rose-600/10 px-5 py-2 font-mono text-xs font-bold text-rose-300 uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50"
          >
            {sedangHapusAkun ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>MEMPROSES PENGHAPUSAN...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>HAPUS AKUN PERMANEN</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
