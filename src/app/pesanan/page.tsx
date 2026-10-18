import { redirect } from "next/navigation";

interface PropertiHalamanPesanan {
  searchParams: Promise<{
    order_id?: string;
    orderId?: string;
    nomor_pesanan?: string;
    [key: string]: string | undefined;
  }>;
}

export const dynamic = "force-dynamic";

export default async function HalamanPesananGatewayRedirect({
  searchParams,
}: PropertiHalamanPesanan) {
  const query = await searchParams;
  const nomorPesanan = query.order_id || query.orderId || query.nomor_pesanan;

  if (nomorPesanan && nomorPesanan.trim().length > 0) {
    const params = new URLSearchParams();
    for (const [kunci, nilai] of Object.entries(query)) {
      if (
        kunci !== "order_id" &&
        kunci !== "orderId" &&
        kunci !== "nomor_pesanan" &&
        nilai !== undefined
      ) {
        params.set(kunci, nilai);
      }
    }
    const sisaQuery = params.toString();
    const tujuan = `/pesanan/${encodeURIComponent(nomorPesanan.trim())}${
      sisaQuery ? `?${sisaQuery}` : ""
    }`;
    redirect(tujuan);
  }

  // Jika diakses tanpa parameter nomor pesanan, arahkan ke rute pelacakan publik
  redirect("/lacak");
}
