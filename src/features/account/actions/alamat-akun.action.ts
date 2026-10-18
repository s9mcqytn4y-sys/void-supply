"use server";

import { desc, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { alamatPelanggan } from "@/lib/db/auth.schema";
import { ambilSesiPengguna } from "@/lib/auth/session";
import { skemaAlamatPelanggan, type InputAlamatPelanggan } from "../schemas/account.schema";

export interface AlamatPelangganItem {
  id: string;
  label: string;
  namaPenerima: string;
  teleponPenerima: string;
  alamatLengkap: string;
  provinsi: string;
  kota: string;
  kecamatan: string | null;
  kodePos: string;
  apakahUtama: boolean;
  catatanKurir: string | null;
  dibuatPada: string;
}

/**
 * Server Action: Mengambil seluruh buku alamat milik pengguna terotentikasi
 */
export async function ambilBukuAlamatAction(): Promise<{
  sukses: boolean;
  alamat: AlamatPelangganItem[];
  pesan?: string;
}> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        alamat: [],
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const rows = await db
      .select()
      .from(alamatPelanggan)
      .where(eq(alamatPelanggan.penggunaId, sesi.pengguna.id))
      .orderBy(desc(alamatPelanggan.apakahUtama), desc(alamatPelanggan.dibuatPada));

    const hasil: AlamatPelangganItem[] = rows.map((r) => ({
      id: r.id,
      label: r.label,
      namaPenerima: r.namaPenerima,
      teleponPenerima: r.teleponPenerima,
      alamatLengkap: r.alamatLengkap,
      provinsi: r.provinsi,
      kota: r.kota,
      kecamatan: r.kecamatan,
      kodePos: r.kodePos,
      apakahUtama: r.apakahUtama,
      catatanKurir: r.catatanKurir,
      dibuatPada: r.dibuatPada.toISOString(),
    }));

    return { sukses: true, alamat: hasil };
  } catch (error) {
    console.error("[BUKU ALAMAT] Gagal memuat alamat:", error);
    return {
      sukses: false,
      alamat: [],
      pesan: "Gagal memuat buku alamat. Silakan coba kembali.",
    };
  }
}

/**
 * Server Action: Menyimpan atau memperbarui alamat pelanggan
 */
export async function simpanAlamatAction(
  input: InputAlamatPelanggan
): Promise<{ sukses: boolean; pesan: string; alamatId?: string }> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const validasi = skemaAlamatPelanggan.safeParse(input);
    if (!validasi.success) {
      return {
        sukses: false,
        pesan: validasi.error.errors[0]?.message || "Format data alamat tidak valid.",
      };
    }

    const data = validasi.data;
    const userId = sesi.pengguna.id;

    // Cek apakah ini alamat pertama, jika iya jadikan default otomatis
    const daftarEksis = await db
      .select({ id: alamatPelanggan.id })
      .from(alamatPelanggan)
      .where(eq(alamatPelanggan.penggunaId, userId))
      .limit(1);

    const jadikanUtama = data.apakahUtama || daftarEksis.length === 0;

    // Jika alamat ini dijadikan utama, ubah alamat lain menjadi bukan utama
    if (jadikanUtama) {
      await db
        .update(alamatPelanggan)
        .set({ apakahUtama: false })
        .where(eq(alamatPelanggan.penggunaId, userId));
    }

    if (data.id) {
      // Pembaruan alamat eksis
      await db
        .update(alamatPelanggan)
        .set({
          label: data.label,
          namaPenerima: data.namaPenerima,
          teleponPenerima: data.teleponPenerima,
          alamatLengkap: data.alamatLengkap,
          provinsi: data.provinsi,
          kota: data.kota,
          kecamatan: data.kecamatan || null,
          kodePos: data.kodePos,
          apakahUtama: jadikanUtama,
          catatanKurir: data.catatanKurir || null,
          diperbaruiPada: new Date(),
        })
        .where(
          and(
            eq(alamatPelanggan.id, data.id),
            eq(alamatPelanggan.penggunaId, userId)
          )
        );

      return {
        sukses: true,
        pesan: "Alamat pengiriman berhasil diperbarui.",
        alamatId: data.id,
      };
    } else {
      // Penambahan alamat baru
      const [inserted] = await db
        .insert(alamatPelanggan)
        .values({
          penggunaId: userId,
          label: data.label,
          namaPenerima: data.namaPenerima,
          teleponPenerima: data.teleponPenerima,
          alamatLengkap: data.alamatLengkap,
          provinsi: data.provinsi,
          kota: data.kota,
          kecamatan: data.kecamatan || null,
          kodePos: data.kodePos,
          apakahUtama: jadikanUtama,
          catatanKurir: data.catatanKurir || null,
        })
        .returning({ id: alamatPelanggan.id });

      return {
        sukses: true,
        pesan: "Alamat baru berhasil ditambahkan ke Buku Alamat.",
        alamatId: inserted?.id,
      };
    }
  } catch (error) {
    console.error("[BUKU ALAMAT] Gagal menyimpan alamat:", error);
    return {
      sukses: false,
      pesan: "Gagal menyimpan alamat karena kendala server.",
    };
  }
}

/**
 * Server Action: Menjadikan alamat tertentu sebagai alamat utama
 */
export async function aturAlamatUtamaAction(
  alamatId: string
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

    // Reset semua alamat milik user
    await db
      .update(alamatPelanggan)
      .set({ apakahUtama: false })
      .where(eq(alamatPelanggan.penggunaId, userId));

    // Jadikan alamat target sebagai utama
    await db
      .update(alamatPelanggan)
      .set({ apakahUtama: true, diperbaruiPada: new Date() })
      .where(
        and(
          eq(alamatPelanggan.id, alamatId),
          eq(alamatPelanggan.penggunaId, userId)
        )
      );

    return { sukses: true, pesan: "Alamat utama berhasil diperbarui." };
  } catch (error) {
    console.error("[BUKU ALAMAT] Gagal mengatur alamat utama:", error);
    return {
      sukses: false,
      pesan: "Gagal mengatur alamat utama. Silakan coba kembali.",
    };
  }
}

/**
 * Server Action: Menghapus alamat dari buku alamat
 */
export async function hapusAlamatAction(
  alamatId: string
): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    await db
      .delete(alamatPelanggan)
      .where(
        and(
          eq(alamatPelanggan.id, alamatId),
          eq(alamatPelanggan.penggunaId, sesi.pengguna.id)
        )
      );

    return { sukses: true, pesan: "Alamat berhasil dihapus dari Buku Alamat." };
  } catch (error) {
    console.error("[BUKU ALAMAT] Gagal menghapus alamat:", error);
    return {
      sukses: false,
      pesan: "Gagal menghapus alamat. Silakan coba kembali.",
    };
  }
}
