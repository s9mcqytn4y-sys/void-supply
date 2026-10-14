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
import { formatRupiah } from "@/lib/utils";
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
            AKSES DITOLAK (SEC-02)
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
    `INV/${pesananDb.dibuatPada.toISOString().slice(0, 10).replace(/-/g, "")}/${pesananDb.nomorPesanan.slice(-5)}`;

  return (
    <main className="mx-auto min-h-[85vh] max-w-4xl px-4 py-12 sm:px-6 lg:px-8 print:p-0">
      <div className="mb-6 flex items-center justify-between">
        <TombolCetakFaktur />
      </div>

      <div className="border border-neutral-800 bg-neutral-950 p-8 sm:p-12 print:border-none print:bg-white print:p-0 print:text-black">
        {/* Header Faktur */}
        <div className="flex flex-col justify-between gap-6 border-b border-neutral-800 pb-8 sm:flex-row print:border-neutral-300">
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase print:text-neutral-600">
              FAKTUR RESMI PEMBELIAN // VOID SUPPLY
            </span>
            <h1 className="mt-1 font-mono text-3xl font-black text-white uppercase print:text-black">
              VOID SUPPLY
            </h1>
            <p className="mt-1 font-mono text-xs text-neutral-400 print:text-neutral-600">
              Jl. Percetakan Negara No. 18, Johar Baru, Jakarta Pusat 10560
            </p>
            <p className="font-mono text-xs text-neutral-400 print:text-neutral-600">
              Email: support@voidsupply.com // voidsupply.com
            </p>
          </div>

          <div className="text-left font-mono text-xs sm:text-right">
            <span className="inline-block border border-emerald-500/50 bg-emerald-950/40 px-3 py-1 font-bold text-emerald-400 uppercase print:border-emerald-700 print:bg-emerald-50 print:text-emerald-800">
              STATUS: {pembayaranDb?.statusPembayaran === "berhasil" ? "LUNAS (PAID)" : "TERCATAT"}
            </span>
            <p className="mt-3 font-bold text-white print:text-black">
              NO. FAKTUR: {nomorFaktur}
            </p>
            <p className="text-neutral-400 print:text-neutral-600">
              NO. PESANAN: {pesananDb.nomorPesanan}
            </p>
            <p className="text-neutral-400 print:text-neutral-600">
              TANGGAL:{" "}
              {new Date(pesananDb.dibuatPada).toLocaleDateString("id-ID", {
                dateStyle: "long",
              })}
            </p>
          </div>
        </div>

        {/* Informasi Pembeli & Pengiriman */}
        <div className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2">
          <div>
            <h2 className="font-mono text-xs font-bold text-white uppercase print:text-black">
              TAGIHAN KEPADA
            </h2>
            <p className="mt-2 font-mono text-xs font-bold text-neutral-200 print:text-black">
              {pesananDb.namaPelanggan}
            </p>
            <p className="font-mono text-xs text-neutral-400 print:text-neutral-600">
              {pesananDb.emailPelanggan}
            </p>
            <p className="font-mono text-xs text-neutral-400 print:text-neutral-600">
              {pesananDb.teleponPelanggan}
            </p>
          </div>

          <div>
            <h2 className="font-mono text-xs font-bold text-white uppercase print:text-black">
              ALAMAT PENGIRIMAN
            </h2>
            <p className="mt-2 font-mono text-xs text-neutral-200 print:text-black">
              {pengirimanDb?.alamatLengkap || "Alamat tidak tercatat"}
            </p>
            <p className="font-mono text-xs text-neutral-400 print:text-neutral-600">
              {pengirimanDb?.kota}, {pengirimanDb?.provinsi} {pengirimanDb?.kodePos}
            </p>
            <p className="font-mono text-xs text-neutral-400 print:text-neutral-600">
              Kurir: {pengirimanDb?.kurir} ({pengirimanDb?.layanan})
            </p>
          </div>
        </div>

        {/* Tabel Rincian Artikel */}
        <div className="border-t border-neutral-800 pt-6 print:border-neutral-300">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 print:border-neutral-300 print:text-neutral-600">
                <th className="pb-3 uppercase">DESKRIPSI ARTIKEL</th>
                <th className="pb-3 text-center uppercase">SKU</th>
                <th className="pb-3 text-right uppercase">QTY</th>
                <th className="pb-3 text-right uppercase">HARGA</th>
                <th className="pb-3 text-right uppercase">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 print:divide-neutral-200">
              {itemsDb.map((item) => (
                <tr key={item.id} className="text-neutral-300 print:text-black">
                  <td className="py-3">
                    <span className="font-bold text-white print:text-black">
                      {item.namaProduk}
                    </span>
                    <span className="block text-[11px] text-neutral-400 print:text-neutral-600">
                      Varian: {item.namaVarian}
                    </span>
                  </td>
                  <td className="py-3 text-center text-neutral-400 print:text-neutral-600">
                    {item.sku}
                  </td>
                  <td className="py-3 text-right">{item.jumlah}</td>
                  <td className="py-3 text-right">{formatRupiah(item.hargaSatuan)}</td>
                  <td className="py-3 text-right font-bold text-white print:text-black">
                    {formatRupiah(item.subtotalItem)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Biaya */}
        <div className="mt-8 border-t border-neutral-800 pt-6 font-mono text-xs print:border-neutral-300">
          <div className="ml-auto max-w-xs space-y-2">
            <div className="flex justify-between text-neutral-400 print:text-neutral-600">
              <span>SUBTOTAL PRODUK:</span>
              <span className="font-bold text-white print:text-black">
                {formatRupiah(pesananDb.subtotal)}
              </span>
            </div>
            {pesananDb.totalDiskon > 0 && (
              <div className="flex justify-between text-emerald-400 print:text-emerald-700">
                <span>
                  POTONGAN DISKON {pesananDb.kodeVoucher ? `(${pesananDb.kodeVoucher})` : ""}:
                </span>
                <span className="font-bold">-{formatRupiah(pesananDb.totalDiskon)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-400 print:text-neutral-600">
              <span>ONGKOS KIRIM:</span>
              <span className="font-bold text-white print:text-black">
                {formatRupiah(pesananDb.totalOngkir)}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm font-black text-white print:border-neutral-300 print:text-black">
              <span>TOTAL PEMBAYARAN:</span>
              <span className="text-emerald-400 print:text-black">
                {formatRupiah(pesananDb.totalAkhir)}
              </span>
            </div>
          </div>
        </div>

        {/* Catatan Kaki Legal */}
        <div className="mt-12 border-t border-neutral-800 pt-6 font-mono text-[11px] text-neutral-500 print:border-neutral-300 print:text-neutral-600">
          <p>
            Faktur ini merupakan bukti transaksi yang sah diterbitkan oleh sistem komputer VOID Supply.
            Segala pertanyaan mengenai pesanan ini dapat diajukan dengan menyertakan Nomor Faktur atau Nomor Pesanan.
          </p>
          <p className="mt-1">
            Dicetak secara elektronik pada {new Date().toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </main>
  );
}
