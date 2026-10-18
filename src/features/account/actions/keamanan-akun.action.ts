"use server";

import { desc, eq, and, ne, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  sesiPengguna,
  aktivitasAkun,
  pengguna,
  alamatPelanggan,
  preferensiPengguna,
  wishlist,
  keranjangAkun,
  klaimPesanan,
  akunAutentikasi,
} from "@/lib/db/auth.schema";
import { pelanggan, pesanan } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { ambilSesiPengguna } from "@/lib/auth/session";
import { skemaUbahKataSandi, type InputUbahKataSandi } from "../schemas/account.schema";
import { tambahTugasOutboxLangsung } from "@/lib/services/outbox.service";

export interface SesiAktifItem {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  dibuatPada: string;
  kedaluwarsaPada: string;
  apakahSesiIni: boolean;
}

export interface LogKeamananItem {
  id: string;
  jenis: string;
  waktu: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadataAman: Record<string, unknown> | null;
}

/**
 * Server Action: Mengubah kata sandi akun pelanggan
 */
export async function ubahKataSandiAction(
  input: InputUbahKataSandi
): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const validasi = skemaUbahKataSandi.safeParse(input);
    if (!validasi.success) {
      return {
        sukses: false,
        pesan: validasi.error.errors[0]?.message || "Data kata sandi tidak valid.",
      };
    }

    const { kataSandiLama, kataSandiBaru } = validasi.data;
    const reqHeaders = await headers();

    // Panggil API Better Auth
    await auth.api.changePassword({
      body: {
        currentPassword: kataSandiLama,
        newPassword: kataSandiBaru,
        revokeOtherSessions: false,
      },
      headers: reqHeaders,
    });

    // Catat log aktivitas keamanan
    const userAgent = reqHeaders.get("user-agent") || undefined;
    const forwardedFor = reqHeaders.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : undefined;

    await db.insert(aktivitasAkun).values({
      penggunaId: sesi.pengguna.id,
      jenis: "ubah_kata_sandi",
      ipAddress,
      userAgent,
      metadataAman: { keterangan: "Kata sandi akun berhasil diperbarui." },
    });

    // Kirim email notifikasi keamanan ke pengguna
    if (sesi.pengguna.email) {
      await tambahTugasOutboxLangsung({
        tipePekerjaan: "kirim_email",
        payload: {
          emailTujuan: sesi.pengguna.email,
          namaPelanggan: sesi.pengguna.nama || "Pelanggan",
          tipe: "notifikasi_keamanan",
          subjek: "Pemberitahuan: Pembaruan Kata Sandi Akun // VOID Supply",
          data: {
            aktivitas: "Pembaruan Kata Sandi Akun",
            rincian:
              "Kata sandi akun Anda baru saja berhasil diperbarui. Jika Anda tidak melakukan tindakan ini, segera hubungi dukungan operasional kami.",
          },
        },
      });
    }

    return {
      sukses: true,
      pesan: "Kata sandi berhasil diperbarui.",
    };
  } catch (error) {
    console.error("[KEAMANAN AKUN] Gagal memperbarui kata sandi:", error);
    const msg =
      error instanceof Error ? error.message : "Kata sandi saat ini tidak sesuai.";
    return {
      sukses: false,
      pesan: msg.includes("Invalid password") || msg.includes("password")
        ? "Kata sandi saat ini tidak cocok. Silakan periksa kembali."
        : "Gagal memperbarui kata sandi karena kendala otentikasi.",
    };
  }
}

/**
 * Server Action: Mengambil daftar sesi perangkat aktif
 */
export async function ambilDaftarSesiAction(): Promise<{
  sukses: boolean;
  sesi: SesiAktifItem[];
  pesan?: string;
}> {
  try {
    const sesiAktif = await ambilSesiPengguna();
    if (!sesiAktif?.pengguna?.id) {
      return {
        sukses: false,
        sesi: [],
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const rows = await db
      .select()
      .from(sesiPengguna)
      .where(eq(sesiPengguna.userId, sesiAktif.pengguna.id))
      .orderBy(desc(sesiPengguna.createdAt));

    const hasil: SesiAktifItem[] = rows.map((r) => ({
      id: r.id,
      ipAddress: r.ipAddress,
      userAgent: r.userAgent,
      dibuatPada: new Date(r.createdAt).toISOString(),
      kedaluwarsaPada: new Date(r.expiresAt).toISOString(),
      apakahSesiIni: r.token === sesiAktif.sesi.token,
    }));

    return { sukses: true, sesi: hasil };
  } catch (error) {
    console.error("[KEAMANAN AKUN] Gagal memuat daftar sesi:", error);
    return {
      sukses: false,
      sesi: [],
      pesan: "Gagal memuat sesi aktif.",
    };
  }
}

/**
 * Server Action: Mencabut sesi tertentu
 */
export async function cabutSesiAction(
  sessionId: string
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
      .delete(sesiPengguna)
      .where(
        and(
          eq(sesiPengguna.id, sessionId),
          eq(sesiPengguna.userId, sesi.pengguna.id)
        )
      );

    return {
      sukses: true,
      pesan: "Sesi perangkat berhasil dicabut.",
    };
  } catch (error) {
    console.error("[KEAMANAN AKUN] Gagal mencabut sesi:", error);
    return {
      sukses: false,
      pesan: "Gagal mencabut sesi perangkat.",
    };
  }
}

/**
 * Server Action: Mencabut seluruh sesi perangkat lain
 */
export async function cabutSemuaSesiLainAction(): Promise<{
  sukses: boolean;
  pesan: string;
}> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    await db
      .delete(sesiPengguna)
      .where(
        and(
          eq(sesiPengguna.userId, sesi.pengguna.id),
          ne(sesiPengguna.token, sesi.sesi.token)
        )
      );

    return {
      sukses: true,
      pesan: "Seluruh sesi perangkat lain telah berhasil dikeluarkan.",
    };
  } catch (error) {
    console.error("[KEAMANAN AKUN] Gagal mencabut semua sesi lain:", error);
    return {
      sukses: false,
      pesan: "Gagal mencabut sesi perangkat lain.",
    };
  }
}

