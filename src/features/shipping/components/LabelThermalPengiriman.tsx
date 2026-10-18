import React from "react";
import { generateCode128Svg } from "@/lib/barcode/code128";

export interface ItemLabelPengiriman {
  namaProduk: string;
  namaVarian: string;
  sku: string;
  jumlah: number;
}

export interface DataLabelPengiriman {
  nomorPesanan: string;
  nomorResi: string;
  kurir: string;
  layanan: string;
  beratGram: number;
  isLunas: boolean;
  penerima: {
    nama: string;
    telepon: string;
    alamatLengkap: string;
    kota: string;
    kodePos: string;
  };
  daftarItem: ItemLabelPengiriman[];
}

interface LabelThermalPengirimanProps {
  data: DataLabelPengiriman;
  className?: string;
}

export function LabelThermalPengiriman({
  data,
  className = "",
}: LabelThermalPengirimanProps) {
  const {
    nomorPesanan,
    nomorResi,
    kurir,
    layanan,
    beratGram,
    isLunas,
    penerima,
    daftarItem,
  } = data;

  return (
    <div
      className={`mx-auto w-full max-w-105 border-2 border-dashed border-neutral-700 bg-white p-4 font-mono text-black print:m-0 print:w-full print:max-w-none print:border-none print:p-4 print:break-after-page ${className}`}
    >
      {/* Header Label: Brand & Ekspedisi */}
      <div className="border-b-2 border-black pb-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
              OFFICIAL STREETWEAR DROP
            </span>
            <h2 className="text-xl font-black tracking-tight uppercase">
              VOID SUPPLY
            </h2>
          </div>
          <div className="text-right">
            <span className="inline-block border-2 border-black bg-black px-2 py-0.5 text-xs font-black text-white uppercase">
              {kurir}
            </span>
            <span className="mt-0.5 block text-[10px] font-bold text-neutral-800 uppercase">
              {layanan}
            </span>
          </div>
        </div>
      </div>

      {/* Section Nomor Resi / Barcode Visual Code 128 */}
      <div className="border-b-2 border-black py-3 text-center">
        <div
          className="mx-auto flex justify-center py-1"
          dangerouslySetInnerHTML={{
            __html: generateCode128Svg(nomorResi, {
              lebarBar: 1.35,
              tinggi: 54,
              tampilkanTeks: true,
            }),
          }}
        />
        <span className="mt-1 block text-[9px] text-neutral-600 uppercase">
          NO. PESANAN: {nomorPesanan}
        </span>
      </div>

      {/* Info Pengirim & Penerima */}
      <div className="grid grid-cols-2 gap-2 border-b-2 border-black py-2 text-[11px] leading-tight">
        <div className="border-r border-black pr-2">
          <span className="font-bold text-neutral-700 uppercase">DARI (PENGIRIM):</span>
          <p className="mt-0.5 font-black">VOID Supply // Atelier Studio</p>
          <p className="text-[10px] text-neutral-800">0856-7060-477</p>
          <p className="mt-1 text-[10px]">
            Jl. Johar Baru No. 10, Jakarta Pusat
          </p>
          <p className="text-[10px] font-bold">DKI JAKARTA, 10560</p>
        </div>

        <div className="pl-1">
          <span className="font-bold text-neutral-700 uppercase">KEPADA (PENERIMA):</span>
          <p className="mt-0.5 font-black">{penerima.nama}</p>
          <p className="text-[10px] text-neutral-800">{penerima.telepon}</p>
          <p className="mt-1 text-[10px]">{penerima.alamatLengkap}</p>
          <p className="text-[10px] font-black uppercase">
            {penerima.kota}, {penerima.kodePos}
          </p>
        </div>
      </div>

      {/* Tag Logistik & Pembayaran */}
      <div className="grid grid-cols-3 border-b-2 border-black py-2 text-center text-[10px]">
        <div className="border-r border-black px-1">
          <span className="text-neutral-600 uppercase">BERAT PAKET</span>
          <p className="font-black text-xs">{beratGram} GR</p>
        </div>
        <div className="border-r border-black px-1">
          <span className="text-neutral-600 uppercase">TIPE TRANSAKSI</span>
          <p className="font-black text-xs">{isLunas ? "LUNAS (NON-COD)" : "BELUM LUNAS"}</p>
        </div>
        <div className="px-1">
          <span className="text-neutral-600 uppercase">ASURANSI LOGISTIK</span>
          <p className="font-black text-xs text-neutral-800">STANDAR EKSPEDISI</p>
        </div>
      </div>

      {/* Isi Paket Garmen */}
      <div className="border-b-2 border-black py-2 text-[10px]">
        <span className="font-bold uppercase">ISI KIRIMAN MERCHANDISE:</span>
        <ul className="mt-1 space-y-1">
          {daftarItem.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between gap-2 border-b border-neutral-200 pb-0.5 last:border-b-0"
            >
              <span className="wrap-break-word">
                {item.jumlah}x {item.namaProduk} ({item.namaVarian})
              </span>
              <span className="shrink-0 font-bold break-all">{item.sku}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Biteship Logistics Verification */}
      <div className="pt-2 text-center text-[9px] text-neutral-600">
        <p className="font-bold uppercase">
          VOID SUPPLY FULFILLMENT // PENGIRIMAN EKSPEDISI RESMI
        </p>
        <p>
          Wajib video unboxing untuk klaim penukaran // support@voidsupply.com
        </p>
      </div>
    </div>
  );
}
