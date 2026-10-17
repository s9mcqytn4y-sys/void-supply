import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, pesanan, pengiriman, pelacakanPengiriman } from "@/lib/db";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment";

export interface PayloadWebhookBiteship {
  event?: string;
  order_id?: string;
  courier_tracking_id?: string;
  courier_waybill_id?: string;
  courier_company?: string;
  status?: string;
  price?: number;
  courier_price?: number;
  shipping_fee?: number;
  note?: string;
  updated_at?: string;
  location?: string;
  metadata?: {
    reference_id?: string;
    nomor_pesanan?: string;
  };
}

/**
 * Route Handler Webhook Biteship Tracking & Logistics Lifecycle
 * Menangani:
 * 1. Handshake instalasi Biteship: POST dengan body kosong merespons 200 "ok" text/plain.
 * 2. Autentikasi custom header (x-void-biteship-secret / Authorization).
 * 3. Pemetaan pesanan via internal reference atau external Biteship ID (order_id, courier_tracking_id, courier_waybill_id).
 * 4. Pembaruan terisolasi status pesanan (hanya untuk pesanan target, guard status diproses -> dikirim).
 * 5. Pencatatan biaya riil ekspedisi untuk event 'order.price'.
 * 6. Idempotensi pencatatan titik pelacakan resi.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // 1. Handshake Instalasi Biteship:
    // Biteship mengirimkan POST kosong saat registrasi URL webhook di dashboard.
    // Request kosong harus langsung merespons "ok" (HTTP 200) tanpa memodifikasi database.
    if (!rawBody.trim()) {
      return new Response("ok", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    const env = selesaikanKonfigurasiEnvironment();

    // 2. Verifikasi Autentikasi Custom Header jika Secret Dikonfigurasi
    const webhookSecret = env.biteship.webhookSecret;
    if (webhookSecret && webhookSecret.trim().length > 0) {
      const headerKey = env.biteship.webhookHeaderKey.toLowerCase();
      const customHeader = req.headers.get(headerKey);
      const authHeader = req.headers.get("authorization");
      const sigHeader = req.headers.get("x-biteship-signature");

      const expectedBearer = `Bearer ${webhookSecret}`;
      const headerCocok =
        customHeader === webhookSecret ||
        authHeader === webhookSecret ||
        authHeader === expectedBearer ||
        sigHeader === webhookSecret;

      if (!headerCocok) {
        return NextResponse.json(
          { error: "Autentikasi webhook Biteship tidak valid." },
          { status: 403 }
        );
      }
    }

    // 3. Parsing JSON Payload
    let body: PayloadWebhookBiteship;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Payload webhook bukan format JSON yang valid." },
        { status: 400 }
      );
    }

    const event = body.event;
    const rawStatus = body.status || event;

    if (!rawStatus) {
      return NextResponse.json(
        { error: "Payload webhook tidak memuat atribut 'status' atau 'event'." },
        { status: 400 }
      );
    }

    const status = rawStatus;
    const {
      order_id,
      courier_tracking_id,
      courier_waybill_id,
      courier_company,
      note,
      updated_at,
      location,
      metadata,
    } = body;

    const nomorPesananTarget =
      metadata?.nomor_pesanan ||
      metadata?.reference_id ||
      order_id;

    // 4. Pencarian Pesanan Terkait di Database
    let pesananTerkait: { id: string; nomorPesanan: string; statusPesanan: string } | undefined;

    // 4a. Cari berdasarkan nomor pesanan internal
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

    // 4b. Jika belum ditemukan, cari via external Biteship ID pada entitas pengiriman
    if (!pesananTerkait && (order_id || courier_tracking_id || courier_waybill_id)) {
      let pengirimanOrder: { pesananId: string } | undefined;

      if (order_id) {
        const [p] = await db
          .select({ pesananId: pengiriman.pesananId })
          .from(pengiriman)
          .where(eq(pengiriman.biteshipOrderId, order_id.trim()))
          .limit(1);
        pengirimanOrder = p;
      }

      if (!pengirimanOrder && courier_tracking_id) {
        const [p] = await db
          .select({ pesananId: pengiriman.pesananId })
          .from(pengiriman)
          .where(eq(pengiriman.biteshipTrackingId, courier_tracking_id.trim()))
          .limit(1);
        pengirimanOrder = p;
      }

      if (!pengirimanOrder && courier_waybill_id) {
        const [p] = await db
          .select({ pesananId: pengiriman.pesananId })
          .from(pengiriman)
          .where(eq(pengiriman.nomorResi, courier_waybill_id.trim()))
          .limit(1);
        pengirimanOrder = p;
      }

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
    const statusNormal = status.toLowerCase();

    // Penyesuaian keterangan berdasarkan event logistik Biteship
    let keteranganFinal = note;
    if (!keteranganFinal) {
      if (statusNormal.includes("price") || event === "order.price") {
        keteranganFinal = "Penyesuaian tarif ongkos kirim dari ekspedisi (selisih ditanggung sepenuhnya oleh VOID Supply).";
      } else if (statusNormal.includes("waybill") || event === "order.waybill_id") {
        keteranganFinal = `Pembaruan nomor resi fisik ekspedisi: ${courier_waybill_id}`;
      } else {
        keteranganFinal = `Status logistik diperbarui: ${status}`;
      }
    }

    // 5. Transaksi Mutasi Status, Pengiriman, & Titik Pelacakan
    await db.transaction(async (tx) => {
      // 5a. Idempotensi Titik Pelacakan: Cek apakah titik peristiwa yang sama persis sudah ada
      const [pelacakanEksis] = await tx
        .select({ id: pelacakanPengiriman.id })
        .from(pelacakanPengiriman)
        .where(
          and(
            eq(pelacakanPengiriman.pesananId, pesananTerkait.id),
            eq(pelacakanPengiriman.statusPelacakan, status),
            eq(pelacakanPengiriman.nomorResi, nomorResiFinal)
          )
        )
        .limit(1);

      if (!pelacakanEksis) {
        await tx.insert(pelacakanPengiriman).values({
          pesananId: pesananTerkait.id,
          nomorResi: nomorResiFinal,
          kurir: kurirFinal,
          statusPelacakan: status,
          keterangan: keteranganFinal,
          lokasi: location || null,
          waktuPeristiwa,
        });
      }

      // 5b. Update data pengiriman dengan ID eksternal dan biaya aktual jika ada
      const nilaiUpdatePengiriman: Record<string, unknown> = {
        diperbaruiPada: new Date(),
      };

      if (courier_waybill_id) {
        nilaiUpdatePengiriman.nomorResi = courier_waybill_id.trim();
      }
      if (order_id) {
        nilaiUpdatePengiriman.biteshipOrderId = order_id.trim();
      }
      if (courier_tracking_id) {
        nilaiUpdatePengiriman.biteshipTrackingId = courier_tracking_id.trim();
      }

      // Tangani event order.price (biaya riil ekspedisi)
      const rawPrice = body.price ?? body.courier_price ?? body.shipping_fee;
      if (typeof rawPrice === "number" && !isNaN(rawPrice)) {
        nilaiUpdatePengiriman.biayaPengirimanAktual = Math.round(rawPrice);
      }

      await tx
        .update(pengiriman)
        .set(nilaiUpdatePengiriman)
        .where(eq(pengiriman.pesananId, pesananTerkait.id));

      // 5c. Pemetaan Transisi Status Pesanan dan Pengiriman (ISOLASI KETAT PER PESANAN)
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

        // Transisi pesanan ke 'dikirim' HANYA jika pesanan terkait saat ini berstatus 'diproses'
        // Mencegah perubahan pesanan lain dan pesanan yang masih 'menunggu_pembayaran'
        await tx
          .update(pesanan)
          .set({
            statusPesanan: "dikirim",
            diperbaruiPada: new Date(),
          })
          .where(
            and(
              eq(pesanan.id, pesananTerkait.id),
              eq(pesanan.statusPesanan, "diproses")
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
      `[BITESHIP WEBHOOK] Berhasil memproses event logistik ${status} untuk pesanan ${pesananTerkait.nomorPesanan} (Resi: ${nomorResiFinal}).`
    );

    const statusPesananAkhir =
      statusNormal === "delivered"
        ? "selesai"
        : (statusNormal === "picking_up" || statusNormal === "dropping_off") && pesananTerkait.statusPesanan === "diproses"
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
