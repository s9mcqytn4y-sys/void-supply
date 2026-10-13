import { describe, it, expect, vi } from "vitest";
import { POST } from "../route";
import { db, pesanan } from "@/lib/db";

vi.mock("@/lib/services/midtrans.service", () => ({
  verifikasiSignatureMidtrans: vi.fn(
    (orderId, statusCode, grossAmount, signatureKey) => {
      return signatureKey === "valid_signature_test";
    }
  ),
}));

describe("Module 02.15: Midtrans Webhook Matrix & Compare-and-Set Suite", () => {
  it("menolak webhook dengan HTTP 400 jika payload tidak lengkap", async () => {
    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: "VOID-TEST",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("tidak lengkap");
  });

  it("menolak webhook dengan HTTP 403 jika signature hash salah", async () => {
    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: "VOID-TEST",
        status_code: "200",
        gross_amount: "500000.00",
        signature_key: "invalid_signature_hash",
        transaction_status: "settlement",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("signature_key tidak valid");
  });

  it("menolak webhook dengan HTTP 404 jika nomor pesanan tidak terdaftar", async () => {
    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: `VOID-UNKNOWN-${Date.now()}`,
        status_code: "200",
        gross_amount: "250000.00",
        signature_key: "valid_signature_test",
        transaction_status: "settlement",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("menolak webhook dengan HTTP 422 jika nominal tagihan (gross_amount) tidak cocok", async () => {
    // 1. Ambil pesanan nyata di database
    const [orderDb] = await db
      .select({
        nomorPesanan: pesanan.nomorPesanan,
        totalAkhir: pesanan.totalAkhir,
      })
      .from(pesanan)
      .limit(1);

    if (!orderDb) return;

    const nominalBeda = `${orderDb.totalAkhir + 50000}.00`;

    const req = new Request("http://localhost:3000/api/midtrans/webhook", {
      method: "POST",
      body: JSON.stringify({
        order_id: orderDb.nomorPesanan,
        status_code: "200",
        gross_amount: nominalBeda,
        signature_key: "valid_signature_test",
        transaction_status: "settlement",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toContain("gross_amount tidak cocok");
  });
});
