import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { produk, kategori } from "@/lib/db/schema";

export const productRepository = {
  async temukanSemuaAktif() {
    return db.query.produk.findMany({
      where: eq(produk.status, "aktif"),
      with: {
        varian: true,
        kategoriRelasi: true,
      },
      orderBy: [desc(produk.dibuatPada)],
    });
  },

  async temukanBerdasarkanSlug(slug: string) {
    return db.query.produk.findFirst({
      where: and(eq(produk.slug, slug), eq(produk.status, "aktif")),
      with: {
        varian: true,
        kategoriRelasi: true,
      },
    });
  },

  async temukanBerdasarkanKategoriSlug(kategoriSlug: string) {
    const dataKategori = await db.query.kategori.findFirst({
      where: eq(kategori.slug, kategoriSlug),
    });

    if (!dataKategori) {
      return [];
    }

    return db.query.produk.findMany({
      where: and(eq(produk.status, "aktif"), eq(produk.kategoriId, dataKategori.id)),
      with: {
        varian: true,
        kategoriRelasi: true,
      },
      orderBy: [desc(produk.dibuatPada)],
    });
  },
};

export type ProductRepository = typeof productRepository;
