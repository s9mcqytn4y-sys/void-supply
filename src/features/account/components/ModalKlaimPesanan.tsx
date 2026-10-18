"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, Check, AlertCircle, Loader2 } from "lucide-react";
import {
  skemaKlaimPesanan,
  type InputKlaimPesanan,
} from "../schemas/account.schema";
import { klaimPesananLawasAction } from "../actions/pesanan-akun.action";

interface ModalKlaimPesananProps {
  onSukses: () => void;
}

export function ModalKlaimPesanan({ onSukses }: ModalKlaimPesananProps) {
  const [buka, setBuka] = useState(false);
  const [sedangMemproses, setSedangMemproses] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputKlaimPesanan>({
    resolver: zodResolver(skemaKlaimPesanan),
    defaultValues: {
      nomorPesanan: "",
      tokenAkses: "",
    },
  });

  const onSubmit = async (data: InputKlaimPesanan) => {
    setSedangMemproses(true);
    try {
      const res = await klaimPesananLawasAction(data);
      if (res.sukses) {
        toast.success(res.pesan);
        reset();
        setBuka(false);
        onSukses();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Terjadi kendala saat menautkan pesanan. Silakan coba kembali.");
    } finally {
      setSedangMemproses(false);
    }
  };

  return (
    <div>
      {!buka ? (
        <button
          type="button"
          onClick={() => setBuka(true)}
          className="inline-flex min-h-11 items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 py-2 font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider hover:border-zinc-500 hover:text-white transition-colors"
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>KLAIM PESANAN LAWAS DENGAN TOKEN</span>
        </button>
      ) : (
        <div className="border border-zinc-700 bg-zinc-950 p-5 mt-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-white" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                KLAIM PESANAN HISTORIS (GUEST CHECKOUT)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setBuka(false);
                reset();
              }}
              className="font-mono text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              [ BATAL ]
            </button>
          </div>

          <p className="font-mono text-xs text-zinc-400 mb-4 leading-relaxed">
            Jika Anda pernah melakukan pemesanan sebelum mendaftarkan akun ini,
            masukkan Nomor Pesanan dan Token Akses UUID yang tercantum pada faktur
            atau email konfirmasi Anda untuk menautkan transaksi ke akun ini.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="klaim-nomor-pesanan"
                className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5"
              >
                NOMOR PESANAN
              </label>
              <input
                id="klaim-nomor-pesanan"
                type="text"
                placeholder="VOID-20261018-XXXXXXXX"
                className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white uppercase placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                {...register("nomorPesanan")}
              />
              {errors.nomorPesanan && (
                <p className="mt-1 flex items-center gap-1 font-mono text-xs text-rose-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.nomorPesanan.message}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="klaim-token-akses"
                className="block font-mono text-xs text-zinc-300 uppercase tracking-wider mb-1.5"
              >
                TOKEN AKSES FAKTUR (UUID V4)
              </label>
              <input
                id="klaim-token-akses"
                type="text"
                placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
                className="w-full min-h-11 border border-zinc-700 bg-zinc-900 px-3.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-colors"
                {...register("tokenAkses")}
              />
              {errors.tokenAkses && (
                <p className="mt-1 flex items-center gap-1 font-mono text-xs text-rose-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.tokenAkses.message}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={sedangMemproses}
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {sedangMemproses ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>MEMVALIDASI...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>TAUTKAN PESANAN SEKARANG</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
