export default function LoadingDetailProduk() {
  return (
    <main
      aria-label="Memuat data detail produk"
      aria-busy="true"
      className="mx-auto min-h-screen w-full max-w-7xl animate-pulse bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Skeleton Galeri Kiri */}
        <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-6">
          <div className="flex gap-3 md:w-20 md:flex-col">
            <div className="aspect-4/5 w-16 bg-neutral-900 md:w-full" />
            <div className="aspect-4/5 w-16 bg-neutral-900 md:w-full" />
            <div className="aspect-4/5 w-16 bg-neutral-900 md:w-full" />
          </div>
          <div className="aspect-4/5 w-full flex-1 border border-neutral-900 bg-neutral-900" />
        </div>

        {/* Skeleton Detail Kanan */}
        <div className="flex flex-col gap-6">
          {/* Breadcrumb & Category */}
          <div className="h-4 w-1/3 bg-neutral-900" />
          <div className="h-4 w-1/2 bg-neutral-900" />

          {/* Title & Price */}
          <div className="h-10 w-3/4 bg-neutral-900" />
          <div className="h-7 w-1/4 bg-neutral-900" />

          {/* Description */}
          <div className="space-y-2 border-t border-neutral-900 pt-4">
            <div className="h-4 w-full bg-neutral-900" />
            <div className="h-4 w-5/6 bg-neutral-900" />
            <div className="h-4 w-4/6 bg-neutral-900" />
          </div>

          {/* Size Pills */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-1/4 bg-neutral-900" />
            <div className="grid grid-cols-5 gap-2">
              <div className="min-h-11 bg-neutral-900" />
              <div className="min-h-11 bg-neutral-900" />
              <div className="min-h-11 bg-neutral-900" />
              <div className="min-h-11 bg-neutral-900" />
              <div className="min-h-11 bg-neutral-900" />
            </div>
          </div>

          {/* Action CTA */}
          <div className="min-h-12 w-full bg-neutral-900" />

          {/* Material Accordion Skeleton */}
          <div className="h-32 w-full border border-neutral-900 bg-neutral-900/60" />
        </div>
      </div>
    </main>
  );
}
