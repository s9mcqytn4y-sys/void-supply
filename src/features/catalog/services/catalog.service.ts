import { productRepository } from "../repositories/product.repository";
import type { ProdukRingkasan, ProdukDetail } from "../types/product.type";

export const catalogService = {
  async ambilDaftarKatalog(kategoriSlug?: string): Promise<ProdukRingkasan[]> {
    const rawProduk = kategoriSlug
      ? await productRepository.temukanBerdasarkanKategoriSlug(kategoriSlug)
      : await productRepository.temukanSemuaAktif();

    return rawProduk.map((item) => {
      const varianList = item.varian || [];
      const totalStok = varianList.reduce((acc, v) => acc + v.stok, 0);
      const varianTersedia = varianList.filter((v) => v.stok > 0);

      return {
        id: item.id,
        nama: item.nama,
        slug: item.slug,
        kategori: item.kategoriRelasi?.nama ?? "Apparel",
        hargaDasar: item.hargaDasar,
        gambarUtama: item.gambarUtama,
        totalStok,
        apakahHabis: totalStok === 0,
        apakahStokMenipis: totalStok > 0 && totalStok < 15,
        ukuranTersedia: varianTersedia.map((v) => v.ukuran),
        varian: varianList.map((v) => ({
          id: v.id,
          ukuran: v.ukuran,
          warna: v.warna,
          sku: v.sku,
          stok: v.stok,
          beratGram: v.beratGram,
          harga: v.harga,
        })),
      };
    });
  },

  async ambilDetailProduk(slug: string): Promise<ProdukDetail | null> {
    const item = await productRepository.temukanBerdasarkanSlug(slug);
    if (!item) return null;

    const varianList = item.varian || [];

    return {
      id: item.id,
      nama: item.nama,
      slug: item.slug,
      deskripsi: item.deskripsi,
      kategori: item.kategoriRelasi?.nama ?? "Apparel",
      hargaDasar: item.hargaDasar,
      status: item.status,
      gambarUtama: item.gambarUtama,
      galeriGambar: (item.galeriGambar as string[]) || [item.gambarUtama],
      spesifikasi: item.spesifikasi,
      panduanUkuran: item.panduanUkuran,
      varian: varianList.map((v) => ({
        id: v.id,
        ukuran: v.ukuran,
        warna: v.warna,
        sku: v.sku,
        stok: v.stok,
        beratGram: v.beratGram,
        harga: v.harga,
      })),
    };
  },
};

export type CatalogService = typeof catalogService;
export const layananKatalog = catalogService;
export type LayananKatalog = typeof layananKatalog;

export const ambilDaftarKatalog = catalogService.ambilDaftarKatalog.bind(catalogService);
export const ambilDetailProduk = catalogService.ambilDetailProduk.bind(catalogService);
