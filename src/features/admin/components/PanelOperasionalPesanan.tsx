"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  inquireMidtransStatusAction,
  batalkanPesananAdminAction,
  tambahCatatanOperasionalAction,
} from "../actions/pesanan-admin.lifecycle";
import { ModalAksiAdmin } from "./primitives";
import {
  RefreshCw,
  Printer,
  FileText,
  AlertTriangle,
  MessageSquare,
  Plus,
} from "lucide-react";

interface PanelOperasionalPesananProps {
  pesananId: string;
  nomorPesanan: string;
  statusPesanan: string;
}

export function PanelOperasionalPesanan({
  pesananId,
  nomorPesanan,
  statusPesanan,
}: PanelOperasionalPesananProps) {
  const router = useRouter();
  const [sedangInquire, setSedangInquire] = useState(false);
  const [modalBatalTerbuka, setModalBatalTerbuka] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [sedangBatal, setSedangBatal] = useState(false);

  // Form Tambah Catatan
  const [catatanBaru, setCatatanBaru] = useState("");
  const [urgensi, setUrgensi] = useState("normal");
  const [sedangSimpanCatatan, setSedangSimpanCatatan] = useState(false);

  const handleInquireMidtrans = async () => {
    setSedangInquire(true);
    try {
      const res = await inquireMidtransStatusAction(nomorPesanan);
      if (res.sukses) {
        toast.success(res.pesan);
        router.refresh();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal menghubungkan ke gateway Midtrans.");
    } finally {
      setSedangInquire(false);
    }
  };

  const handleKonfirmasiBatal = async () => {
    if (!alasanBatal.trim()) {
      toast.error("Silakan masukkan alasan pembatalan pesanan.");
      return;
    }
    setSedangBatal(true);
    try {
      const res = await batalkanPesananAdminAction(nomorPesanan, alasanBatal);
      if (res.sukses) {
        toast.success(res.pesan);
        setModalBatalTerbuka(false);
        router.refresh();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal memproses pembatalan pesanan.");
    } finally {
      setSedangBatal(false);
    }
  };

  const handleSimpanCatatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatanBaru.trim()) return;

    setSedangSimpanCatatan(true);
    try {
      const res = await tambahCatatanOperasionalAction(pesananId, catatanBaru, urgensi);
      if (res.sukses) {
        toast.success(res.pesan);
        setCatatanBaru("");
        router.refresh();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal menambahkan catatan.");
    } finally {
      setSedangSimpanCatatan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tombol Aksi Cepat */}
      <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-4">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          AKSI OPERASIONAL & GATEWAY
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {/* Inquire Gateway */}
          <button
            type="button"
            onClick={handleInquireMidtrans}
            disabled={sedangInquire}
            className="inline-flex min-h-11 items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 font-mono text-xs font-semibold text-zinc-200 uppercase transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${sedangInquire ? "animate-spin" : ""}`} />
            <span>{sedangInquire ? "MENGHUBUNGKAN..." : "CEK STATUS MIDTRANS"}</span>
          </button>

          {/* Cetak Resi Thermal */}
          <a
            href={`/pesanan/${nomorPesanan}/resi`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 font-mono text-xs font-semibold text-zinc-200 uppercase transition-colors hover:border-zinc-500 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5 text-zinc-400" />
            <span>LABEL RESI THERMAL A6</span>
          </a>

          {/* Cetak Faktur */}
          <a
            href={`/pesanan/${nomorPesanan}/faktur`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 font-mono text-xs font-semibold text-zinc-200 uppercase transition-colors hover:border-zinc-500 hover:text-white"
          >
            <FileText className="h-3.5 w-3.5 text-zinc-400" />
            <span>FAKTUR A4 RESMI</span>
          </a>

          {/* Batalkan Pesanan */}
          {statusPesanan !== "dibatalkan" && (
            <button
              type="button"
              onClick={() => setModalBatalTerbuka(true)}
              className="inline-flex min-h-11 items-center gap-2 border border-rose-500/30 bg-rose-950/20 px-4 font-mono text-xs font-semibold text-rose-400 uppercase transition-colors hover:border-rose-500 hover:bg-rose-950/40"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>BATALKAN PESANAN</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Tambah Catatan Operasional */}
      <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-4">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-zinc-400" />
          <span>TAMBAH CATATAN INTERNAL</span>
        </h3>

        <form onSubmit={handleSimpanCatatan} className="space-y-3">
          <textarea
            value={catatanBaru}
            onChange={(e) => setCatatanBaru(e.target.value)}
            placeholder="Tuliskan catatan tindak lanjut kurir, komplain, atau status paket..."
            rows={2}
            className="w-full border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <select
              value={urgensi}
              onChange={(e) => setUrgensi(e.target.value)}
              className="inline-flex min-h-11 border border-zinc-800 bg-zinc-900 px-3 font-mono text-xs text-zinc-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              <option value="normal">Urgensi: Normal</option>
              <option value="penting">Urgensi: Penting</option>
              <option value="kritis">Urgensi: Kritis</option>
            </select>

            <button
              type="submit"
              disabled={sedangSimpanCatatan || !catatanBaru.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-white bg-white px-5 font-mono text-xs font-bold text-black uppercase hover:bg-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{sedangSimpanCatatan ? "MENYIMPAN..." : "SIMPAN CATATAN"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi Pembatalan */}
      <ModalAksiAdmin
        terbuka={modalBatalTerbuka}
        onTutup={() => setModalBatalTerbuka(false)}
        judul="KONFIRMASI PEMBATALAN PESANAN"
        deskripsi={`Tindakan ini akan membatalkan pesanan #${nomorPesanan} dan mengembalikan seluruh kuota stok ke varian produk.`}
        tombolKonfirmasi={{
          teks: "BATALKAN SEKARANG",
          onKlik: handleKonfirmasiBatal,
          sedangProses: sedangBatal,
          bahaya: true,
        }}
      >
        <div className="space-y-3">
          <label className="block font-mono text-xs text-zinc-400 uppercase">
            ALASAN PEMBATALAN (WAJIB DIISI):
          </label>
          <textarea
            value={alasanBatal}
            onChange={(e) => setAlasanBatal(e.target.value)}
            placeholder="Misal: Permintaan pembeli / Pembayaran expired / Penjemputan gagal..."
            rows={3}
            className="w-full border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </ModalAksiAdmin>
    </div>
  );
}
