import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PropertiGambarProduk {
  src: string;
  alt: string;
  apakahHabis?: boolean;
  apakahStokMenipis?: boolean;
  priority?: boolean;
  labelBadge?: string;
  className?: string;
}

export function GambarProduk({
  src,
  alt,
  apakahHabis = false,
  apakahStokMenipis = false,
  priority = false,
  labelBadge = "DROP 04",
  className,
}: PropertiGambarProduk) {
  return (
    <div className={cn("relative aspect-4/5 w-full overflow-hidden bg-neutral-900", className)}>
      {/* Badge Koleksi Drop di Kiri Atas */}
      {labelBadge && (
        <span className="absolute top-3 left-3 z-10 border border-neutral-700/80 bg-black/80 px-2.5 py-1 font-mono text-[11px] tracking-widest text-neutral-200 uppercase backdrop-blur-sm">
          {labelBadge}
        </span>
      )}

      {/* Badge Status Urgensi Stok di Kanan Atas */}
      {apakahHabis ? (
        <span className="absolute top-3 right-3 z-10 border border-red-800/80 bg-red-950/90 px-2.5 py-1 font-mono text-[11px] tracking-widest text-red-300 uppercase backdrop-blur-sm">
          HABIS TERJUAL
        </span>
      ) : apakahStokMenipis ? (
        <span className="absolute top-3 right-3 z-10 border border-amber-800/80 bg-amber-950/90 px-2.5 py-1 font-mono text-[11px] tracking-widest text-amber-300 uppercase backdrop-blur-sm">
          HAMPIR HABIS
        </span>
      ) : null}

      {/* Komponen Gambar Next.js dengan Efek Transisi */}
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            apakahHabis && "opacity-40 grayscale"
          )}
        />
      </div>
    </div>
  );
}

// Alias untuk kompatibilitas
export const ProductImage = GambarProduk;
export type ProductImageProps = PropertiGambarProduk;
