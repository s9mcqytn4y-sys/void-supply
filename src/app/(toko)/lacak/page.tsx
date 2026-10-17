import type { Metadata } from "next";
import { HalamanLacakClient } from "@/features/shipping/components/HalamanLacakClient";
import { lacakPengirimanPublikAction } from "@/features/shipping/actions/lacak.action";

export const metadata: Metadata = {
  title: "Lacak Pengiriman // VOID Supply",
  description: "Pantau status pengiriman logistik, pergerakan kurir, dan nomor resi pesanan VOID Supply secara real-time.",
};

interface PropsHalamanLacak {
  searchParams: Promise<{
    q?: string;
    resi?: string;
    pesanan?: string;
  }>;
}

export default async function HalamanLacak({ searchParams }: PropsHalamanLacak) {
  const params = await searchParams;
  const kataKunci = params.q || params.resi || params.pesanan || "";

  let initialData = null;
  if (kataKunci && kataKunci.trim().length >= 4) {
    const res = await lacakPengirimanPublikAction(kataKunci.trim());
    if (res.sukses && res.data) {
      initialData = res.data;
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <HalamanLacakClient
        initialQuery={kataKunci}
        initialData={initialData}
      />
    </main>
  );
}
