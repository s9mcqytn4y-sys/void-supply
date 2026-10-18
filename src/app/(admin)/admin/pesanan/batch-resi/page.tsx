import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { inArray, eq } from "drizzle-orm";
import { db, pesanan, pengiriman, itemPesanan } from "@/lib/db";
import { verifikasiStafAdmin } from "@/features/admin/actions/auth-guard";
import { LabelThermalPengiriman, type DataLabelPengiriman } from "@/features/shipping";
import { BilahKendaliCetakBulk } from "./BilahKendaliCetakBulk";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cetak Bulk Resi Thermal | Admin VOID Supply",
  description: "Cetak stiker resi thermal pengiriman massal 100mm x 150mm VOID Supply.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PropsHalamanBatchResi {
  searchParams: Promise<{
    orders?: string;
  }>;
}

export default async function HalamanBatchResiAdmin({
  searchParams,
}: PropsHalamanBatchResi) {
  // 1. Verifikasi Akses Staf Admin
  const cek = await verifikasiStafAdmin();
  if (!cek.sah || !cek.staf) {
    redirect("/admin/login");
  }

  const { orders } = await searchParams;
  const daftarNomor = (orders || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (daftarNomor.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 font-mono text-white">
        <div className="w-full max-w-md border-2 border-dashed border-zinc-700 bg-zinc-950 p-6 text-center space-y-4">
          <p className="text-xs uppercase text-zinc-500">// PARAMETER TIDAK LENGKAP</p>
          <h1 className="text-lg font-bold uppercase text-rose-400">
            Tidak Ada Pesanan yang Dipilih
          </h1>
          <p className="text-xs text-zinc-400">
            Pilih minimal satu pesanan pada tabel manajemen pesanan untuk mencetak resi pengiriman.
          </p>
          <Link
            href="/admin/pesanan"
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 text-xs font-bold uppercase text-black hover:bg-zinc-200 transition-colors"
          >
            KEMBALI KE DAFTAR PESANAN
          </Link>
        </div>
      </div>
    );
  }

  // 2. Ambil data pesanan, pengiriman, dan item pesanan
  const daftarPesananDb = await db
    .select({
      pesanan: pesanan,
      pengiriman: pengiriman,
    })
    .from(pesanan)
    .innerJoin(pengiriman, eq(pengiriman.pesananId, pesanan.id))
    .where(inArray(pesanan.nomorPesanan, daftarNomor));

  if (daftarPesananDb.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 font-mono text-white">
        <div className="w-full max-w-md border-2 border-dashed border-zinc-700 bg-zinc-950 p-6 text-center space-y-4">
          <p className="text-xs uppercase text-zinc-500">// PESANAN TIDAK DITEMUKAN</p>
          <h1 className="text-lg font-bold uppercase text-rose-400">
            Data Pesanan Tidak Valid
          </h1>
          <p className="text-xs text-zinc-400">
            Seluruh nomor pesanan yang diminta tidak ditemukan dalam basis data sistem.
          </p>
          <Link
            href="/admin/pesanan"
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 text-xs font-bold uppercase text-black hover:bg-zinc-200 transition-colors"
          >
            KEMBALI KE DAFTAR PESANAN
          </Link>
        </div>
      </div>
    );
  }

  // 3. Ambil seluruh item pesanan terkait
  const pesananIds = daftarPesananDb.map((p) => p.pesanan.id);
  const semuaItem = await db
    .select()
    .from(itemPesanan)
    .where(inArray(itemPesanan.pesananId, pesananIds));

  // Kelompokkan item per pesananId
  const itemPerPesanan = new Map<string, typeof semuaItem>();
  for (const it of semuaItem) {
    const list = itemPerPesanan.get(it.pesananId) || [];
    list.push(it);
    itemPerPesanan.set(it.pesananId, list);
  }

  // 4. Transformasi ke format DataLabelPengiriman
  const daftarLabel: DataLabelPengiriman[] = daftarPesananDb.map((item) => {
    const p = item.pesanan;
    const s = item.pengiriman;
    const items = itemPerPesanan.get(p.id) || [];

    const isLunas =
      p.statusPesanan !== "menunggu_pembayaran" &&
      p.statusPesanan !== "dibatalkan";

    const nomorResi =
      s.nomorResi || s.biteshipOrderId || `VOID-${p.nomorPesanan}`;

    return {
      nomorPesanan: p.nomorPesanan,
      nomorResi,
      kurir: (s.kurir || "ekspedisi").toUpperCase(),
      layanan: (s.layanan || "reguler").toUpperCase(),
      beratGram: s.beratTotalGram || 1000,
      isLunas,
      penerima: {
        nama: s.namaPenerima,
        telepon: s.teleponPenerima,
        alamatLengkap: s.alamatLengkap,
        kota: s.kota,
        kodePos: s.kodePos,
      },
      daftarItem: items.map((it) => ({
        namaProduk: it.namaProduk,
        namaVarian: it.namaVarian,
        sku: it.sku,
        jumlah: it.jumlah,
      })),
    };
  });

  return (
    <div className="min-h-screen bg-neutral-900 pb-16 print:bg-white print:p-0 print:m-0">
      {/* Bilah Kendali Toolbar Staf Admin (Sembunyi saat cetak) */}
      <BilahKendaliCetakBulk totalResi={daftarLabel.length} />

      {/* Kontainer Lembaran Label Thermal Kontinu 100x150 mm */}
      <main className="mx-auto max-w-4xl px-4 py-8 print:p-0 print:m-0 print:max-w-none">
        <div className="space-y-8 print:space-y-0">
          {daftarLabel.map((dataLabel) => (
            <div
              key={dataLabel.nomorPesanan}
              className="print:break-after-page print:page-break-after-always"
            >
              <LabelThermalPengiriman data={dataLabel} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