/**
 * Server Action: Mengambil riwayat log aktivitas keamanan
 */
export async function ambilLogKeamananAction(): Promise<{
  sukses: boolean;
  log: LogKeamananItem[];
}> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return { sukses: true, log: [] };
    }

    const rows = await db
      .select()
      .from(aktivitasAkun)
      .where(eq(aktivitasAkun.penggunaId, sesi.pengguna.id))
      .orderBy(desc(aktivitasAkun.waktu))
      .limit(20);

    const hasil: LogKeamananItem[] = rows.map((r) => ({
      id: r.id,
      jenis: r.jenis,
      waktu: new Date(r.waktu).toISOString(),
      ipAddress: r.ipAddress,
      userAgent: r.userAgent,
      metadataAman: r.metadataAman as Record<string, unknown> | null,
    }));

    return { sukses: true, log: hasil };
  } catch (error) {
    console.error("[KEAMANAN AKUN] Gagal memuat log keamanan:", error);
    return { sukses: true, log: [] };
  }
}

/**
 * Server Action: Hapus Akun Pelanggan (GDPR & Regulasi Keuangan)
 * Mengosongkan kaitan pesanan historis (pengguna_id = null) demi integritas faktur perpajakan,
 * lalu menghapus kredensial, sesi, buku alamat, preferensi, dan akun pengguna.
 */
export async function hapusAkunAction(): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const userId = sesi.pengguna.id;

    // 0. Cegah penghapusan jika masih ada transaksi aktif yang sedang berjalan
    const pesananAktif = await db
      .select({ id: pesanan.id, statusPesanan: pesanan.statusPesanan })
      .from(pesanan)
      .innerJoin(pelanggan, eq(pesanan.pelangganId, pelanggan.id))
      .where(
        and(
          eq(pelanggan.penggunaId, userId),
          inArray(pesanan.statusPesanan, ["menunggu_pembayaran", "diproses", "dikirim"])
        )
      )
      .limit(1);

    if (pesananAktif.length > 0) {
      return {
        sukses: false,
        pesan:
          "Akun tidak dapat dihapus karena masih memiliki pesanan aktif yang sedang diproses atau dalam pengiriman. Selesaikan transaksi Anda terlebih dahulu.",
      };
    }

    await db.transaction(async (tx) => {
      // 1. Lepaskan kaitan pesanan historis non-destruktif
      const pelangganList = await tx
        .select({ id: pelanggan.id })
        .from(pelanggan)
        .where(eq(pelanggan.penggunaId, userId));

      for (const p of pelangganList) {
        await tx
          .update(pelanggan)
          .set({ penggunaId: null })
          .where(eq(pelanggan.id, p.id));
      }

      // 2. Hapus data relasi pelanggan
      await tx.delete(alamatPelanggan).where(eq(alamatPelanggan.penggunaId, userId));
      await tx.delete(preferensiPengguna).where(eq(preferensiPengguna.penggunaId, userId));
      await tx.delete(wishlist).where(eq(wishlist.penggunaId, userId));
      await tx.delete(keranjangAkun).where(eq(keranjangAkun.penggunaId, userId));
      await tx.delete(aktivitasAkun).where(eq(aktivitasAkun.penggunaId, userId));
      await tx.delete(klaimPesanan).where(eq(klaimPesanan.penggunaId, userId));

      // 3. Hapus sesi dan kredensial autentikasi
      await tx.delete(sesiPengguna).where(eq(sesiPengguna.userId, userId));
      await tx.delete(akunAutentikasi).where(eq(akunAutentikasi.userId, userId));

      // 4. Hapus entitas pengguna
      await tx.delete(pengguna).where(eq(pengguna.id, userId));
    });

    return {
      sukses: true,
      pesan: "Akun Anda telah berhasil dihapus secara permanen.",
    };
  } catch (error) {
    console.error("[KEAMANAN AKUN] Gagal menghapus akun pengguna:", error);
    return {
      sukses: false,
      pesan: "Gagal menghapus akun. Silakan coba beberapa saat lagi.",
    };
  }
}

