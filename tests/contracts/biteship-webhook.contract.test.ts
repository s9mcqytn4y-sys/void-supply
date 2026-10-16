import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { POST } from "@/app/api/biteship/webhook/route";
import {
  db,
  pesanan,
  varianProduk,
  produk,
  kategori,
  pengiriman,
  pelacakanPengiriman,
} from "@/lib/db";
import { buatPesanan } from "@/features/checkout/actions/buat-pesanan.action";

describe("Fase 2: Biteship Webhook Contract & Tracking Integration Matrix", () => {
  let varianTerisolasiId: string;
  let produkTerisolasiId: string;

  const WEBHOOK_SECRET_TEST = "biteship_test_secret_key_123";

  beforeAll(async () => {
    process.env.ALLOW_PAYMENT_MOCK = "true";
    process.env.BITESHIP_WEBHOOK_SECRET = WEBHOOK_SECRET_TEST;

    const [kat] = await db.select({ id: kategori.id }).from(kategori).limit(1);

    const [prod] = await db
      .insert(produk)
      .values({
        kategoriId: kat.id,
        nama: `Produk Uji Biteship Contract ${Date.now()}`,
        slug: `produk-biteship-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        deskripsi: "Produk uji terisolasi untuk suite kontrak webhook Biteship",
        hargaDasar: 250000,
        gambarUtama: "/images/products/drop-04/void-tee-01-front.webp",
      })
      .returning({ id: produk.id });

    produkTerisolasiId = prod.id;

    const [varian] = await db
      .insert(varianProduk)
      .values({
        produkId: prod.id,
        ukuran: "L",
        sku: `SKU-BITESHIP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stok: 100,
        harga: 250000,
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
        // Abaikan
      }
    }
  });

  async function buatPesananUji(suffix: string) {
    const resOrder = await buatPesanan({
      namaLengkap: `Penerima Biteship ${suffix}`,
      email: `biteship-${suffix}@voidsupply.test`,
      telepon: "081298765432",
      alamatLengkap: "Jl. Kramat Raya No. 45 Johar Baru",
      kota: "Jakarta Pusat",
      provinsi: "DKI Jakarta",
      kodePos: "10560",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      catatan: "Uji Biteship Webhook",
      idempotensiKey: `idemp-biteship-${suffix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      items: [{ varianId: varianTerisolasiId, jumlah: 1 }],
    });

    if (!resOrder.sukses || !resOrder.nomorPesanan) {
      throw new Error(`Gagal membuat pesanan uji: ${resOrder.pesan}`);
    }

    return {
      nomorPesanan: resOrder.nomorPesanan,
    };
  }

  it("menolak request jika payload tidak memuat atribut status (HTTP 400)", async () => {
    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET_TEST}`,
      },
      body: JSON.stringify({ courier_company: "jne" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("status");
  });

  it("menolak request jika token secret dikonfigurasi namun header tidak valid (HTTP 403)", async () => {
    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-palsu-invalid",
      },
      body: JSON.stringify({
        status: "allocated",
        order_id: "VOID-TEST-INVALID",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("mengembalikan 404 jika nomor pesanan / waybill tidak ditemukan di database", async () => {
    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET_TEST}`,
      },
      body: JSON.stringify({
        status: "picking_up",
        order_id: "VOID-NOMOR-TIDAK-PERNAH-ADA-999999",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("memproses event picking_up dan memutasikan status pesanan ke 'dikirim'", async () => {
    const pesananData = await buatPesananUji("pickup");

    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET_TEST}`,
      },
      body: JSON.stringify({
        event: "order.status_updated",
        order_id: pesananData.nomorPesanan,
        courier_waybill_id: `RESI-JNE-${Date.now()}`,
        courier_company: "jne",
        status: "picking_up",
        note: "Kurir JNE sedang menuju lokasi gudang VOID Supply",
        location: "Johar Baru Hub",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.sukses).toBe(true);
    expect(json.statusPesanan).toBe("dikirim");

    // Verifikasi database: status pesanan dan titik pelacakan
    const [pesananDb] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, pesananData.nomorPesanan))
      .limit(1);

    expect(pesananDb.statusPesanan).toBe("dikirim");

    const titikPelacakan = await db
      .select()
      .from(pelacakanPengiriman)
      .where(eq(pelacakanPengiriman.pesananId, pesananDb.id));

    expect(titikPelacakan.length).toBeGreaterThanOrEqual(1);
    expect(titikPelacakan[0].statusPelacakan).toBe("picking_up");
    expect(titikPelacakan[0].lokasi).toBe("Johar Baru Hub");
  });

  it("memproses event delivered dan memutasikan status pesanan ke 'selesai'", async () => {
    const pesananData = await buatPesananUji("delivered");

    const noResi = `RESI-DELIVERED-${Date.now()}`;
    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET_TEST}`,
      },
      body: JSON.stringify({
        event: "order.status_updated",
        order_id: pesananData.nomorPesanan,
        courier_waybill_id: noResi,
        courier_company: "jne",
        status: "delivered",
        note: "Paket berhasil diserahkan kepada pihak penerima",
        location: "Jakarta Pusat",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.sukses).toBe(true);
    expect(json.statusPesanan).toBe("selesai");

    // Verifikasi status pengiriman menjadi 'terkirim'
    const [pesananDb] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, pesananData.nomorPesanan))
      .limit(1);

    expect(pesananDb.statusPesanan).toBe("selesai");

    const [pengirimanDb] = await db
      .select()
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, pesananDb.id))
      .limit(1);

    expect(pengirimanDb.statusPengiriman).toBe("terkirim");
    expect(pengirimanDb.nomorResi).toBe(noResi);
  });
});
