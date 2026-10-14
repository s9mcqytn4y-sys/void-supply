import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { POST } from "@/app/api/midtrans/webhook/route";
import { db, pesanan, varianProduk, produk, kategori, itemPesanan, pembayaran, pengiriman } from "@/lib/db";
import { buatPesanan } from "@/features/checkout/actions/buat-pesanan.action";

vi.mock("@/lib/services/midtrans.service", () => ({
  verifikasiSignatureMidtrans: vi.fn(
    (orderId, statusCode, grossAmount, signatureKey) => {
      return signatureKey === "valid_signature_contract_test" || signatureKey === "valid_signature_test";
    }
  ),
  buatTransaksiMidtrans: vi.fn(async ({ nomorPesanan }) => ({
    sukses: true,
    token: `SNAP-${nomorPesanan}`,
    redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/SNAP-${nomorPesanan}`,
  })),
}));

describe("Module 02.17: Midtrans Webhook Contract & Idempotency Matrix", () => {
  let varianTerisolasiId: string;
  let produkTerisolasiId: string;

  beforeAll(async () => {
    process.env.ALLOW_PAYMENT_MOCK = "true";

    // Buat kategori atau ambil kategori eksis
    const [kat] = await db.select({ id: kategori.id }).from(kategori).limit(1);

    const [prod] = await db
      .insert(produk)
      .values({
        kategoriId: kat.id,
        nama: `Produk Uji Contract ${Date.now()}`,
        slug: `produk-contract-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        deskripsi: "Produk uji terisolasi untuk suite kontrak webhook",
        hargaDasar: 300000,
        gambarUtama: "/images/products/drop-04/void-tee-01-front.webp",
      })
      .returning({ id: produk.id });

    produkTerisolasiId = prod.id;

    const [varian] = await db
      .insert(varianProduk)
      .values({
        produkId: prod.id,
        ukuran: "XL",
        sku: `SKU-CONTRACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stok: 100, // Stok besar terisolasi
        harga: 300000,
      })
      .returning({ id: varianProduk.id });

    varianTerisolasiId = varian.id;
  });

  afterAll(async () => {
    if (varianTerisolasiId && produkTerisolasiId) {
      try {
        await db.delete(varianProduk).where(eq(varianProduk.id, varianTerisolasiId));
        await db.delete(produk).where(eq(produk.id, produkTerisolasiId));
      } catch {
        // Abaikan jika ada foreign key constraint
      }
    }
  });

  async function setupPesananUji(suffix: string) {
    const resOrder = await buatPesanan({
      namaLengkap: `Pembeli Contract ${suffix}`,
      email: `contract-${suffix}@voidsupply.test`,
      telepon: "081234567890",
      alamatLengkap: "Jl. Veteran No. 10 Johar Baru",
      kota: "Jakarta Pusat",
      provinsi: "DKI Jakarta",
      kodePos: "10560",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      catatan: "Uji contract webhook",
      idempotensiKey: `idemp-contract-${suffix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      items: [
        {
          varianId: varianTerisolasiId,
          jumlah: 1,
        },
      ],
    });

    if (!resOrder.sukses || !resOrder.nomorPesanan) {
      throw new Error(`Gagal membuat pesanan uji: ${resOrder.pesan}`);
    }

    const [orderDiDb] = await db
      .select({ totalAkhir: pesanan.totalAkhir })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, resOrder.nomorPesanan))
      .limit(1);

    return {
      nomorPesanan: resOrder.nomorPesanan,
      totalAkhir: orderDiDb?.totalAkhir ?? 0,
      varianId: varianTerisolasiId,
    };
  }

  it("kontrak 1: settlement berhasil memutasikan status pesanan ke 'diproses'", async () => {
    const { nomorPesanan, totalAkhir } = await setupPesananUji("settlement");

    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: nomorPesanan,
        status_code: "200",
        gross_amount: `${totalAkhir}.00`,
        signature_key: "valid_signature_contract_test",
        transaction_status: "settlement",
        transaction_id: `trx-${Date.now()}`,
        payment_type: "bank_transfer",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const [orderDiDb] = await db
      .select({ statusPesanan: pesanan.statusPesanan })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    expect(orderDiDb?.statusPesanan).toBe("diproses");
  });

  it("kontrak 2: pending mempertahankan status 'menunggu_pembayaran'", async () => {
    const { nomorPesanan, totalAkhir } = await setupPesananUji("pending");

    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: nomorPesanan,
        status_code: "201",
        gross_amount: `${totalAkhir}.00`,
        signature_key: "valid_signature_contract_test",
        transaction_status: "pending",
        transaction_id: `trx-${Date.now()}`,
        payment_type: "echannel",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const [orderDiDb] = await db
      .select({ statusPesanan: pesanan.statusPesanan })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    expect(orderDiDb?.statusPesanan).toBe("menunggu_pembayaran");
  });

  it("kontrak 3: expire membatalkan pesanan dan memulihkan stok secara atomik", async () => {
    const [varianSebelum] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianTerisolasiId))
      .limit(1);

    const stokSebelum = varianSebelum?.stok ?? 0;

    const { nomorPesanan, totalAkhir } = await setupPesananUji("expire");

    // Stok berkurang 1 saat order dibuat
    const [varianSaatOrder] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianTerisolasiId))
      .limit(1);

    expect(varianSaatOrder?.stok).toBe(stokSebelum - 1);

    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: nomorPesanan,
        status_code: "200",
        gross_amount: `${totalAkhir}.00`,
        signature_key: "valid_signature_contract_test",
        transaction_status: "expire",
        transaction_id: `trx-${Date.now()}`,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const [orderDiDb] = await db
      .select({ statusPesanan: pesanan.statusPesanan })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    expect(orderDiDb?.statusPesanan).toBe("dibatalkan");

    const [varianSesudah] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianTerisolasiId))
      .limit(1);

    // Stok harus pulih kembali ke stokSebelum
    expect(varianSesudah?.stok).toBe(stokSebelum);
  });

  it("kontrak 4: cancel membatalkan pesanan dan memulihkan stok", async () => {
    const [varianSebelum] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianTerisolasiId))
      .limit(1);

    const stokSebelum = varianSebelum?.stok ?? 0;

    const { nomorPesanan, totalAkhir } = await setupPesananUji("cancel");

    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: nomorPesanan,
        status_code: "200",
        gross_amount: `${totalAkhir}.00`,
        signature_key: "valid_signature_contract_test",
        transaction_status: "cancel",
        transaction_id: `trx-${Date.now()}`,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const [orderDiDb] = await db
      .select({ statusPesanan: pesanan.statusPesanan })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    expect(orderDiDb?.statusPesanan).toBe("dibatalkan");

    const [varianSesudah] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianTerisolasiId))
      .limit(1);

    expect(varianSesudah?.stok).toBe(stokSebelum);
  });

  it("kontrak 5: webhook duplikat / berulang idempotent dan tidak menyebabkan pemulihan stok ganda", async () => {
    const { nomorPesanan, totalAkhir } = await setupPesananUji("duplicate");

    // 1. Kirim webhook expire pertama
    const payloadExpire = {
      order_id: nomorPesanan,
      status_code: "200",
      gross_amount: `${totalAkhir}.00`,
      signature_key: "valid_signature_contract_test",
      transaction_status: "expire",
      transaction_id: `trx-${Date.now()}`,
    };

    const res1 = await POST(
      new Request("http://localhost:3000/api/midtrans/webhook", {
        method: "POST",
        body: JSON.stringify(payloadExpire),
      })
    );
    expect(res1.status).toBe(200);

    const [varianSetelahWebhook1] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianTerisolasiId))
      .limit(1);

    const stokSetelahWebhook1 = varianSetelahWebhook1?.stok ?? 0;

    // 2. Kirim webhook expire kedua (duplikat jaringan)
    const res2 = await POST(
      new Request("http://localhost:3000/api/midtrans/webhook", {
        method: "POST",
        body: JSON.stringify(payloadExpire),
      })
    );
    expect(res2.status).toBe(200);

    const [varianSetelahWebhook2] = await db
      .select({ stok: varianProduk.stok })
      .from(varianProduk)
      .where(eq(varianProduk.id, varianTerisolasiId))
      .limit(1);

    // Stok TIDAK boleh bertambah lagi (idempotent guard Compare-and-Set)
    expect(varianSetelahWebhook2?.stok).toBe(stokSetelahWebhook1);
  });
});
