import Link from "next/link";

export function FooterToko() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Kolom 1: Brand Info */}
          <div>
            <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">
              VOID SUPPLY
            </span>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-neutral-400">
              Label streetwear teknikal berorientasi fungsionalitas dan transparansi material.
              Dikonstruksi di Bandung, dirancang untuk iklim nokturnal perkotaan.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              EKSPLORASI
            </span>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              <li>
                <Link
                  href="/katalog"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  KATALOG // DROP 04
                </Link>
              </li>
              <li>
                <Link
                  href="/#manifesto"
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  FILOSOFI MANIFESTO
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan & Transparansi */}
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              KEBIJAKAN RILISAN
            </span>
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">
              Setiap artikel dirilis dalam jumlah terbatas berdasarkan spesifikasi teknis dan standar kurasi VOID Supply.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-neutral-900 pt-8 sm:flex-row">
          <p className="font-mono text-[11px] text-neutral-500">
            &copy; 2026 VOID SUPPLY. SELURUH HAK CIPTA DILINDUNGI.
          </p>
          <div className="mt-4 flex gap-4 font-mono text-[11px] text-neutral-500 sm:mt-0">
            <span>DROP 04 : NIGHT TRANSMISSION</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
