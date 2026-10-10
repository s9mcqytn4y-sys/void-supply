import axios from "axios";

/**
 * Service Logistik & Ongkos Kirim Biteship API
 * Menghitung ongkir real-time berdasarkan berat fisik riil artikel merchandise.
 */

const BITESHIP_API_KEY =
  process.env.BITESHIP_API_KEY ||
  process.env.BITESHIP_API_KEY_SANDBOX ||
  "biteship_test.xxxxxxxxxxxx";

const ORIGIN_POSTAL_CODE = process.env.BITESHIP_ORIGIN_POSTAL_CODE || "55281";

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
 * Menggunakan API Biteship jika key terpasang, atau fallback kalkulator berbasis zona & berat jika dalam sandbox test mode.
 */
export async function hitungOngkirBiteship(
  params: ParameterCekOngkir
): Promise<OpsiKurir[]> {
  const beratKg = Math.max(1, Math.ceil(params.totalBeratGram / 1000));

  // Jika API key adalah placeholder sandbox, berikan kalkulasi tarif deterministik berdasarkan berat
  if (
    !BITESHIP_API_KEY ||
    BITESHIP_API_KEY.includes("xxxxxxxxxxxx") ||
    BITESHIP_API_KEY.startsWith("biteship_test.demo")
  ) {
    return [
      {
        namaKurir: "JNE",
        kodeKurir: "jne",
        layanan: "Reguler",
        estimasiHari: "2-3 Hari",
        tarifIdr: 18000 * beratKg,
      },
      {
        namaKurir: "SiCepat",
        kodeKurir: "sicepat",
        layanan: "BEST (Next Day)",
        estimasiHari: "1 Hari",
        tarifIdr: 28000 * beratKg,
      },
      {
        namaKurir: "J&T",
        kodeKurir: "jnt",
        layanan: "EZ",
        estimasiHari: "2-3 Hari",
        tarifIdr: 19000 * beratKg,
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
    if (data && Array.isArray(data.pricing)) {
      return data.pricing.map((p: { courier_name: string; courier_code: string; courier_service_name: string; duration: string; price: number }) => ({
        namaKurir: p.courier_name,
        kodeKurir: p.courier_code,
        layanan: p.courier_service_name,
        estimasiHari: p.duration,
        tarifIdr: p.price,
      }));
    }

    throw new Error("Format respons Biteship tidak sesuai.");
  } catch (error) {
    console.warn("⚠️ Biteship API timeout/gagal, menggunakan kalkulasi tarif fallback:", error);
    return [
      {
        namaKurir: "JNE",
        kodeKurir: "jne",
        layanan: "Reguler",
        estimasiHari: "2-3 Hari",
        tarifIdr: 18000 * beratKg,
      },
      {
        namaKurir: "SiCepat",
        kodeKurir: "sicepat",
        layanan: "BEST",
        estimasiHari: "1-2 Hari",
        tarifIdr: 25000 * beratKg,
      },
    ];
  }
}
