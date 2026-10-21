import { describe, it, expect, vi, beforeEach } from "vitest";
import { batchRequestPickupBiteshipAction } from "../actions/pesanan-admin.action";
import * as authGuard from "../actions/auth-guard";
import * as biteshipService from "@/lib/services/biteship.service";
import * as outboxService from "@/lib/services/outbox.service";
import { db } from "@/lib/db";

// Mock dependencies
vi.mock("../actions/auth-guard", () => ({
  verifikasiStafAdmin: vi.fn(),
}));

vi.mock("@/lib/services/biteship.service", () => ({
  buatOrderPengirimanBiteship: vi.fn(),
  lacakPengirimanBiteship: vi.fn(),
}));

vi.mock("@/lib/services/outbox.service", () => ({
  tambahTugasOutboxLangsung: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const mockDb = {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
  };
  return { db: mockDb, pesanan: {}, pengiriman: {}, pelanggan: {}, itemPesanan: {}, pelacakanPengiriman: {} };
});

describe("Fase 3B: Batch Fulfillment & Request Pickup Biteship Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menolak eksekusi batch jika sesi staf admin tidak sah", async () => {
    vi.mocked(authGuard.verifikasiStafAdmin).mockResolvedValue({
      sah: false,
      sesi: null,
      pesan: "Sesi tidak ditemukan.",
    });

    const hasil = await batchRequestPickupBiteshipAction(["ORD-01", "ORD-02"]);
    expect(hasil.sukses).toBe(false);
    expect(hasil.totalDiminta).toBe(2);
    expect(hasil.totalBerhasil).toBe(0);
    expect(hasil.totalGagal).toBe(2);
    expect(hasil.pesan).toContain("Sesi tidak ditemukan");
  });

  it("merespons aman jika daftar nomor pesanan kosong", async () => {
    vi.mocked(authGuard.verifikasiStafAdmin).mockResolvedValue({
      sah: true,
      sesi: {
        pengguna: {
          id: "staf-01",
          nama: "Operator Logistik",
          email: "ops@voidsupply.local",
          peran: "operator",
          emailDiverifikasi: true,
        },
        sesi: {
          id: "ses-1",
          token: "tok-1",
          kedaluwarsaPada: new Date(),
        },
      },
      staf: {
        id: "staf-01",
        nama: "Operator Logistik",
        email: "ops@voidsupply.local",
        peran: "operator",
      },
    });

    const hasil = await batchRequestPickupBiteshipAction([]);
    expect(hasil.sukses).toBe(false);
    expect(hasil.pesan).toContain("Tidak ada pesanan");
    expect(hasil.totalDiminta).toBe(0);
  });

  it("menghemat saldo Biteship dengan menggunakan resi eksis jika sudah ada di database", async () => {
    vi.mocked(authGuard.verifikasiStafAdmin).mockResolvedValue({
      sah: true,
      sesi: {
        pengguna: {
          id: "staf-01",
          nama: "Operator Logistik",
          email: "ops@voidsupply.local",
          peran: "operator",
          emailDiverifikasi: true,
        },
        sesi: {
          id: "ses-1",
          token: "tok-1",
          kedaluwarsaPada: new Date(),
        },
      },
      staf: {
        id: "staf-01",
        nama: "Operator Logistik",
        email: "ops@voidsupply.local",
        peran: "operator",
      },
    });

    // Mock query database mengembalikan pesanan yang sudah memiliki nomorResi
    const mockOrderEksis = {
      pesanan: {
        id: "order-id-1",
        nomorPesanan: "ORD-EXISTING-1",
        statusPesanan: "diproses",
        tokenAkses: "token-123",
      },
      pengiriman: {
        id: "ship-1",
        nomorResi: "JNE-WAYBILL-999",
        kurir: "jne",
        biteshipOrderId: "biteship-ord-999",
      },
      pelanggan: {
        id: "cust-1",
        email: "customer@gmail.com",
        namaLengkap: "Rian Trendsetter",
      },
    };

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockOrderEksis]),
    };

    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
    const mockUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue({ rowCount: 1 }),
    };
    vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

    const hasil = await batchRequestPickupBiteshipAction(["ORD-EXISTING-1"]);

    expect(hasil.sukses).toBe(true);
    expect(hasil.totalBerhasil).toBe(1);
    expect(hasil.daftarSukses[0].nomorResi).toBe("JNE-WAYBILL-999");
    // Verifikasi API Biteship TIDAK dipanggil ulang demi menghemat kuota biaya
    expect(biteshipService.buatOrderPengirimanBiteship).not.toHaveBeenCalled();
  });

  it("mencegah duplikasi order Biteship saat pengiriman sedang dikunci oleh worker lain (Single Dispatch Guard)", async () => {
    vi.mocked(authGuard.verifikasiStafAdmin).mockResolvedValue({
      sah: true,
      sesi: {
        pengguna: {
          id: "staf-01",
          nama: "Operator Logistik",
          email: "ops@voidsupply.local",
          peran: "operator",
          emailDiverifikasi: true,
        },
        sesi: {
          id: "ses-1",
          token: "tok-1",
          kedaluwarsaPada: new Date(),
        },
      },
      staf: {
        id: "staf-01",
        nama: "Operator Logistik",
        email: "ops@voidsupply.local",
        peran: "operator",
      },
    });

    const mockOrderDiproses = {
      pesanan: {
        id: "order-id-2",
        nomorPesanan: "ORD-LOCKED-2",
        statusPesanan: "diproses",
        tokenAkses: "token-456",
      },
      pengiriman: {
        id: "ship-2",
        nomorResi: null,
        kurir: "jne",
        biteshipOrderId: "DISPATCHING_LOCKED_123",
      },
      pelanggan: {
        id: "cust-2",
        email: "locked@gmail.com",
        namaLengkap: "Rian Tester",
      },
    };

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockOrderDiproses]),
    };
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

    // Update mengembalikan array kosong menandakan CAS lock gagal diambil (sedang di-lock)
    const mockUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

    const hasil = await batchRequestPickupBiteshipAction(["ORD-LOCKED-2"]);

    expect(hasil.sukses).toBe(false);
    expect(hasil.totalGagal).toBe(1);
    expect(hasil.daftarGagal[0].alasan).toContain("sedang berlangsung");
    // Pastikan tidak ada pemanggilan side-effect ke Biteship API
    expect(biteshipService.buatOrderPengirimanBiteship).not.toHaveBeenCalled();
  });
});
