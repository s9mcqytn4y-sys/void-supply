"use server";

import { desc, eq, or, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pesanan, pelanggan, itemPesanan, pengiriman, pembayaran } from "@/lib/db/schema";
import { klaimPesanan, aktivitasAkun, pengguna } from "@/lib/db/auth.schema";
import { ambilSesiPengguna } from "@/lib/auth/session";
import { skemaKlaimPesanan, type InputKlaimPesanan } from "../schemas/account.schema";

export interface ItemPesananRingkas {
  id: string;
  namaProduk: string;
  namaVarian: string;
  ukuran: string;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
}

export interface PesananAkunItem {
  id: string;
  nomorPesanan: string;
  totalAkhir: number;
  statusPesanan: string;
  statusPembayaran: string | null;
  tokenAkses: string | null;
  dibuatPada: string;
  kurir: string | null;
  layanan: string | null;
  nomorResi: string | null;
  statusPengiriman: string | null;
  daftarItem: ItemPesananRingkas[];
}

/**
 * Server Action: Mengambil riwayat pesanan akun terotentikasi
 * Menerapkan auto-link pesanan lawas jika email pengguna cocok & terverifikasi
 */
export async function ambilDaftarPesananAkunAction(): Promise<{
  sukses: boolean;
  pesanan: PesananAkunItem[];
  pesan?: string;
}> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
        pesanan: [],
      };
    }

    const userId = sesi.pengguna.id;
    const userEmail = sesi.pengguna.email?.toLowerCase().trim();

    // Periksa status email verified pengguna
    const [dataPengguna] = await db
      .select({ emailVerified: pengguna.emailVerified })
      .from(pengguna)
      .where(eq(pengguna.id, userId))
      .limit(1);

    const isEmailVerified = Boolean(dataPengguna?.emailVerified);

    // Auto-link pesanan lawas yang belum memiliki pengguna_id jika email terverifikasi
    if (isEmailVerified && userEmail) {
      await db
        .update(pelanggan)
        .set({ penggunaId: userId })
        .where(
          and(
            eq(sql`lower(${pelanggan.email})`, userEmail),
            sql`${pelanggan.penggunaId} IS NULL`
          )
        );
    }

    // Ambil semua pesanan milik pelanggan terikat
    const kondisiPencarian = isEmailVerified && userEmail
      ? or(
          eq(pelanggan.penggunaId, userId),
          eq(sql`lower(${pelanggan.email})`, userEmail)
        )
      : eq(pelanggan.penggunaId, userId);

    const rows = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        totalAkhir: pesanan.totalAkhir,
        statusPesanan: pesanan.statusPesanan,
        statusPembayaran: pembayaran.statusPembayaran,
        tokenAkses: pesanan.tokenAkses,
        dibuatPada: pesanan.dibuatPada,
        kurir: pengiriman.kurir,
        layanan: pengiriman.layanan,
        nomorResi: pengiriman.nomorResi,
        statusPengiriman: pengiriman.statusPengiriman,
      })
      .from(pesanan)
      .innerJoin(pelanggan, eq(pesanan.pelangganId, pelanggan.id))
      .leftJoin(pengiriman, eq(pengiriman.pesananId, pesanan.id))
      .leftJoin(pembayaran, eq(pembayaran.pesananId, pesanan.id))
      .where(kondisiPencarian)
      .orderBy(desc(pesanan.dibuatPada));

    if (rows.length === 0) {
      return { sukses: true, pesanan: [] };
    }

    // Ambil item pesanan terkait
    const pesananIds = rows.map((r) => r.id);
    const allItems = await db
      .select({
        id: itemPesanan.id,
        pesananId: itemPesanan.pesananId,
        namaProduk: itemPesanan.namaProduk,
        namaVarian: itemPesanan.namaVarian,
        jumlah: itemPesanan.jumlah,
        hargaSatuan: itemPesanan.hargaSatuan,
        subtotalItem: itemPesanan.subtotalItem,
      })
      .from(itemPesanan)
      .where(sql`${itemPesanan.pesananId} IN ${pesananIds}`);

    const itemMap = new Map<string, ItemPesananRingkas[]>();
    for (const item of allItems) {
      const existing = itemMap.get(item.pesananId) || [];
      existing.push({
        id: item.id,
        namaProduk: item.namaProduk,
        namaVarian: item.namaVarian,
        ukuran: item.namaVarian,
        jumlah: item.jumlah,
        hargaSatuan: item.hargaSatuan,
        subtotal: item.subtotalItem,
      });
      itemMap.set(item.pesananId, existing);
    }

    const hasil: PesananAkunItem[] = rows.map((r) => ({
      id: r.id,
      nomorPesanan: r.nomorPesanan,
      totalAkhir: r.totalAkhir,
      statusPesanan: r.statusPesanan,
      statusPembayaran: r.statusPembayaran ?? "menunggu_pembayaran",
      tokenAkses: r.tokenAkses,
      dibuatPada: new Date(r.dibuatPada).toISOString(),
      kurir: r.kurir,
      layanan: r.layanan,
      nomorResi: r.nomorResi,
      statusPengiriman: r.statusPengiriman,
      daftarItem: itemMap.get(r.id) || [],
    }));

    return { sukses: true, pesanan: hasil };
  } catch (error) {
    console.error("[PESANAN AKUN] Gagal memuat riwayat pesanan:", error);
    return {
      sukses: false,
      pesanan: [],
      pesan: "Terjadi kendala saat memuat riwayat pesanan. Silakan coba kembali.",
    };
  }
}

