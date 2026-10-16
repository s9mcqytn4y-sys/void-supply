import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db, pesanan, pengiriman, pelacakanPengiriman } from "@/lib/db";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment";

export interface PayloadWebhookBiteship {
  event?: string;
  order_id?: string;
  courier_tracking_id?: string;
  courier_waybill_id?: string;
  courier_company?: string;
  status: string;
  note?: string;
  updated_at?: string;
  location?: string;
  metadata?: {
    reference_id?: string;
    nomor_pesanan?: string;
  };
}

/**
 * Route Handler Webhook Biteship Tracking
 * Menangani notifikasi pergerakan kurir dan waybill tracking:
 * 1. Mengidentifikasi pesanan berdasarkan nomor pesanan (order_id/reference_id) atau nomor resi
 * 2. Mencatat timeline titik peristiwa ke tabel 'pelacakan_pengiriman'
 * 3. Memutasikan status pesanan dan pengiriman (diproses -> dikirim -> selesai)
 */
export async function POST(req: Request) {
  try {
    const env = selesaikanKonfigurasiEnvironment();

    // Verifikasi Token / Signature jika webhook secret dikonfigurasi
    const webhookSecret = process.env.BITESHIP_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.trim().length > 0) {
      const authHeader = req.headers.get("authorization") || req.headers.get("x-biteship-signature");
      const expectedToken = `Bearer ${webhookSecret}`;
      if (!authHeader || (authHeader !== webhookSecret && authHeader !== expectedToken)) {
        return NextResponse.json(
          { error: "Autentikasi webhook Biteship tidak valid." },
          { status: 403 }
        );
      }
    }

    const body: PayloadWebhookBiteship = await req.json();

    const {
      status,
      courier_waybill_id,
      courier_company,
      note,
      updated_at,
      location,
      metadata,
    } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Payload webhook tidak memuat atribut 'status'." },
        { status: 400 }
      );
    }

    const nomorPesananTarget =
      metadata?.nomor_pesanan ||
      metadata?.reference_id ||
      body.order_id;

    // 1. Cari pesanan terkait di database
    let pesananTerkait: { id: string; nomorPesanan: string; statusPesanan: string } | undefined;

    if (nomorPesananTarget) {
      const [order] = await db
        .select({
          id: pesanan.id,
          nomorPesanan: pesanan.nomorPesanan,
          statusPesanan: pesanan.statusPesanan,
        })
        .from(pesanan)
        .where(eq(pesanan.nomorPesanan, nomorPesananTarget.trim()))
        .limit(1);

      pesananTerkait = order;
    }

    // Jika belum ditemukan lewat nomor pesanan, cari lewat nomor resi
    if (!pesananTerkait && courier_waybill_id) {
      const [pengirimanOrder] = await db
        .select({
          pesananId: pengiriman.pesananId,
        })
        .from(pengiriman)
        .where(eq(pengiriman.nomorResi, courier_waybill_id.trim()))
        .limit(1);

      if (pengirimanOrder) {
        const [order] = await db
          .select({
            id: pesanan.id,
            nomorPesanan: pesanan.nomorPesanan,
            statusPesanan: pesanan.statusPesanan,
          })
          .from(pesanan)
          .where(eq(pesanan.id, pengirimanOrder.pesananId))
          .limit(1);

        pesananTerkait = order;
      }
    }

    if (!pesananTerkait) {
      return NextResponse.json(
        { error: "Pesanan yang terkait dengan waybill/order Biteship tidak ditemukan." },
        { status: 404 }
      );
    }

    const nomorResiFinal = courier_waybill_id || "MENUNGGU-RESI";
    const kurirFinal = courier_company || "Kurir Resmi";
    const waktuPeristiwa = updated_at ? new Date(updated_at) : new Date();
    const keteranganFinal = note || `Status logistik diperbarui: ${status}`;

    const statusNormal = status.toLowerCase();

    // 2. Transaksi Mutasi Status & Pencatatan Titik Pelacakan
    await db.transaction(async (tx) => {
      // Catat entri titik pelacakan baru
      await tx.insert(pelacakanPengiriman).values({
        pesananId: pesananTerkait.id,
        nomorResi: nomorResiFinal,
        kurir: kurirFinal,
        statusPelacakan: status,
        keterangan: keteranganFinal,
        lokasi: location || null,
        waktuPeristiwa,
      });

      // Perbarui nomor resi pada entitas pengiriman jika tersedia
      if (courier_waybill_id) {
        await tx
          .update(pengiriman)
          .set({
            nomorResi: courier_waybill_id.trim(),
            diperbaruiPada: new Date(),
          })
          .where(eq(pengiriman.pesananId, pesananTerkait.id));
      }

      // Pemetaan transisi status pesanan dan pengiriman
      if (
        statusNormal === "picking_up" ||
        statusNormal === "dropping_off" ||
        statusNormal === "in_transit"
      ) {
        await tx
          .update(pengiriman)
          .set({
            statusPengiriman: "dalam_pengiriman",
            diperbaruiPada: new Date(),
          })
          .where(eq(pengiriman.pesananId, pesananTerkait.id));

        // Transisi pesanan ke 'dikirim' jika sebelumnya berstatus 'diproses'
        await tx
          .update(pesanan)
          .set({
            statusPesanan: "dikirim",
            diperbaruiPada: new Date(),
          })
          .where(
            or(
              eq(pesanan.statusPesanan, "diproses"),
              eq(pesanan.statusPesanan, "menunggu_pembayaran")
            )
          );
      } else if (statusNormal === "delivered") {
        await tx
          .update(pengiriman)
          .set({
            statusPengiriman: "terkirim",
            diperbaruiPada: new Date(),
          })
          .where(eq(pengiriman.pesananId, pesananTerkait.id));

        await tx
          .update(pesanan)
          .set({
            statusPesanan: "selesai",
            diperbaruiPada: new Date(),
          })
          .where(eq(pesanan.id, pesananTerkait.id));
      } else if (statusNormal === "cancelled" || statusNormal === "rejected") {
        await tx
          .update(pengiriman)
          .set({
            statusPengiriman: "gagal",
            diperbaruiPada: new Date(),
          })
          .where(eq(pengiriman.pesananId, pesananTerkait.id));
      }
    });

    console.log(
      `[BITESHIP WEBHOOK] Berhasil mencatat pelacakan resi ${nomorResiFinal} untuk pesanan ${pesananTerkait.nomorPesanan} (Status: ${status}).`
    );

    const statusPesananAkhir =
      statusNormal === "delivered"
        ? "selesai"
        : statusNormal === "picking_up" || statusNormal === "dropping_off"
        ? "dikirim"
        : pesananTerkait.statusPesanan;

    return NextResponse.json({
      sukses: true,
      status: "ok",
      nomorPesanan: pesananTerkait.nomorPesanan,
      statusPelacakan: status,
      statusPesanan: statusPesananAkhir,
    });
  } catch (error) {
    console.error("[BITESHIP WEBHOOK] Galat saat memproses webhook pelacakan:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
