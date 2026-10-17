import { and, eq, lte, sql } from "drizzle-orm";
import { db, pesanan, pembayaran, itemPesanan, varianProduk } from "@/lib/db";
import { cekStatusTransaksiMidtrans, batalkanTransaksiMidtrans } from "@/lib/services/midtrans.service";

export interface HasilBatalKedaluwarsa {
  sukses: boolean;
  jumlahDibatalkan: number;
  daftarNomorPesanan: string[];
  pesan: string;
}

/**
 * Service Domain Reservasi Stok (Module 02.15 Release Hardening)
 * Bertanggung jawab memulihkan stok dan membatalkan pesanan yang melewati jendela waktu 15 menit.
 * Menerapkan Rekonsiliasi Gateway Midtrans (OPS-02) & Atomic Compare-and-Set.
 */
export async function batalkanPesananKedaluwarsa(
  pesananIdSpesifik?: string
): Promise<HasilBatalKedaluwarsa> {
  try {
    const sekarang = new Date();

    // 1. Ambil pesanan yang berstatus 'menunggu_pembayaran' dan telah melewati batas kedaluwarsa
    const query = db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        statusPesanan: pesanan.statusPesanan,
        kedaluwarsaPada: pesanan.kedaluwarsaPada,
        dibuatPada: pesanan.dibuatPada,
      })
      .from(pesanan)
      .where(
        pesananIdSpesifik
          ? and(
              eq(pesanan.id, pesananIdSpesifik),
              eq(pesanan.statusPesanan, "menunggu_pembayaran")
            )
          : and(
              eq(pesanan.statusPesanan, "menunggu_pembayaran"),
              sql`COALESCE(${pesanan.kedaluwarsaPada}, ${pesanan.dibuatPada} + INTERVAL '15 minutes') <= NOW()`
            )
      );

    const pesananKedaluwarsa = await query;

    if (pesananKedaluwarsa.length === 0) {
      return {
        sukses: true,
        jumlahDibatalkan: 0,
        daftarNomorPesanan: [],
        pesan: "Tidak ada pesanan kedaluwarsa yang perlu dibatalkan.",
      };
    }

    const dibatalkan: string[] = [];

    // 2. Eksekusi compare-and-set dan pemulihan stok per pesanan
    for (const order of pesananKedaluwarsa) {
      // Rekonsiliasi Gateway Midtrans Tri-State (OPS-02 & PAY-04):
      const statusGateway = await cekStatusTransaksiMidtrans(order.nomorPesanan);

      // KASUS 1: PAID (Transaksi sukses di gateway) -> Ubah pesanan ke diproses, pembayaran ke berhasil secara atomik
      if (statusGateway.state === "PAID" || statusGateway.apakahSudahDibayar) {
        await db.transaction(async (tx) => {
          const [updatedPaid] = await tx
            .update(pesanan)
            .set({
              statusPesanan: "diproses",
              diperbaruiPada: sekarang,
            })
            .where(
              and(
                eq(pesanan.id, order.id),
                eq(pesanan.statusPesanan, "menunggu_pembayaran")
              )
            )
            .returning({ id: pesanan.id });

          if (updatedPaid) {
            await tx
              .update(pembayaran)
              .set({
                statusPembayaran: "berhasil",
                diperbaruiPada: sekarang,
              })
              .where(eq(pembayaran.pesananId, order.id));
          }
        });
        continue;
      }

      // KASUS 2: UNKNOWN (Network error / Gateway 5xx / timeout) -> JANGAN batalkan pesanan & JANGAN kembalikan stok!
      // Catat percobaan rekonsiliasi dan tandai perlu tinjauan manual jika mencapai 12 kali (1 jam)
      if (statusGateway.state === "UNKNOWN") {
        await db
          .update(pesanan)
          .set({
            percobaanRekonsiliasi: sql`${pesanan.percobaanRekonsiliasi} + 1`,
            rekonsiliasiTerakhirPada: sekarang,
            perluTinjauanManual: sql`CASE WHEN ${pesanan.percobaanRekonsiliasi} + 1 >= 12 THEN true ELSE ${pesanan.perluTinjauanManual} END`,
            diperbaruiPada: sekarang,
          })
          .where(eq(pesanan.id, order.id));
        continue;
      }

      // KASUS 3: PENDING (Transaksi masih pending di gateway saat batas waktu habis)
      // Panggil Cancel API Midtrans terlebih dahulu agar gateway tidak lagi menerima pembayaran
      if (statusGateway.state === "PENDING") {
        const hasilBatalGateway = await batalkanTransaksiMidtrans(order.nomorPesanan);
        if (!hasilBatalGateway.sukses) {
          console.warn(
            `[RESERVASI] Gagal membatalkan transaksi ${order.nomorPesanan} di gateway Midtrans: ${hasilBatalGateway.pesan}. Pelepasan stok ditunda.`
          );
          await db
            .update(pesanan)
            .set({
              percobaanRekonsiliasi: sql`${pesanan.percobaanRekonsiliasi} + 1`,
              rekonsiliasiTerakhirPada: sekarang,
              diperbaruiPada: sekarang,
            })
            .where(eq(pesanan.id, order.id));
          continue;
        }
      }

      // KASUS 3: UNPAID_TERMINAL -> Pembatalan pesanan, pemulihan stok artikel, dan update pembayaran secara atomik
      await db.transaction(async (tx) => {
        // Compare-and-Set: Hanya batalkan jika status di database masih 'menunggu_pembayaran'
        const [updated] = await tx
          .update(pesanan)
          .set({
            statusPesanan: "dibatalkan",
            diperbaruiPada: sekarang,
          })
          .where(
            and(
              eq(pesanan.id, order.id),
              eq(pesanan.statusPesanan, "menunggu_pembayaran")
            )
          )
          .returning({ id: pesanan.id });

        if (!updated) {
          // Status telah berubah oleh proses lain (misalnya webhook sukses atau dibatalkan sebelumnya)
          return;
        }

        // Ambil item pesanan untuk pemulihan stok artikel
        const items = await tx
          .select({
            varianId: itemPesanan.varianId,
            jumlah: itemPesanan.jumlah,
          })
          .from(itemPesanan)
          .where(eq(itemPesanan.pesananId, order.id));

        for (const item of items) {
          if (item.varianId) {
            await tx
              .update(varianProduk)
              .set({
                stok: sql`${varianProduk.stok} + ${item.jumlah}`,
                diperbaruiPada: sekarang,
              })
              .where(eq(varianProduk.id, item.varianId));
          }
        }

        // Perbarui entitas pembayaran menjadi 'kadaluarsa'
        await tx
          .update(pembayaran)
          .set({
            statusPembayaran: "kadaluarsa",
            diperbaruiPada: sekarang,
          })
          .where(eq(pembayaran.pesananId, order.id));

        dibatalkan.push(order.nomorPesanan);
      });
    }

    return {
      sukses: true,
      jumlahDibatalkan: dibatalkan.length,
      daftarNomorPesanan: dibatalkan,
      pesan: `Berhasil membatalkan ${dibatalkan.length} pesanan kedaluwarsa dan mengembalikan stok.`,
    };
  } catch (error) {
    console.error("Galat saat membatalkan pesanan kedaluwarsa:", error);
    return {
      sukses: false,
      jumlahDibatalkan: 0,
      daftarNomorPesanan: [],
      pesan:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat memproses pembatalan kedaluwarsa.",
    };
  }
}
