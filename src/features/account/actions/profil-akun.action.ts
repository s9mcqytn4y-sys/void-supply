"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pengguna, preferensiPengguna } from "@/lib/db/auth.schema";
import { ambilSesiPengguna } from "@/lib/auth/session";
import { skemaProfilAkun, type InputProfilAkun } from "../schemas/account.schema";

export interface ProfilPenggunaData {
  id: string;
  nama: string;
  email: string;
  emailVerified: boolean;
  peran: string;
  gambar: string | null;
  dibuatPada: string;
  preferensi?: {
    ukuranFavorit: string | null;
    modeTampilan: string;
    emailMarketing: boolean;
  };
}

/**
 * Server Action: Mengambil data profil dan preferensi akun
 */
export async function ambilProfilAkunAction(): Promise<{
  sukses: boolean;
  profil?: ProfilPenggunaData;
  pesan?: string;
}> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const userId = sesi.pengguna.id;

    const [dataUser] = await db
      .select()
      .from(pengguna)
      .where(eq(pengguna.id, userId))
      .limit(1);

    if (!dataUser) {
      return {
        sukses: false,
        pesan: "Profil pengguna tidak ditemukan.",
      };
    }

    const [pref] = await db
      .select()
      .from(preferensiPengguna)
      .where(eq(preferensiPengguna.penggunaId, userId))
      .limit(1);

    const profil: ProfilPenggunaData = {
      id: dataUser.id,
      nama: dataUser.name,
      email: dataUser.email,
      emailVerified: dataUser.emailVerified,
      peran: dataUser.peran,
      gambar: dataUser.image,
      dibuatPada: new Date(dataUser.createdAt).toISOString(),
      preferensi: pref
        ? {
            ukuranFavorit: pref.ukuranFavorit,
            modeTampilan: pref.modeTampilan,
            emailMarketing: pref.emailMarketing,
          }
        : undefined,
    };

    return { sukses: true, profil };
  } catch (error) {
    console.error("[PROFIL AKUN] Gagal memuat profil:", error);
    return {
      sukses: false,
      pesan: "Gagal memuat profil pengguna. Silakan coba kembali.",
    };
  }
}

/**
 * Server Action: Memperbarui nama profil pengguna
 */
export async function perbaruiProfilAkunAction(
  input: InputProfilAkun
): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const validasi = skemaProfilAkun.safeParse(input);
    if (!validasi.success) {
      return {
        sukses: false,
        pesan: validasi.error.errors[0]?.message || "Data profil tidak valid.",
      };
    }

    await db
      .update(pengguna)
      .set({
        name: validasi.data.nama,
        updatedAt: new Date(),
      })
      .where(eq(pengguna.id, sesi.pengguna.id));

    return {
      sukses: true,
      pesan: "Profil nama akun berhasil diperbarui.",
    };
  } catch (error) {
    console.error("[PROFIL AKUN] Gagal memperbarui profil:", error);
    return {
      sukses: false,
      pesan: "Gagal memperbarui profil pengguna.",
    };
  }
}

/**
 * Server Action: Memperbarui preferensi akun pengguna
 */
export async function perbaruiPreferensiAction(preferensi: {
  ukuranFavorit?: string;
  emailMarketing?: boolean;
}): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return {
        sukses: false,
        pesan: "Sesi tidak sah. Silakan masuk terlebih dahulu.",
      };
    }

    const userId = sesi.pengguna.id;

    const [ada] = await db
      .select({ penggunaId: preferensiPengguna.penggunaId })
      .from(preferensiPengguna)
      .where(eq(preferensiPengguna.penggunaId, userId))
      .limit(1);

    if (ada) {
      await db
        .update(preferensiPengguna)
        .set({
          ukuranFavorit: preferensi.ukuranFavorit,
          emailMarketing: preferensi.emailMarketing,
          diperbaruiPada: new Date(),
        })
        .where(eq(preferensiPengguna.penggunaId, userId));
    } else {
      await db.insert(preferensiPengguna).values({
        penggunaId: userId,
        ukuranFavorit: preferensi.ukuranFavorit,
        emailMarketing: preferensi.emailMarketing ?? false,
      });
    }

    return {
      sukses: true,
      pesan: "Preferensi akun berhasil disimpan.",
    };
  } catch (error) {
    console.error("[PROFIL AKUN] Gagal menyimpan preferensi:", error);
    return {
      sukses: false,
      pesan: "Gagal menyimpan preferensi.",
    };
  }
}
