import Image from "next/image";

export function FiturUtamaMaterial() {
  return (
    <section
      aria-label="Editorial Lookbook dan Rekayasa Garmen Drop 04"
      className="border-t border-zinc-800 bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
              LOOKBOOK ARCHIVE // DROP 04 CAMPAIGN
            </span>
            <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
              SILUET BRUTALIS & KONSTRUKSI TEKSTIL
            </h2>
          </div>
          <div className="font-mono text-xs text-zinc-500">
            ARSIP RESMI // JOHAR BARU, JAKARTA PUSAT (10560)
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Visual Utama: Editorial Campaign Frame */}
          <div className="group relative overflow-hidden border border-zinc-800 bg-zinc-900 lg:col-span-8">
            <div className="relative aspect-video w-full">
              <Image
                src="/images/lookbook/drop-04-editorial-campaign.jpg"
                alt="Kampanye Editorial VOID Supply Drop 04 dalam lanskap arsitektur beton brutalis"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-102"
              />
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 border border-zinc-800/90 bg-zinc-950/85 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DROP 04 // LIVE RUN</span>
            </div>
            <div className="absolute right-4 bottom-4 border border-zinc-800/90 bg-zinc-950/85 px-3 py-1.5 font-mono text-[11px] tracking-wider text-zinc-300 uppercase backdrop-blur-xs">
              EDISI KURASI 2026 // MONOKROM TEKSTURAL
            </div>
          </div>

          {/* Kolom Kanan: Detail Makro Kain & Segel Otentik */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* Kartu Segel Resmi */}
            <div className="flex items-center gap-4 border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-zinc-700 bg-zinc-950">
                <Image
                  src="/images/brand/void-drop04-seal.jpg"
                  alt="Segel Otentikasi VOID Supply Drop 04 Archive Edition"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase">
                  DETAIL KONSTRUKSI
                </span>
                <h3 className="font-mono text-sm font-bold text-white uppercase">
                  VOID ARCHIVE EDITION
                </h3>
                <p className="mt-0.5 font-mono text-xs text-zinc-400">
                  Diproduksi dengan toleransi presisi dan penguncian jahitan ganda.
                </p>
              </div>
            </div>

            {/* Kartu Makro Kerapatan Kain */}
            <div className="flex flex-1 flex-col justify-between border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700">
              <div className="group relative aspect-4/3 w-full overflow-hidden border border-zinc-800 bg-zinc-950">
                <Image
                  src="/images/brand/fabric-density-macro.jpg"
                  alt="Detail makro serat katun 420 GSM loopback dengan jahitan dobel rantai"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute right-2 bottom-2 bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                  INSPEKSI MAKRO // JAHITAN RANTAI
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-white uppercase">
                    SERAT COTTON LOOPBACK
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">420 GSM</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Konstruksi rajut loopback berbobot tinggi dengan struktur rib elastis tahan cuci dan sirkulasi udara optimal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
