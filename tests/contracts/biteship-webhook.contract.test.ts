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
import { petakanKodeLayananBiteship } from "@/lib/services/biteship.service";
import { resetCacheKonfigurasi } from "@/lib/environment/resolver";

describe("Fase 3: Biteship Webhook Contract & Tracking Integration Matrix", () => {
  let varianTerisolasiId: string;
  let produkTerisolasiId: string;

  const WEBHOOK_SECRET_TEST = "biteship_test_secret_key_123";

  beforeAll(async () => {
    process.env.ALLOW_PAYMENT_MOCK = "true";
    process.env.BITESHIP_WEBHOOK_SECRET = WEBHOOK_SECRET_TEST;
    process.env.BITESHIP_WEBHOOK_HEADER_KEY = "x-void-biteship-secret";
    resetCacheKonfigurasi();

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

  it("menerima handshake instalasi dengan body kosong dan merespons HTTP 200 'ok'", async () => {
    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("ok");
    expect(res.headers.get("content-type")).toContain("text/plain");
  });

  it("menerima request jika menggunakan custom header x-void-biteship-secret yang valid", async () => {
    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-void-biteship-secret": WEBHOOK_SECRET_TEST,
      },
      body: JSON.stringify({
        status: "picking_up",
        order_id: "VOID-ORDER-TIDAK-ADA",
      }),
    });

    const res = await POST(req);
    // Karena token valid, lanjut ke pencarian pesanan (mengembalikan 404 karena order tidak ada)
    expect(res.status).toBe(404);
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

  it("TIDAK mengubah status pesanan yang masih 'menunggu_pembayaran' menjadi 'dikirim'", async () => {
    const pesananData = await buatPesananUji("unpaid-pickup");

    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET_TEST}`,
      },
      body: JSON.stringify({
        event: "order.status_updated",
        order_id: pesananData.nomorPesanan,
        courier_waybill_id: `RESI-UNPAID-${Date.now()}`,
        courier_company: "jne",
        status: "picking_up",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verifikasi database: pesanan harus TETAP 'menunggu_pembayaran'
    const [pesananDb] = await db
      .select({ statusPesanan: pesanan.statusPesanan })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, pesananData.nomorPesanan))
      .limit(1);

    expect(pesananDb.statusPesanan).toBe("menunggu_pembayaran");
  });

  it("memproses event picking_up dan memutasikan status pesanan 'diproses' ke 'dikirim'", async () => {
    const pesananData = await buatPesananUji("pickup");

    // Simulasikan pembayaran selesai sehingga status pesanan menjadi 'diproses'
    await db
      .update(pesanan)
      .set({ statusPesanan: "diproses" })
      .where(eq(pesanan.nomorPesanan, pesananData.nomorPesanan));

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

  it("mencari pesanan via external biteshipOrderId dan memperbarui biayaPengirimanAktual pada order.price", async () => {
    const pesananData = await buatPesananUji("ext-id-price");
    const biteshipOrderIdUji = `biteship-order-ext-${Date.now()}`;

    // Simpan biteshipOrderId pada pengiriman
    const [pesananDb] = await db
      .select({ id: pesanan.id })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, pesananData.nomorPesanan))
      .limit(1);

    await db
      .update(pengiriman)
      .set({ biteshipOrderId: biteshipOrderIdUji })
      .where(eq(pengiriman.pesananId, pesananDb.id));

    const req = new Request("http://localhost:3000/api/biteship/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET_TEST}`,
      },
      body: JSON.stringify({
        event: "order.price",
        order_id: biteshipOrderIdUji,
        status: "price_updated",
        courier_price: 18500,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const [pengirimanDb] = await db
      .select({ biayaPengirimanAktual: pengiriman.biayaPengirimanAktual })
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, pesananDb.id))
      .limit(1);

    expect(pengirimanDb.biayaPengirimanAktual).toBe(18500);
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

  it("petakanKodeLayananBiteship memetakan nama layanan tampilan ke kode resmi Biteship", () => {
    // SiCepat
    expect(petakanKodeLayananBiteship("sicepat", "Besok Sampai Tujuan")).toBe("best");
    expect(petakanKodeLayananBiteship("sicepat", "SiCepat BEST")).toBe("best");
    expect(petakanKodeLayananBiteship("sicepat", "GOKIL (Kargo)")).toBe("gokil");
    expect(petakanKodeLayananBiteship("sicepat", "SIUNTUNG (Reguler)")).toBe("reg");

    // JNE
    expect(petakanKodeLayananBiteship("jne", "Yakin Esok Sampai")).toBe("yes");
    expect(petakanKodeLayananBiteship("jne", "JNE YES")).toBe("yes");
    expect(petakanKodeLayananBiteship("jne", "JTR Trucking Kargo")).toBe("jtr");
    expect(petakanKodeLayananBiteship("jne", "Reguler")).toBe("reg");

    // AnterAja
    expect(petakanKodeLayananBiteship("anteraja", "Next Day")).toBe("next_day");
    expect(petakanKodeLayananBiteship("anteraja", "Same Day")).toBe("same_day");
    expect(petakanKodeLayananBiteship("anteraja", "Reguler")).toBe("reg");

    // GoSend
    expect(petakanKodeLayananBiteship("gosend", "Instant Delivery")).toBe("instant");
    expect(petakanKodeLayananBiteship("gosend", "Same Day")).toBe("same_day");

    // Kode eksplisit yang sudah valid
    expect(petakanKodeLayananBiteship("sicepat", "Besok Sampai Tujuan", "best")).toBe("best");
  });
});
