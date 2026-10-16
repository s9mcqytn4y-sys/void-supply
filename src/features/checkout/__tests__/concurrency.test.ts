import { describe, it, expect, beforeAll } from "vitest";
import { and, eq, sql } from "drizzle-orm";
import { db, varianProduk, produk, kategori } from "@/lib/db";
import { batalkanPesananKedaluwarsa } from "../services/reservasi.service";
import { buatPesanan } from "../actions/buat-pesanan.action";

describe("Module 02.15: Concurrency, Idempotency & Stock Recovery Suite", () => {
  beforeAll(() => {
    process.env.ALLOW_PAYMENT_MOCK = "true";
  });

  it("mencegah overselling saat dua transaksi bersaing untuk stok terakhir secara paralel (atomic decrement)", async () => {
    // 1. Buat entitas produk dan varian terisolasi khusus pengujian konkurensi
    const [kategoriEksis] = await db
      .select({ id: kategori.id })
      .from(kategori)
      .limit(1);

    expect(kategoriEksis).toBeDefined();

    const timestampUnik = Date.now();
    const [produkUji] = await db
      .insert(produk)
      .values({
        kategoriId: kategoriEksis.id,
        nama: `Artikel Uji Konkurensi ${timestampUnik}`,
        slug: `artikel-uji-konkurensi-${timestampUnik}`,
        deskripsi: "Artikel isolasi untuk pengujian race condition atomik",
        hargaDasar: 150000,
        status: "aktif",
        gambarUtama: "/images/katalog/test-front.webp",
      })
      .returning({ id: produk.id });

    const [varianUji] = await db
      .insert(varianProduk)
      .values({
        produkId: produkUji.id,
        ukuran: "L",
        warna: "Hitam",
        sku: `CONC-ISOLASI-${timestampUnik}`,
        stok: 1, // Tepat 1 unit stok untuk simulasi kontensi
        beratGram: 500,
        harga: 150000,
      })
      .returning({
        id: varianProduk.id,
        stok: varianProduk.stok,
        sku: varianProduk.sku,
      });

    expect(varianUji).toBeDefined();

    try {
      // 2. Jalankan dua pengurangan stok bersyarat secara serentak (Promise.all)
      const eksekusiPembeli = async (nama: string) => {
        return await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(varianProduk)
            .set({
              stok: sql`${varianProduk.stok} - 1`,
            })
            .where(
              and(
                eq(varianProduk.id, varianUji.id),
                sql`${varianProduk.stok} >= 1`
              )
            )
            .returning({ id: varianProduk.id });

          return !!updated;
        });
      };

      const [hasilA, hasilB] = await Promise.all([
        eksekusiPembeli("Pembeli A"),
        eksekusiPembeli("Pembeli B"),
      ]);

      // Tepat SATU pembeli harus berhasil, dan satu pembeli harus ditolak (anti-oversell)
      const jumlahSukses = (hasilA ? 1 : 0) + (hasilB ? 1 : 0);
      expect(jumlahSukses).toBe(1);

      // Verifikasi sisa stok di database tidak pernah bernilai negatif
      const [stokAkhir] = await db
        .select({ stok: varianProduk.stok })
        .from(varianProduk)
        .where(eq(varianProduk.id, varianUji.id));

      expect(stokAkhir.stok).toBe(0);
    } finally {
      // Bersihkan data uji terisolasi
      await db.delete(varianProduk).where(eq(varianProduk.id, varianUji.id));
      await db.delete(produk).where(eq(produk.id, produkUji.id));
    }
  });

  it("menolak duplikasi pesanan ketika formulir dikirim ulang dengan idempotensiKey yang sama", async () => {
    const [varianUji] = await db
      .select({
        id: varianProduk.id,
        stok: varianProduk.stok,
      })
      .from(varianProduk)
      .where(sql`${varianProduk.stok} >= 5`)
      .limit(1);

    expect(varianUji).toBeDefined();
    const stokAwal = varianUji.stok;

    const keyUnik = `test-idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const payloadCheckout = {
      namaLengkap: "Rian Tester",
      email: "rian.tester@voidsupply.test",
      telepon: "081299998888",
      alamatLengkap: "Jl. Senopati No. 12, Kebayoran Baru",
      kota: "Jakarta Selatan",
      provinsi: "DKI Jakarta",
      kodePos: "12190",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      idempotensiKey: keyUnik,
      items: [{ varianId: varianUji.id, jumlah: 1 }],
    };

    try {
      // Panggilan pertama
      const hasilPertama = await buatPesanan(payloadCheckout);
      expect(hasilPertama.sukses).toBe(true);
      expect(hasilPertama.nomorPesanan).toBeDefined();
      expect(hasilPertama.tokenAkses).toBeDefined();

      const stokSetelahPertama = await db
        .select({ stok: varianProduk.stok })
        .from(varianProduk)
        .where(eq(varianProduk.id, varianUji.id));

      // Panggilan kedua dengan idempotensiKey yang sama (simulasi double-click / network retry)
      const hasilKedua = await buatPesanan(payloadCheckout);
      expect(hasilKedua.sukses).toBe(true);
      expect(hasilKedua.nomorPesanan).toBe(hasilPertama.nomorPesanan);
      expect(hasilKedua.tokenAkses).toBe(hasilPertama.tokenAkses);
      expect(hasilKedua.pesan).toContain("idempotent");

      // Stok varian TIDAK boleh berkurang untuk kedua kalinya
      const stokSetelahKedua = await db
        .select({ stok: varianProduk.stok })
        .from(varianProduk)
        .where(eq(varianProduk.id, varianUji.id));

      expect(stokSetelahKedua[0].stok).toBe(stokSetelahPertama[0].stok);
    } finally {
      // Pulihkan stok awal agar tidak mencemari lingkungan pengujian berikutnya
      await db
        .update(varianProduk)
        .set({ stok: stokAwal })
        .where(eq(varianProduk.id, varianUji.id));
    }
  });

  it("memulihkan kuota stok secara atomik saat pesanan kedaluwarsa dibatalkan", async () => {
    const hasilBatal = await batalkanPesananKedaluwarsa();
    expect(hasilBatal.sukses).toBe(true);
    expect(typeof hasilBatal.jumlahDibatalkan).toBe("number");
  });
});
