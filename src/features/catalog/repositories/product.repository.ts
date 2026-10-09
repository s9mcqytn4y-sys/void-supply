import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { produk, kategori } from "@/lib/db/schema";
import type { ProdukDenganRelasi } from "../types/product.type";

export const productRepository = {
  async temukanSemuaAktif(): Promise<ProdukDenganRelasi[]> {
    const hasil = await db.query.produk.findMany({
      where: eq(produk.status, "aktif"),
      with: {
        varian: true,
        kategoriRelasi: true,
      },
      orderBy: [desc(produk.dibuatPada)],
    });

    return hasil as ProdukDenganRelasi[];
  },

  async temukanBerdasarkanSlug(slug: string): Promise<ProdukDenganRelasi | null> {
    const hasil = await db.query.produk.findFirst({
      where: and(eq(produk.slug, slug), eq(produk.status, "aktif")),
      with: {
        varian: true,
        kategoriRelasi: true,
      },
    });

    return (hasil as ProdukDenganRelasi) ?? null;
  },

  async temukanBerdasarkanKategoriSlug(kategoriSlug: string): Promise<ProdukDenganRelasi[]> {
    // Optimasi Single-Query: Mengambil relasi produk aktif langsung dari node kategori
    const dataKategori = await db.query.kategori.findFirst({
      where: eq(kategori.slug, kategoriSlug),
      with: {
        produk: {
          where: eq(produk.status, "aktif"),
          with: {
            varian: true,
            kategoriRelasi: true,
          },
          orderBy: [desc(produk.dibuatPada)],
        },
      },
    });

    return (dataKategori?.produk as ProdukDenganRelasi[]) ?? [];
  },
};

export type ProductRepository = typeof productRepository;
export const repositoriProduk = productRepository;
export type RepositoriProduk = typeof repositoriProduk;
