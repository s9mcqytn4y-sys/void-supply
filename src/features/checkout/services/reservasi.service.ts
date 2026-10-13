import { and, eq, lte, sql } from "drizzle-orm";
import { db, pesanan, pembayaran, itemPesanan, varianProduk } from "@/lib/db";

export interface HasilBatalKedaluwarsa {
  sukses: boolean;
  jumlahDibatalkan: number;
  daftarNomorPesanan: string[];
  pesan: string;
}

/**
 * Service Domain Reservasi Stok (Module 02.15 Release Hardening)
 * Bertanggung jawab memulihkan stok dan membatalkan pesanan yang melewati jendela waktu 15 menit.
 * Menerapkan Atomic Compare-and-Set untuk mencegah pemulihan kuota stok ganda.
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
