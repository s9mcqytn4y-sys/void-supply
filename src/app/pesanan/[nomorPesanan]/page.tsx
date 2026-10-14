import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ambilStatusPesanan } from "@/features/checkout/actions/status-pesanan.action";
import { KartuStatusPesanan } from "@/features/checkout/components/KartuStatusPesanan";

interface PropsHalamanStatusPesanan {
  params: Promise<{
    nomorPesanan: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropsHalamanStatusPesanan): Promise<Metadata> {
  const { nomorPesanan } = await params;
  return {
    title: `Status Pesanan #${nomorPesanan} | VOID Supply`,
    description: "Status transaksi dan rincian pemesanan merchandise VOID Supply.",
    robots: {
      index: false,
      follow: false,
    },
    referrer: "no-referrer",
  };
}

export default async function HalamanStatusPesanan({
  params,
  searchParams,
}: PropsHalamanStatusPesanan) {
  const { nomorPesanan } = await params;
  const { token } = await searchParams;
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(`void_order_token_${nomorPesanan}`)?.value;

  // Jika token dikirim via URL, alihkan ke endpoint /access agar browser history tersanitasi menjadi cookie
  if (token && typeof token === "string" && !tokenCookie) {
    const { redirect } = await import("next/navigation");
    redirect(`/pesanan/${nomorPesanan}/access?token=${encodeURIComponent(token.trim())}`);
  }

  const tokenAksesStr = (tokenCookie || (typeof token === "string" ? token.trim() : undefined))?.trim();
  const hasil = await ambilStatusPesanan(nomorPesanan, tokenAksesStr);

  if (!hasil.sukses || !hasil.data) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="border border-neutral-800 bg-neutral-950 p-8 sm:p-12">
          <span className="font-mono text-xs font-bold text-rose-400 uppercase">
            PESANAN TIDAK DITEMUKAN
          </span>
          <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            DATA TIDAK TERSEDIA
          </h1>
          <p className="mt-4 font-mono text-xs text-neutral-400">
            Nomor pesanan &apos;{nomorPesanan}&apos; tidak tercatat dalam basis data
            kami atau telah dihapus.
          </p>
          <div className="mt-8">
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
            >
              KEMBALI KE KATALOG
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <KartuStatusPesanan pesananAwal={hasil.data} tokenAkses={tokenAksesStr} />
    </main>
  );
}
