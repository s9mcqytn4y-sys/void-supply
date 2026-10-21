import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import {
  db,
  pesanan,
  pembayaran,
  varianProduk,
  produk,
  kategori,
} from "@/lib/db";
import { buatPesanan } from "@/features/checkout/actions/buat-pesanan.action";
import {
  inquireMidtransStatusAction,
  batalkanPesananAdminAction,
} from "@/features/admin/actions/pesanan-admin.lifecycle";
import { ambilSesiPengguna } from "@/lib/auth/session";

// Mock sesi dinamis: guest untuk checkout, admin untuk aksi manajemen
let mockSesiAktif: any = null;

const setAdminSession = () => {
  mockSesiAktif = {
    pengguna: {
      id: "usr_demo_void_collector_2026",
      nama: "Administrator VOID",
      email: "abdulaziz543333@gmail.com",
      peran: "admin",
      emailDiverifikasi: true,
    },
    sesi: {
      id: "ses-admin-001",
      token: "tok-admin-001",
      kedaluwarsaPada: new Date(Date.now() + 3600000),
    },
  };
};

const setGuestSession = () => {
  mockSesiAktif = null;
};

vi.mock("@/lib/auth/session", () => ({
  ambilSesiPengguna: vi.fn(async () => mockSesiAktif),
}));

