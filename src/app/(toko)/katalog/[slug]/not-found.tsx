import Link from "next/link";

export default function ProdukNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md border border-neutral-800 bg-neutral-950 p-8 sm:p-12">
        <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">
          ERROR 404 // KODE ARTIKEL TIDAK VALID
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
          PRODUK TIDAK DITEMUKAN
        </h1>
        <p className="mt-4 text-xs leading-relaxed text-neutral-300 sm:text-sm">
          Artikel atau edisi rilisan yang Anda cari mungkin telah ditarik dari peredaran, habis
          terjual sepenuhnya, atau tautan URL yang dimasukkan salah.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/katalog"
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-black uppercase transition-colors hover:bg-neutral-200 active:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            KEMBALI KE KATALOG
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-transparent px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            BERANDA
          </Link>
        </div>
      </div>
    </main>
  );
}
