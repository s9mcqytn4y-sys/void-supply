import { describe, it, expect, beforeEach, vi } from "vitest";
import { useKeranjangStore } from "../stores/keranjang.store";
import { stateKeranjangTersimpanSkema } from "../schemas/cart.schema";
import type { InputItemKeranjang, HasilRekonsiliasiKeranjang } from "../types/cart.type";

const dummyItem1: InputItemKeranjang = {
  varianId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  produkId: "11111111-1111-1111-1111-111111111111",
  nama: "Void Heavyweight Oversized Tee 01",
  slug: "void-heavyweight-tee-01",
  gambar: "/images/products/drop-04/void-tee-01-front.webp",
  sku: "VOID-D04-TEE-BLK-M",
  ukuran: "M",
  warna: "Hitam",
  hargaTampilanIdr: 389000,
  jumlah: 2,
};

describe("Modul 02.13 // Cart Persistence, Hydration & Reconciliation", () => {
  beforeEach(() => {
    localStorage.clear();
    useKeranjangStore.getState().kosongkan();
  });

  it("1. Skema Zod berhasil memvalidasi format data LocalStorage yang valid", () => {
    const dataValid = {
      items: [
        {
          varianId: "var-1",
          produkId: "prod-1",
          nama: "Hoodie",
          slug: "hoodie",
          gambar: "/img.webp",
          sku: "SKU-1",
          ukuran: "L",
          warna: "Hitam",
          hargaTampilanIdr: 789000,
          jumlah: 3,
        },
      ],
    };

    const hasilValidasi = stateKeranjangTersimpanSkema.safeParse(dataValid);
    expect(hasilValidasi.success).toBe(true);
  });

  it("2. Skema Zod menolak data LocalStorage yang korup (jumlah negatif atau harga tidak valid)", () => {
    const dataKorup = {
      items: [
        {
          varianId: "var-1",
          produkId: "prod-1",
          nama: "Hoodie",
          slug: "hoodie",
          gambar: "/img.webp",
          sku: "SKU-1",
          ukuran: "L",
          warna: "Hitam",
          hargaTampilanIdr: -50000, // Harga negatif ilegal
          jumlah: 0, // Kuantitas 0 ilegal
        },
      ],
    };

    const hasilValidasi = stateKeranjangTersimpanSkema.safeParse(dataKorup);
    expect(hasilValidasi.success).toBe(false);
  });

  it("3. Menyimpan items ke LocalStorage saat item ditambahkan", () => {
    useKeranjangStore.getState().tambahItem(dummyItem1);

    const rawStorage = localStorage.getItem("void-supply-cart");
    expect(rawStorage).not.toBeNull();

    const parsed = JSON.parse(rawStorage!);
    expect(parsed.state.items.length).toBe(1);
    expect(parsed.state.items[0].sku).toBe("VOID-D04-TEE-BLK-M");
    expect(parsed.state.items[0].jumlah).toBe(2);
  });

  it("4. Berhasil menerapkan hasil rekonsiliasi server ke store", () => {
    useKeranjangStore.getState().tambahItem(dummyItem1);

    // Mock hasil dari Server Action rekonsiliasi
    const mockHasilServer: HasilRekonsiliasiKeranjang = {
      sukses: true,
      pesan: "Harga dan stok terverifikasi.",
      items: [
        {
          varianId: dummyItem1.varianId,
          produkId: dummyItem1.produkId,
          nama: dummyItem1.nama,
          slug: dummyItem1.slug,
          gambar: dummyItem1.gambar,
          sku: dummyItem1.sku,
          ukuran: dummyItem1.ukuran,
          warna: dummyItem1.warna,
          hargaServerIdr: 399000, // Harga resmi server dinaikkan di database
          jumlahDiminta: 2,
          jumlahDisetujui: 2,
          beratGram: 450,
          stokAktual: 35,
          status: "tersedia",
        },
      ],
      subtotalServerIdr: 399000 * 2,
      totalBeratGram: 900,
      apakahAdaPerubahan: true,
    };

    useKeranjangStore.getState().terapkanHasilRekonsiliasi(mockHasilServer);

    const storeSekarang = useKeranjangStore.getState();
    expect(storeSekarang.items[0].hargaTampilanIdr).toBe(399000); // Terupdate ke harga server
    expect(storeSekarang.hitungSubtotalIdr()).toBe(399000 * 2);
    expect(storeSekarang.items[0].statusKetersediaan).toBe("tersedia");
  });

  it("5. Menyesuaikan kuantitas otomatis saat stok server lebih sedikit dari permintaan", () => {
    useKeranjangStore.getState().tambahItem(dummyItem1); // Minta 2 unit

    const mockHasilStokKurang: HasilRekonsiliasiKeranjang = {
      sukses: true,
      pesan: "Stok tersisa hanya 1 unit.",
      items: [
        {
          varianId: dummyItem1.varianId,
          produkId: dummyItem1.produkId,
          nama: dummyItem1.nama,
          slug: dummyItem1.slug,
          gambar: dummyItem1.gambar,
          sku: dummyItem1.sku,
          ukuran: dummyItem1.ukuran,
          warna: dummyItem1.warna,
          hargaServerIdr: 389000,
          jumlahDiminta: 2,
          jumlahDisetujui: 1, // Disesuaikan menjadi 1
          beratGram: 450,
          stokAktual: 1,
          status: "stok_kurang",
          pesan: "Stok tersisa hanya 1 unit.",
        },
      ],
      subtotalServerIdr: 389000 * 1,
      totalBeratGram: 450,
      apakahAdaPerubahan: true,
    };

    useKeranjangStore.getState().terapkanHasilRekonsiliasi(mockHasilStokKurang);

    const store = useKeranjangStore.getState();
    expect(store.items[0].jumlah).toBe(1);
    expect(store.items[0].statusKetersediaan).toBe("stok_kurang");
    expect(store.hitungTotalItem()).toBe(1);
  });

  it("6. Menghapus item dari keranjang jika stok server bernilai 0 (habis)", () => {
    useKeranjangStore.getState().tambahItem(dummyItem1);

    const mockHasilHabis: HasilRekonsiliasiKeranjang = {
      sukses: true,
      pesan: "Stok artikel habis.",
      items: [
        {
          varianId: dummyItem1.varianId,
          produkId: dummyItem1.produkId,
          nama: dummyItem1.nama,
          slug: dummyItem1.slug,
          gambar: dummyItem1.gambar,
          sku: dummyItem1.sku,
          ukuran: dummyItem1.ukuran,
          warna: dummyItem1.warna,
          hargaServerIdr: 389000,
          jumlahDiminta: 2,
          jumlahDisetujui: 0,
          beratGram: 450,
          stokAktual: 0,
          status: "habis",
          pesan: "Stok habis.",
        },
      ],
      subtotalServerIdr: 0,
      totalBeratGram: 0,
      apakahAdaPerubahan: true,
    };

    useKeranjangStore.getState().terapkanHasilRekonsiliasi(mockHasilHabis);

    const store = useKeranjangStore.getState();
    expect(store.items.length).toBe(0); // Dihapus karena status habis
    expect(store.hitungTotalItem()).toBe(0);
  });
});
