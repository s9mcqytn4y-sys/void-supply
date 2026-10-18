import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity, Terminal } from "lucide-react";
import { ambilDaftarAktivitasAdminAction } from "@/features/admin/actions/aktivitas-admin.action";
import {
  TabelDataAdmin,
  BadgeStatusOperasional,
} from "@/features/admin/components/primitives";

export const metadata = {
  title: "Audit Aktivitas Staf | VOID Supply Internal Ops",
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

export default async function HalamanAuditAktivitasAdmin() {
  const { log = [], pesan } = await ambilDaftarAktivitasAdminAction();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              KEMBALI KE DASBOR
            </Link>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-zinc-400" />
            AUDIT AKTIVITAS STAF
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Rekam jejak kepatuhan dan keamanan seluruh tindakan administratif staf internal: mutasi stok, pembatalan pesanan, dan penambahan catatan.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border border-zinc-800 bg-zinc-900 text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          AUDIT ENGINE SECURE
        </div>
      </div>

      {pesan && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
          {pesan}
        </div>
      )}

      {/* Summary Count Bar */}
      <div className="flex items-center justify-between text-xs font-mono px-3 py-2 bg-zinc-900/60 border border-zinc-800 text-zinc-400">
        <span>LOG TEREKAM: {log.length} AKTIVITAS TERAKHIR</span>
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          SERVER TIMESTAMP RECORDED
        </span>
      </div>

      {/* Tabel Data Audit */}
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
            kunci: "staf",
            label: "STAF ADMIN",
            render: (baris) => (
              <div>
                <p className="font-medium text-white text-xs">{baris.adminNama}</p>
                <p className="text-[11px] font-mono text-zinc-400">{baris.adminEmail}</p>
              </div>
            ),
          },
          {
            kunci: "tindakan",
            label: "TINDAKAN",
            render: (baris) => (
              <BadgeStatusOperasional
                status={baris.tindakan}
                label={baris.tindakan.toUpperCase().replace(/_/g, " ")}
              />
            ),
          },
          {
            kunci: "targetId",
            label: "TARGET ENTITAS",
            render: (baris) => (
              <span className="text-xs font-mono text-zinc-300 px-2 py-1 bg-zinc-900 border border-zinc-800">
                {baris.targetId || "N/A"}
              </span>
            ),
          },
          {
            kunci: "payload",
            label: "PAYLOAD & PARAMETER",
            render: (baris) => {
              if (!baris.payloadAman) {
                return <span className="text-xs text-zinc-400">-</span>;
              }
              return (
                <div className="max-w-md bg-zinc-950 p-2 border border-zinc-800/80 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
                  {Object.entries(baris.payloadAman).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-zinc-400">{k}:</span>
                      <span className="text-zinc-200 font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              );
            },
          },
        ]}
        data={log}
        kunciUnik={(baris) => baris.id}
        pesanKosong="Belum ada aktivitas administratif staf yang terekam pada sistem."
      />
    </div>
  );
}
