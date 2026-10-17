import crypto from "crypto";
import midtransClient from "midtrans-client";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment";

/**
 * Service Gateway Pembayaran Midtrans Snap
 * Penanggung jawab pembuatan transaksi Snap dengan total gross_amount yang dihitung server.
 */

const envConfig = selesaikanKonfigurasiEnvironment();
const isProduction = envConfig.midtrans.isProduction;
const serverKey = envConfig.midtrans.serverKey;
const clientKey = envConfig.midtrans.clientKey;

// Inisialisasi Snap Client
export const midtransSnap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

export interface ParameterTransaksiMidtrans {
  nomorPesanan: string;
  totalAkhirIdr: number;
  items: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  pelanggan: {
    namaLengkap: string;
    email: string;
    telepon: string;
    alamat?: string;
  };
}

export interface HasilBuatTransaksiSnap {
  sukses: boolean;
  token?: string;
  redirectUrl?: string;
  pesan?: string;
  isMock?: boolean;
}

/**
 * Buat Transaksi Snap Terverifikasi Server
 * Mengembalikan snap token dan URL pembayaran.
 */
export async function buatTransaksiMidtrans(
  params: ParameterTransaksiMidtrans
): Promise<HasilBuatTransaksiSnap> {
  try {
    const isKeyPlaceholder =
      serverKey.includes("xxxxxxxxxxxx") || serverKey.startsWith("SB-Mid-server-demo");

    const isRealProduction =
      process.env.CI !== "true" &&
      (isProduction ||
        (process.env.NODE_ENV === "production" &&
          process.env.VERCEL_ENV === "production"));

    // Di production nyata, token simulasi dilarang mutlak
    if (isRealProduction && isKeyPlaceholder) {
      return {
        sukses: false,
        pesan: "Konfigurasi Gateway Gagal: MIDTRANS_SERVER_KEY produksi belum dikonfigurasi.",
      };
    }

    // Di luar environment production nyata, fallback mock aktif jika flag ALLOW_PAYMENT_MOCK bernilai true secara eksplisit
    const allowMock = process.env.ALLOW_PAYMENT_MOCK === "true" && !isRealProduction;
    if (allowMock || isKeyPlaceholder) {
      if (!allowMock) {
        return {
          sukses: false,
          pesan: "Kredensial Midtrans Sandbox tidak valid dan simulasi mock dinonaktifkan (ALLOW_PAYMENT_MOCK=false).",
        };
      }

      const tokenSimulasi = `SNAP-SIM-${params.nomorPesanan}`;
      return {
        sukses: true,
        token: tokenSimulasi,
        redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${tokenSimulasi}`,
        isMock: true,
      };
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://voidsupply.com";

    const payload = {
      transaction_details: {
        order_id: params.nomorPesanan,
        gross_amount: params.totalAkhirIdr,
      },
      item_details: params.items.map((item) => ({
        id: item.id.substring(0, 50),
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
      customer_details: {
        first_name: params.pelanggan.namaLengkap,
        email: params.pelanggan.email,
        phone: params.pelanggan.telepon,
        billing_address: {
          first_name: params.pelanggan.namaLengkap,
          email: params.pelanggan.email,
          phone: params.pelanggan.telepon,
          address: params.pelanggan.alamat,
        },
      },
      expiry: {
        unit: "minutes",
        duration: 15,
      },
      callbacks: {
        finish: `${siteUrl}/pesanan/${params.nomorPesanan}`,
      },
    };

    const transaksi = await midtransSnap.createTransaction(payload);

    return {
      sukses: true,
      token: transaksi.token,
      redirectUrl: transaksi.redirect_url,
    };
  } catch (error) {
    console.error("Galat saat membuat transaksi Midtrans:", error);
    return {
      sukses: false,
      pesan: error instanceof Error ? error.message : "Gagal membuat sesi pembayaran Midtrans.",
    };
  }
}

/**
 * Verifikasi signature hash SHA-512 dari payload Webhook Midtrans
 * Format formula Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifikasiSignatureMidtrans(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
  customServerKey?: string
): boolean {
  try {
    const key = customServerKey || serverKey;
    const inputString = `${orderId}${statusCode}${grossAmount}${key}`;
    const calculatedHash = crypto.createHash("sha512").update(inputString).digest("hex");
    return calculatedHash.toLowerCase() === signatureKey.toLowerCase();
  } catch (err) {
    console.error("Gagal memverifikasi signature Midtrans:", err);
    return false;
  }
}

export type StatusRekonsiliasiMidtrans = "PAID" | "PENDING" | "UNPAID_TERMINAL" | "UNKNOWN";

export interface HasilCekStatusMidtrans {
  ditemukan: boolean;
  statusTransaksi?: string;
  fraudStatus?: string;
  state: StatusRekonsiliasiMidtrans;
  apakahSudahDibayar: boolean;
  pesan?: string;
}

/**
 * Periksa Status Transaksi Langsung ke Gateway Midtrans (OPS-02 & PAY-04)
 * Menerapkan rekonsiliasi status gateway:
 * - PAID: Transaksi sukses/settlement/capture
 * - PENDING: Transaksi masih menunggu pembayaran di gateway (jangan lepas stok sebelum dibatalkan secara eksplisit)
 * - UNPAID_TERMINAL: Transaksi pasti belum dibayar & final (expire, cancel, deny, failure, atau 404 pada batas waktu)
 * - UNKNOWN: Gateway unreachable / 5xx / timeout (tidak boleh batalkan order / release stok otomatis)
 */
export async function cekStatusTransaksiMidtrans(
  nomorPesanan: string
): Promise<HasilCekStatusMidtrans> {
  // Flag simulasi mock lokal
  if (serverKey.includes("xxxxxxxxxxxx") || serverKey.startsWith("SB-Mid-server-demo")) {
    if (process.env.ALLOW_PAYMENT_MOCK === "true") {
      return {
        ditemukan: true,
        statusTransaksi: "expire",
        state: "UNPAID_TERMINAL",
        apakahSudahDibayar: false,
        pesan: "Simulasi sandbox/mock: Transaksi dianggap belum dibayar secara terminal.",
      };
    }
  }

  try {
    const baseUrl = isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

    const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${baseUrl}/v2/${encodeURIComponent(nomorPesanan)}/status`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });

    if (res.status === 404) {
      // 404 Not Found di Midtrans berarti transaksi tidak pernah terdaftar atau sudah dibersihkan gateway
      return {
        ditemukan: false,
        state: "UNPAID_TERMINAL",
        apakahSudahDibayar: false,
        pesan: "Transaksi tidak ditemukan di gateway (404).",
      };
    }

    if (!res.ok) {
      // HTTP 5xx atau error lain dari server gateway
      return {
        ditemukan: false,
        state: "UNKNOWN",
        apakahSudahDibayar: false,
        pesan: `Gateway Midtrans merespons status ${res.status}. Status transaksi belum dapat dipastikan.`,
      };
    }

    const data = await res.json();
    const status = data?.transaction_status as string | undefined;
    const fraud = data?.fraud_status as string | undefined;

    const sudahDibayar =
      status === "settlement" ||
      (status === "capture" && fraud === "accept");

    if (sudahDibayar) {
      return {
        ditemukan: true,
        statusTransaksi: status,
        fraudStatus: fraud,
        state: "PAID",
        apakahSudahDibayar: true,
      };
    }

    const terminalStatuses = ["expire", "cancel", "deny", "failure"];
    if (status && terminalStatuses.includes(status)) {
      return {
        ditemukan: true,
        statusTransaksi: status,
        fraudStatus: fraud,
        state: "UNPAID_TERMINAL",
        apakahSudahDibayar: false,
      };
    }

    // Status masih pending di gateway: kembalikan state PENDING secara eksplisit
    // Stok tidak boleh dilepaskan sampai pembatalan gateway diverifikasi
    if (status === "pending") {
      return {
        ditemukan: true,
        statusTransaksi: status,
        fraudStatus: fraud,
        state: "PENDING",
        apakahSudahDibayar: false,
      };
    }

    return {
      ditemukan: true,
      statusTransaksi: status,
      fraudStatus: fraud,
      state: "UNKNOWN",
      apakahSudahDibayar: false,
    };
  } catch (error) {
    console.error("Gagal memeriksa status transaksi Midtrans:", error);
    return {
      ditemukan: false,
      state: "UNKNOWN",
      apakahSudahDibayar: false,
      pesan: error instanceof Error ? error.message : "Network error / timeout",
    };
  }
}

