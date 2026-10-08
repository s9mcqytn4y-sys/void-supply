export default function ShopLoading() {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-7xl bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Memuat katalog produk VOID Supply"
    >
      {/* Skeleton Header */}
      <header className="mb-10 animate-pulse border-b border-neutral-800 pb-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-neutral-800" />
            <div className="h-10 w-64 bg-neutral-800 md:w-80" />
          </div>
          <div className="h-4 w-36 bg-neutral-800" />
        </div>

        {/* Skeleton Lookbook Hero */}
        <div className="aspect-video w-full border border-neutral-800 bg-neutral-900 md:aspect-21/9" />
      </header>

      {/* Skeleton Product Grid (8 Item Skeleton 4:5) */}
      <section
        aria-label="Memuat daftar item produk"
        className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col border border-neutral-800/80 bg-neutral-950">
            {/* Wadah Gambar Skeleton 4:5 */}
            <div className="aspect-4/5 w-full bg-neutral-900" />

            {/* Wadah Info Skeleton */}
            <div className="flex flex-col gap-3 border-t border-neutral-800/80 p-4">
              <div className="h-3 w-16 bg-neutral-800/80" />
              <div className="h-4 w-3/4 bg-neutral-800" />
              <div className="flex items-center justify-between border-t border-neutral-900 pt-2">
                <div className="h-4 w-24 bg-neutral-800" />
                <div className="h-3 w-14 bg-neutral-800/80" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
