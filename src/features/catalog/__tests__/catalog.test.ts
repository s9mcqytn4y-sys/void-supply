import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatRupiah } from "@/lib/utils";
import { catalogService } from "../services/catalog.service";
import { productRepository } from "../repositories/product.repository";
import { dapatDibeli } from "../types/product.type";
import { pilihVarianSkema } from "../schemas/product.schema";

describe("Modul Katalog // Layanan & Validasi Bisnis", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatRupiah", () => {
    it("memformat nominal angka integer menjadi format mata uang Rupiah IDR yang benar", () => {
      expect(formatRupiah(389000)).toBe("Rp 389.000");
      expect(formatRupiah(1150000)).toBe("Rp 1.150.000");
      expect(formatRupiah(0)).toBe("Rp 0");
    });
  });

  describe("layananKatalog.ambilDetailProduk", () => {
    it("mengembalikan detail produk lengkap ketika slug artikel ditemukan di repository", async () => {
      const mockProdukDb = {
        id: "prod-01",
        nama: "Void Heavyweight Oversized Tee 01",
        slug: "void-heavyweight-tee-01",
        deskripsi: "Kaos combed 16s 235 GSM.",
        hargaDasar: 389000,
        status: "active" as const,
        gambarUtama: "/images/products/drop-04/void-tee-01-front.webp",
        galeriGambar: [
          "/images/products/drop-04/void-tee-01-front.webp",
          "/images/products/drop-04/void-tee-01-back.webp",
        ],
        kategoriId: "kat-01",
        dibuatPada: new Date(),
        diperbaruiPada: new Date(),
        kategoriRelasi: {
          id: "kat-01",
          nama: "T-Shirt",
          slug: "tshirt",
          deskripsi: "Kategori T-shirt",
          urutan: 1,
          dibuatPada: new Date(),
          diperbaruiPada: new Date(),
        },
        varian: [
          {
            id: "var-01",
            produkId: "prod-01",
            ukuran: "M",
            warna: "Hitam",
            sku: "VOID-D04-TEE-M",
            stok: 10,
            beratGram: 450,
            harga: 389000,
            dibuatPada: new Date(),
            diperbaruiPada: new Date(),
          },
          {
            id: "var-02",
            produkId: "prod-01",
            ukuran: "L",
            warna: "Hitam",
            sku: "VOID-D04-TEE-L",
            stok: 0,
            beratGram: 480,
            harga: 389000,
            dibuatPada: new Date(),
            diperbaruiPada: new Date(),
          },
        ],
      };

      vi.spyOn(productRepository, "temukanBerdasarkanSlug").mockResolvedValue(
        mockProdukDb as any
      );

      const hasil = await catalogService.ambilDetailProduk("void-heavyweight-tee-01");

      expect(hasil).not.toBeNull();
      expect(hasil?.nama).toBe("Void Heavyweight Oversized Tee 01");
      expect(hasil?.kategori).toBe("T-Shirt");
      expect(hasil?.hargaDasar).toBe(389000);
      expect(hasil?.varian.length).toBe(2);
      expect(hasil?.varian[0].ukuran).toBe("M");
      expect(hasil?.varian[0].stok).toBe(10);
      expect(hasil?.varian[1].stok).toBe(0);
    });

    it("mengembalikan null ketika slug artikel tidak ditemukan (memicu 404 notFound)", async () => {
      vi.spyOn(productRepository, "temukanBerdasarkanSlug").mockResolvedValue(null);

      const hasil = await catalogService.ambilDetailProduk("slug-fiktif-tidak-ada-404");

      expect(hasil).toBeNull();
    });
  });

  describe("layananKatalog.ambilDaftarKatalog", () => {
    it("menghitung total stok, status habis, dan varian yang tersedia dengan akurat", async () => {
      const mockDaftar = [
        {
          id: "prod-02",
          nama: "Void Modular Technical Bomber",
          slug: "void-modular-bomber",
          deskripsi: "Bomber jacket ripstop.",
          hargaDasar: 1150000,
          status: "active" as const,
          gambarUtama: "/images/products/drop-04/bomber-front.webp",
          galeriGambar: [],
          kategoriId: "kat-02",
          dibuatPada: new Date(),
          diperbaruiPada: new Date(),
          kategoriRelasi: {
            id: "kat-02",
            nama: "Outerwear",
            slug: "outerwear",
            deskripsi: "Outerwear",
            urutan: 2,
            dibuatPada: new Date(),
            diperbaruiPada: new Date(),
          },
          varian: [
            {
              id: "var-03",
              produkId: "prod-02",
              ukuran: "M",
              warna: "Olive",
              sku: "VOID-D04-BMB-M",
              stok: 5,
              beratGram: 850,
              harga: 1150000,
              dibuatPada: new Date(),
              diperbaruiPada: new Date(),
            },
          ],
        },
      ];

      vi.spyOn(productRepository, "temukanSemuaAktif").mockResolvedValue(
        mockDaftar as any
      );

      const daftar = await catalogService.ambilDaftarKatalog();

      expect(daftar.length).toBe(1);
      expect(daftar[0].totalStok).toBe(5);
      expect(daftar[0].apakahHabis).toBe(false);
      expect(daftar[0].apakahStokMenipis).toBe(true);
      expect(daftar[0].ukuranTersedia).toEqual(["M"]);
    });
  });

  describe("Aturan Bisnis Pembelian // dapatDibeli (Module 02.11)", () => {
    it("mengembalikan true untuk kuantitas valid dalam batas stok dan limit per transaksi (1-10)", () => {
      expect(dapatDibeli(10, 2)).toBe(true);
      expect(dapatDibeli(5, 1)).toBe(true);
      expect(dapatDibeli(10, 10)).toBe(true);
      expect(dapatDibeli(25, 10)).toBe(true);
    });

    it("mengembalikan false saat stok habis (0)", () => {
      expect(dapatDibeli(0, 1)).toBe(false);
    });

    it("mengembalikan false saat jumlah melebihi stok yang tersedia", () => {
      expect(dapatDibeli(3, 5)).toBe(false);
      expect(dapatDibeli(1, 2)).toBe(false);
    });

    it("mengembalikan false saat jumlah melebihi batas pembelian maksimal (10)", () => {
      expect(dapatDibeli(20, 11)).toBe(false);
      expect(dapatDibeli(50, 99)).toBe(false);
    });

    it("mengembalikan false saat jumlah kurang dari 1 atau bukan integer bulat", () => {
      expect(dapatDibeli(10, 0)).toBe(false);
      expect(dapatDibeli(10, -1)).toBe(false);
      expect(dapatDibeli(10, 1.5)).toBe(false);
      expect(dapatDibeli(10, NaN)).toBe(false);
    });
  });

  describe("Validasi Skema Zod Pemilih Varian // pilihVarianSkema & tambahKeranjangSkema", () => {
    it("berhasil memvalidasi payload pilihVarianSkema dengan produkId dan varianId UUID yang valid", () => {
      const payloadValid = {
        produkId: "123e4567-e89b-12d3-a456-426614174000",
        varianId: "987fcdeb-51a2-43f7-9876-543210fedcba",
        kuantitas: 2,
      };

      const hasil = pilihVarianSkema.safeParse(payloadValid);
      expect(hasil.success).toBe(true);
    });

    it("menolak payload bila format varianId bukan UUID valid", () => {
      const payloadInvalid = {
        produkId: "123e4567-e89b-12d3-a456-426614174000",
        varianId: "id-bukan-uuid",
        kuantitas: 1,
      };

      const hasil = pilihVarianSkema.safeParse(payloadInvalid);
      expect(hasil.success).toBe(false);
    });

    it("menolak payload bila kuantitas di luar batas wajar (1-10)", () => {
      const payloadNol = {
        produkId: "123e4567-e89b-12d3-a456-426614174000",
        varianId: "987fcdeb-51a2-43f7-9876-543210fedcba",
        kuantitas: 0,
      };
      const payloadLebih = {
        produkId: "123e4567-e89b-12d3-a456-426614174000",
        varianId: "987fcdeb-51a2-43f7-9876-543210fedcba",
        kuantitas: 11,
      };

      expect(pilihVarianSkema.safeParse(payloadNol).success).toBe(false);
      expect(pilihVarianSkema.safeParse(payloadLebih).success).toBe(false);
    });
  });
});
