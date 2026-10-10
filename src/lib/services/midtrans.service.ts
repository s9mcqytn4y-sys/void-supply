import crypto from "crypto";
import midtransClient from "midtrans-client";

/**
 * Service Gateway Pembayaran Midtrans Snap
 * Penanggung jawab pembuatan transaksi Snap dengan total gross_amount yang dihitung server.
 */

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey =
  process.env.MIDTRANS_SERVER_KEY ||
  process.env.MIDTRANS_SERVER_KEY_SANDBOX ||
  "SB-Mid-server-xxxxxxxxxxxx";
const clientKey =
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX ||
  "SB-Mid-client-xxxxxxxxxxxx";

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

    // Di production, token simulasi dilarang mutlak
    if (isProduction && isKeyPlaceholder) {
      return {
        sukses: false,
        pesan: "Konfigurasi Gateway Gagal: MIDTRANS_SERVER_KEY produksi belum dikonfigurasi.",
      };
    }

    // Di environment development / testing, fallback mock hanya aktif jika flag ALLOW_PAYMENT_MOCK diizinkan
    const allowMock = process.env.ALLOW_PAYMENT_MOCK === "true" || process.env.NODE_ENV !== "production";
    if (isKeyPlaceholder) {
      if (!allowMock) {
        return {
          sukses: false,
          pesan: "Kredensial Midtrans Sandbox tidak valid dan simulasi mock dinonaktifkan.",
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


