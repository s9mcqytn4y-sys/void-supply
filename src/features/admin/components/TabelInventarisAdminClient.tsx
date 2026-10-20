"use client";

import { useState } from "react";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { TabelDataAdmin, type KolomTabelAdmin } from "./primitives";
import { ModalPenyesuaianStok } from "./ModalPenyesuaianStok";
import type { ItemInventarisAdmin } from "../actions/stok-admin.action";
import { SlidersHorizontal } from "lucide-react";

interface TabelInventarisAdminClientProps {
  daftarInventaris: ItemInventarisAdmin[];
}

export function TabelInventarisAdminClient({
  daftarInventaris,
}: TabelInventarisAdminClientProps) {
  const [varianAktif, setVarianAktif] = useState<{
    id: string;
    namaProduk: string;
    namaVarian: string;
    sku: string;
    stokSekarang: number;
  } | null>(null);

  const [modalBuka, setModalBuka] = useState(false);

  const handleBukaModal = (item: ItemInventarisAdmin) => {
    setVarianAktif({
      id: item.id,
      namaProduk: item.namaProduk,
      namaVarian: `${item.warna} / ${item.ukuran}`,
      sku: item.sku,
      stokSekarang: item.stok,
    });
    setModalBuka(true);
  };

  const kolomTabel: KolomTabelAdmin<ItemInventarisAdmin>[] = [
    {
      kunci: "produk",
      label: "ARTIKEL & VARIAN",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-zinc-800 bg-zinc-900">
            <Image
              src={item.gambarUtama}
              alt={item.namaProduk}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-white uppercase">{item.namaProduk}</p>
            <p className="text-[10px] text-zinc-400">
              {item.warna} / {item.ukuran} // {item.beratGram}g
            </p>
          </div>
        </div>
      ),
    },
    {
      kunci: "sku",
      label: "SKU GARMEN",
      render: (item) => (
        <span className="font-mono text-zinc-300 font-semibold">{item.sku}</span>
      ),
    },
    {
      kunci: "harga",
      label: "HARGA SATUAN",
      render: (item) => (
        <span className="font-bold text-white">{formatRupiah(item.harga)}</span>
      ),
    },
    {
      kunci: "stok",
      label: "KETERSEDIAAN STOK",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 border ${
              item.stok === 0
                ? "border-rose-500/50 bg-rose-950/40 text-rose-400"
                : item.stok <= 5
                ? "border-amber-500/50 bg-amber-950/40 text-amber-400"
                : "border-emerald-500/40 bg-emerald-950/30 text-emerald-400"
            }`}
          >
            {item.stok === 0 ? "HABIS" : `${item.stok} UNIT`}
          </span>
          {item.stok <= 5 && item.stok > 0 && (
            <span className="text-[9px] font-mono text-amber-400">MENIPIS</span>
          )}
        </div>
      ),
    },
    {
      kunci: "aksi",
      label: "PENYESUAIAN",
      rataKanan: true,
      render: (item) => (
        <button
          type="button"
          onClick={() => handleBukaModal(item)}
          className="inline-flex min-h-11 items-center gap-1.5 border border-zinc-700 bg-zinc-800 px-3 font-mono text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white transition-colors"
        >
          <SlidersHorizontal className="h-3 w-3 text-zinc-400" />
          <span>SESUAIKAN STOK</span>
        </button>
      ),
    },
  ];

  return (
    <>
      <TabelDataAdmin
        kolom={kolomTabel}
        data={daftarInventaris}
        kunciUnik={(item) => item.id}
        pesanKosong="Tidak ada varian inventaris yang ditemukan."
      />

      <ModalPenyesuaianStok
        terbuka={modalBuka}
        onTutup={() => setModalBuka(false)}
        varian={varianAktif}
      />
    </>
  );
}