/**
 * Batalkan Transaksi di Gateway Midtrans secara Eksplisit (Midtrans Cancel API)
 * Digunakan saat masa kedaluwarsa bisnis (15 menit) terlewati dan status di Midtrans masih 'pending'.
 * Endpoint Midtrans: POST /v2/{order_id}/cancel
 * Midtrans mengubah status menjadi 'cancel' dan merespons HTTP 200.
 */
export async function batalkanTransaksiMidtrans(
  nomorPesanan: string
): Promise<{ sukses: boolean; pesan: string; statusTransaksi?: string }> {
  // Flag simulasi mock lokal
  if (serverKey.includes("xxxxxxxxxxxx") || serverKey.startsWith("SB-Mid-server-demo")) {
    if (process.env.ALLOW_PAYMENT_MOCK === "true") {
      return {
        sukses: true,
        pesan: "Simulasi sandbox/mock: Transaksi berhasil dibatalkan di gateway.",
        statusTransaksi: "cancel",
      };
    }
  }

  try {
    const baseUrl = isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

    const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${baseUrl}/v2/${encodeURIComponent(nomorPesanan)}/cancel`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });

    if (res.status === 404) {
      // 404 berarti transaksi tidak pernah terdaftar atau sudah dibersihkan gateway
      return {
        sukses: true,
        pesan: "Transaksi tidak ditemukan di gateway (404), aman dibatalkan di internal.",
        statusTransaksi: "cancel",
      };
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        sukses: false,
        pesan: `Gagal membatalkan transaksi di Midtrans (${res.status}): ${errJson?.status_message || res.statusText}`,
      };
    }

    const data = await res.json();
    return {
      sukses: true,
      pesan: data.status_message || "Transaksi berhasil dibatalkan di Midtrans.",
      statusTransaksi: data.transaction_status || "cancel",
    };
  } catch (err) {
    console.error("Galat saat memanggil cancel API Midtrans:", err);
    return {
      sukses: false,
      pesan: err instanceof Error ? err.message : "Network error / timeout",
    };
  }
}
