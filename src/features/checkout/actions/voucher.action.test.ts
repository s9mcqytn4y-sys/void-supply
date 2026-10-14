import { describe, it, expect, vi, beforeEach } from "vitest";
import { validasiVoucherAction } from "./voucher.action";
import { db } from "@/lib/db";

// Mock database query
vi.mock("@/lib/db", () => {
  return {
    db: {
      select: vi.fn(),
    },
    aturanDiskon: {
      kode: "kode",
      apakahAktif: "apakah_aktif",
      tipeDiskon: "tipe_diskon",
      nilaiDiskon: "nilai_diskon",
      minimalPembelian: "minimal_pembelian",
      maksimalPotongan: "maksimal_potongan",
      tanggalMulai: "tanggal_mulai",
      tanggalBerakhir: "tanggal_berakhir",
      kuotaPenggunaan: "kuota_penggunaan",
      totalDigunakan: "total_digunakan",
    },
  };
});

describe("validasiVoucherAction (Module 02.17)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menolak kode voucher kosong", async () => {
    const hasil = await validasiVoucherAction({ kode: "", subtotal: 500000 });
    expect(hasil.sukses).toBe(false);
    expect(hasil.pesan).toContain("Kode voucher wajib diisi");
  });

  it("menolak jika voucher tidak ditemukan di basis data", async () => {
    const mockWhere = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue([]),
    });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

    const hasil = await validasiVoucherAction({ kode: "TIDAKADA", subtotal: 500000 });
    expect(hasil.sukses).toBe(false);
    expect(hasil.pesan).toContain("tidak ditemukan");
  });

  it("menghitung diskon persentase dengan benar dan membatasi jika ada maksimalPotongan", async () => {
    const mockVoucher = {
      kode: "WELCOME10",
      nama: "Welcome Discount",
      apakahAktif: true,
      tipeDiskon: "persentase",
      nilaiDiskon: 10,
      minimalPembelian: 200000,
      maksimalPotongan: 50000,
      tanggalMulai: null,
      tanggalBerakhir: null,
      kuotaPenggunaan: null,
      totalDigunakan: 5,
    };

    const mockWhere = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue([mockVoucher]),
    });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

    // Subtotal 1.000.000 -> 10% = 100.000, tapi maksimalPotongan = 50.000
    const hasil = await validasiVoucherAction({ kode: "welcome10", subtotal: 1000000 });
    expect(hasil.sukses).toBe(true);
    expect(hasil.kode).toBe("WELCOME10");
    expect(hasil.potonganIdr).toBe(50000);
  });

  it("menolak jika subtotal belum memenuhi minimalBelanja", async () => {
    const mockVoucher = {
      kode: "DROP04",
      nama: "Drop 04 Promo",
      apakahAktif: true,
      tipeDiskon: "persentase",
      nilaiDiskon: 15,
      minimalPembelian: 500000,
      maksimalPotongan: null,
      tanggalMulai: null,
      tanggalBerakhir: null,
      kuotaPenggunaan: null,
      totalDigunakan: 0,
    };

    const mockWhere = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue([mockVoucher]),
    });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

    const hasil = await validasiVoucherAction({ kode: "DROP04", subtotal: 300000 });
    expect(hasil.sukses).toBe(false);
    expect(hasil.pesan).toContain("Minimal pembelanjaan");
  });
});
