import React from "react";
import Link from "next/link";
import { ArrowLeft, History, FileSpreadsheet, Package } from "lucide-react";
import { ambilRiwayatMutasiStokAction } from "@/features/admin/actions/stok-admin.action";
import {
  TabelDataAdmin,
  BadgeStatusOperasional,
} from "@/features/admin/components/primitives";

export const metadata = {
  title: "Buku Besar Mutasi Stok | VOID Supply Internal Ops",
  robots: { index: false, follow: false },
};

function formatWaktuWIB(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(d);
  } catch {
    return isoString;
  }
}

export default async function HalamanBukuBesarMutasiStok() {
  const { mutasi = [], pesan } = await ambilRiwayatMutasiStokAction();

  return (
    <div className="space-y-6">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/inventaris"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              KEMBALI KE INVENTARIS
            </Link>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
            <History className="w-6 h-6 text-zinc-400" />
            BUKU BESAR MUTASI STOK
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Catatan log imutabel perubahan inventaris, restock, koreksi audit fisik, dan reservasi pesanan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventaris"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 min-h-11 transition-colors"
          >
            <Package className="w-4 h-4 text-zinc-400" />
            Kelola Stok SKU
          </Link>
        </div>
      </div>

      {pesan && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
          {pesan}
        </div>
      )}

      {/* Summary Count Bar */}
      <div className="flex items-center justify-between text-xs font-mono px-3 py-2 bg-zinc-900/60 border border-zinc-800 text-zinc-400">
        <span>TOTAL REKAMAN: {mutasi.length} ENTRI TERAKHIR</span>
        <span className="flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          IMMUTABLE LEDGER ACTIVE
        </span>
      </div>

      {/* Tabel Data Mutasi */}
      <TabelDataAdmin
        kolom={[
          {
            kunci: "waktu",
            label: "WAKTU (WIB)",
            render: (baris) => (
              <span className="text-xs font-mono text-zinc-400 whitespace-nowrap">
                {formatWaktuWIB(baris.dibuatPada)}
              </span>
            ),
          },
          {
            kunci: "produk",
            label: "PRODUK & SKU",
            render: (baris) => (
              <div>
                <p className="font-medium text-white">{baris.namaProduk}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {baris.namaVarian}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {baris.sku}
                  </span>
                </div>
              </div>
            ),
          },
          {
            kunci: "jenisMutasi",
            label: "JENIS MUTASI",
            render: (baris) => (
              <BadgeStatusOperasional
                status={baris.jenisMutasi}
                label={baris.jenisMutasi.toUpperCase().replace("_", " ")}
              />
            ),
          },
          {
            kunci: "kuantitasSebelum",
            label: "SEBELUM",
            render: (baris) => (
              <span className="text-xs font-mono text-zinc-400">
                {baris.kuantitasSebelum}
              </span>
            ),
          },
          {
            kunci: "perubahan",
            label: "PERUBAHAN",
            render: (baris) => {
              const positif = baris.perubahan > 0;
              const nol = baris.perubahan === 0;
              return (
                <span
                  className={`text-xs font-mono font-bold ${
                    positif
                      ? "text-emerald-400"
                      : nol
                      ? "text-zinc-400"
                      : "text-rose-400"
                  }`}
                >
                  {positif ? `+${baris.perubahan}` : baris.perubahan}
                </span>
              );
            },
          },
          {
            kunci: "kuantitasSesudah",
            label: "SESUDAH",
            render: (baris) => (
              <span className="text-xs font-mono font-bold text-white">
                {baris.kuantitasSesudah}
              </span>
            ),
          },
          {
            kunci: "referensi",
            label: "REFERENSI & CATATAN",
            render: (baris) => (
              <div className="max-w-xs">
                {baris.nomorReferensi ? (
                  <p className="text-xs font-mono text-amber-300/90 font-medium">
                    Ref: {baris.nomorReferensi}
                  </p>
                ) : null}
                <p className="text-xs text-zinc-400 italic mt-0.5">
                  {baris.catatan || "Tidak ada catatan."}
                </p>
              </div>
            ),
          },
        ]}
        data={mutasi}
        kunciUnik={(baris) => baris.id}
        pesanKosong="Belum ada riwayat mutasi stok yang tercatat pada sistem."
      />
    </div>
  );
}
