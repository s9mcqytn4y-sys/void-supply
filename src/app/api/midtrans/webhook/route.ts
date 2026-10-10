import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, pesanan, pembayaran, itemPesanan, varianProduk } from "@/lib/db";
import { verifikasiSignatureMidtrans } from "@/lib/services/midtrans.service";

interface PayloadWebhookMidtrans {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  settlement_time?: string;
}

/**
 * Route Handler Webhook Midtrans (Module 02.14 & 03.0)
 * Menangani notifikasi status pembayaran dari gateway Midtrans secara tepercaya & idempoten:
 * 1. Verifikasi tanda tangan kriptografis SHA-512
 * 2. Idempotency Guard (mencegah pemrosesan ganda webhook yang sama)
 * 3. Transisi status pembayaran & pesanan
 * 4. Auto-release pengembalian kuota stok ketika pembayaran expired, dibatalkan, atau ditolak
 */
export async function POST(req: Request) {
  try {
    const body: PayloadWebhookMidtrans = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { error: "Payload webhook Midtrans tidak lengkap." },
        { status: 400 }
      );
    }

    // 1. Verifikasi Keaslian Signature Hash SHA-512
    const signatureValid = verifikasiSignatureMidtrans(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!signatureValid) {
      console.warn(`[MIDTRANS WEBHOOK] Percobaan webhook dengan signature tidak valid untuk pesanan: ${order_id}`);
      return NextResponse.json(
        { error: "Tanda tangan signature_key tidak valid." },
        { status: 403 }
      );
    }

    // 2. Ambil data pesanan dan pembayaran terkini
    const [pesananTerkait] = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        statusPesanan: pesanan.statusPesanan,
      })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, order_id))
      .limit(1);

    if (!pesananTerkait) {
      return NextResponse.json(
        { error: `Pesanan dengan nomor '${order_id}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    const [pembayaranTerkait] = await db
      .select({
        id: pembayaran.id,
        statusPembayaran: pembayaran.statusPembayaran,
      })
      .from(pembayaran)
      .where(eq(pembayaran.pesananId, pesananTerkait.id))
      .limit(1);

    // 3. Idempotency Guard: Jangan proses ulang jika status sudah final
    if (
      pembayaranTerkait &&
      (pembayaranTerkait.statusPembayaran === "berhasil" ||
        pesananTerkait.statusPesanan === "dibatalkan")
    ) {
      return NextResponse.json({
        status: "ok",
        message: "Notifikasi berulang diabaikan karena status transaksi sudah final.",
      });
    }

    // 4. Evaluasi Status Transaksi Midtrans
    const isSuccess =
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement";

    const isPending = transaction_status === "pending";

    const isFailureOrCancelled =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire" ||
      transaction_status === "failure";

    if (isSuccess) {
      // Pembayaran Berhasil Diverifikasi
      await db.transaction(async (tx) => {
        await tx
          .update(pembayaran)
          .set({
            statusPembayaran: "berhasil",
            metodePembayaran: payment_type || "midtrans",
            gatewayTransactionId: transaction_id,
            dibayarPada: new Date(),
            metadataGateway: body,
            diperbaruiPada: new Date(),
          })
          .where(eq(pembayaran.pesananId, pesananTerkait.id));

        await tx
          .update(pesanan)
          .set({
            statusPesanan: "diproses",
            diperbaruiPada: new Date(),
          })
          .where(eq(pesanan.id, pesananTerkait.id));
      });

      console.log(`[MIDTRANS WEBHOOK] Pesanan ${order_id} berhasil dibayar & status diperbarui ke diproses.`);
    } else if (isFailureOrCancelled) {
      // Pembayaran Gagal / Dibatalkan / Expired -> Auto Release Stok
      await db.transaction(async (tx) => {
        // Ambil item snapshot pesanan untuk memulihkan stok
        const items = await tx
          .select({
            varianId: itemPesanan.varianId,
            jumlah: itemPesanan.jumlah,
          })
          .from(itemPesanan)
          .where(eq(itemPesanan.pesananId, pesananTerkait.id));

        // Kembalikan stok secara atomik
        for (const item of items) {
          if (item.varianId) {
            await tx
              .update(varianProduk)
              .set({
                stok: sql`${varianProduk.stok} + ${item.jumlah}`,
              })
              .where(eq(varianProduk.id, item.varianId));
          }
        }

        const statusBayarAkhir =
          transaction_status === "expire" ? "kadaluarsa" : "gagal";

        await tx
          .update(pembayaran)
          .set({
            statusPembayaran: statusBayarAkhir,
            metadataGateway: body,
            diperbaruiPada: new Date(),
          })
          .where(eq(pembayaran.pesananId, pesananTerkait.id));

        await tx
          .update(pesanan)
          .set({
            statusPesanan: "dibatalkan",
            diperbaruiPada: new Date(),
          })
          .where(eq(pesanan.id, pesananTerkait.id));
      });

      console.log(
        `[MIDTRANS WEBHOOK] Pesanan ${order_id} gagal/expired (${transaction_status}). Stok berhasil dikembalikan dan status pesanan dibatalkan.`
      );
    } else if (isPending) {
      await db
        .update(pembayaran)
        .set({
          statusPembayaran: "menunggu_pembayaran",
          metadataGateway: body,
          diperbaruiPada: new Date(),
        })
        .where(eq(pembayaran.pesananId, pesananTerkait.id));
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[MIDTRANS WEBHOOK] Galat saat memproses webhook:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
