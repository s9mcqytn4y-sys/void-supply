import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { eq, sql } from "drizzle-orm";
import {
  cekStatusTransaksiMidtrans,
  batalkanTransaksiMidtrans,
} from "@/lib/services/midtrans.service";
import { batalkanPesananKedaluwarsa } from "@/features/checkout/services/reservasi.service";
import {
  db,
  pesanan,
  varianProduk,
  produk,
  kategori,
  pembayaran,
} from "@/lib/db";
import { buatPesanan } from "@/features/checkout/actions/buat-pesanan.action";

describe("Fase 4: Midtrans Tri-State Reconciliation & Expiry Hardening", () => {
  let varianUjiId: string;
  let produkUjiId: string;

  beforeAll(async () => {
    process.env.ALLOW_PAYMENT_MOCK = "true";

    const [kat] = await db.select({ id: kategori.id }).from(kategori).limit(1);

    const [prod] = await db
      .insert(produk)
      .values({
        kategoriId: kat.id,
        nama: `Produk Reconcile Test ${Date.now()}`,
        slug: `prod-reconcile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        deskripsi: "Produk uji terisolasi untuk suite rekonsiliasi Midtrans",
        hargaDasar: 200000,
        gambarUtama: "/images/products/drop-04/void-tee-01-front.webp",
      })
      .returning({ id: produk.id });

    produkUjiId = prod.id;

    const [varian] = await db
      .insert(varianProduk)
      .values({
        produkId: prod.id,
        ukuran: "M",
        sku: `SKU-RECON-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stok: 50,
        harga: 200000,
      })
      .returning({ id: varianProduk.id });

    varianUjiId = varian.id;
  });

  afterAll(async () => {
    if (varianUjiId && produkUjiId) {
      try {
        await db.delete(varianProduk).where(eq(varianProduk.id, varianUjiId));
        await db.delete(produk).where(eq(produk.id, produkUjiId));
      } catch {
        // Abaikan
      }
    }
  });

  async function buatPesananKedaluwarsaUji(suffix: string) {
    const resOrder = await buatPesanan({
      namaLengkap: `Pembeli Reconcile ${suffix}`,
      email: `reconcile-${suffix}@voidsupply.test`,
      telepon: "081234567890",
      alamatLengkap: "Jl. Kramat Jaya No. 12 Johar Baru",
      kota: "Jakarta Pusat",
      provinsi: "DKI Jakarta",
      kodePos: "10560",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      catatan: "Uji rekonsiliasi expiry",
      idempotensiKey: `idemp-recon-${suffix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      items: [{ varianId: varianUjiId, jumlah: 1 }],
    });

    if (!resOrder.sukses || !resOrder.nomorPesanan) {
      throw new Error(`Gagal membuat pesanan uji: ${resOrder.pesan}`);
    }

    // Set waktu kedaluwarsa mundur ke 20 menit yang lalu (sudah lewat jendela 15 menit)
    const duapuluhMenitLalu = new Date(Date.now() - 20 * 60 * 1000);
    await db
      .update(pesanan)
      .set({
        kedaluwarsaPada: duapuluhMenitLalu,
        dibuatPada: duapuluhMenitLalu,
      })
      .where(eq(pesanan.nomorPesanan, resOrder.nomorPesanan));

    return {
      nomorPesanan: resOrder.nomorPesanan,
    };
  }

  it("cekStatusTransaksiMidtrans menangani mode mock sandbox dengan aman", async () => {
    const hasil = await cekStatusTransaksiMidtrans("VOID-TEST-MOCK-ORDER");
    expect(hasil.ditemukan).toBe(true);
    expect(hasil.state).toBe("UNPAID_TERMINAL");
    expect(hasil.apakahSudahDibayar).toBe(false);
  });

  it("batalkanTransaksiMidtrans membatalkan transaksi pada mode mock sandbox", async () => {
    const hasil = await batalkanTransaksiMidtrans("VOID-TEST-MOCK-ORDER");
    expect(hasil.sukses).toBe(true);
    expect(hasil.statusTransaksi).toBe("cancel");
  });

  it("batalkanPesananKedaluwarsa membatalkan pesanan yang lewat batas waktu dan memulihkan stok", async () => {
    const [varianSebelum] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianUjiId))
      .limit(1);

    const stokAwal = varianSebelum?.stok ?? 0;

    const { nomorPesanan } = await buatPesananKedaluwarsaUji("batal-sukses");

    // Stok berkurang 1
    const [varianSaatOrder] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianUjiId))
      .limit(1);

    expect(varianSaatOrder?.stok).toBe(stokAwal - 1);

    // Jalankan service pembatalan kedaluwarsa
    const hasil = await batalkanPesananKedaluwarsa();
    expect(hasil.sukses).toBe(true);
    expect(hasil.daftarNomorPesanan).toContain(nomorPesanan);

    // Verifikasi database: pesanan dibatalkan
    const [pesananDb] = await db
      .select({ statusPesanan: pesanan.statusPesanan })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    expect(pesananDb.statusPesanan).toBe("dibatalkan");

    // Verifikasi database: pembayaran berstatus kadaluarsa
    const [pembayaranDb] = await db
      .select({ statusPembayaran: pembayaran.statusPembayaran })
      .from(pembayaran)
      .innerJoin(pesanan, eq(pembayaran.pesananId, pesanan.id))
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    expect(pembayaranDb.statusPembayaran).toBe("kadaluarsa");

    // Verifikasi database: stok varian telah dipulihkan secara atomik
    const [varianSesudah] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianUjiId))
      .limit(1);

    expect(varianSesudah?.stok).toBe(stokAwal);
  });
});
