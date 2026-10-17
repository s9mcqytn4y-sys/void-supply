import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Lacak Pengiriman // VOID Supply Logistics",
  description: "Lacak posisi paket dan status pengiriman ekspedisi pesanan VOID Supply secara real-time.",
};

interface PropsHalamanLacak {
  searchParams: Promise<{
    resi?: string;
    order?: string;
  }>;
}

export default async function HalamanLacakInduk({ searchParams }: PropsHalamanLacak) {
  const { resi, order } = await searchParams;
  const target = (order || resi)?.trim();

  if (target) {
    redirect(`/track/${encodeURIComponent(target)}`);
  }

  async function handleCari(formData: FormData) {
    "use server";
    const query = (formData.get("nomor") as string)?.trim();
    if (query) {
      redirect(`/track/${encodeURIComponent(query)}`);
    }
  }

  return (
    <main className="mx-auto min-h-[75vh] max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border border-neutral-800 bg-neutral-950 p-8 sm:p-12">
        <div className="border-b border-neutral-800 pb-6 text-center">
          <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase">
            SISTEM LOGISTIK & PELACAKAN // BITESHIP API
          </span>
          <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            LACAK PENGIRIMAN
          </h1>
          <p className="mt-2 font-mono text-xs text-neutral-400">
            Masukkan Nomor Pesanan (contoh: VOID-20261017-XXXX) atau Nomor Resi Ekspedisi Anda.
          </p>
        </div>

        <form action={handleCari} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="input-nomor"
              className="block font-mono text-xs font-medium text-neutral-300"
            >
              NOMOR PESANAN / NOMOR RESI AWB
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="input-nomor"
                name="nomor"
                type="text"
                required
                placeholder="Contoh: VOID-20261017-ABC12"
                className="min-h-11 flex-1 border border-neutral-800 bg-neutral-900 px-4 font-mono text-xs text-white focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-8 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
              >
                LACAK PAKET
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 border-t border-neutral-900 pt-6">
          <h2 className="font-mono text-xs font-bold text-neutral-300 uppercase">
            EKSPEDISI & MITRA LOGISTIK TERHUBUNG
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Gojek Instant",
              "Grab Instant",
              "J&T Express",
              "JNE",
              "SiCepat",
              "Anteraja",
              "Pos Indonesia",
              "TIKI",
            ].map((kurir) => (
              <span
                key={kurir}
                className="border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-[11px] text-neutral-400"
              >
                {kurir}
              </span>
            ))}
          </div>
          <p className="mt-4 font-mono text-[11px] text-neutral-500">
            Fulfillment dikirim langsung dari Johar Baru, Jakarta Pusat (10530) dengan asuransi pengiriman aktif.
          </p>
        </div>
      </div>
    </main>
  );
}
