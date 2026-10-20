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
  kodeLayananKurir?: string;
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
  kodeLayananKurir?: string;
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
 * Normalisasi dan Pemetaan Kode Layanan Resmi Biteship
 * Menghubungkan nama layanan tampilan pembeli (misal: "Besok Sampai Tujuan")
 * ke service code resmi yang diterima oleh Biteship API (misal: "best").
 */
export function petakanKodeLayananBiteship(
  kodeKurir: string,
  namaLayanan: string,
  kodeLayanan?: string
): string {
  if (kodeLayanan && kodeLayanan.trim().length > 0) {
    const cleanCode = kodeLayanan.trim().toLowerCase();
    // Jika sudah berupa kode singkat, langsung gunakan
    if (!cleanCode.includes(" ") && cleanCode.length <= 15) {
      return cleanCode;
    }
  }

  const kurir = kodeKurir.toLowerCase().trim();
  const layanan = (kodeLayanan || namaLayanan).toLowerCase().trim();

  // 1. SiCepat
  if (kurir === "sicepat") {
    if (layanan.includes("best") || layanan.includes("besok")) return "best";
    if (layanan.includes("gokil") || layanan.includes("kargo") || layanan.includes("cargo")) return "gokil";
    if (layanan.includes("sds") || layanan.includes("same")) return "sds";
    if (layanan.includes("siuntung") || layanan.includes("reg")) return "reg";
    return "reg";
  }

  // 2. JNE
  if (kurir === "jne") {
    if (layanan.includes("yes") || layanan.includes("yakin")) return "yes";
    if (layanan.includes("jtr") || layanan.includes("truck") || layanan.includes("kargo")) return "jtr";
    if (layanan.includes("oke")) return "oke";
    return "reg";
  }

  // 3. J&T
  if (kurir === "jnt") {
    if (layanan.includes("super")) return "super";
    if (layanan.includes("doc")) return "doc";
    return "ez";
  }

  // 4. AnterAja
  if (kurir === "anteraja") {
    if (layanan.includes("same")) return "same_day";
    if (layanan.includes("next")) return "next_day";
    if (layanan.includes("cargo") || layanan.includes("kargo")) return "cargo";
    return "reg";
  }

  // 5. TIKI
  if (kurir === "tiki") {
    if (layanan.includes("ons")) return "ons";
    if (layanan.includes("eco")) return "eco";
    return "reg";
  }

  // 6. Pos Indonesia
  if (kurir === "pos") {
    if (layanan.includes("kilat")) return "pos_kilat_khusus";
    if (layanan.includes("next")) return "pos_next_day";
    return "pos_reguler";
  }

  // 7. GoSend
  if (kurir === "gojek" || kurir === "gosend") {
    if (layanan.includes("instant")) return "instant";
    return "same_day";
  }

  // 8. Grab
  if (kurir === "grab") {
    if (layanan.includes("instant")) return "instant";
    return "same_day";
  }

  return layanan.replace(/[^a-z0-9_]/g, "");
}

interface CacheOngkirEntry {
  waktu: number;
  data: OpsiKurir[];
}

const cacheOngkir = new Map<string, CacheOngkirEntry>();
const TTL_CACHE_ONGKIR_MS = 10 * 60 * 1000; // 10 menit

/**
 * Hitung Estimasi Ongkir Biteship
 * Mendukung Kurir Instant (Gojek, Grab) jika koordinat tersedia, dan Reguler (J&T, JNE, Anteraja, Pos Indonesia, SiCepat, TIKI).
 */
export async function hitungOngkirBiteship(
  params: ParameterCekOngkir
): Promise<OpsiKurir[]> {
  const cacheKey = `${params.kodePosTujuan}_${params.totalBeratGram}_${params.latitudeTujuan || 0}_${params.longitudeTujuan || 0}`;
  const entriCache = cacheOngkir.get(cacheKey);
  if (entriCache && Date.now() - entriCache.waktu < TTL_CACHE_ONGKIR_MS) {
    return entriCache.data;
  }

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

    const response = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: {
        Authorization: BITESHIP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(7000),
    });

    if (!response.ok) {
      const errJson = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errJson?.message || `HTTP ${response.status}: Gagal memanggil API Biteship`);
    }

    const data = (await response.json()) as {
      pricing?: Array<{
        courier_name: string;
        courier_code: string;
        courier_service_name: string;
        courier_service_code?: string;
        duration: string;
        price: number;
      }>;
    };
    if (data && Array.isArray(data.pricing) && data.pricing.length > 0) {
      const hasilPricing = data.pricing.map(
        (p: {
          courier_name: string;
          courier_code: string;
          courier_service_name: string;
          courier_service_code?: string;
          duration: string;
          price: number;
        }) => ({
          namaKurir: p.courier_name,
          kodeKurir: p.courier_code,
          layanan: p.courier_service_name,
          kodeLayananKurir:
            p.courier_service_code ||
            p.courier_service_name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          estimasiHari: p.duration,
          tarifIdr: p.price,
        })
      );

      if (cacheOngkir.size >= 100) {
        const kunciTertua = cacheOngkir.keys().next().value;
        if (kunciTertua) cacheOngkir.delete(kunciTertua);
      }
      cacheOngkir.set(cacheKey, { waktu: Date.now(), data: hasilPricing });

      return hasilPricing;
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
      courier_company: params.kodeKurir.toLowerCase().trim(),
      courier_type: petakanKodeLayananBiteship(
        params.kodeKurir,
        params.layanan,
        params.kodeLayananKurir
      ),
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

    const res = await fetch("https://api.biteship.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: BITESHIP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadOrder),
      signal: AbortSignal.timeout(10000),
    });

    const resData = (await res.json().catch(() => null)) as {
      success?: boolean;
      id?: string;
      waybill_id?: string;
      status?: string;
      message?: string;
      courier?: {
        waybill_id?: string;
        tracking_id?: string;
        link?: string;
      };
    } | null;
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

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: BITESHIP_API_KEY,
      },
      signal: AbortSignal.timeout(8000),
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      status?: string;
      waybill_id?: string;
      link?: string;
      message?: string;
      courier?: {
        company?: string;
      };
      history?: Array<{
        status: string;
        note: string;
        updated_at: string;
        location?: string;
      }>;
    } | null;
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
