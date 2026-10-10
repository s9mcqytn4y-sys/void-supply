import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
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
 * Route Handler Webhook Midtrans (Module 02.15 State Machine)
 * Menangani notifikasi status pembayaran dari gateway Midtrans:
 * 1. Verifikasi tanda tangan kriptografis SHA-512
 * 2. Pencocokan nominal gross_amount terhadap total tagihan resmi order
 * 3. Atomic Compare-and-Set Guard: Transisi status hanya terjadi jika order masih dalam status awal
 * 4. Anti-Double Refund Guard: Pengembalian stok HANYA dilakukan satu kali ketika order berhasil dibatalkan
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

    // 2. Ambil data pesanan dari database
    const [pesananTerkait] = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        statusPesanan: pesanan.statusPesanan,
        totalAkhir: pesanan.totalAkhir,
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

    // 3. Verifikasi Jumlah Pembayaran (Gross Amount Integrity Check)
    const grossAmountNumber = Math.round(Number(gross_amount));
    if (isNaN(grossAmountNumber) || grossAmountNumber !== pesananTerkait.totalAkhir) {
      console.error(
        `[MIDTRANS WEBHOOK] Mismatch gross_amount pada order ${order_id}! Gateway: ${grossAmountNumber}, Database: ${pesananTerkait.totalAkhir}`
      );
      return NextResponse.json(
        {
          error: "Jumlah gross_amount tidak cocok dengan total tagihan resmi pesanan.",
        },
        { status: 422 }
      );
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

    // 5. Eksekusi Mutasi Status Atomik (Compare-and-Set)
    return await db.transaction(async (tx) => {
      if (isSuccess) {
        // Compare-and-Set: Hanya ubah jika status saat ini 'menunggu_pembayaran'
        const [updatedOrder] = await tx
          .update(pesanan)
          .set({
            statusPesanan: "diproses",
            diperbaruiPada: new Date(),
          })
          .where(
            and(
              eq(pesanan.id, pesananTerkait.id),
              eq(pesanan.statusPesanan, "menunggu_pembayaran")
            )
          )
          .returning({ id: pesanan.id });

        if (updatedOrder) {
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

          console.log(`[MIDTRANS WEBHOOK] Pesanan ${order_id} berhasil diverifikasi & status diubah ke diproses.`);
        } else {
          console.info(`[MIDTRANS WEBHOOK] Order ${order_id} sudah berada pada status final (${pesananTerkait.statusPesanan}). Mutasi sukses diabaikan.`);
        }

        return NextResponse.json({ status: "ok" });
      }

      if (isFailureOrCancelled) {
        // Compare-and-Set: HANYA ubah dan pulihkan stok jika status saat ini 'menunggu_pembayaran'
        const [cancelledOrder] = await tx
          .update(pesanan)
          .set({
            statusPesanan: "dibatalkan",
            diperbaruiPada: new Date(),
          })
          .where(
            and(
              eq(pesanan.id, pesananTerkait.id),
              eq(pesanan.statusPesanan, "menunggu_pembayaran")
            )
          )
          .returning({ id: pesanan.id });

        if (cancelledOrder) {
          // Status berhasil ditransisikan: Pulihkan stok artikel secara atomik
          const items = await tx
            .select({
              varianId: itemPesanan.varianId,
              jumlah: itemPesanan.jumlah,
            })
            .from(itemPesanan)
            .where(eq(itemPesanan.pesananId, pesananTerkait.id));

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

          console.log(
            `[MIDTRANS WEBHOOK] Pesanan ${order_id} dibatalkan (${transaction_status}). Kuota stok dikembalikan secara atomik.`
          );
        } else {
          console.info(
            `[MIDTRANS WEBHOOK] Order ${order_id} sudah berstatus final (${pesananTerkait.statusPesanan}). Pengembalian stok ganda dicegah.`
          );
        }

        return NextResponse.json({ status: "ok" });
      }

      if (isPending) {
        // Transaksi tertunda: jangan sentuh stok atau status final
        await tx
          .update(pembayaran)
          .set({
            statusPembayaran: "menunggu_pembayaran",
            metadataGateway: body,
            diperbaruiPada: new Date(),
          })
          .where(
            and(
              eq(pembayaran.pesananId, pesananTerkait.id),
              eq(pembayaran.statusPembayaran, "menunggu_pembayaran")
            )
          );

        return NextResponse.json({ status: "ok" });
      }

      return NextResponse.json({ status: "ok" });
    });
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
