import React from "react";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { generateCode128Svg } from "@/lib/barcode/code128";

export interface ItemFakturTransaksi {
  id: string;
  namaProduk: string;
  namaVarian: string;
  sku: string;
  jumlah: number;
  hargaSatuan: number;
  subtotalItem: number;
}

export interface DataFakturTransaksi {
  nomorFaktur: string;
  nomorPesanan: string;
  dibuatPada: string | Date;
  statusPembayaran: string;
  pelanggan: {
    nama: string;
    email: string;
    telepon: string;
  };
  pengiriman: {
    alamatLengkap: string;
    kota: string;
    provinsi: string;
    kodePos: string;
    kurir: string;
    layanan: string;
    nomorResi?: string | null;
  } | null;
  daftarItem: ItemFakturTransaksi[];
  subtotal: number;
  totalDiskon: number;
  kodeVoucher?: string | null;
  totalOngkir: number;
  totalAkhir: number;
  hashIntegrity?: string | null;
}

interface FakturTransaksiProps {
  data: DataFakturTransaksi;
  className?: string;
}

export function FakturTransaksi({ data, className = "" }: FakturTransaksiProps) {
  const {
    nomorFaktur,
    nomorPesanan,
    dibuatPada,
    statusPembayaran,
    pelanggan,
    pengiriman,
    daftarItem,
    subtotal,
    totalDiskon,
    kodeVoucher,
    totalOngkir,
    totalAkhir,
    hashIntegrity,
  } = data;

  const tanggalStr =
    typeof dibuatPada === "string"
      ? new Date(dibuatPada).toLocaleDateString("id-ID", { dateStyle: "long" })
      : dibuatPada.toLocaleDateString("id-ID", { dateStyle: "long" });

  const barcodeFakturSvg = generateCode128Svg(nomorFaktur, {
    tinggi: 30,
    lebarBar: 1.2,
    tampilkanTeks: false,
  });

  return (
    <div
      className={`faktur-a4-sheet border border-neutral-800 bg-neutral-950 p-6 sm:p-8 print:border-neutral-900 print:bg-white print:p-6 print:text-black ${className}`}
    >
      {/* Header Faktur */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-5 sm:flex-row print:border-neutral-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center bg-white font-mono text-xs font-black text-black print:border print:border-black">
              V
            </span>
            <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase print:text-neutral-700">
              FAKTUR RESMI PEMBELIAN // VOID SUPPLY
            </span>
          </div>
          <h1 className="mt-1 font-mono text-2xl font-black text-white uppercase print:text-black">
            VOID SUPPLY
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-neutral-400 print:text-neutral-600">
            Jl. Johar Baru No. 10, Jakarta Pusat, DKI Jakarta 10560
          </p>
          <p className="font-mono text-[11px] text-neutral-400 print:text-neutral-600">
            Email: orders@voidsupply.com // voidsupply.com
          </p>
        </div>

        <div className="relative text-left font-mono text-xs sm:text-right">
          <div className="pointer-events-none absolute -top-4 -right-2 hidden h-24 w-24 opacity-35 select-none sm:block print:block print:opacity-60">
            <Image
              src="/assets/brand/void-archive-stamp-white.webp"
              alt="Segel Arsip VOID Supply"
              fill
              className="object-contain print:invert"
            />
          </div>
          <span className="relative z-10 inline-block border border-emerald-500/50 bg-emerald-950/40 px-3 py-1 font-bold text-emerald-400 uppercase print:border-emerald-700 print:bg-emerald-50 print:text-emerald-800">
            STATUS: {statusPembayaran === "berhasil" ? "LUNAS (PAID)" : "TERCATAT"}
          </span>
          <p className="mt-2 font-bold text-white print:text-black">
            NO. FAKTUR: {nomorFaktur}
          </p>
          <p className="text-[11px] text-neutral-400 print:text-neutral-700">
            NO. PESANAN: {nomorPesanan}
          </p>
          <p className="text-[11px] text-neutral-400 print:text-neutral-700">
            TANGGAL: {tanggalStr}
          </p>
        </div>
      </div>

      {/* Informasi Pembeli & Pengiriman */}
      <div className="grid grid-cols-1 gap-6 py-5 sm:grid-cols-2 print:py-4">
        <div>
          <h2 className="font-mono text-xs font-bold text-white uppercase print:text-black">
            TAGIHAN KEPADA
          </h2>
          <p className="mt-1 font-mono text-xs font-bold text-neutral-200 print:text-black">
            {pelanggan.nama}
          </p>
          <p className="font-mono text-[11px] text-neutral-400 print:text-neutral-700">
            {pelanggan.email}
          </p>
          <p className="font-mono text-[11px] text-neutral-400 print:text-neutral-700">
            {pelanggan.telepon}
          </p>
        </div>

        <div>
          <h2 className="font-mono text-xs font-bold text-white uppercase print:text-black">
            ALAMAT PENGIRIMAN
          </h2>
          <p className="mt-1 font-mono text-xs text-neutral-200 print:text-black">
            {pengiriman?.alamatLengkap || "Alamat tidak tercatat"}
          </p>
          <p className="font-mono text-[11px] text-neutral-400 print:text-neutral-700">
            {pengiriman?.kota}, {pengiriman?.provinsi} {pengiriman?.kodePos}
          </p>
          <p className="font-mono text-[11px] text-neutral-400 print:text-neutral-700">
            Kurir: {pengiriman?.kurir || "Standar"} ({pengiriman?.layanan || "Reguler"})
          </p>
          {pengiriman?.nomorResi && (
            <p className="font-mono text-[11px] font-bold text-emerald-400 print:text-black">
              No. Resi: {pengiriman.nomorResi}
            </p>
          )}
        </div>
      </div>

      {/* Tabel Rincian Artikel */}
      <div className="border-t border-neutral-800 pt-4 print:border-neutral-300">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 print:border-neutral-300 print:text-neutral-600">
              <th className="pb-2 uppercase">DESKRIPSI ARTIKEL</th>
              <th className="pb-2 text-center uppercase">SKU</th>
              <th className="pb-2 text-right uppercase">QTY</th>
              <th className="pb-2 text-right uppercase">HARGA</th>
              <th className="pb-2 text-right uppercase">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 print:divide-neutral-200">
            {daftarItem.map((item) => (
              <tr key={item.id} className="text-neutral-300 print:text-black">
                <td className="py-2.5">
                  <span className="font-bold text-white print:text-black">
                    {item.namaProduk}
                  </span>
                  <span className="block text-[11px] text-neutral-400 print:text-neutral-600">
                    Varian: {item.namaVarian}
                  </span>
                </td>
                <td className="py-2.5 text-center text-neutral-400 print:text-neutral-700">
                  {item.sku}
                </td>
                <td className="py-2.5 text-right font-medium">{item.jumlah}</td>
                <td className="py-2.5 text-right">{formatRupiah(item.hargaSatuan)}</td>
                <td className="py-2.5 text-right font-bold text-white print:text-black">
                  {formatRupiah(item.subtotalItem)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ringkasan Biaya */}
      <div className="mt-4 border-t border-neutral-800 pt-4 font-mono text-xs print:border-neutral-300">
        <div className="ml-auto max-w-xs space-y-1.5">
          <div className="flex justify-between text-neutral-400 print:text-neutral-700">
            <span>SUBTOTAL PRODUK:</span>
            <span className="font-bold text-white print:text-black">
              {formatRupiah(subtotal)}
            </span>
          </div>
          {totalDiskon > 0 && (
            <div className="flex justify-between text-emerald-400 print:text-emerald-700">
              <span>
                POTONGAN DISKON {kodeVoucher ? `(${kodeVoucher})` : ""}:
              </span>
              <span className="font-bold">-{formatRupiah(totalDiskon)}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-400 print:text-neutral-700">
            <span>ONGKOS KIRIM:</span>
            <span className="font-bold text-white print:text-black">
              {formatRupiah(totalOngkir)}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 print:text-neutral-700">
            <span>PPN (NON-PKP):</span>
            <span>Rp 0</span>
          </div>
          <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm font-black text-white print:border-neutral-300 print:text-black">
            <span>TOTAL PEMBAYARAN:</span>
            <span className="text-emerald-400 print:text-black">
              {formatRupiah(totalAkhir)}
            </span>
          </div>
        </div>
      </div>

      {/* Barcode Code128 & Segel Integritas Kriptografis SHA-256 */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-neutral-800 pt-4 sm:flex-row print:border-neutral-300">
        <div className="flex items-center gap-3">
          <div
            className="overflow-hidden print:invert"
            dangerouslySetInnerHTML={{ __html: barcodeFakturSvg }}
          />
          <span className="font-mono text-[9px] text-neutral-400 uppercase print:text-neutral-700">
            VERIFIED // ELECTRONIC RECEIPT
          </span>
        </div>
        <div className="font-mono text-[9px] text-neutral-400 text-right print:text-neutral-700">
          {hashIntegrity ? (
            <>
              <span className="block font-bold text-emerald-400 print:text-black">
                SHA-256: {hashIntegrity.slice(0, 16)}...{hashIntegrity.slice(-8)}
              </span>
              <span className="text-neutral-400">IMMUTABLE ARCHIVE VERIFIED</span>
            </>
          ) : (
            <>KODE VERIFIKASI: {nomorPesanan.slice(0, 12).toUpperCase()}</>
          )}
        </div>
      </div>

      {/* Catatan Kaki Legal */}
      <div className="mt-4 border-t border-neutral-800 pt-3 font-mono text-[10px] text-neutral-400 print:border-neutral-300 print:text-neutral-700">
        <p>
          Faktur ini merupakan bukti transaksi resmi sah yang diterbitkan oleh sistem komputer VOID Supply.
          Segala pertanyaan pesanan dapat diajukan dengan menyertakan Nomor Faktur atau Nomor Pesanan.
        </p>
      </div>
    </div>
  );
}
