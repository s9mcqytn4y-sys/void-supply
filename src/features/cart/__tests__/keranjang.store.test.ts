import { describe, it, expect, beforeEach } from "vitest";
import { useKeranjangStore, BATAS_MAKSIMAL_PER_SKU } from "../stores/keranjang.store";
import type { InputItemKeranjang } from "../types/cart.type";

const dummyItemA: InputItemKeranjang = {
  varianId: "var-001",
  produkId: "prod-001",
  nama: "Void Heavyweight Oversized Tee 01",
  slug: "void-heavyweight-tee-01",
  gambar: "/images/products/drop-04/void-tee-01-front.webp",
  sku: "VOID-D04-TEE-BLK-M",
  ukuran: "M",
  warna: "Hitam",
  hargaTampilanIdr: 389000,
  jumlah: 2,
};

const dummyItemB: InputItemKeranjang = {
  varianId: "var-002",
  produkId: "prod-002",
  nama: "Void Modular Technical Bomber",
  slug: "void-modular-bomber",
  gambar: "/images/products/drop-04/bomber-front.webp",
  sku: "VOID-D04-BMB-OLV-L",
  ukuran: "L",
  warna: "Olive Drab",
  hargaTampilanIdr: 1150000,
  jumlah: 1,
};

describe("Modul 02.12 // Zustand Cart Store (useKeranjangStore)", () => {
  beforeEach(() => {
    useKeranjangStore.getState().kosongkan();
  });

  it("1. Berhasil menambahkan item baru ke keranjang belanja (add)", () => {
    const hasil = useKeranjangStore.getState().tambahItem(dummyItemA);

    expect(hasil.sukses).toBe(true);
    const store = useKeranjangStore.getState();
    expect(store.items.length).toBe(1);
    expect(store.items[0].varianId).toBe("var-001");
    expect(store.items[0].jumlah).toBe(2);
    expect(store.hitungTotalItem()).toBe(2);
    expect(store.hitungSubtotalIdr()).toBe(389000 * 2);
  });

  it("2. Menggabungkan kuantitas untuk item dengan varianId yang sama (duplicate/combine)", () => {
    useKeranjangStore.getState().tambahItem(dummyItemA); // 2 unit
    const hasilTambahLagi = useKeranjangStore.getState().tambahItem({
      ...dummyItemA,
      jumlah: 3,
    });

    expect(hasilTambahLagi.sukses).toBe(true);
    const store = useKeranjangStore.getState();
    expect(store.items.length).toBe(1); // tetap 1 baris
    expect(store.items[0].jumlah).toBe(5);
    expect(store.hitungTotalItem()).toBe(5);
  });

  it("3. Menolak akumulasi penambahan bila melebihi batas maksimal 10 unit per SKU (limit)", () => {
    useKeranjangStore.getState().tambahItem({
      ...dummyItemA,
      jumlah: 8,
    });

    const hasilLebih = useKeranjangStore.getState().tambahItem({
      ...dummyItemA,
      jumlah: 3, // 8 + 3 = 11 (> 10)
    });

    expect(hasilLebih.sukses).toBe(false);
    expect(hasilLebih.pesan).toContain(`Batas maksimal pemesanan adalah ${BATAS_MAKSIMAL_PER_SKU} unit`);

    const store = useKeranjangStore.getState();
    expect(store.items[0].jumlah).toBe(8); // Tidak berubah
  });

  it("4. Berhasil mengubah kuantitas item yang ada dalam keranjang", () => {
    useKeranjangStore.getState().tambahItem(dummyItemA);
    const hasilUbah = useKeranjangStore.getState().ubahJumlah("var-001", 6);

    expect(hasilUbah.sukses).toBe(true);
    expect(useKeranjangStore.getState().items[0].jumlah).toBe(6);
  });

  it("5. Menolak pengubahan jumlah di luar rentang valid (1-10)", () => {
    useKeranjangStore.getState().tambahItem(dummyItemA);

    const hasilNol = useKeranjangStore.getState().ubahJumlah("var-001", 0);
    expect(hasilNol.sukses).toBe(false);

    const hasilLebih = useKeranjangStore.getState().ubahJumlah("var-001", 11);
    expect(hasilLebih.sukses).toBe(false);

    expect(useKeranjangStore.getState().items[0].jumlah).toBe(2);
  });

  it("6. Berhasil menghapus baris item spesifik berdasarkan varianId (remove)", () => {
    useKeranjangStore.getState().tambahItem(dummyItemA);
    useKeranjangStore.getState().tambahItem(dummyItemB);

    expect(useKeranjangStore.getState().items.length).toBe(2);

    useKeranjangStore.getState().hapusItem("var-001");

    const store = useKeranjangStore.getState();
    expect(store.items.length).toBe(1);
    expect(store.items[0].varianId).toBe("var-002");
    expect(store.hitungTotalItem()).toBe(1);
  });

  it("7. Berhasil mengosongkan seluruh isi keranjang belanja (empty)", () => {
    useKeranjangStore.getState().tambahItem(dummyItemA);
    useKeranjangStore.getState().tambahItem(dummyItemB);

    useKeranjangStore.getState().kosongkan();

    const store = useKeranjangStore.getState();
    expect(store.items.length).toBe(0);
    expect(store.hitungTotalItem()).toBe(0);
    expect(store.hitungSubtotalIdr()).toBe(0);
  });
});
