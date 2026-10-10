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
}

/**
 * Buat Transaksi Snap Terverifikasi Server
 * Mengembalikan snap token dan URL pembayaran.
 */
export async function buatTransaksiMidtrans(
  params: ParameterTransaksiMidtrans
): Promise<HasilBuatTransaksiSnap> {
  try {
    // Jika masih menggunakan placeholder dummy key di sandbox, buat simulasi token yang stabil
    if (serverKey.includes("xxxxxxxxxxxx") || serverKey.startsWith("SB-Mid-server-demo")) {
      const tokenSimulasi = `SNAP-SIM-${params.nomorPesanan}`;
      return {
        sukses: true,
        token: tokenSimulasi,
        redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${tokenSimulasi}`,
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
