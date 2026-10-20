import Link from "next/link";
import Image from "next/image";

export function HeroEditorial() {
  return (
    <section
      aria-label="Sorotan Koleksi Drop 04"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Kolom Narasi Editorial (5 Kolom Desktop) */}
        <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-5">
          <div className="mb-4 inline-flex w-fit items-center gap-2 border border-zinc-800 bg-zinc-900/90 px-3 py-1 font-mono text-[11px] tracking-widest text-zinc-300 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            RILISAN TERBATAS // DROP 04
          </div>

          <h1 className="font-mono text-3xl font-black tracking-tighter text-white uppercase sm:text-5xl lg:text-5xl xl:text-6xl">
            FUNCTIONAL <br className="hidden sm:inline" />
            RESISTANCE.
          </h1>

          <p className="mt-4 max-w-lg text-xs leading-relaxed text-zinc-300 sm:text-sm">
            Eksplorasi garmen streetwear perkotaan berbobot berat. Katun combed 16s berdensitas tinggi 235 GSM,
            nilon ripstop tahan cuaca, serta fleece loopback 420 GSM berstruktur kokoh untuk mobilitas iklim nokturnal.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-black uppercase transition-all hover:bg-zinc-200 active:scale-[0.98] active:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              JELAJAHI KATALOG
            </Link>
            <Link
              href="#manifesto"
              className="inline-flex min-h-11 items-center justify-center border border-zinc-800 bg-zinc-900 px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-all hover:border-zinc-500 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              BACA MANIFESTO
            </Link>
          </div>

          {/* Spek Cepat Grid */}
          <div className="mt-8 grid grid-cols-3 border-t border-zinc-800 pt-6 font-mono text-[11px]">
            <div>
              <span className="text-zinc-500 block uppercase">GRAMASI</span>
              <p className="font-bold text-white mt-1">235 : 420 GSM</p>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase">KONSTRUKSI</span>
              <p className="font-bold text-white mt-1">DOUBLE CHAIN</p>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase">STATUS DROP</span>
              <p className="font-bold text-emerald-400 mt-1">TERSEDIA</p>
            </div>
          </div>
        </div>

        {/* Kolom Frame Editorial Visual (7 Kolom Desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-7">
          <div className="group relative overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="relative aspect-4/3 w-full sm:aspect-16/10 lg:aspect-4/3 overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/images/lookbook/drop-04-editorial-hero.webp"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
                aria-label="Editorial video loop kampanye Drop 04 VOID Supply"
              >
                <source src="/assets/video/ambient-lookbook-loop.webm" type="video/webm" />
                <source src="/assets/video/ambient-lookbook-loop.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Tag Caption Editorial Brutalist */}
            <div className="absolute right-3 bottom-3 border border-zinc-800/90 bg-zinc-950/85 px-2.5 py-1 font-mono text-[10px] tracking-wider text-zinc-300 uppercase backdrop-blur-xs">
              LOOK 01 // NIGHT TRANSMISSION [LOOP]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
