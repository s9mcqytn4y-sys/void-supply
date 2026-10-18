import { describe, it, expect, vi, beforeEach } from "vitest";
import { konfirmasiPesananDiterimaAction } from "../actions/konfirmasi-diterima.action";

// Mock database Drizzle
const mockSelect = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/db", () => {
  return {
    db: {
      update: (...args: unknown[]) => mockUpdate(...args),
      select: (...args: unknown[]) => mockSelect(...args),
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
    pengiriman: {
      pesananId: "pesanan_id",
      nomorResi: "nomor_resi",
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

  it("menolak konfirmasi jika pesanan masih berstatus 'diproses'", async () => {
    mockSelect.mockReturnValueOnce({
      from: () => ({
        where: () => ({
          limit: () =>
            Promise.resolve([
              {
                id: "order-1",
                statusPesanan: "diproses",
                diterimaPada: null,
                garansiBerakhirPada: null,
              },
            ]),
        }),
      }),
    });

    const res = await konfirmasiPesananDiterimaAction({
      nomorPesanan: "VOID-20261017-001",
      tokenAkses: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(res.sukses).toBe(false);
    expect(res.pesan).toContain("masih dalam tahap penyiapan");
  });

  it("menolak konfirmasi jika pesanan belum memiliki nomor resi kurir", async () => {
    mockSelect
      .mockReturnValueOnce({
        from: () => ({
          where: () => ({
            limit: () =>
              Promise.resolve([
                {
                  id: "order-1",
                  statusPesanan: "dikirim",
                  diterimaPada: null,
                  garansiBerakhirPada: null,
                },
              ]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ nomorResi: null }]),
          }),
        }),
      });

    const res = await konfirmasiPesananDiterimaAction({
      nomorPesanan: "VOID-20261017-001",
      tokenAkses: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(res.sukses).toBe(false);
    expect(res.pesan).toContain("belum memiliki nomor resi");
  });
});
