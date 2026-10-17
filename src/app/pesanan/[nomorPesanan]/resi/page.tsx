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
import { generateCode128Svg } from "@/lib/barcode/code128";
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
            AKSES DITOLAK (SEC-02)
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

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 print:m-0 print:max-w-none print:p-0">
      <div className="mb-6 flex justify-between print:hidden">
        <div>
          <span className="font-mono text-xs text-neutral-400 uppercase">
            THERMAL SHIPPING LABEL // 100 x 150 MM
          </span>
          <h1 className="font-mono text-xl font-black text-white uppercase">
            LABEL RESI PENGIRIMAN RESMI
          </h1>
        </div>
        <TombolCetakResi />
      </div>

      {/* Kontainer Label Stiker Thermal 100mm x 150mm */}
      <div className="mx-auto w-full max-w-105 border-2 border-dashed border-neutral-700 bg-white p-4 font-mono text-black print:m-0 print:w-full print:max-w-none print:border-none print:p-4">
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
                {kurirNama}
              </span>
              <span className="mt-0.5 block text-[10px] font-bold text-neutral-800 uppercase">
                {layananNama}
              </span>
            </div>
          </div>
        </div>

        {/* Section Nomor Resi / Barcode Visual Code 128 (Standar Ekspedisi Nasional) */}
        <div className="border-b-2 border-black py-3 text-center">
          <div
            className="mx-auto flex justify-center py-1"
            dangerouslySetInnerHTML={{
              __html: generateCode128Svg(nomorResi, {
                lebarBar: 2,
                tinggi: 54,
                tampilkanTeks: true,
              }),
            }}
          />
          <span className="mt-1 block text-[9px] text-neutral-600 uppercase">
            NO. PESANAN: {pesananDb.nomorPesanan}
          </span>
        </div>

        {/* Info Pengirim & Penerima */}
        <div className="grid grid-cols-2 gap-2 border-b-2 border-black py-2 text-[11px] leading-tight">
          <div className="border-r border-black pr-2">
            <span className="font-bold text-neutral-700 uppercase">DARI (PENGIRIM):</span>
            <p className="mt-0.5 font-black">Abdul Aziz // VOID Warehouse</p>
            <p className="text-[10px] text-neutral-800">08567060477</p>
            <p className="mt-1 text-[10px]">
              Jl. Johar Baru No. 10, Jakarta Pusat
            </p>
            <p className="text-[10px] font-bold">DKI JAKARTA, 10530</p>
          </div>

          <div className="pl-1">
            <span className="font-bold text-neutral-700 uppercase">KEPADA (PENERIMA):</span>
            <p className="mt-0.5 font-black">{pengirimanDb?.namaPenerima || pesananDb.namaPelanggan}</p>
            <p className="text-[10px] text-neutral-800">{pengirimanDb?.teleponPenerima || pesananDb.teleponPelanggan}</p>
            <p className="mt-1 text-[10px]">
              {pengirimanDb?.alamatLengkap || "Alamat tercatat"}
            </p>
            <p className="text-[10px] font-black uppercase">
              {pengirimanDb?.kota}, {pengirimanDb?.kodePos}
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
            <p className="font-black text-xs">NON-COD (LUNAS)</p>
          </div>
          <div className="px-1">
            <span className="text-neutral-600 uppercase">ASURANSI LOGISTIK</span>
            <p className="font-black text-xs text-emerald-800">TERCOVER</p>
          </div>
        </div>

        {/* Isi Paket Garmen */}
        <div className="border-b-2 border-black py-2 text-[10px]">
          <span className="font-bold uppercase">ISI KIRIMAN MERCHANDISE:</span>
          <ul className="mt-1 space-y-0.5">
            {itemsDb.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {item.jumlah}x {item.namaProduk} ({item.namaVarian})
                </span>
                <span className="font-bold">{item.sku}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Biteship Logistics Verification */}
        <div className="pt-2 text-center text-[9px] text-neutral-600">
          <p className="font-bold uppercase">
            LOGISTICS FULFILLMENT VERIFIED // POWERED BY BITESHIP API
          </p>
          <p>
            Wajib video unboxing untuk klaim asuransi // support@voidsupply.com
          </p>
        </div>
      </div>

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
