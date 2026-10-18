"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Clock, ExternalLink, FileText, RefreshCw } from "lucide-react";
import type { PesananAkunItem } from "../actions/pesanan-akun.action";
import { ModalKlaimPesanan } from "./ModalKlaimPesanan";

interface DaftarPesananAkunProps {
  pesananAwal: PesananAkunItem[];
  onRefresh?: () => void;
}

export function DaftarPesananAkun({
  pesananAwal,
}: DaftarPesananAkunProps) {
  const [filterStatus, setFilterStatus] = useState<string>("SEMUA");
  const [daftarPesanan, setDaftarPesanan] = useState<PesananAkunItem[]>(pesananAwal);

  const statusOptions = [
    { label: "SEMUA", value: "SEMUA" },
    { label: "MENUNGGU BAYAR", value: "menunggu_pembayaran" },
    { label: "DIPROSES", value: "diproses" },
    { label: "DIKIRIM", value: "dikirim" },
    { label: "SELESAI", value: "selesai" },
    { label: "BATAL", value: "dibatalkan" },
  ];

  const pesananTersaring = daftarPesanan.filter((p) => {
    if (filterStatus === "SEMUA") return true;
    return p.statusPesanan === filterStatus;
  });

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "menunggu_pembayaran":
        return "border-amber-400/80 bg-amber-950/40 text-amber-300";
      case "diproses":
        return "border-blue-400/80 bg-blue-950/40 text-blue-300";
      case "dikirim":
        return "border-purple-400/80 bg-purple-950/40 text-purple-300";
      case "selesai":
        return "border-emerald-400/80 bg-emerald-950/40 text-emerald-300";
      case "dibatalkan":
        return "border-zinc-700 bg-zinc-900 text-zinc-400";
      default:
        return "border-zinc-700 bg-zinc-900 text-zinc-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman & Tombol Klaim */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="font-mono text-lg font-bold text-white uppercase tracking-wider">
            RIWAYAT PESANAN RESMI
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Daftar seluruh transaksi yang terhubung secara server-authoritative dengan akun Anda
          </p>
        </div>
        <ModalKlaimPesanan onSukses={() => window.location.reload()} />
      </div>

      {/* Filter Tabs Horizontal */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilterStatus(opt.value)}
            className={`min-h-11 shrink-0 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors border ${
              filterStatus === opt.value
                ? "border-white bg-white text-black"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Daftar Kartu Pesanan */}
      {pesananTersaring.length > 0 ? (
        <div className="space-y-4">
          {pesananTersaring.map((p) => (
            <article
              key={p.id}
              className="border border-zinc-800 bg-zinc-950 p-5 space-y-4"
            >
              {/* Header Kartu Pesanan */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white uppercase">
                      #{p.nomorPesanan}
                    </span>
                    <span
                      className={`inline-block border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(
                        p.statusPesanan
                      )}`}
                    >
                      {p.statusPesanan.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 font-mono text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(p.dibuatPada).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
                    TOTAL TRANSAKSI
                  </span>
                  <span className="font-mono text-base font-extrabold text-white">
                    Rp {p.totalAkhir.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Rincian Item Artikel */}
              <div className="space-y-2 py-1">
                {p.daftarItem.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between font-mono text-xs text-zinc-300"
                  >
                    <div className="truncate pr-4">
                      <span className="text-white font-medium">
                        {item.namaProduk}
                      </span>{" "}
                      <span className="text-zinc-400">
                        ({item.namaVarian} // Ukuran {item.ukuran}) &times; {item.jumlah}
                      </span>
                    </div>
                    <span className="shrink-0 text-zinc-400">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status Logistik & Resi (Bila Ada) */}
              {(p.nomorResi || p.kurir) && (
                <div className="border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-zinc-400 uppercase tracking-wider">
                      EKSPEDISI:
                    </span>{" "}
                    <span className="text-white font-bold">
                      {p.kurir?.toUpperCase()} {p.layanan}
                    </span>
                    {p.nomorResi && (
                      <span className="ml-2 text-zinc-300">
                        [ Resi: {p.nomorResi} ]
                      </span>
                    )}
                  </div>
                  {p.nomorResi && (
                    <Link
                      href={`/lacak?resi=${p.nomorResi}`}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>LACAK PAKET</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-900">
                <Link
                  href={`/pesanan/${p.nomorPesanan}?token=${p.tokenAkses}`}
                  className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-5 py-2 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  RINCIAN & PEMBAYARAN
                </Link>

                <Link
                  href={`/pesanan/${p.nomorPesanan}/faktur?token=${p.tokenAkses}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs font-semibold text-zinc-200 uppercase tracking-wider hover:border-zinc-600 hover:text-white transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>FAKTUR RESMI</span>
                </Link>

                {p.nomorResi && (
                  <Link
                    href={`/pesanan/${p.nomorPesanan}/resi?token=${p.tokenAkses}`}
                    className="inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs font-semibold text-zinc-200 uppercase tracking-wider hover:border-zinc-600 hover:text-white transition-colors"
                  >
                    LABEL PENGIRIMAN
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
          <Package className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            TIDAK ADA PESANAN
          </p>
          <p className="font-mono text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Tidak ditemukan riwayat pesanan dengan filter status yang dipilih.
          </p>
          <div className="mt-6">
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-zinc-200 transition-colors"
            >
              JELAJAHI KATALOG DROP 04
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
