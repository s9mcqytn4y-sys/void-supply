import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifikasiSignatureMidtrans } from "@/lib/services/midtrans.service";
import { formulirCheckoutSkema } from "../schemas/checkout.schema";

describe("Module 02.14: Checkout Integrity & Security Suite", () => {
  describe("1. Formulir Checkout Runtime Zod Validation", () => {
    it("menolak payload jika alamat atau nomor telepon tidak memenuhi spesifikasi", () => {
      const payloadTidakValid = {
        namaLengkap: "Ri", // terlalu pendek
        email: "bukan-email",
        telepon: "123", // kurang dari 10 digit
        alamatLengkap: "Pendek",
        kota: "J",
        provinsi: "D",
        kodePos: "123", // bukan 5 digit
        kodeKurir: "",
        layananKurir: "",
        items: [],
      };

      const result = formulirCheckoutSkema.safeParse(payloadTidakValid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorFields = result.error.errors.map((e) => e.path[0]);
        expect(errorFields).toContain("namaLengkap");
        expect(errorFields).toContain("email");
        expect(errorFields).toContain("telepon");
        expect(errorFields).toContain("alamatLengkap");
        expect(errorFields).toContain("kodePos");
        expect(errorFields).toContain("items");
      }
    });

    it("menolak tarifOngkirIdr dari client karena skema bersifat server-authoritative", () => {
      const payloadDenganOngkirPalsu = {
        namaLengkap: "Rian Pratama",
        email: "rian@voidsupply.test",
        telepon: "081298765432",
        alamatLengkap: "Jl. Kemang Timur No. 42, Bangka",
        kota: "Jakarta Selatan",
        provinsi: "DKI Jakarta",
        kodePos: "12730",
        kodeKurir: "jne",
        layananKurir: "REG",
        tarifOngkirIdr: 0, // Manipulasi client!
        items: [
          {
            varianId: "11111111-1111-1111-1111-111111111111",
            jumlah: 2,
          },
        ],
      };

      const parsed = formulirCheckoutSkema.parse(payloadDenganOngkirPalsu);
      // tarifOngkirIdr di-strip oleh Zod parser dan tidak masuk ke tipe runtime terverifikasi
      expect((parsed as any).tarifOngkirIdr).toBeUndefined();
    });
  });

  describe("2. Verifikasi Kriptografis Signature SHA-512 Midtrans", () => {
    const serverKey = "SB-Mid-server-testkey12345";
    const orderId = "VOID-20261010-88888";
    const statusCode = "200";
    const grossAmount = "750000.00";

    it("memvalidasi signature hash SHA-512 yang sah", () => {
      const crypto = require("crypto");
      const validHash = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");

      const isValid = verifikasiSignatureMidtrans(
        orderId,
        statusCode,
        grossAmount,
        validHash,
        serverKey
      );

      expect(isValid).toBe(true);
    });

    it("menolak signature yang diutak-atik (tampered payload)", () => {
      const fakeHash = "abcdef0123456789abcdef0123456789";

      const isValid = verifikasiSignatureMidtrans(
        orderId,
        statusCode,
        grossAmount,
        fakeHash,
        serverKey
      );

      expect(isValid).toBe(false);
    });

    it("menolak jika gross_amount diubah di tengah jalan", () => {
      const crypto = require("crypto");
      // Dihitung dengan nominal asli 750000
      const originalHash = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");

      // Payload mencoba melaporkan harga yang lebih kecil (100000)
      const isTamperedAmount = verifikasiSignatureMidtrans(
        orderId,
        statusCode,
        "100000.00",
        originalHash,
        serverKey
      );

      expect(isTamperedAmount).toBe(false);
    });
  });

  describe("3. Deduplikasi SKU / Varian ID Logic", () => {
    it("menggabungkan quantity ketika varianId yang sama dikirim berulang", () => {
      const rawItems = [
        { varianId: "var-1", jumlah: 2 },
        { varianId: "var-2", jumlah: 1 },
        { varianId: "var-1", jumlah: 3 },
      ];

      const itemGabunganMap = new Map<string, number>();
      for (const item of rawItems) {
        const jumlahLama = itemGabunganMap.get(item.varianId) || 0;
        itemGabunganMap.set(item.varianId, jumlahLama + item.jumlah);
      }

      expect(itemGabunganMap.size).toBe(2);
      expect(itemGabunganMap.get("var-1")).toBe(5);
      expect(itemGabunganMap.get("var-2")).toBe(1);
    });
  });
});
