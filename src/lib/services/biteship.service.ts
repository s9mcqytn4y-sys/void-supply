import axios from "axios";

/**
 * Service Logistik & Ongkos Kirim Biteship API
 * Menghitung ongkir real-time berdasarkan berat fisik riil artikel merchandise.
 */

const BITESHIP_API_KEY =
  process.env.BITESHIP_API_KEY ||
  process.env.BITESHIP_API_KEY_SANDBOX ||
  "biteship_test.xxxxxxxxxxxx";

const ORIGIN_POSTAL_CODE = process.env.BITESHIP_ORIGIN_POSTAL_CODE || "10560"; // Johar Baru, Jakarta Pusat

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
}

/**
 * Hitung Estimasi Ongkir Biteship
 * Menggunakan API Biteship jika key terpasang, atau kalkulasi tarif deterministik jika dalam development sandbox.
 */
export async function hitungOngkirBiteship(
  params: ParameterCekOngkir
): Promise<OpsiKurir[]> {
  const beratKg = Math.max(1, Math.ceil(params.totalBeratGram / 1000));
  const isKeyPlaceholder =
    !BITESHIP_API_KEY ||
    BITESHIP_API_KEY.includes("xxxxxxxxxxxx") ||
    BITESHIP_API_KEY.startsWith("biteship_test.demo");

  // Jika API key adalah placeholder sandbox pada environment dev/test
  if (isKeyPlaceholder) {
    return [
      {
        namaKurir: "JNE",
        kodeKurir: "jne",
        layanan: "Reguler",
        estimasiHari: "1-2 Hari",
        tarifIdr: 10000 * beratKg,
      },
      {
        namaKurir: "SiCepat",
        kodeKurir: "sicepat",
        layanan: "BEST (Next Day)",
        estimasiHari: "1 Hari",
        tarifIdr: 16000 * beratKg,
      },
      {
        namaKurir: "J&T",
        kodeKurir: "jnt",
        layanan: "EZ",
        estimasiHari: "1-2 Hari",
        tarifIdr: 11000 * beratKg,
      },
    ];
  }

  try {
    const response = await axios.post(
      "https://api.biteship.com/v1/rates/couriers",
      {
        origin_postal_code: Number(ORIGIN_POSTAL_CODE),
        destination_postal_code: Number(params.kodePosTujuan),
        couriers: "jne,sicepat,jnt",
        items: [
          {
            name: "VOID Supply Streetwear Merchandise",
            value: 500000,
            weight: params.totalBeratGram,
            quantity: 1,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${BITESHIP_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
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
    throw new Error(
      error instanceof Error
        ? `Layanan ongkos kirim gagal: ${error.message}`
        : "Gagal menghubungkan ke server logistik resmi Biteship."
    );
  }
}

