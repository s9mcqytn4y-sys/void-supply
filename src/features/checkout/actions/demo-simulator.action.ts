"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, pesanan, pengiriman } from "@/lib/db";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment";

export interface HasilSimulasiDemo {
  sukses: boolean;
  pesan: string;
}

/**
 * Simulasi Pelunasan Midtrans Instan
 * Menembak internal webhook Midtrans dengan tanda tangan kriptografis SHA-512 resmi.
 */
export async function simulasikanPembayaranBerhasilAction(
  nomorPesanan: string,
  tokenAkses?: string
): Promise<HasilSimulasiDemo> {
  try {
    const env = selesaikanKonfigurasiEnvironment();
    if (env.appEnv === "production" && process.env.ALLOW_PAYMENT_MOCK !== "true") {
      return {
        sukses: false,
        pesan: "Simulasi pembayaran demo dinonaktifkan di lingkungan produksi.",
      };
    }

    const serverKey = env.midtrans.serverKey;

    const dataPesanan = await db.query.pesanan.findFirst({
      where: eq(pesanan.nomorPesanan, nomorPesanan),
    });

    if (!dataPesanan) {
      return { sukses: false, pesan: "Pesanan tidak ditemukan di database." };
    }

    // IDOR Protection: Verifikasi token akses jika token_akses ada pada pesanan
    if (dataPesanan.tokenAkses && dataPesanan.tokenAkses !== tokenAkses) {
      return { sukses: false, pesan: "Akses ditolak: Token otentikasi pesanan tidak cocok." };
    }

    if (dataPesanan.statusPesanan !== "menunggu_pembayaran") {
      return {
        sukses: false,
        pesan: `Pesanan sudah berada pada status '${dataPesanan.statusPesanan}', tidak dapat dilunasi ulang.`,
      };
    }

    const grossAmount = `${dataPesanan.totalAkhir}.00`;
    const statusCode = "200";
    const signatureKey = crypto
      .createHash("sha512")
      .update(`${nomorPesanan}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    const payload = {
      order_id: nomorPesanan,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: "settlement",
      fraud_status: "accept",
      payment_type: "bank_transfer",
      transaction_id: `SIM-TRX-${Date.now()}`,
      settlement_time: new Date().toISOString(),
    };

    const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const webhookUrl = `${host}/api/midtrans/webhook`;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        sukses: false,
        pesan: `Gagal memicu webhook Midtrans (${res.status}): ${errText}`,
      };
    }

    return {
      sukses: true,
      pesan: `Pembayaran pesanan #${nomorPesanan} berhasil diverifikasi. Status telah diperbarui menjadi DIPROSES.`,
    };
  } catch (err) {
    console.error("Gagal menjalankan simulasi pelunasan:", err);
    return {
      sukses: false,
      pesan: err instanceof Error ? err.message : "Terjadi kesalahan internal simulator.",
    };
  }
}

/**
 * Simulasi Mutasi Pengiriman Biteship
 * Menembak internal webhook Biteship untuk menguji status logistik dan nomor resi kurir.
 */
