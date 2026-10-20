"use server";

import { desc, eq, and, sql, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pesanan,
  itemPesanan,
  pengiriman,
  pembayaran,
} from "@/lib/db/schema";
import { catatanOperasionalPesanan } from "@/lib/db/admin.schema";
import { verifikasiStafAdmin } from "./auth-guard";

export interface ItemPesananAdmin {
  id: string;
  namaProduk: string;
  namaVarian: string;
  sku: string;
  jumlah: number;
  hargaSatuan: number;
  subtotalItem: number;
}

export interface PesananAdminRow {
  id: string;
  nomorPesanan: string;
  namaPelanggan: string;
  emailPelanggan: string;
  teleponPelanggan: string;
  totalAkhir: number;
  statusPesanan: string;
  statusPembayaran: string | null;
  kurir: string | null;
  layanan: string | null;
  nomorResi: string | null;
  dibuatPada: string;
  jumlahItem: number;
}

export interface DetailPesananAdminData {
  pesanan: {
    id: string;
    nomorPesanan: string;
    namaPelanggan: string;
    emailPelanggan: string;
    teleponPelanggan: string;
    statusPesanan: string;
    subtotal: number;
    totalOngkir: number;
    totalDiskon: number;
    totalAkhir: number;
    catatan: string | null;
    dibuatPada: string;
  };
  pembayaran: {
    gateway: string;
    statusPembayaran: string;
    metodePembayaran: string | null;
    jumlahBayar: number;
    dibayarPada: string | null;
    snapToken: string | null;
  } | null;
  pengiriman: {
    kurir: string;
    layanan: string;
    nomorResi: string | null;
    namaPenerima: string;
    teleponPenerima: string;
    alamatTujuan: string;
    kotaTujuan: string;
    provinsiTujuan: string;
    kodePosTujuan: string;
    biayaOngkir: number;
  } | null;
  daftarItem: ItemPesananAdmin[];
  catatanOperasional: {
    id: string;
    adminNama: string;
    isiCatatan: string;
    tingkatUrgensi: string;
    dibuatPada: string;
  }[];
}

/**
 * Server Action: Mengambil daftar pesanan untuk tabel admin dengan filter status & pencarian
 */
export async function ambilDaftarPesananAdminAction(filter?: {
  status?: string;
  cari?: string;
}): Promise<{
  sukses: boolean;
  pesanan: PesananAdminRow[];
  totalData: number;
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, pesanan: [], totalData: 0, pesan: cek.pesan };
    }

    const kondisi: any[] = [];

    if (filter?.status && filter.status !== "semua") {
      kondisi.push(eq(pesanan.statusPesanan, filter.status as any));
    }

    if (filter?.cari && filter.cari.trim()) {
      const q = `%${filter.cari.trim().toLowerCase()}%`;
      kondisi.push(
        or(
          sql`lower(${pesanan.nomorPesanan}) LIKE ${q}`,
          sql`lower(${pesanan.namaPelanggan}) LIKE ${q}`,
          sql`lower(${pesanan.emailPelanggan}) LIKE ${q}`
        )
      );
    }

    const whereClause = kondisi.length > 0 ? and(...kondisi) : undefined;

    const rows = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        namaPelanggan: pesanan.namaPelanggan,
        emailPelanggan: pesanan.emailPelanggan,
        teleponPelanggan: pesanan.teleponPelanggan,
        totalAkhir: pesanan.totalAkhir,
        statusPesanan: pesanan.statusPesanan,
        statusPembayaran: pembayaran.statusPembayaran,
        kurir: pengiriman.kurir,
        layanan: pengiriman.layanan,
        nomorResi: pengiriman.nomorResi,
        dibuatPada: pesanan.dibuatPada,
        jumlahItem: sql<number>`(SELECT COALESCE(sum(jumlah), 0) FROM item_pesanan WHERE item_pesanan.pesanan_id = ${pesanan.id})`,
      })
      .from(pesanan)
      .leftJoin(pembayaran, eq(pembayaran.pesananId, pesanan.id))
      .leftJoin(pengiriman, eq(pengiriman.pesananId, pesanan.id))
      .where(whereClause)
      .orderBy(desc(pesanan.dibuatPada))
      .limit(50);

    const hasil: PesananAdminRow[] = rows.map((r) => ({
      id: r.id,
      nomorPesanan: r.nomorPesanan,
      namaPelanggan: r.namaPelanggan,
      emailPelanggan: r.emailPelanggan,
      teleponPelanggan: r.teleponPelanggan,
      totalAkhir: r.totalAkhir,
      statusPesanan: r.statusPesanan,
      statusPembayaran: r.statusPembayaran,
      kurir: r.kurir,
      layanan: r.layanan,
      nomorResi: r.nomorResi,
      dibuatPada: new Date(r.dibuatPada).toISOString(),
      jumlahItem: Number(r.jumlahItem || 0),
    }));

    return { sukses: true, pesanan: hasil, totalData: hasil.length };
  } catch (error) {
    console.error("[ADMIN PESANAN] Gagal memuat daftar pesanan:", error);
    return {
      sukses: false,
      pesan: "Gagal memuat daftar pesanan.",
      pesanan: [],
      totalData: 0,
    };
  }
}

