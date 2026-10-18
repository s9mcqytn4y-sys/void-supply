import { describe, it, expect } from "vitest";
import {
  skemaDaftarAkun,
  skemaMasukAkun,
  skemaLupaPassword,
  skemaResetPassword,
} from "../schemas/auth.schema";

describe("Phase 2B: Auth Zod Schemas Validation Suite", () => {
  describe("skemaDaftarAkun", () => {
    it("menerima data registrasi yang valid dengan kata sandi >= 12 karakter", () => {
      const payloadValid = {
        namaLengkap: "Rian Pratama",
        email: "rian.trendsetter@voidsupply.test",
        kataSandi: "super-secure-password-1234",
        setujuKetentuan: true,
        setujuMarketing: true,
      };

      const hasil = skemaDaftarAkun.safeParse(payloadValid);
      expect(hasil.success).toBe(true);
    });

    it("menolak registrasi jika kata sandi kurang dari 12 karakter (NIST 800-63B standard)", () => {
      const payloadPendek = {
        namaLengkap: "Rian Pratama",
        email: "rian.trendsetter@voidsupply.test",
        kataSandi: "pendek123",
        setujuKetentuan: true,
      };

      const hasil = skemaDaftarAkun.safeParse(payloadPendek);
      expect(hasil.success).toBe(false);
      if (!hasil.success) {
        expect(hasil.error.issues[0].message).toContain("minimal 12 karakter");
      }
    });

    it("menolak registrasi jika pengguna tidak menyetujui syarat & ketentuan", () => {
      const payloadTanpaSetuju = {
        namaLengkap: "Rian Pratama",
        email: "rian.trendsetter@voidsupply.test",
        kataSandi: "super-secure-password-1234",
        setujuKetentuan: false,
      };

      const hasil = skemaDaftarAkun.safeParse(payloadTanpaSetuju);
      expect(hasil.success).toBe(false);
    });
  });

  describe("skemaMasukAkun", () => {
    it("menerima email dan kata sandi yang valid", () => {
      const payload = {
        email: "rian.trendsetter@voidsupply.test",
        kataSandi: "super-secure-password-1234",
        ingatSaya: true,
      };

      const hasil = skemaMasukAkun.safeParse(payload);
      expect(hasil.success).toBe(true);
    });

    it("menolak email dengan format tidak valid", () => {
      const payload = {
        email: "bukan-email-valid",
        kataSandi: "super-secure-password-1234",
      };

      const hasil = skemaMasukAkun.safeParse(payload);
      expect(hasil.success).toBe(false);
    });
  });

  describe("skemaLupaPassword & skemaResetPassword", () => {
    it("memvalidasi email lupa password", () => {
      const hasil = skemaLupaPassword.safeParse({
        email: "rian@voidsupply.test",
      });
      expect(hasil.success).toBe(true);
    });

    it("menolak reset password tanpa token atau dengan password pendek", () => {
      const hasil = skemaResetPassword.safeParse({
        token: "",
        kataSandiBaru: "123",
      });
      expect(hasil.success).toBe(false);
    });
  });
});
