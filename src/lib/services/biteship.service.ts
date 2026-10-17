import axios from "axios";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment";

/**
 * Service Logistik & Ongkos Kirim Biteship API
 * Menangani estimasi tarif real-time (Instant: Gojek, Grab; Reguler: J&T, JNE, Anteraja, Pos Indonesia, SiCepat, TIKI),
 * pembuatan order pengiriman (POST /v1/orders), dan pelacakan kurir (GET /v1/trackings).
 */

const envConfig = selesaikanKonfigurasiEnvironment();
const BITESHIP_API_KEY = envConfig.biteship.apiKey;
const ORIGIN_POSTAL_CODE = envConfig.biteship.originPostalCode || "10530";

// Origin Fulfillment Resmi VOID Supply (Johar Baru, Jakarta Pusat)
export const WAREHOUSE_ORIGIN = {
  contactName: "Abdul Aziz",
  contactPhone: "08567060477",
  address: "Jl. Johar Baru No. 10, Jakarta Pusat, DKI Jakarta",
  postalCode: Number(ORIGIN_POSTAL_CODE) || 10530,
  coordinate: {
    latitude: -6.1852,
    longitude: 106.8584,
  },
};

export interface OpsiKurir {
  namaKurir: string;
  kodeKurir: string;
  layanan: string;
  estimasiHari: string;
  tarifIdr: number;
}

export interface ParameterCekOngkir {
  kodePosTujuan: string;
  totalBeratGram: number;
  latitudeTujuan?: number;
  longitudeTujuan?: number;
}

export interface ItemOrderBiteship {
  name: string;
  value: number;
  quantity: number;
  weight: number;
}

export interface ParameterBuatOrderBiteship {
  nomorPesanan: string;
  namaPenerima: string;
  teleponPenerima: string;
  alamatLengkap: string;
  kodePos: string;
  kodeKurir: string;
  layanan: string;
  totalBeratGram: number;
  items: ItemOrderBiteship[];
  latitudeTujuan?: number;
  longitudeTujuan?: number;
}

export interface HasilBuatOrderBiteship {
  sukses: boolean;
  orderId?: string;
  waybillId?: string;
  trackingId?: string;
  courierTrackingUrl?: string;
  status?: string;
  pesan?: string;
}

export interface EventPelacakanBiteship {
  status: string;
  note: string;
  updatedAt: string;
  location?: string | null;
}

export interface HasilPelacakanBiteship {
  sukses: boolean;
  status: string;
  nomorResi: string;
  kurir: string;
  linkWebview?: string;
  riwayat: EventPelacakanBiteship[];
  pesan?: string;
}

/**
 * Hitung Estimasi Ongkir Biteship
 * Mendukung Kurir Instant (Gojek, Grab) jika koordinat tersedia, dan Reguler (J&T, JNE, Anteraja, Pos Indonesia, SiCepat, TIKI).
 */