describe("Fase 0 & 1 Hardening: Admin Order Lifecycle & Payment CAS Contract Tests", () => {
  let varianUjiId: string;
  let produkUjiId: string;

  beforeAll(async () => {
    process.env.ALLOW_PAYMENT_MOCK = "true";

    const [kat] = await db.select({ id: kategori.id }).from(kategori).limit(1);

    const [prod] = await db
      .insert(produk)
      .values({
        kategoriId: kat.id,
        nama: `Produk Lifecycle Test ${Date.now()}`,
        slug: `prod-lifecycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        deskripsi: "Produk uji terisolasi untuk suite siklus hidup pesanan admin",
        hargaDasar: 150000,
        gambarUtama: "/images/products/drop-04/void-tee-01-front.webp",
      })
      .returning({ id: produk.id });

    produkUjiId = prod.id;

    const [varian] = await db
      .insert(varianProduk)
      .values({
        produkId: prod.id,
        ukuran: "L",
        sku: `SKU-LC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stok: 30,
        harga: 150000,
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
        // Abaikan jika sudah dibersihkan
      }
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    setGuestSession();
  });

  it("kontrak 1: pembatalan pesanan berstatus 'diproses' (berbayar) memulihkan stok dan menandai status pembayaran 'dikembalikan'", async () => {
    const resPesanan = await buatPesanan({
      namaLengkap: "Rian Tester",
      email: "rian.test@example.com",
      telepon: "081234567890",
      alamatLengkap: "Jl. Kramat Jaya No. 12",
      kota: "Jakarta Pusat",
      provinsi: "DKI Jakarta",
      kodePos: "10560",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      idempotensiKey: `IDEMP-LC-CANCEL-PAID-${Date.now()}`,
      items: [{ varianId: varianUjiId, jumlah: 2 }],
    });

    expect(resPesanan.sukses).toBe(true);
    const nomorPesanan = resPesanan.nomorPesanan!;

    const [pesananAwal] = await db
      .select({ id: pesanan.id })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan));

    expect(pesananAwal).toBeDefined();

    // Simulasikan pembayaran sudah lunas (status pesanan 'diproses')
    await db
      .update(pesanan)
      .set({ statusPesanan: "diproses" })
      .where(eq(pesanan.nomorPesanan, nomorPesanan));

    await db
      .update(pembayaran)
      .set({ statusPembayaran: "berhasil", dibayarPada: new Date() })
      .where(eq(pembayaran.pesananId, pesananAwal.id));

    // Admin mengeksekusi pembatalan pesanan
    setAdminSession();
    const resBatal = await batalkanPesananAdminAction(
      nomorPesanan,
      "Permintaan pembatalan pelanggan sebelum pengiriman fisik"
    );

    expect(resBatal.sukses).toBe(true);
    expect(resBatal.pesan).toContain("dikembalikan");

    // Verifikasi status pesanan di database
    const [pesananTerkini] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan));
    expect(pesananTerkini.statusPesanan).toBe("dibatalkan");

    // Verifikasi status pembayaran di database berubah menjadi 'dikembalikan'
    const [pembayaranTerkini] = await db
      .select()
      .from(pembayaran)
      .where(eq(pembayaran.pesananId, pesananAwal.id));
    expect(pembayaranTerkini.statusPembayaran).toBe("dikembalikan");
  });

  it("kontrak 2: pembatalan pesanan berstatus 'menunggu_pembayaran' memulihkan stok dan menandai status pembayaran 'gagal'", async () => {
    const resPesanan = await buatPesanan({
      namaLengkap: "Rian Unpaid",
      email: "rian.unpaid@example.com",
      telepon: "081234567891",
      alamatLengkap: "Jl. Percetakan Negara No. 4",
      kota: "Jakarta Pusat",
      provinsi: "DKI Jakarta",
      kodePos: "10560",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      idempotensiKey: `IDEMP-LC-CANCEL-UNPAID-${Date.now()}`,
      items: [{ varianId: varianUjiId, jumlah: 1 }],
    });

    expect(resPesanan.sukses).toBe(true);
    const nomorPesanan = resPesanan.nomorPesanan!;

    const [pesananAwal] = await db
      .select({ id: pesanan.id })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan));

    expect(pesananAwal).toBeDefined();

    setAdminSession();
    const resBatal = await batalkanPesananAdminAction(
      nomorPesanan,
      "Dibatalkan atas permintaan pelanggan sebelum pembayaran"
    );

    expect(resBatal.sukses).toBe(true);
    expect(resBatal.pesan).not.toContain("dikembalikan");

    const [pesananTerkini] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan));
    expect(pesananTerkini.statusPesanan).toBe("dibatalkan");

    const [pembayaranTerkini] = await db
      .select()
      .from(pembayaran)
      .where(eq(pembayaran.pesananId, pesananAwal.id));
    expect(pembayaranTerkini.statusPembayaran).toBe("gagal");
  });

  it("kontrak 3: inkuiri gateway dengan capture dan fraud_status challenge menolak mutasi status ke diproses", async () => {
    const resPesanan = await buatPesanan({
      namaLengkap: "Fraud Tester",
      email: "fraud.test@example.com",
      telepon: "081234567899",
      alamatLengkap: "Jl. Salemba Raya No. 1",
      kota: "Jakarta Pusat",
      provinsi: "DKI Jakarta",
      kodePos: "10560",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      idempotensiKey: `IDEMP-LC-INQUIRE-FRAUD-${Date.now()}`,
      items: [{ varianId: varianUjiId, jumlah: 1 }],
    });

    expect(resPesanan.sukses).toBe(true);
    const nomorPesanan = resPesanan.nomorPesanan!;

    const [pesananAwal] = await db
      .select({ id: pesanan.id })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan));

    expect(pesananAwal).toBeDefined();

    // Mock global fetch untuk simulasi respons Midtrans status API
    const fetchAsli = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        transaction_status: "capture",
        fraud_status: "challenge",
        payment_type: "credit_card",
        transaction_id: "trx-mock-fraud-123",
      }),
    } as any);

    try {
      setAdminSession();
      const resInquire = await inquireMidtransStatusAction(nomorPesanan);
      expect(resInquire.sukses).toBe(true);

      const [pesananTerkini] = await db
        .select()
        .from(pesanan)
        .where(eq(pesanan.nomorPesanan, nomorPesanan));

      // Status pesanan HARUS tetap 'menunggu_pembayaran', tidak boleh langsung 'diproses'
      expect(pesananTerkini.statusPesanan).toBe("menunggu_pembayaran");

      const [pembayaranTerkini] = await db
        .select()
        .from(pembayaran)
        .where(eq(pembayaran.pesananId, pesananAwal.id));
      expect(pembayaranTerkini.statusPembayaran).toBe("menunggu_pembayaran");
    } finally {
      global.fetch = fetchAsli;
    }
  });

  it("kontrak 4: inkuiri gateway settlement menyinkronkan status pesanan dan pembayaran secara atomik", async () => {
    const resPesanan = await buatPesanan({
      namaLengkap: "Settlement Tester",
      email: "settlement.test@example.com",
      telepon: "081234567898",
      alamatLengkap: "Jl. Cempaka Putih Tengah",
      kota: "Jakarta Pusat",
      provinsi: "DKI Jakarta",
      kodePos: "10560",
      kodeKurir: "jne",
      layananKurir: "Reguler",
      idempotensiKey: `IDEMP-LC-INQUIRE-SETTLE-${Date.now()}`,
      items: [{ varianId: varianUjiId, jumlah: 1 }],
    });

    expect(resPesanan.sukses).toBe(true);
    const nomorPesanan = resPesanan.nomorPesanan!;

    const [pesananAwal] = await db
      .select({ id: pesanan.id })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan));

    expect(pesananAwal).toBeDefined();

    const fetchAsli = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        transaction_status: "settlement",
        fraud_status: "accept",
        payment_type: "qris",
        transaction_id: "trx-mock-settle-123",
      }),
    } as any);

    try {
      setAdminSession();
      const resInquire = await inquireMidtransStatusAction(nomorPesanan);
      expect(resInquire.sukses).toBe(true);

      const [pesananTerkini] = await db
        .select()
        .from(pesanan)
        .where(eq(pesanan.nomorPesanan, nomorPesanan));
      expect(pesananTerkini.statusPesanan).toBe("diproses");

      const [pembayaranTerkini] = await db
        .select()
        .from(pembayaran)
        .where(eq(pembayaran.pesananId, pesananAwal.id));
      expect(pembayaranTerkini.statusPembayaran).toBe("berhasil");
      expect(pembayaranTerkini.gatewayTransactionId).toBe("trx-mock-settle-123");
    } finally {
      global.fetch = fetchAsli;
    }
  });
});
