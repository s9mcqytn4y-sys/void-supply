"use server";

import { eq, or } from "drizzle-orm";
import { db, pesanan, pengiriman, pelacakanPengiriman } from "@/lib/db";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment";

export type TahapSimulasiKurir = "picking_up" | "in_transit" | "delivered";

export interface HasilSimulasiKurir {
  sukses: boolean;
  pesan: string;
  nomorResi?: string;
  tahapBaru?: TahapSimulasiKurir;
}

/**
 * Server Action: Simulasi Pergerakan Kurir Sandbox
 * Khusus untuk mode demonstrasi / development di Vercel Hobby & lokal:
 * Memajukan timeline pengiriman secara realistis tanpa memerlukan pickup kurir fisik.
 */
export async function simulasiPergerakanKurirAction(
  nomorPesanan: string,
  tahap: TahapSimulasiKurir,
  tokenAkses?: string
): Promise<HasilSimulasiKurir> {
  try {
    const env = selesaikanKonfigurasiEnvironment();
    if (env.appEnv === "production" && process.env.ALLOW_PAYMENT_MOCK !== "true") {
      return {
        sukses: false,
        pesan: "Simulasi logistik dinonaktifkan di lingkungan produksi.",
      };
    }

    if (!nomorPesanan || typeof nomorPesanan !== "string") {
      return {
        sukses: false,
        pesan: "Nomor pesanan tidak valid.",
      };
    }

    const [pesananDb] = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        statusPesanan: pesanan.statusPesanan,
        tokenAkses: pesanan.tokenAkses,
      })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan.trim()))
      .limit(1);

    if (!pesananDb) {
      return {
        sukses: false,
        pesan: `Pesanan '${nomorPesanan}' tidak ditemukan.`,
      };
    }

    // IDOR Protection: Verifikasi token akses
    if (pesananDb.tokenAkses && pesananDb.tokenAkses !== tokenAkses) {
      return {
        sukses: false,
        pesan: "Akses ditolak: Token otentikasi pesanan tidak cocok.",
      };
    }

    const [pengirimanDb] = await db
      .select()
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, pesananDb.id))
      .limit(1);

    if (!pengirimanDb) {
      return {
        sukses: false,
        pesan: "Data pengiriman pesanan tidak ditemukan.",
      };
    }

    const kurirKode = (pengirimanDb.kurir || "JNE").toUpperCase();
    const acakResi = Math.floor(100000000 + Math.random() * 900000000);
    const nomorResi = pengirimanDb.nomorResi || `VOID-${kurirKode}-${acakResi}`;

    let keterangan = "";
    let lokasi = "";

    switch (tahap) {
      case "picking_up":
        keterangan = `Paket telah diserahkan kepada kurir ${kurirKode} dan resi diterbitkan.`;
        lokasi = "Fulfillment Hub Johar Baru, Jakarta Pusat";
        break;
      case "in_transit":
        keterangan = "Paket sedang dalam perjalanan menuju fasilitas sortir wilayah tujuan.";
        lokasi = "Sorting Gateway Jakarta Selatan";
        break;
      case "delivered":
        keterangan = `Paket berhasil diserahkan kepada penerima (${pengirimanDb.namaPenerima}).`;
        lokasi = `${pengirimanDb.kota}, ${pengirimanDb.provinsi}`;
        break;
    }

    await db.transaction(async (tx) => {
      // Perbarui resi dan status pengiriman
      await tx
        .update(pengiriman)
        .set({
          nomorResi,
          statusPengiriman: tahap === "delivered" ? "terkirim" : "dalam_pengiriman",
          diperbaruiPada: new Date(),
        })
        .where(eq(pengiriman.id, pengirimanDb.id));

      // Perbarui status pesanan secara terisolasi per ID pesanan spesifik
      if (tahap === "delivered") {
        await tx
          .update(pesanan)
          .set({
            statusPesanan: "selesai",
            diperbaruiPada: new Date(),
          })
          .where(eq(pesanan.id, pesananDb.id));
      } else {
        await tx
          .update(pesanan)
          .set({
            statusPesanan: "dikirim",
            diperbaruiPada: new Date(),
          })
          .where(
            and(
              eq(pesanan.id, pesananDb.id),
              or(
                eq(pesanan.statusPesanan, "diproses"),
                eq(pesanan.statusPesanan, "menunggu_pembayaran")
              )
            )
          );
      }

      // Catat entri titik pelacakan baru
      await tx.insert(pelacakanPengiriman).values({
        pesananId: pesananDb.id,
        nomorResi,
        kurir: pengirimanDb.kurir,
        statusPelacakan: tahap,
        keterangan,
        lokasi,
        waktuPeristiwa: new Date(),
      });
    });

    return {
      sukses: true,
      pesan: `Simulasi pergerakan kurir (${tahap}) berhasil diterapkan.`,
      nomorResi,
      tahapBaru: tahap,
    };
  } catch (error) {
    console.error("Gagal menjalankan simulasi kurir:", error);
    return {
      sukses: false,
      pesan: error instanceof Error ? error.message : "Terjadi kesalahan sistem saat simulasi kurir.",
    };
  }
}