export async function hitungOngkirBiteship(
  params: ParameterCekOngkir
): Promise<OpsiKurir[]> {
  const beratKg = Math.max(1, Math.ceil(params.totalBeratGram / 1000));
  const isKeyPlaceholder =
    !BITESHIP_API_KEY ||
    BITESHIP_API_KEY.includes("xxxxxxxxxxxx") ||
    BITESHIP_API_KEY.startsWith("biteship_test.demo");

  const isRealProduction =
    process.env.NODE_ENV === "production" &&
    process.env.CI !== "true" &&
    process.env.VERCEL_ENV === "production";

  // Mock data jika di non-production dengan ALLOW_PAYMENT_MOCK aktif
  if (isKeyPlaceholder) {
    if (isRealProduction || process.env.ALLOW_PAYMENT_MOCK !== "true") {
      throw new Error("Konfigurasi Logistik Gagal: BITESHIP_API_KEY resmi belum dikonfigurasi.");
    }

    const opsiFallback: OpsiKurir[] = [
      {
        namaKurir: "JNE",
        kodeKurir: "jne",
        layanan: "Reguler",
        estimasiHari: "1-2 Hari",
        tarifIdr: 10000 * beratKg,
      },
      {
        namaKurir: "J&T",
        kodeKurir: "jnt",
        layanan: "EZ",
        estimasiHari: "1-2 Hari",
        tarifIdr: 11000 * beratKg,
      },
      {
        namaKurir: "SiCepat",
        kodeKurir: "sicepat",
        layanan: "BEST",
        estimasiHari: "1 Hari",
        tarifIdr: 15000 * beratKg,
      },
      {
        namaKurir: "Anteraja",
        kodeKurir: "anteraja",
        layanan: "Reguler",
        estimasiHari: "1-2 Hari",
        tarifIdr: 10500 * beratKg,
      },
      {
        namaKurir: "Pos Indonesia",
        kodeKurir: "pos",
        layanan: "Kilat Khusus",
        estimasiHari: "2-3 Hari",
        tarifIdr: 9500 * beratKg,
      },
      {
        namaKurir: "TIKI",
        kodeKurir: "tiki",
        layanan: "REG",
        estimasiHari: "1-2 Hari",
        tarifIdr: 11000 * beratKg,
      },
    ];

    // Jika koordinat tersedia, sertakan kurir instant (Gojek / Grab)
    if (params.latitudeTujuan && params.longitudeTujuan) {
      opsiFallback.unshift(
        {
          namaKurir: "Gojek",
          kodeKurir: "gojek",
          layanan: "Instant",
          estimasiHari: "2-3 Jam",
          tarifIdr: 25000 * beratKg,
        },
        {
          namaKurir: "Grab",
          kodeKurir: "grab",
          layanan: "Instant",
          estimasiHari: "2-3 Jam",
          tarifIdr: 27000 * beratKg,
        }
      );
    }

    return opsiFallback;
  }

  try {
    const hasCoords =
      typeof params.latitudeTujuan === "number" &&
      typeof params.longitudeTujuan === "number";

    // Kurir aktif resmi VOID Supply
    const daftarKurir = hasCoords
      ? "gojek,grab,jnt,jne,anteraja,pos,sicepat,tiki"
      : "jnt,jne,anteraja,pos,sicepat,tiki";

    const payload: Record<string, unknown> = {
      origin_postal_code: WAREHOUSE_ORIGIN.postalCode,
      destination_postal_code: Number(params.kodePosTujuan),
      couriers: daftarKurir,
      items: [
        {
          name: "VOID Supply Streetwear Merchandise",
          value: 500000,
          weight: params.totalBeratGram,
          quantity: 1,
        },
      ],
    };

    if (hasCoords) {
      payload.origin_latitude = WAREHOUSE_ORIGIN.coordinate.latitude;
      payload.origin_longitude = WAREHOUSE_ORIGIN.coordinate.longitude;
      payload.destination_latitude = params.latitudeTujuan;
      payload.destination_longitude = params.longitudeTujuan;
    }

    const response = await axios.post(
      "https://api.biteship.com/v1/rates/couriers",
      payload,
      {
        headers: {
          Authorization: `Bearer ${BITESHIP_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 7000,
      }
    );

    const data = response.data;
    if (data && Array.isArray(data.pricing) && data.pricing.length > 0) {
      return data.pricing.map(
        (p: {
          courier_name: string;
          courier_code: string;
          courier_service_name: string;
          duration: string;
          price: number;
        }) => ({
          namaKurir: p.courier_name,
          kodeKurir: p.courier_code,
          layanan: p.courier_service_name,
          estimasiHari: p.duration,
          tarifIdr: p.price,
        })
      );
    }

    throw new Error("Tidak ada opsi logistik yang tersedia untuk rute tujuan ini.");
  } catch (error) {
    console.error("Gagal memanggil API resmi Biteship:", error);

    if (!isRealProduction && process.env.ALLOW_PAYMENT_MOCK === "true") {
      console.warn("Menggunakan opsi logistik simulasi dev/CI karena kuota saldo Biteship habis.");
      return [
        {
          namaKurir: "JNE",
          kodeKurir: "jne",
          layanan: "Reguler",
          estimasiHari: "1-2 Hari",
          tarifIdr: 10000 * beratKg,
        },
        {
          namaKurir: "J&T",
          kodeKurir: "jnt",
          layanan: "EZ",
          estimasiHari: "1-2 Hari",
          tarifIdr: 11000 * beratKg,
        },
        {
          namaKurir: "SiCepat",
          kodeKurir: "sicepat",
          layanan: "BEST",
          estimasiHari: "1 Hari",
          tarifIdr: 15000 * beratKg,
        },
      ];
    }

    throw new Error(
      error instanceof Error
        ? `Layanan ongkos kirim gagal: ${error.message}`
        : "Gagal menghubungkan ke server logistik resmi Biteship."
    );
  }
}

/**
 * Buat Order Pengiriman Biteship Resmi (POST /v1/orders)
 * Menghasilkan order_id, waybill_id (nomor resi AWB), tracking_id, dan link tracking webview.
 */
export async function buatOrderPengirimanBiteship(
  params: ParameterBuatOrderBiteship
): Promise<HasilBuatOrderBiteship> {
  const isKeyPlaceholder =
    !BITESHIP_API_KEY ||
    BITESHIP_API_KEY.includes("xxxxxxxxxxxx") ||
    BITESHIP_API_KEY.startsWith("biteship_test.demo");

  const isRealProduction =
    process.env.NODE_ENV === "production" &&
    process.env.CI !== "true" &&
    process.env.VERCEL_ENV === "production";

  // Simulasi jika testing/dev tanpa key resmi
  if (isKeyPlaceholder || process.env.ALLOW_PAYMENT_MOCK === "true") {
    if (isRealProduction && !process.env.ALLOW_PAYMENT_MOCK) {
      return {
        sukses: false,
        pesan: "Konfigurasi Logistik Gagal: BITESHIP_API_KEY belum terpasang di production.",
      };
    }

    const mockResi = `VOID-${params.kodeKurir.toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const mockTrackingId = `TRACK-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      sukses: true,
      orderId: `order_biteship_${params.nomorPesanan}`,
      waybillId: mockResi,
      trackingId: mockTrackingId,
      courierTrackingUrl: `https://biteship.com/track/${mockTrackingId}`,
      status: "allocated",
    };
  }

  try {
    const payloadOrder: Record<string, unknown> = {
      shipper_contact_name: WAREHOUSE_ORIGIN.contactName,
      shipper_contact_phone: WAREHOUSE_ORIGIN.contactPhone,
      shipper_contact_email: "orders@voidsupply.com",
      origin_contact_name: WAREHOUSE_ORIGIN.contactName,
      origin_contact_phone: WAREHOUSE_ORIGIN.contactPhone,
      origin_address: WAREHOUSE_ORIGIN.address,
      origin_postal_code: WAREHOUSE_ORIGIN.postalCode,
      origin_coordinate: WAREHOUSE_ORIGIN.coordinate,
      destination_contact_name: params.namaPenerima,
      destination_contact_phone: params.teleponPenerima,
      destination_address: params.alamatLengkap,
      destination_postal_code: Number(params.kodePos),
      courier_company: params.kodeKurir.toLowerCase(),
      courier_type: params.layanan.toLowerCase().replace(/[^a-z0-9]/g, ""),
      delivery_type: "now",
      order_note: `Streetwear Drop: ${params.nomorPesanan}`,
      reference_id: params.nomorPesanan,
      metadata: {
        nomor_pesanan: params.nomorPesanan,
      },
      items: params.items.map((i) => ({
        name: i.name,
        description: "Streetwear Apparel",
        value: i.value,
        quantity: i.quantity,
        weight: i.weight,
      })),
    };

    if (params.latitudeTujuan && params.longitudeTujuan) {
      payloadOrder.destination_coordinate = {
        latitude: params.latitudeTujuan,
        longitude: params.longitudeTujuan,
      };
    }

    const res = await axios.post(
      "https://api.biteship.com/v1/orders",
      payloadOrder,
      {
        headers: {
          Authorization: `Bearer ${BITESHIP_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const resData = res.data;
    if (resData && (resData.success || resData.id)) {
      return {
        sukses: true,
        orderId: resData.id,
        waybillId: resData.courier?.waybill_id || resData.waybill_id,
        trackingId: resData.courier?.tracking_id || resData.id,
        courierTrackingUrl: resData.courier?.link || `https://biteship.com/track/${resData.id}`,
        status: resData.status || "allocated",
      };
    }

    return {
      sukses: false,
      pesan: resData?.message || "Gagal membuat order pengiriman di Biteship.",
    };
  } catch (error) {
    console.error("Galat saat membuat order pengiriman di Biteship:", error);
    return {
      sukses: false,
      pesan: error instanceof Error ? error.message : "Network error / API Biteship gagal.",
    };
  }
}

/**
 * Lacak Pengiriman Resmi Biteship (GET /v1/trackings/{id})
 */
export async function lacakPengirimanBiteship(
  trackingIdOrWaybill: string,
  courierCode?: string
): Promise<HasilPelacakanBiteship> {
  const isKeyPlaceholder =
    !BITESHIP_API_KEY ||
    BITESHIP_API_KEY.includes("xxxxxxxxxxxx") ||
    BITESHIP_API_KEY.startsWith("biteship_test.demo");

  if (isKeyPlaceholder || process.env.ALLOW_PAYMENT_MOCK === "true") {
    return {
      sukses: true,
      status: "dropping_off",
      nomorResi: trackingIdOrWaybill,
      kurir: courierCode || "JNE",
      linkWebview: `https://biteship.com/track/${trackingIdOrWaybill}`,
      riwayat: [
        {
          status: "allocated",
          note: "Pesanan logistik telah dibuat dan dialokasikan ke kurir.",
          updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          location: "Warehouse Johar Baru, Jakarta Pusat",
        },
        {
          status: "picking_up",
          note: "Kurir telah menjemput paket dari gudang VOID Supply.",
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          location: "Hub Johar Baru",
        },
        {
          status: "dropping_off",
          note: "Paket dalam perjalanan menuju alamat tujuan penerima.",
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          location: "Transit Delivery Center",
        },
      ],
    };
  }

  try {
    const url = courierCode
      ? `https://api.biteship.com/v1/trackings/${encodeURIComponent(trackingIdOrWaybill)}/couriers/${encodeURIComponent(courierCode)}`
      : `https://api.biteship.com/v1/trackings/${encodeURIComponent(trackingIdOrWaybill)}`;

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BITESHIP_API_KEY}`,
      },
      timeout: 8000,
    });

    const data = res.data;
    if (data && data.success) {
      const history = Array.isArray(data.history)
        ? data.history.map((h: { status: string; note: string; updated_at: string; location?: string }) => ({
            status: h.status,
            note: h.note,
            updatedAt: h.updated_at,
            location: h.location || null,
          }))
        : [];

      return {
        sukses: true,
        status: data.status || "allocated",
        nomorResi: data.waybill_id || trackingIdOrWaybill,
        kurir: data.courier?.company || courierCode || "Kurir Resmi",
        linkWebview: data.link,
        riwayat: history,
      };
    }

    return {
      sukses: false,
      status: "unknown",
      nomorResi: trackingIdOrWaybill,
      kurir: courierCode || "Kurir Resmi",
      riwayat: [],
      pesan: data?.message || "Data pelacakan tidak ditemukan.",
    };
  } catch (error) {
    console.error("Gagal melacak pengiriman Biteship:", error);
    return {
      sukses: false,
      status: "unknown",
      nomorResi: trackingIdOrWaybill,
      kurir: courierCode || "Kurir Resmi",
      riwayat: [],
      pesan: error instanceof Error ? error.message : "Gagal menghubungi API pelacakan Biteship.",
    };
  }
}