export async function simulasikanStatusLogistikBiteshipAction(
  nomorPesanan: string,
  eventStatus: "picking_up" | "dropping_off" | "delivered",
  tokenAkses?: string
): Promise<HasilSimulasiDemo> {
  try {
    const env = selesaikanKonfigurasiEnvironment();
    if (env.appEnv === "production" && process.env.ALLOW_PAYMENT_MOCK !== "true") {
      return {
        sukses: false,
        pesan: "Simulasi logistik demo dinonaktifkan di lingkungan produksi.",
      };
    }

    const dataPesanan = await db.query.pesanan.findFirst({
      where: eq(pesanan.nomorPesanan, nomorPesanan),
    });

    if (!dataPesanan) {
      return { sukses: false, pesan: "Pesanan tidak ditemukan." };
    }

    if (dataPesanan.tokenAkses && dataPesanan.tokenAkses !== tokenAkses) {
      return { sukses: false, pesan: "Akses ditolak: Token pesanan tidak valid." };
    }

    const dataKirim = await db.query.pengiriman.findFirst({
      where: eq(pengiriman.pesananId, dataPesanan.id),
    });

    const resiKurir = dataKirim?.nomorResi || `WYB-SIM-${Date.now().toString().slice(-8)}`;

    const eventBiteshipMap = {
      picking_up: "order.picking_up",
      dropping_off: "order.dropping_off",
      delivered: "order.delivered",
    };

    const payload = {
      event: eventBiteshipMap[eventStatus] || "order.dropping_off",
      order_id: dataKirim?.biteshipOrderId || `biteship-demo-${nomorPesanan}`,
      courier_tracking_id: dataKirim?.biteshipTrackingId || `TRACK-SIM-${nomorPesanan}`,
      courier_waybill_id: resiKurir,
      courier_company: dataKirim?.kurir || "sicepat",
      status: eventStatus,
      updated_at: new Date().toISOString(),
      metadata: {
        nomor_pesanan: nomorPesanan,
        reference_id: nomorPesanan,
      },
    };

    const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const webhookUrl = `${host}/api/biteship/webhook`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (env.biteship.webhookSecret) {
      headers[env.biteship.webhookHeaderKey] = env.biteship.webhookSecret;
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        sukses: false,
        pesan: `Gagal memicu webhook Biteship (${res.status}): ${errText}`,
      };
    }

    return {
      sukses: true,
      pesan: `Logistik pesanan #${nomorPesanan} berhasil dimutasi ke status '${eventStatus.toUpperCase()}' (Nomor Resi: ${resiKurir}).`,
    };
  } catch (err) {
    console.error("Gagal menjalankan simulasi logistik:", err);
    return {
      sukses: false,
      pesan: err instanceof Error ? err.message : "Terjadi kesalahan simulator logistik.",
    };
  }
}

/**
 * Simulasi Pembatalan / Kadaluwarsa Pesanan Midtrans
 * Menembak internal webhook Midtrans dengan status 'expire' untuk menguji Compare-and-Set pemulihan stok atomik.
 */
export async function simulasikanPembatalanPesananAction(
  nomorPesanan: string,
  tokenAkses?: string
): Promise<HasilSimulasiDemo> {
  try {
    const env = selesaikanKonfigurasiEnvironment();
    if (env.appEnv === "production" && process.env.ALLOW_PAYMENT_MOCK !== "true") {
      return {
        sukses: false,
        pesan: "Simulasi pembatalan demo dinonaktifkan di lingkungan produksi.",
      };
    }

    const serverKey = env.midtrans.serverKey;

    const dataPesanan = await db.query.pesanan.findFirst({
      where: eq(pesanan.nomorPesanan, nomorPesanan),
    });

    if (!dataPesanan) {
      return { sukses: false, pesan: "Pesanan tidak ditemukan di database." };
    }

    if (dataPesanan.tokenAkses && dataPesanan.tokenAkses !== tokenAkses) {
      return { sukses: false, pesan: "Akses ditolak: Token otentikasi pesanan tidak cocok." };
    }

    if (dataPesanan.statusPesanan !== "menunggu_pembayaran") {
      return {
        sukses: false,
        pesan: `Pesanan sudah berada pada status '${dataPesanan.statusPesanan}', tidak dapat dibatalkan melalui simulator ini.`,
      };
    }

    const grossAmount = `${dataPesanan.totalAkhir}.00`;
    const statusCode = "200";
    const signatureKey = crypto
      .createHash("sha512")
      .update(`${nomorPesanan}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    const payload = {
      order_id: nomorPesanan,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: "expire",
      fraud_status: "accept",
      payment_type: "bank_transfer",
      transaction_id: `SIM-EXP-${Date.now()}`,
    };

    const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const webhookUrl = `${host}/api/midtrans/webhook`;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        sukses: false,
        pesan: `Gagal memicu webhook pembatalan (${res.status}): ${errText}`,
      };
    }

    return {
      sukses: true,
      pesan: `Pesanan #${nomorPesanan} berhasil dibatalkan dan kuota stok varian telah dipulihkan secara atomik.`,
    };
  } catch (err) {
    console.error("Gagal menjalankan simulasi pembatalan:", err);
    return {
      sukses: false,
      pesan: err instanceof Error ? err.message : "Terjadi kesalahan internal simulator.",
    };
  }
}

