import { describe, it, expect, beforeEach } from "vitest";
import { useKeranjangStore } from "../stores/keranjang.store";
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
  jumlah: 3,
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
  jumlah: 2,
};

describe("Audit Finding 5.A // Reaktivitas Selector Total Item Header Toko", () => {
  beforeEach(() => {
    useKeranjangStore.getState().kosongkan();
  });

  it("1. Selector state.items.reduce mengembalikan 0 saat keranjang kosong", () => {
    const totalItem = useKeranjangStore.getState().items.reduce(
      (total, item) => total + item.jumlah,
      0
    );
    expect(totalItem).toBe(0);
  });

  it("2. Selector reaktif memperbarui nilai saat item ditambahkan", () => {
    useKeranjangStore.getState().tambahItem(dummyItemA); // +3

    const totalItem1 = useKeranjangStore.getState().items.reduce(
      (total, item) => total + item.jumlah,
      0
    );
    expect(totalItem1).toBe(3);

    useKeranjangStore.getState().tambahItem(dummyItemB); // +2
    const totalItem2 = useKeranjangStore.getState().items.reduce(
      (total, item) => total + item.jumlah,
      0
    );
    expect(totalItem2).toBe(5);
  });

  it("3. Selector reaktif memperbarui nilai saat kuantitas diubah atau item dihapus", () => {
    useKeranjangStore.getState().tambahItem(dummyItemA); // 3
    useKeranjangStore.getState().tambahItem(dummyItemB); // 2

    // Ubah jumlah item A dari 3 menjadi 1
    useKeranjangStore.getState().ubahJumlah("var-001", 1);
    const totalSetelahUbah = useKeranjangStore.getState().items.reduce(
      (total, item) => total + item.jumlah,
      0
    );
    expect(totalSetelahUbah).toBe(3); // 1 + 2

    // Hapus item B
    useKeranjangStore.getState().hapusItem("var-002");
    const totalSetelahHapus = useKeranjangStore.getState().items.reduce(
      (total, item) => total + item.jumlah,
      0
    );
    expect(totalSetelahHapus).toBe(1); // sisa item A = 1
  });
});
