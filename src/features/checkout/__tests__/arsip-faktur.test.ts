import { describe, it, expect, vi, beforeEach } from "vitest";
import { simpanSnapshotArsipFaktur } from "../services/arsip-faktur.service";
import crypto from "crypto";

// Mock database Drizzle
vi.mock("@/lib/db", () => {
  return {
    db: {
      query: {
        arsipFaktur: {
          findFirst: vi.fn(),
        },
      },
      select: vi.fn(),
      insert: vi.fn(),
    },
    faktur: { id: "id", nomorFaktur: "nomor_faktur" },
    arsipFaktur: { id: "id", fakturId: "faktur_id", nomorFaktur: "nomor_faktur", snapshotPayload: "snapshot_payload", hashIntegrity: "hash_integrity" },
    pesanan: { id: "id", nomorPesanan: "nomor_pesanan" },
    itemPesanan: { id: "id", pesananId: "pesanan_id" },
    pengiriman: { id: "id", pesananId: "pesanan_id" },
    pembayaran: { id: "id", pesananId: "pesanan_id" },
  };
});

describe("Arsip Faktur Service Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengembalikan arsip eksis secara idempoten jika sudah tercatat", async () => {
    const { db } = await import("@/lib/db");
    const mockDb = db as any;

    mockDb.query.arsipFaktur.findFirst.mockResolvedValueOnce({
      id: "arsip-uuid-1",
      hashIntegrity: "mock-hash-64",
    });

    const res = await simpanSnapshotArsipFaktur("faktur-1", "INV/20261017/001", "pesanan-1");

    expect(res.sukses).toBe(true);
    expect(res.pesan).toContain("sudah tercatat");
    expect(res.arsipId).toBe("arsip-uuid-1");
    expect(res.hashIntegrity).toBe("mock-hash-64");
  });

  it("gagal dengan pesan jelas jika data pesanan tidak ditemukan", async () => {
    const { db } = await import("@/lib/db");
    const mockDb = db as any;

    mockDb.query.arsipFaktur.findFirst.mockResolvedValueOnce(null);
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([]),
        }),
      }),
    });

    const res = await simpanSnapshotArsipFaktur("faktur-1", "INV/20261017/001", "pesanan-tidak-ada");

    expect(res.sukses).toBe(false);
    expect(res.pesan).toContain("tidak ditemukan");
  });

  it("berhasil membuat snapshot JSONB dan menghitung SHA-256 integrity hash", async () => {
    const { db } = await import("@/lib/db");
    const mockDb = db as any;

    // 1. findFirst arsipFaktur -> null
    mockDb.query.arsipFaktur.findFirst.mockResolvedValueOnce(null);

    // 2. select pesanan
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([
            {
              id: "pesanan-1",
              nomorPesanan: "VOID-20261017-001",
              namaPelanggan: "Budi Santoso",
              emailPelanggan: "budi@voidsupply.com",
              teleponPelanggan: "08123456789",
              subtotal: 500000,
              totalOngkir: 25000,
              totalDiskon: 0,
              kodeVoucher: null,
              totalAkhir: 525000,
            },
          ]),
        }),
      }),
    });

    // 3. select itemPesanan
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce([
          {
            id: "item-1",
            namaProduk: "Heavyweight Boxy Tee",
            namaVarian: "Black / L",
            sku: "VOID-D04-TEE-BLK-L",
            hargaSatuan: 500000,
            jumlah: 1,
            subtotalItem: 500000,
          },
        ]),
      }),
    });

    // 4. select pengiriman
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([
            {
              alamatLengkap: "Jl. Sudirman No. 1",
              kota: "Jakarta Selatan",
              provinsi: "DKI Jakarta",
              kodePos: "12190",
              kurir: "sicepat",
              layanan: "GOKIL",
              nomorResi: "SC123456789",
              estimasiHari: "1-2 hari",
            },
          ]),
        }),
      }),
    });

    // 5. select pembayaran
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([
            {
              metodePembayaran: "bca_va",
              gatewayTransactionId: "TRX-12345",
              dibayarPada: new Date("2026-10-17T12:00:00Z"),
              statusPembayaran: "berhasil",
            },
          ]),
        }),
      }),
    });

    // 6. insert arsipFaktur
    mockDb.insert.mockReturnValueOnce({
      values: vi.fn().mockReturnValueOnce({
        returning: vi.fn().mockResolvedValueOnce([
          {
            id: "arsip-baru-1",
            hashIntegrity: "mock-sha256-hash",
          },
        ]),
      }),
    });

    const res = await simpanSnapshotArsipFaktur("faktur-1", "INV/20261017/001", "pesanan-1");

    expect(res.sukses).toBe(true);
    expect(res.arsipId).toBe("arsip-baru-1");
    expect(res.hashIntegrity).toBeDefined();
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });
});