/**
 * Server Action: Klaim pesanan lawas (guest checkout) secara manual
 * Memvalidasi nomor pesanan dan token akses faktur berentropi tinggi
 */
export async function klaimPesananLawasAction(
  input: InputKlaimPesanan
): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const userId = sesi.pengguna.id;
    const validasi = skemaKlaimPesanan.safeParse(input);
    if (!validasi.success) {
      return {
        sukses: false,
        pesan: validasi.error.errors[0]?.message || "Format data klaim tidak valid.",
      };
    }

    const { nomorPesanan, tokenAkses } = validasi.data;

    // Cari pesanan dengan nomor dan token akses yang persis
    const [dataPesanan] = await db
      .select({
        id: pesanan.id,
        pelangganId: pesanan.pelangganId,
        tokenAkses: pesanan.tokenAkses,
      })
      .from(pesanan)
      .where(
        and(
          eq(pesanan.nomorPesanan, nomorPesanan),
          eq(pesanan.tokenAkses, tokenAkses)
        )
      )
      .limit(1);

    if (!dataPesanan) {
      return {
        sukses: false,
        pesan:
          "Nomor pesanan atau token akses tidak cocok. Pastikan token yang Anda salin dari faktur sudah benar.",
      };
    }

    // Perbarui pelanggan untuk mengikat penggunaId jika pelangganId ada
    if (dataPesanan.pelangganId) {
      await db
        .update(pelanggan)
        .set({ penggunaId: userId })
        .where(eq(pelanggan.id, dataPesanan.pelangganId));
    }

    // Catat ke tabel klaim_pesanan
    await db.insert(klaimPesanan).values({
      penggunaId: userId,
      pesananId: dataPesanan.id,
      status: "berhasil",
      metodeVerifikasi: "token_akses_faktur",
    });

    // Catat log keamanan
    await db.insert(aktivitasAkun).values({
      penggunaId: userId,
      jenis: "klaim_pesanan",
      metadataAman: { nomorPesanan },
    });

    return {
      sukses: true,
      pesan: `Pesanan #${nomorPesanan} berhasil ditautkan ke akun Anda.`,
    };
  } catch (error) {
    console.error("[KLAIM PESANAN] Gagal menautkan pesanan:", error);
    return {
      sukses: false,
      pesan: "Gagal menautkan pesanan karena kendala server. Silakan coba kembali.",
    };
  }
}
