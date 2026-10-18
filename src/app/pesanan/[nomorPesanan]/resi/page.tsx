import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  db,
  pesanan,
  pengiriman,
  itemPesanan,
} from "@/lib/db";
import { LabelThermalPengiriman } from "@/features/shipping";
import { TombolCetakResi } from "./TombolCetakResi";

interface PropsHalamanResi {
  params: Promise<{
    nomorPesanan: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropsHalamanResi): Promise<Metadata> {
  const { nomorPesanan } = await params;
  return {
    title: `Label Resi Pengiriman #${nomorPesanan} | VOID Supply`,
    description: "Label thermal pengiriman resmi standar Biteship x VOID Supply.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function HalamanResiThermal({
  params,
  searchParams,
}: PropsHalamanResi) {
  const { nomorPesanan } = await params;
  const { token } = await searchParams;
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(`void_order_token_${nomorPesanan}`)?.value;
  const tokenPengguna = (tokenCookie || (typeof token === "string" ? token.trim() : undefined))?.trim();

  // 1. Ambil data pesanan
  const [pesananDb] = await db
    .select()
    .from(pesanan)
    .where(eq(pesanan.nomorPesanan, nomorPesanan))
    .limit(1);

  if (!pesananDb) {
    notFound();
  }

  // 2. Proteksi IDOR (SEC-02): Verifikasi token akses
  const isAuthorized =
    Boolean(pesananDb.tokenAkses) &&
    Boolean(tokenPengguna) &&
    tokenPengguna === pesananDb.tokenAkses;

  if (!isAuthorized) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="border border-neutral-800 bg-neutral-950 p-8">
          <span className="font-mono text-xs font-bold text-rose-400 uppercase">
            AKSES DITOLAK
          </span>
          <h1 className="mt-2 font-mono text-xl font-black text-white uppercase">
            OTORISASI TIDAK VALID
          </h1>
          <p className="mt-4 font-mono text-xs text-neutral-400">
            Label resi ini hanya dapat diakses melalui perangkat yang sama saat melakukan pemesanan
            atau tautan resmi dengan token otentikasi.
          </p>
          <div className="mt-6">
            <Link
              href={`/pesanan/${nomorPesanan}`}
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase hover:bg-neutral-200"
            >
              LIHAT STATUS PESANAN
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Ambil data pengiriman & artikel
  const [pengirimanDb] = await db
    .select()
    .from(pengiriman)
    .where(eq(pengiriman.pesananId, pesananDb.id))
    .limit(1);

  const itemsDb = await db
    .select()
    .from(itemPesanan)
    .where(eq(itemPesanan.pesananId, pesananDb.id));

  const nomorResi = pengirimanDb?.nomorResi || `VOID-${(pengirimanDb?.kurir || "JNE").toUpperCase()}-PENDING`;
  const kurirNama = pengirimanDb?.kurir || "JNE";
  const layananNama = pengirimanDb?.layanan || "Reguler";
  const beratGram = pengirimanDb?.beratTotalGram || 500;

  const isLunas = ["dibayar", "diproses", "dikirim", "selesai"].includes(pesananDb.statusPesanan);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 print:m-0 print:max-w-none print:p-0">
      {/* CSS Cetak Standar Thermal 100 x 150 mm */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: 100mm 150mm;
              margin: 0;
            }
            @media print {
              html, body {
                width: 100mm !important;
                height: 150mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background-color: #ffffff !important;
              }
            }
          `,
        }}
      />

      <div className="mb-6 flex justify-between print:hidden">
        <div>
          <span className="font-mono text-xs text-neutral-400 uppercase">
            THERMAL SHIPPING LABEL // 100 x 150 MM
          </span>
          <h1 className="font-mono text-xl font-black text-white uppercase">
            LABEL PENGIRIMAN THERMAL
          </h1>
        </div>
        <TombolCetakResi />
      </div>

      {/* Label Stiker Thermal 100mm x 150mm Modular */}
      <LabelThermalPengiriman
        data={{
          nomorPesanan: pesananDb.nomorPesanan,
          nomorResi,
          kurir: kurirNama,
          layanan: layananNama,
          beratGram,
          isLunas,
          penerima: {
            nama: pengirimanDb?.namaPenerima || pesananDb.namaPelanggan,
            telepon: pengirimanDb?.teleponPenerima || pesananDb.teleponPelanggan,
            alamatLengkap: pengirimanDb?.alamatLengkap || "Alamat tercatat",
            kota: pengirimanDb?.kota || "Jakarta Pusat",
            kodePos: pengirimanDb?.kodePos || "10560",
          },
          daftarItem: itemsDb.map((item) => ({
            namaProduk: item.namaProduk,
            namaVarian: item.namaVarian,
            sku: item.sku,
            jumlah: item.jumlah,
          })),
        }}
      />

      {/* Referensi Contoh Resi Fisik Standar Biteship */}
      <div className="mt-8 border border-neutral-800 bg-neutral-950 p-6 print:hidden">
        <h3 className="border-b border-neutral-800 pb-2 font-mono text-xs font-bold text-neutral-300 uppercase">
          REFERENSI STANDAR CETAK STIKER BITESHIP
        </h3>
        <p className="mt-2 font-mono text-[11px] text-neutral-400">
          Stiker thermal ini kompatibel dengan printer label Blueprint, Xprinter, Zebra, dan printer resi ekspedisi standar 100mm x 150mm.
        </p>
        <div className="mt-4 flex justify-center">
          <div className="relative aspect-4/3 w-full max-w-xs overflow-hidden border border-neutral-800">
            <Image
              src="/images/shipping/sample-resi-biteship.jpg"
              alt="Contoh Resi Standar Biteship x VOID Supply"
              fill
              className="object-contain"
              sizes="320px"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
