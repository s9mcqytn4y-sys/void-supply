import React from "react";
import Image from "next/image";
import Link from "next/link";

interface PropsAuthLayoutSplit {
  children: React.ReactNode;
  judul: string;
  subjudul: string;
  badge?: string;
}

export function AuthLayoutSplit({
  children,
  judul,
  subjudul,
  badge = "DROP 04 // PROTOCOL IDENTITY",
}: PropsAuthLayoutSplit) {
  return (
    <div className="grid min-h-[100dvh] w-full grid-cols-1 bg-neutral-950 font-mono text-neutral-100 lg:grid-cols-12">
      {/* Sisi Kiri: Visual Editorial Lookbook & Brand Artifacts */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-neutral-800 bg-neutral-900 p-8 lg:col-span-6 lg:flex xl:col-span-7 xl:p-12">
        {/* Background Image dengan subtle brutalist dark gradient */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/products/drop-04/cyber-hoodie-front.webp"
            alt="VOID Supply Drop 04 Visual Editorial"
            fill
            priority
            className="object-cover object-center grayscale contrast-125"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-neutral-950/70" />
        </div>

        {/* Header Visual */}
        <div className="relative z-10 flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-100 uppercase"
          >
            <span className="inline-block h-3 w-3 bg-neutral-100 transition-transform group-hover:rotate-45" />
            <span>VOID SUPPLY</span>
          </Link>
          <span className="border border-neutral-700 bg-neutral-950/80 px-2.5 py-1 text-[10px] font-semibold text-neutral-400 tracking-wider uppercase">
            {badge}
          </span>
        </div>

        {/* Center Quote / Identity Statement */}
        <div className="relative z-10 my-auto max-w-lg py-12">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            KREDENSIAL PELANGGAN RESMI
          </p>
          <h2 className="mt-3 text-3xl font-black text-neutral-100 tracking-tighter uppercase sm:text-4xl">
            ARSITEKTUR BUSANA UTILITARIAN DENGAN INTEGRITAS TRANSAKSI SERI TERBATAS.
          </h2>
          <p className="mt-4 text-xs leading-relaxed text-neutral-400">
            Satu identitas pelanggan mengikat alamat pengiriman Biteship, reservasi kuota stok varian,
            status faktur e-receipt resmi, dan pelacakan kurir terverifikasi.
          </p>
        </div>

        {/* Footer Technical Metadata */}
        <div className="relative z-10 flex items-center justify-between border-t border-neutral-800/80 pt-4 text-[10px] text-neutral-500 uppercase">
          <span>PORT 3000 // TURBOPACK NEON</span>
          <span>SYSTEM TIMEZONE // UTC+7</span>
        </div>
      </div>

      {/* Sisi Kanan: Formulir Autentikasi High-Contrast */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-6 lg:p-12 xl:col-span-5 xl:p-16">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4 lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-100 uppercase"
          >
            <span className="inline-block h-2.5 w-2.5 bg-neutral-100" />
            <span>VOID SUPPLY</span>
          </Link>
          <span className="text-[10px] text-neutral-500 uppercase">FASE 2 AUTH</span>
        </div>

        {/* Content Box */}
        <div className="my-auto mx-auto w-full max-w-md py-8">
          <div className="mb-8">
            <span className="border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
              PORTAL PELANGGAN
            </span>
            <h1 className="mt-3 text-2xl font-bold text-neutral-100 tracking-tight uppercase sm:text-3xl">
              {judul}
            </h1>
            <p className="mt-1 text-xs text-neutral-400">{subjudul}</p>
          </div>

          {children}
        </div>

        {/* Footer Links */}
        <div className="border-t border-neutral-900 pt-4 text-center text-[10px] text-neutral-500">
          <p>
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="/syarat-ketentuan" className="underline hover:text-neutral-300">
              Syarat & Ketentuan
            </Link>{" "}
            serta{" "}
            <Link href="/kebijakan-privasi" className="underline hover:text-neutral-300">
              Kebijakan Privasi
            </Link>{" "}
            VOID Supply.
          </p>
        </div>
      </div>
    </div>
  );
}