/**
 * Server Action: Mengambil detail lengkap satu pesanan untuk halaman inspeksi & tindakan admin
 */
export async function ambilDetailPesananAdminAction(
  nomorPesanan: string
): Promise<{
  sukses: boolean;
  data?: DetailPesananAdminData;
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, pesan: cek.pesan };
    }

    const [dataPesanan] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    if (!dataPesanan) {
      return { sukses: false, pesan: `Pesanan #${nomorPesanan} tidak ditemukan.` };
    }

    const [dataPembayaran] = await db
      .select()
      .from(pembayaran)
      .where(eq(pembayaran.pesananId, dataPesanan.id))
      .limit(1);

    const [dataPengiriman] = await db
      .select()
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, dataPesanan.id))
      .limit(1);

    const barisItem = await db
      .select()
      .from(itemPesanan)
      .where(eq(itemPesanan.pesananId, dataPesanan.id));

    const catatan = await db
      .select()
      .from(catatanOperasionalPesanan)
      .where(eq(catatanOperasionalPesanan.pesananId, dataPesanan.id))
      .orderBy(desc(catatanOperasionalPesanan.dibuatPada));

    return {
      sukses: true,
      data: {
        pesanan: {
          id: dataPesanan.id,
          nomorPesanan: dataPesanan.nomorPesanan,
          namaPelanggan: dataPesanan.namaPelanggan,
          emailPelanggan: dataPesanan.emailPelanggan,
          teleponPelanggan: dataPesanan.teleponPelanggan,
          statusPesanan: dataPesanan.statusPesanan,
          subtotal: dataPesanan.subtotal,
          totalOngkir: dataPesanan.totalOngkir,
          totalDiskon: dataPesanan.totalDiskon,
          totalAkhir: dataPesanan.totalAkhir,
          catatan: dataPesanan.catatan,
          dibuatPada: new Date(dataPesanan.dibuatPada).toISOString(),
        },
        pembayaran: dataPembayaran
          ? {
              gateway: dataPembayaran.gateway,
              statusPembayaran: dataPembayaran.statusPembayaran,
              metodePembayaran: dataPembayaran.metodePembayaran,
              jumlahBayar: dataPembayaran.jumlahBayar,
              dibayarPada: dataPembayaran.dibayarPada
                ? new Date(dataPembayaran.dibayarPada).toISOString()
                : null,
              snapToken: dataPembayaran.snapToken,
            }
          : null,
        pengiriman: dataPengiriman
          ? {
              kurir: dataPengiriman.kurir,
              layanan: dataPengiriman.layanan,
              nomorResi: dataPengiriman.nomorResi,
              namaPenerima: dataPengiriman.namaPenerima,
              teleponPenerima: dataPengiriman.teleponPenerima,
              alamatTujuan: dataPengiriman.alamatLengkap,
              kotaTujuan: dataPengiriman.kota,
              provinsiTujuan: dataPengiriman.provinsi,
              kodePosTujuan: dataPengiriman.kodePos,
              biayaOngkir: dataPengiriman.biayaOngkir,
            }
          : null,
        daftarItem: barisItem.map((item) => ({
          id: item.id,
          namaProduk: item.namaProduk,
          namaVarian: item.namaVarian,
          sku: item.sku,
          jumlah: item.jumlah,
          hargaSatuan: item.hargaSatuan,
          subtotalItem: item.subtotalItem,
        })),
        catatanOperasional: catatan.map((c) => ({
          id: c.id,
          adminNama: "Staf Operasional",
          isiCatatan: c.isiCatatan,
          tingkatUrgensi: c.tingkatUrgensi,
          dibuatPada: new Date(c.dibuatPada).toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("[ADMIN PESANAN] Gagal memuat detail pesanan:", error);
    return { sukses: false, pesan: "Gagal memuat detail pesanan." };
  }
}
