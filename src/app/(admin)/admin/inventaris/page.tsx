import Link from "next/link";
import { ambilInventarisAdminAction } from "@/features/admin/actions/stok-admin.action";
import { TabelInventarisAdminClient } from "@/features/admin/components/TabelInventarisAdminClient";
import { FilterStatusTabs, type OpsiFilterTab } from "@/features/admin/components/primitives";
import { History, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const opsiFilterInventaris: readonly OpsiFilterTab[] = [
  { id: "semua", label: "SEMUA SKU ARTIKEL" },
  { id: "kritis", label: "STOK MENIPIS (<= 5 UNIT)" },
];

export default async function HalamanAdminInventaris({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cari?: string }>;
}) {
  const params = await searchParams;
  const hanyaKritis = params.status === "kritis";

  const res = await ambilInventarisAdminAction({
    cari: params.cari,
    hanyaKritis,
  });

  const daftarInventaris = res.inventaris || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="font-mono text-2xl font-black text-white uppercase tracking-tight">
            INVENTARIS & KONTROL STOK
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Manajemen ketersediaan kuota fisik seluruh SKU dan varian artikel VOID Supply.
          </p>
        </div>

        <Link
          href="/admin/inventaris/mutasi"
          className="inline-flex min-h-11 items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 font-mono text-xs font-semibold text-zinc-200 uppercase hover:border-zinc-500 hover:text-white transition-colors"
        >
          <History className="h-4 w-4 text-zinc-400" />
          <span>BUKU BESAR MUTASI</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <FilterStatusTabs opsi={opsiFilterInventaris} paramKunci="status" />

      {/* Tabel Interaktif */}
      <TabelInventarisAdminClient daftarInventaris={daftarInventaris} />
    </div>
  );
}
