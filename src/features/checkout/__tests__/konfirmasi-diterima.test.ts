import { describe, it, expect, vi, beforeEach } from "vitest";
import { konfirmasiPesananDiterimaAction } from "../actions/konfirmasi-diterima.action";

// Mock database Drizzle
vi.mock("@/lib/db", () => {
  return {
    db: {
      update: vi.fn(),
      select: vi.fn(),
    },
    pesanan: {
      nomorPesanan: "nomor_pesanan",
      tokenAkses: "token_akses",
      statusPesanan: "status_pesanan",
      diterimaPada: "diterima_pada",
      garansiBerakhirPada: "garansi_berakhir_pada",
      catatanPenerima: "catatan_penerima",
      diperbaruiPada: "diperbarui_pada",
      id: "id",
    },
  };
});

describe("Konfirmasi Pesanan Diterima Server Action Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menolak request bila format token akses bukan UUID", async () => {
    const res = await konfirmasiPesananDiterimaAction({
      nomorPesanan: "VOID-20261017-001",
      tokenAkses: "invalid-uuid-token",
    });

    expect(res.sukses).toBe(false);
    expect(res.pesan).toContain("Token akses");
  });

  it("menolak request jika nomor pesanan kosong", async () => {
    const res = await konfirmasiPesananDiterimaAction({
      nomorPesanan: "",
      tokenAkses: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(res.sukses).toBe(false);
    expect(res.pesan).toContain("Nomor pesanan wajib diisi");
  });
});
