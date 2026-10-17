import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { eq, and, sql } from "drizzle-orm";
import { db, pesanan, pembayaran, itemPesanan, varianProduk } from "@/lib/db";
import { faktur } from "@/lib/db/schema";
import { verifikasiSignatureMidtrans } from "@/lib/services/midtrans.service";
import {
  tambahTugasOutbox,
  prosesAntreanOutbox,
  picuProsesOutboxNonBlocking,
} from "@/lib/services/outbox.service";

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
 * 5. Module 02.17: Penerbitan Faktur (E-Receipt) dan Notifikasi Email Otomatis
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
      settlement_time,
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
        namaPelanggan: pesanan.namaPelanggan,
        emailPelanggan: pesanan.emailPelanggan,
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
    await db.transaction(async (tx) => {
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

          // Terbitkan faktur resmi e-receipt
          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const nomorFaktur = `INV/${dateStr}/${order_id.replace(/^VOID-/, "")}`;

          await tx
            .insert(faktur)
            .values({
              nomorFaktur,
              pesananId: pesananTerkait.id,
              totalTagihan: pesananTerkait.totalAkhir,
              statusFaktur: "lunas",
              metadataFaktur: {
                gatewayTransactionId: transaction_id,
                metodePembayaran: payment_type || "midtrans",
                settlementTime: settlement_time || new Date().toISOString(),
              },
            })
            .onConflictDoNothing();

          console.log(`[MIDTRANS WEBHOOK] Pesanan ${order_id} berhasil diverifikasi & faktur ${nomorFaktur} diterbitkan.`);

          // Sisipkan tugas notifikasi email ke antrean Transactional Outbox secara atomik
          await tambahTugasOutbox(tx, {
            tipePekerjaan: "kirim_email",
            pesananId: pesananTerkait.id,
            payload: {
              pesananId: pesananTerkait.id,
              emailPenerima: pesananTerkait.emailPelanggan,
              tipe: "pembayaran_berhasil",
              subjek: `Pembayaran Berhasil // Faktur ${nomorFaktur}`,
              data: {
                nomorPesanan: order_id,
                namaPelanggan: pesananTerkait.namaPelanggan,
                rincian: `Pembayaran sebesar Rp ${pesananTerkait.totalAkhir.toLocaleString("id-ID")} melalui ${payment_type || "Midtrans"} telah terverifikasi.`,
                total: `Rp ${pesananTerkait.totalAkhir.toLocaleString("id-ID")}`,
              },
            },
          });

          // Sisipkan tugas pemesanan kurir Biteship ke antrean Transactional Outbox secara atomik
          await tambahTugasOutbox(tx, {
            tipePekerjaan: "buat_order_biteship",
            pesananId: pesananTerkait.id,
            payload: {
              pesananId: pesananTerkait.id,
              nomorPesanan: order_id,
            },
          });
        } else {
          console.info(`[MIDTRANS WEBHOOK] Order ${order_id} sudah berada pada status final (${pesananTerkait.statusPesanan}). Mutasi sukses diabaikan.`);
        }

        return { sukses: true };
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
      }
    });

    // 6. Pasca-Commit DB: Eksekusi outbox hibrida (3.5s synchronous race + waitUntil guard)
    const outboxPromise = prosesAntreanOutbox(5);
    try {
      if (typeof waitUntil === "function") {
        waitUntil(outboxPromise);
      }
      // Tunggu hingga 3.5 detik agar order kurir tuntas langsung sebelum respon dikembalikan
      await Promise.race([
        outboxPromise,
        new Promise((resolve) => setTimeout(resolve, 3500)),
      ]);
    } catch (e) {
      console.warn("[MIDTRANS WEBHOOK] Eksekusi outbox segera terlewati / timeout:", e);
      picuProsesOutboxNonBlocking();
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
