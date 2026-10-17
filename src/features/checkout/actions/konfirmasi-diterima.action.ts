"use server";

import { eq, and, sql } from "drizzle-orm";
import { db, pesanan } from "@/lib/db";
import { z } from "zod";

const konfirmasiDiterimaSkema = z.object({
  nomorPesanan: z.string().min(1, "Nomor pesanan wajib diisi"),
  tokenAkses: z.string().uuid("Token akses otentikasi tidak valid"),
  catatanPenerima: z.string().max(500).optional(),
});

export type InputKonfirmasiDiterima = z.infer<typeof konfirmasiDiterimaSkema>;

export interface HasilKonfirmasiDiterima {
  sukses: boolean;
  pesan: string;
  diterimaPada?: string;
  garansiBerakhirPada?: string;
}

/**
 * Server Action: Konfirmasi Pesanan Diterima oleh Konsumen (Dual-Trigger Progressive)
 * Mengubah status pesanan menjadi 'selesai' dan mengaktifkan masa garansi unboxing 2x24 jam.
 */
export async function konfirmasiPesananDiterimaAction(
  input: InputKonfirmasiDiterima
): Promise<HasilKonfirmasiDiterima> {
  const parseResult = konfirmasiDiterimaSkema.safeParse(input);
  if (!parseResult.success) {
    return {
      sukses: false,
      pesan: parseResult.error.errors[0]?.message || "Input tidak valid",
    };
  }

  const { nomorPesanan, tokenAkses, catatanPenerima } = parseResult.data;

  try {
    const sekarang = new Date();
    const batasGaransi = new Date(sekarang.getTime() + 48 * 60 * 60 * 1000); // 2x24 jam (48 jam)

    // Compare-and-Set atomik: Lindungi dari race condition & status final
    const [pesananDiperbarui] = await db
      .update(pesanan)
      .set({
        statusPesanan: "selesai",
        diterimaPada: sekarang,
        garansiBerakhirPada: batasGaransi,
        catatanPenerima: catatanPenerima || "Dikonfirmasi langsung oleh pembeli",
        diperbaruiPada: sekarang,
      })
      .where(
        and(
          eq(pesanan.nomorPesanan, nomorPesanan),
          eq(pesanan.tokenAkses, tokenAkses),
          sql`${pesanan.statusPesanan} IN ('dikirim', 'diproses')`
        )
      )
      .returning({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        statusPesanan: pesanan.statusPesanan,
        diterimaPada: pesanan.diterimaPada,
        garansiBerakhirPada: pesanan.garansiBerakhirPada,
      });

    if (!pesananDiperbarui) {
      // Periksa apakah sudah selesai sebelumnya
      const [pesananEksis] = await db
        .select({
          statusPesanan: pesanan.statusPesanan,
          diterimaPada: pesanan.diterimaPada,
          garansiBerakhirPada: pesanan.garansiBerakhirPada,
        })
        .from(pesanan)
        .where(
          and(
            eq(pesanan.nomorPesanan, nomorPesanan),
            eq(pesanan.tokenAkses, tokenAkses)
          )
        )
        .limit(1);

      if (pesananEksis?.statusPesanan === "selesai") {
        return {
          sukses: true,
          pesan: "Pesanan telah dikonfirmasi diterima sebelumnya.",
          diterimaPada: pesananEksis.diterimaPada?.toISOString(),
          garansiBerakhirPada: pesananEksis.garansiBerakhirPada?.toISOString(),
        };
      }

      return {
        sukses: false,
        pesan: "Pesanan belum dapat dikonfirmasi atau otentikasi token tidak cocok.",
      };
    }

    return {
      sukses: true,
      pesan: "Terima kasih! Pesanan telah selesai. Masa garansi produk aktif selama 2x24 jam.",
      diterimaPada: pesananDiperbarui.diterimaPada?.toISOString(),
      garansiBerakhirPada: pesananDiperbarui.garansiBerakhirPada?.toISOString(),
    };
  } catch (error) {
    console.error("Gagal mengeksekusi konfirmasi penerimaan pesanan:", error);
    return {
      sukses: false,
      pesan: "Terjadi kendala pada sistem. Silakan muat ulang halaman dan coba lagi.",
    };
  }
}
