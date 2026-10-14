"use server";

import { db } from "@/lib/db";
import { aturanDiskon } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const validasiVoucherSkema = z.object({
  kode: z.string().min(1, "Kode voucher wajib diisi").trim().toUpperCase(),
  subtotal: z.number().int().nonnegative("Subtotal harus berupa bilangan positif"),
});

export interface HasilValidasiVoucher {
  sukses: boolean;
  kode?: string;
  nama?: string;
  tipeDiskon?: "persentase" | "potongan_tetap";
  potonganIdr: number;
  pesan: string;
}

/**
 * Server Action: Validasi Voucher & Kalkulasi Diskon Transparan
 */
export async function validasiVoucherAction(input: {
  kode: string;
  subtotal: number;
}): Promise<HasilValidasiVoucher> {
  const parseResult = validasiVoucherSkema.safeParse(input);
  if (!parseResult.success) {
    return {
      sukses: false,
      potonganIdr: 0,
      pesan: parseResult.error.issues[0]?.message || "Input voucher tidak valid",
    };
  }

  const { kode, subtotal } = parseResult.data;

  try {
    const [voucher] = await db
      .select()
      .from(aturanDiskon)
      .where(and(eq(aturanDiskon.kode, kode.toUpperCase()), eq(aturanDiskon.apakahAktif, true)))
      .limit(1);

    if (!voucher) {
      return {
        sukses: false,
        potonganIdr: 0,
        pesan: "Kode voucher tidak ditemukan atau sudah tidak aktif.",
      };
    }

    // Cek batas kuota
    if (voucher.kuotaPenggunaan !== null && voucher.totalDigunakan >= voucher.kuotaPenggunaan) {
      return {
        sukses: false,
        potonganIdr: 0,
        pesan: "Kuota penggunaan voucher ini telah habis.",
      };
    }

    // Cek masa berlaku
    const sekarang = new Date();
    if (voucher.tanggalMulai && sekarang < voucher.tanggalMulai) {
      return {
        sukses: false,
        potonganIdr: 0,
        pesan: "Masa berlaku voucher belum dimulai.",
      };
    }
    if (voucher.tanggalBerakhir && sekarang > voucher.tanggalBerakhir) {
      return {
        sukses: false,
        potonganIdr: 0,
        pesan: "Voucher telah kedaluwarsa.",
      };
    }

    // Cek minimal belanja
    if (voucher.minimalPembelian && subtotal < voucher.minimalPembelian) {
      return {
        sukses: false,
        potonganIdr: 0,
        pesan: `Minimal pembelanjaan untuk voucher ini adalah Rp ${voucher.minimalPembelian.toLocaleString("id-ID")}.`,
      };
    }

    // Hitung potongan
    let potongan = 0;
    if (voucher.tipeDiskon === "persentase") {
      potongan = Math.round((subtotal * voucher.nilaiDiskon) / 100);
      if (voucher.maksimalPotongan && potongan > voucher.maksimalPotongan) {
        potongan = voucher.maksimalPotongan;
      }
    } else {
      potongan = voucher.nilaiDiskon;
    }

    // Diskon tidak boleh melebihi subtotal
    potongan = Math.min(potongan, subtotal);

    return {
      sukses: true,
      kode: voucher.kode,
      nama: voucher.nama,
      tipeDiskon: voucher.tipeDiskon,
      potonganIdr: potongan,
      pesan: `Voucher ${voucher.kode} berhasil diterapkan! Potongan: Rp ${potongan.toLocaleString("id-ID")}.`,
    };
  } catch (error) {
    console.error("[VOUCHER ACTION] Kesalahan evaluasi diskon:", error);
    return {
      sukses: false,
      potonganIdr: 0,
      pesan: "Terjadi gangguan sistem saat memvalidasi voucher.",
    };
  }
}
