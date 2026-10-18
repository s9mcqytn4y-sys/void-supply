import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, faktur, arsipFaktur, pesanan, itemPesanan, pengiriman, pembayaran } from "@/lib/db";

export interface SnapshotFakturPayload {
  nomorFaktur: string;
  nomorPesanan: string;
  diterbitkanPada: string;
  entitasPenerbit: {
    nama: string;
    perusahaan: string;
    alamat: string;
    npwp: string;
    email: string;
    website: string;
  };
  pelanggan: {
    nama: string;
    email: string;
    telepon: string;
    alamatLengkap: string;
    kota?: string;
    provinsi?: string;
    kodePos?: string;
  };
  logistik: {
    kurir?: string;
    layanan?: string;
    nomorResi?: string | null;
    estimasiHari?: string;
  };
  pembayaran: {
    metode?: string | null;
    gatewayTransactionId?: string | null;
    dibayarPada?: string | null;
    status: string;
  };
  itemPesanan: Array<{
    id: string;
    namaProduk: string;
    namaVarian: string;
    sku: string;
    hargaSatuan: number;
    jumlah: number;
    subtotalItem: number;
  }>;
  keuangan: {
    subtotal: number;
    totalOngkir: number;
    totalDiskon: number;
    kodeVoucher?: string | null;
    totalAkhir: number;
    pajakPersen: number;
    pajakTermasukIdr: number;
  };
}

export interface HasilArsipFaktur {
  sukses: boolean;
  pesan: string;
  arsipId?: string;
  hashIntegrity?: string;
}

/**
 * Menyimpan snapshot imutabel faktur komersial ke tabel arsip_faktur
 * Dilengkapi hash kriptografis SHA-256 untuk audit legal dan proteksi manipulasi dokumen.
 */
export async function simpanSnapshotArsipFaktur(
  fakturId: string,
  nomorFaktur: string,
  pesananId: string
): Promise<HasilArsipFaktur> {
  try {
    // 1. Cek apakah arsip faktur sudah pernah dibuat (Idempotency)
    const arsipEksis = await db.query.arsipFaktur.findFirst({
      where: eq(arsipFaktur.fakturId, fakturId),
    });

    if (arsipEksis) {
      return {
        sukses: true,
        pesan: "Arsip faktur sudah tercatat sebelumnya.",
        arsipId: arsipEksis.id,
        hashIntegrity: arsipEksis.hashIntegrity,
      };
    }

    // 2. Tarik data lengkap transaksi dari basis data
    const [dataPesanan] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.id, pesananId))
      .limit(1);

    if (!dataPesanan) {
      return { sukses: false, pesan: "Data pesanan tidak ditemukan." };
    }

    const items = await db
      .select()
      .from(itemPesanan)
      .where(eq(itemPesanan.pesananId, pesananId));

    const [dataKirim] = await db
      .select()
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, pesananId))
      .limit(1);

    const [dataBayar] = await db
      .select()
      .from(pembayaran)
      .where(eq(pembayaran.pesananId, pesananId))
      .limit(1);

    // 3. Susun payload dokumen faktur resmi
    // Ketentuan Pajak: Non-PKP / PPN 0% (bebas pungutan pajak fiktif sesuai Anti-Slop R-36)
    const pajakPersen = Number(process.env.MERCHANT_TAX_PERCENT || 0);
    const pajakTermasukIdr =
      pajakPersen > 0
        ? Math.round((dataPesanan.totalAkhir * pajakPersen) / (100 + pajakPersen))
        : 0;

    const payloadSnapshot: SnapshotFakturPayload = {
      nomorFaktur,
      nomorPesanan: dataPesanan.nomorPesanan,
      diterbitkanPada: new Date().toISOString(),
      entitasPenerbit: {
        nama: "VOID SUPPLY OFFICIAL MERCHANDISE",
        perusahaan: process.env.MERCHANT_LEGAL_NAME || "VOID SUPPLY STUDIO",
        alamat:
          process.env.MERCHANT_ADDRESS || "Johar Baru, Jakarta Pusat 10560, DKI Jakarta, Indonesia",
        npwp: process.env.MERCHANT_TAX_ID || "-",
        email: "studio@voidsupply.com",
        website: "https://voidsupply.com",
      },
      pelanggan: {
        nama: dataPesanan.namaPelanggan,
        email: dataPesanan.emailPelanggan,
        telepon: dataPesanan.teleponPelanggan,
        alamatLengkap: dataKirim?.alamatLengkap || "Tidak tercatat",
        kota: dataKirim?.kota,
        provinsi: dataKirim?.provinsi,
        kodePos: dataKirim?.kodePos,
      },
      logistik: {
        kurir: dataKirim?.kurir,
        layanan: dataKirim?.layanan,
        nomorResi: dataKirim?.nomorResi,
        estimasiHari: dataKirim?.estimasiHari,
      },
      pembayaran: {
        metode: dataBayar?.metodePembayaran,
        gatewayTransactionId: dataBayar?.gatewayTransactionId,
        dibayarPada: dataBayar?.dibayarPada ? dataBayar.dibayarPada.toISOString() : null,
        status: dataBayar?.statusPembayaran || "berhasil",
      },
      itemPesanan: items.map((i) => ({
        id: i.id,
        namaProduk: i.namaProduk,
        namaVarian: i.namaVarian,
        sku: i.sku,
        hargaSatuan: i.hargaSatuan,
        jumlah: i.jumlah,
        subtotalItem: i.subtotalItem,
      })),
      keuangan: {
        subtotal: dataPesanan.subtotal,
        totalOngkir: dataPesanan.totalOngkir,
        totalDiskon: dataPesanan.totalDiskon || 0,
        kodeVoucher: dataPesanan.kodeVoucher,
        totalAkhir: dataPesanan.totalAkhir,
        pajakPersen,
        pajakTermasukIdr,
      },
    };

    // 4. Hitung hash integritas kriptografis SHA-256
    const serialized = JSON.stringify(payloadSnapshot);
    const hashIntegrity = crypto
      .createHash("sha256")
      .update(serialized)
      .digest("hex");

    // 5. Simpan ke tabel arsip_faktur
    const [arsipBaru] = await db
      .insert(arsipFaktur)
      .values({
        fakturId,
        nomorFaktur,
        snapshotPayload: payloadSnapshot,
        hashIntegrity,
      })
      .returning({
        id: arsipFaktur.id,
        hashIntegrity: arsipFaktur.hashIntegrity,
      });

    return {
      sukses: true,
      pesan: `Faktur #${nomorFaktur} berhasil diarsipkan secara imutabel.`,
      arsipId: arsipBaru.id,
      hashIntegrity: arsipBaru.hashIntegrity,
    };
  } catch (err) {
    console.error("Gagal menyimpan snapshot arsip faktur:", err);
    return {
      sukses: false,
      pesan: err instanceof Error ? err.message : "Terjadi galat penyimpanan arsip.",
    };
  }
}

/**
 * Mengambil data arsip faktur berdasarkan nomor faktur
 */
export async function ambilArsipFakturByNomor(nomorFaktur: string) {
  try {
    const data = await db.query.arsipFaktur.findFirst({
      where: eq(arsipFaktur.nomorFaktur, nomorFaktur),
    });
    return data || null;
  } catch (err) {
    console.error("Gagal mengambil arsip faktur:", err);
    return null;
  }
}
