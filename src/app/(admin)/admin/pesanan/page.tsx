import { ambilDaftarPesananAdminAction } from "@/features/admin/actions/pesanan-admin.action";
import {
  FilterStatusTabs,
  type OpsiFilterTab,
} from "@/features/admin/components/primitives";
import { TabelPesananAdminClient } from "@/features/admin/components/TabelPesananAdminClient";

export const dynamic = "force-dynamic";

const tabFilterPesanan: readonly OpsiFilterTab[] = [
  { id: "semua", label: "SEMUA" },
  { id: "menunggu_pembayaran", label: "MENUNGGU PEMBAYARAN" },
  { id: "diproses", label: "DIPROSES" },
  { id: "dikirim", label: "DIKIRIM" },
  { id: "selesai", label: "SELESAI" },
  { id: "dibatalkan", label: "DIBATALKAN" },
];

export default async function HalamanAdminPesanan({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cari?: string }>;
}) {
  const params = await searchParams;
  const res = await ambilDaftarPesananAdminAction({
    status: params.status,
    cari: params.cari,
  });

  const daftarPesanan = res.pesanan || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="font-mono text-2xl font-black text-white uppercase tracking-tight">
          MANAJEMEN PESANAN
        </h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">
          Daftar seluruh transaksi masuk, status gateway pembayaran, dan penjemputan logistik kurir.
        </p>
      </div>

      {/* Filter Tabs */}
      <FilterStatusTabs opsi={tabFilterPesanan} paramKunci="status" />

      {/* Tabel Data Pesanan Interaktif dengan Batch Fulfillment */}
      <TabelPesananAdminClient daftarPesanan={daftarPesanan} />
    </div>
  );
}
