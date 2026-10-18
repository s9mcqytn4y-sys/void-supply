import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifikasiStafAdmin } from "../actions/auth-guard";
import { ambilSesiPengguna } from "@/lib/auth/session";

// Mock ambilSesiPengguna
vi.mock("@/lib/auth/session", () => ({
  ambilSesiPengguna: vi.fn(),
}));

describe("Fase 3A: Admin & Operations Portal Architecture Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RBAC Authorization Guard (verifikasiStafAdmin)", () => {
    it("menolak keras jika tidak terdapat sesi pengguna yang aktif", async () => {
      vi.mocked(ambilSesiPengguna).mockResolvedValue(null);

      const hasil = await verifikasiStafAdmin();
      expect(hasil.sah).toBe(false);
      expect(hasil.pesan).toContain("Sesi tidak ditemukan");
    });

    it("menolak keras pengguna biasa dengan peran 'pelanggan'", async () => {
      vi.mocked(ambilSesiPengguna).mockResolvedValue({
        pengguna: {
          id: "usr-pelanggan-123",
          nama: "Rian Pelanggan",
          email: "rian@gmail.com",
          peran: "pelanggan",
          emailDiverifikasi: true,
        },
        sesi: {
          id: "session-123",
          token: "tok-123",
          kedaluwarsaPada: new Date(Date.now() + 3600000),
        },
      });

      const hasil = await verifikasiStafAdmin();
      expect(hasil.sah).toBe(false);
      expect(hasil.pesan).toContain("Akses Ditolak");
    });

    it("mengizinkan staf dengan peran 'operator'", async () => {
      vi.mocked(ambilSesiPengguna).mockResolvedValue({
        pengguna: {
          id: "usr-ops-123",
          nama: "Staf Logistik Johar Baru",
          email: "ops@voidsupply.local",
          peran: "operator",
          emailDiverifikasi: true,
        },
        sesi: {
          id: "session-ops-123",
          token: "tok-ops-123",
          kedaluwarsaPada: new Date(Date.now() + 3600000),
        },
      });

      const hasil = await verifikasiStafAdmin();
      expect(hasil.sah).toBe(true);
      expect(hasil.staf?.peran).toBe("operator");
      expect(hasil.staf?.email).toBe("ops@voidsupply.local");
    });

    it("mengizinkan staf dengan peran 'admin'", async () => {
      vi.mocked(ambilSesiPengguna).mockResolvedValue({
        pengguna: {
          id: "usr-admin-001",
          nama: "Super Admin",
          email: "admin@voidsupply.local",
          peran: "admin",
          emailDiverifikasi: true,
        },
        sesi: {
          id: "session-admin-001",
          token: "tok-admin-001",
          kedaluwarsaPada: new Date(Date.now() + 3600000),
        },
      });

      const hasil = await verifikasiStafAdmin();
      expect(hasil.sah).toBe(true);
      expect(hasil.staf?.peran).toBe("admin");
      expect(hasil.staf?.nama).toBe("Super Admin");
    });
  });
});
