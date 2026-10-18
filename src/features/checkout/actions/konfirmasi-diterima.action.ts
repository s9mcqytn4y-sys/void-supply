"use server";

import { eq, and } from "drizzle-orm";
import { db, pesanan, pengiriman } from "@/lib/db";
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
 * Server Action: Konfirmasi Pesanan Diterima oleh Konsumen
 * Mengubah status pesanan menjadi 'selesai' dan mengaktifkan masa garansi unboxing 2x24 jam.
 * Syarat P0/P1: Pesanan wajib sudah berstatus 'dikirim' dan memiliki bukti nomor resi pengiriman resmi.
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

    // 1. Ambil status pesanan saat ini untuk validasi alur transisi
    const [pesananEksis] = await db
      .select({
        id: pesanan.id,
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

    if (!pesananEksis) {
      return {
        sukses: false,
        pesan: "Pesanan tidak ditemukan atau otentikasi token tidak cocok.",
      };
    }

    if (pesananEksis.statusPesanan === "selesai") {
      return {
        sukses: true,
        pesan: "Pesanan telah dikonfirmasi diterima sebelumnya.",
        diterimaPada: pesananEksis.diterimaPada ? new Date(pesananEksis.diterimaPada).toISOString() : undefined,
        garansiBerakhirPada: pesananEksis.garansiBerakhirPada ? new Date(pesananEksis.garansiBerakhirPada).toISOString() : undefined,
      };
    }

    if (pesananEksis.statusPesanan === "diproses") {
      return {
        sukses: false,
        pesan: "Pesanan masih dalam tahap penyiapan di studio dan belum diserahkan ke kurir pengiriman.",
      };
    }

    if (pesananEksis.statusPesanan !== "dikirim") {
      return {
        sukses: false,
        pesan: `Pesanan dengan status '${pesananEksis.statusPesanan}' belum dapat dikonfirmasi diterima.`,
      };
    }

    // 2. Pastikan nomor resi pengiriman resmi terdaftar
    const [dataKirim] = await db
      .select({ nomorResi: pengiriman.nomorResi })
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, pesananEksis.id))
      .limit(1);

    if (!dataKirim?.nomorResi) {
      return {
        sukses: false,
        pesan: "Pesanan belum memiliki nomor resi bukti pengiriman resmi dari kurir.",
      };
    }

    // 3. Compare-and-Set atomik: Ubah status ke selesai hanya jika status saat ini masih 'dikirim'
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
          eq(pesanan.id, pesananEksis.id),
          eq(pesanan.statusPesanan, "dikirim")
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
      return {
        sukses: false,
        pesan: "Gagal memperbarui status pesanan. Kemungkinan status telah diperbarui oleh proses lain.",
      };
    }

    return {
      sukses: true,
      pesan: "Terima kasih! Pesanan telah selesai. Masa garansi produk aktif selama 2x24 jam.",
      diterimaPada: pesananDiperbarui.diterimaPada ? new Date(pesananDiperbarui.diterimaPada).toISOString() : undefined,
      garansiBerakhirPada: pesananDiperbarui.garansiBerakhirPada ? new Date(pesananDiperbarui.garansiBerakhirPada).toISOString() : undefined,
    };
  } catch (error) {
    console.error("Gagal mengeksekusi konfirmasi penerimaan pesanan:", error);
    return {
      sukses: false,
      pesan: "Terjadi kendala pada sistem. Silakan muat ulang halaman dan coba lagi.",
    };
  }
}
