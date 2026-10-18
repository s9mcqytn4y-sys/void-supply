import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  db,
  pesanan,
  faktur,
  itemPesanan,
  pengiriman,
  pembayaran,
} from "@/lib/db";
import { arsipFaktur } from "@/lib/db/schema";
import { FakturTransaksi } from "@/features/checkout";
import { TombolCetakFaktur } from "./TombolCetakFaktur";

interface PropsHalamanFaktur {
  params: Promise<{
    nomorPesanan: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropsHalamanFaktur): Promise<Metadata> {
  const { nomorPesanan } = await params;
  return {
    title: `Faktur Resmi #${nomorPesanan} | VOID Supply`,
    description: "Faktur transaksi resmi dan bukti pembelian merchandise VOID Supply.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function HalamanFaktur({
  params,
  searchParams,
}: PropsHalamanFaktur) {
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
            Faktur ini hanya dapat diakses melalui perangkat yang sama saat melakukan pemesanan
            atau melalui tautan resmi yang dikirimkan ke email Anda.
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

  // 3. Ambil data faktur, item, pengiriman, dan pembayaran
  const [fakturDb] = await db
    .select()
    .from(faktur)
    .where(eq(faktur.pesananId, pesananDb.id))
    .limit(1);

  const itemsDb = await db
    .select()
    .from(itemPesanan)
    .where(eq(itemPesanan.pesananId, pesananDb.id));

  const [pengirimanDb] = await db
    .select()
    .from(pengiriman)
    .where(eq(pengiriman.pesananId, pesananDb.id))
    .limit(1);

  const [pembayaranDb] = await db
    .select()
    .from(pembayaran)
    .where(eq(pembayaran.pesananId, pesananDb.id))
    .limit(1);

  const nomorFaktur =
    fakturDb?.nomorFaktur ||
    `INV/${new Date(pesananDb.dibuatPada).toISOString().slice(0, 10).replace(/-/g, "")}/${pesananDb.nomorPesanan.slice(-5)}`;

  // Ambil arsip faktur legal snapshot (Murni read-only, tanpa mutasi efek samping pada request GET)
  const arsipFakturDb = fakturDb
    ? await db.query.arsipFaktur.findFirst({
        where: eq(arsipFaktur.fakturId, fakturDb.id),
      })
    : null;

  return (
    <>
      {/* Stylesheet Khusus Print A4 */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
            height: auto !important;
          }
          header, nav, footer, [data-testid="navbar"], [data-testid="footer"], .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            min-height: auto !important;
          }
        }
      `}</style>

      <main className="mx-auto min-h-[85vh] max-w-4xl px-4 py-8 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <TombolCetakFaktur />
        </div>

        <FakturTransaksi
          data={{
            nomorFaktur,
            nomorPesanan: pesananDb.nomorPesanan,
            dibuatPada: pesananDb.dibuatPada,
            statusPembayaran: pembayaranDb?.statusPembayaran || "menunggu_pembayaran",
            pelanggan: {
              nama: pesananDb.namaPelanggan,
              email: pesananDb.emailPelanggan,
              telepon: pesananDb.teleponPelanggan,
            },
            pengiriman: pengirimanDb
              ? {
                  alamatLengkap: pengirimanDb.alamatLengkap,
                  kota: pengirimanDb.kota,
                  provinsi: pengirimanDb.provinsi,
                  kodePos: pengirimanDb.kodePos,
                  kurir: pengirimanDb.kurir,
                  layanan: pengirimanDb.layanan,
                  nomorResi: pengirimanDb.nomorResi,
                }
              : null,
            daftarItem: itemsDb.map((item) => ({
              id: item.id,
              namaProduk: item.namaProduk,
              namaVarian: item.namaVarian,
              sku: item.sku,
              jumlah: item.jumlah,
              hargaSatuan: item.hargaSatuan,
              subtotalItem: item.subtotalItem,
            })),
            subtotal: pesananDb.subtotal,
            totalDiskon: pesananDb.totalDiskon,
            kodeVoucher: pesananDb.kodeVoucher,
            totalOngkir: pesananDb.totalOngkir,
            totalAkhir: pesananDb.totalAkhir,
            hashIntegrity: arsipFakturDb?.hashIntegrity || null,
          }}
        />
      </main>
    </>
  );
}
