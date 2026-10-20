"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mutasiStokAdminAction } from "../actions/stok-admin.action";
import { ModalAksiAdmin } from "./primitives";

interface ModalPenyesuaianStokProps {
  terbuka: boolean;
  onTutup: () => void;
  varian: {
    id: string;
    namaProduk: string;
    namaVarian: string;
    sku: string;
    stokSekarang: number;
  } | null;
}

export function ModalPenyesuaianStok({
  terbuka,
  onTutup,
  varian,
}: ModalPenyesuaianStokProps) {
  const router = useRouter();
  const [jenisMutasi, setJenisMutasi] = useState<"restock" | "koreksi_fisik" | "retur" | "rusak">("restock");
  const [jumlah, setJumlah] = useState<number>(10);
  const [nomorReferensi, setNomorReferensi] = useState("");
  const [catatan, setCatatan] = useState("");
  const [sedangProses, setSedangProses] = useState(false);

  if (!varian) return null;

  // Nilai perubahan: jika rusak/pengurangan koreksi bisa negatif
  const perubahanRiil = jenisMutasi === "rusak" ? -Math.abs(jumlah) : jumlah;
  const stokEstimasi = varian.stokSekarang + perubahanRiil;

  const handleSimpan = async () => {
    if (jumlah === 0) {
      toast.error("Jumlah unit tidak boleh 0.");
      return;
    }

    if (stokEstimasi < 0) {
      toast.error("Stok akhir tidak boleh kurang dari 0.");
      return;
    }

    setSedangProses(true);
    try {
      const res = await mutasiStokAdminAction({
        varianId: varian.id,
        jenisMutasi,
        perubahan: perubahanRiil,
        nomorReferensi: nomorReferensi.trim() || undefined,
        catatan: catatan.trim() || undefined,
      });

      if (res.sukses) {
        toast.success(res.pesan);
        onTutup();
        router.refresh();
      } else {
        toast.error(res.pesan);
      }
    } catch {
      toast.error("Gagal menyesuaikan stok.");
    } finally {
      setSedangProses(false);
    }
  };

  return (
    <ModalAksiAdmin
      terbuka={terbuka}
      onTutup={onTutup}
      judul={`PENYESUAIAN STOK // SKU: ${varian.sku}`}
      deskripsi={`${varian.namaProduk} (${varian.namaVarian}) - Stok saat ini: ${varian.stokSekarang} unit`}
      tombolKonfirmasi={{
        teks: "SIMPAN PERUBAHAN STOK",
        onKlik: handleSimpan,
        sedangProses,
      }}
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Jenis Mutasi */}
        <div>
          <label className="block text-zinc-400 uppercase mb-1">
            JENIS MUTASI / ALASAN:
          </label>
          <select
            value={jenisMutasi}
            onChange={(e) => setJenisMutasi(e.target.value as any)}
            className="w-full min-h-11 border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <option value="restock">Restock Barang Datang (+)</option>
            <option value="retur">Retur Pembeli (+)</option>
            <option value="koreksi_fisik">Koreksi Opname Fisik (+/-)</option>
            <option value="rusak">Barang Cacat / Rusak (-)</option>
          </select>
        </div>

        {/* Jumlah Unit */}
        <div>
          <label className="block text-zinc-400 uppercase mb-1">
            JUMLAH UNIT PERUBAHAN:
          </label>
          <input
            type="number"
            min={1}
            value={jumlah}
            onChange={(e) => setJumlah(Number(e.target.value))}
            className="w-full min-h-11 border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          />
          <p className="mt-1 text-[11px] text-zinc-500">
            Estimasi stok akhir:{" "}
            <strong className={stokEstimasi < 0 ? "text-rose-400" : "text-emerald-400"}>
              {stokEstimasi} unit
            </strong>
          </p>
        </div>

        {/* Nomor Referensi */}
        <div>
          <label className="block text-zinc-400 uppercase mb-1">
            NOMOR REFERENSI / PO:
          </label>
          <input
            type="text"
            value={nomorReferensi}
            onChange={(e) => setNomorReferensi(e.target.value)}
            placeholder="Misal: PO-2026-DROP04 / OPNAME-OKT"
            className="w-full min-h-11 border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          />
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-zinc-400 uppercase mb-1">
            CATATAN OPERASIONAL:
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Keterangan tambahan untuk audit trail buku besar..."
            rows={2}
            className="w-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          />
        </div>
      </div>
    </ModalAksiAdmin>
  );
}
