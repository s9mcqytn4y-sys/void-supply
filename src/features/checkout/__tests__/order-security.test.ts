import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db, varianProduk } from "@/lib/db";
import { sql } from "drizzle-orm";
import { buatPesanan } from "../actions/buat-pesanan.action";
import { ambilStatusPesanan } from "../actions/status-pesanan.action";
import { GET as handlerCron } from "@/app/api/cron/kadaluwarsa-pesanan/route";

describe("Module 02.15: SEC-01 & SEC-02 Security Hardening Suite", () => {
  const secretUji = "test-cron-secret-super-secure-token";
  const secretAwal = process.env.CRON_SECRET;

  beforeAll(() => {
    process.env.ALLOW_PAYMENT_MOCK = "true";
  });

  afterAll(() => {
    if (secretAwal !== undefined) {
      process.env.CRON_SECRET = secretAwal;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  describe("SEC-01: Cron Fail-Closed Authentication (/api/cron/kadaluwarsa-pesanan)", () => {
    it("menolak eksekusi dengan status 500 jika CRON_SECRET tidak disetel di environment", async () => {
      delete process.env.CRON_SECRET;

      const req = new NextRequest("http://localhost:3000/api/cron/kadaluwarsa-pesanan", {
        method: "GET",
        headers: {
          authorization: "Bearer sembarang-token",
        },
      });

      const res = await handlerCron(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.error).toContain("CRON_SECRET belum dikonfigurasi");
    });

    it("menolak eksekusi dengan status 401 jika header Authorization tidak ada", async () => {
      process.env.CRON_SECRET = secretUji;

      const req = new NextRequest("http://localhost:3000/api/cron/kadaluwarsa-pesanan", {
        method: "GET",
      });

      const res = await handlerCron(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toContain("Akses tidak diizinkan");
    });

    it("menolak eksekusi dengan status 401 jika token Authorization salah", async () => {
      process.env.CRON_SECRET = secretUji;

      const req = new NextRequest("http://localhost:3000/api/cron/kadaluwarsa-pesanan", {
        method: "GET",
        headers: {
          authorization: "Bearer token-yang-keliru",
        },
      });

      const res = await handlerCron(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it("mengizinkan eksekusi dengan status 200 jika token Authorization valid dan tidak membocorkan nomor pesanan", async () => {
      process.env.CRON_SECRET = secretUji;

      const req = new NextRequest("http://localhost:3000/api/cron/kadaluwarsa-pesanan", {
        method: "GET",
        headers: {
          authorization: `Bearer ${secretUji}`,
        },
      });

      const res = await handlerCron(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBe("ok");
      expect(typeof json.jumlahDibatalkan).toBe("number");
      // Memastikan response payload tidak membocorkan daftar nomor pesanan
      expect(json.nomorPesanan).toBeUndefined();
    });
  });

  describe("SEC-02: IDOR Protection & High-Entropy Access Token Verification", () => {
    it("menyamarkan PII dan mengunci akses pembayaran saat diakses tanpa token atau token keliru", async () => {
      const [varian] = await db
        .select({ id: varianProduk.id, stok: varianProduk.stok })
        .from(varianProduk)
        .where(sql`${varianProduk.stok} >= 2`)
        .limit(1);

      expect(varian).toBeDefined();

      const orderPayload = {
        namaLengkap: "Rian Hendrawan",
        email: "rian.hendrawan@example.com",
        telepon: "081234567890",
        alamatLengkap: "Jl. M.H. Thamrin No. 28",
        kota: "Jakarta Pusat",
        provinsi: "DKI Jakarta",
        kodePos: "10350",
        kodeKurir: "jne",
        layananKurir: "Reguler",
        idempotensiKey: `sec02-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        items: [{ varianId: varian.id, jumlah: 1 }],
      };

      const hasilOrder = await buatPesanan(orderPayload);
      expect(hasilOrder.sukses).toBe(true);
      expect(hasilOrder.nomorPesanan).toBeDefined();
      expect(hasilOrder.tokenAkses).toBeDefined();

      const nomorPesanan = hasilOrder.nomorPesanan!;
      const tokenValid = hasilOrder.tokenAkses!;

      // 1. Akses tanpa token (pengunjung asing / crawler)
      const hasilTanpaToken = await ambilStatusPesanan(nomorPesanan);
      expect(hasilTanpaToken.sukses).toBe(true);
      expect(hasilTanpaToken.data).toBeDefined();
      expect(hasilTanpaToken.data!.isAuthorized).toBe(false);
      // PII harus tersamarkan
      expect(hasilTanpaToken.data!.namaPelanggan).toContain("***");
      expect(hasilTanpaToken.data!.emailPelanggan).toContain("***@");
      expect(hasilTanpaToken.data!.teleponPelanggan).toContain("****");
      expect(hasilTanpaToken.data!.pembayaran?.snapRedirectUrl).toBeUndefined();
      expect(hasilTanpaToken.data!.pembayaran?.snapToken).toBeUndefined();

      // 2. Akses dengan token keliru (brute-force / IDOR attempt)
      const hasilTokenSalah = await ambilStatusPesanan(nomorPesanan, "invalid-token-uuid");
      expect(hasilTokenSalah.sukses).toBe(true);
      expect(hasilTokenSalah.data).toBeDefined();
      expect(hasilTokenSalah.data!.isAuthorized).toBe(false);
      expect(hasilTokenSalah.data!.namaPelanggan).toContain("***");
      expect(hasilTokenSalah.data!.pembayaran?.snapRedirectUrl).toBeUndefined();
      expect(hasilTokenSalah.data!.pembayaran?.snapToken).toBeUndefined();

      // 3. Akses dengan token valid (pemilik order sesungguhnya)
      const hasilResmi = await ambilStatusPesanan(nomorPesanan, tokenValid);
      expect(hasilResmi.sukses).toBe(true);
      expect(hasilResmi.data).toBeDefined();
      expect(hasilResmi.data!.isAuthorized).toBe(true);
      expect(hasilResmi.data!.namaPelanggan).toBe("Rian Hendrawan");
      expect(hasilResmi.data!.emailPelanggan).toBe("rian.hendrawan@example.com");
      expect(hasilResmi.data!.teleponPelanggan).toBe("081234567890");
    });
  });
});
