"use server";

import { db, pelanggan } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ambilSesiPengguna } from "@/lib/auth/session";

export interface DataAlamatTersimpan {
  namaLengkap: string;
  email: string;
  telepon: string;
  alamatLengkap: string;
  kota: string;
  provinsi: string;
  kodePos: string;
}

export interface HasilAmbilAlamat {
  sukses: boolean;
  adaAlamat: boolean;
  alamat?: DataAlamatTersimpan;
}

/**
 * Server Action: Mengambil data alamat profil default pelanggan terotentikasi.
 * Menggunakan session server-authoritative tanpa IDOR.
 */
export async function ambilAlamatTersimpanAction(): Promise<HasilAmbilAlamat> {
  try {
    const sesi = await ambilSesiPengguna();
    if (!sesi?.pengguna?.id) {
      return { sukses: false, adaAlamat: false };
    }

    // Cari profil pelanggan berdasarkan penggunaId atau email akun
    const [profil] = await db
      .select({
        namaLengkap: pelanggan.namaLengkap,
        email: pelanggan.email,
        telepon: pelanggan.telepon,
        alamatDefault: pelanggan.alamatDefault,
        kotaDefault: pelanggan.kotaDefault,
        provinsiDefault: pelanggan.provinsiDefault,
        kodePosDefault: pelanggan.kodePosDefault,
      })
      .from(pelanggan)
      .where(eq(pelanggan.penggunaId, sesi.pengguna.id))
      .limit(1);

    if (!profil) {
      // Fallback: periksa berdasarkan email jika belum ditautkan pengguna_id
      const [profilEmail] = await db
        .select({
          namaLengkap: pelanggan.namaLengkap,
          email: pelanggan.email,
          telepon: pelanggan.telepon,
          alamatDefault: pelanggan.alamatDefault,
          kotaDefault: pelanggan.kotaDefault,
          provinsiDefault: pelanggan.provinsiDefault,
          kodePosDefault: pelanggan.kodePosDefault,
        })
        .from(pelanggan)
        .where(eq(pelanggan.email, sesi.pengguna.email))
        .limit(1);

      if (!profilEmail || !profilEmail.alamatDefault) {
        return {
          sukses: true,
          adaAlamat: false,
          alamat: {
            namaLengkap: sesi.pengguna.nama || "",
            email: sesi.pengguna.email,
            telepon: "",
            alamatLengkap: "",
            kota: "",
            provinsi: "",
            kodePos: "",
          },
        };
      }

      return {
        sukses: true,
        adaAlamat: true,
        alamat: {
          namaLengkap: profilEmail.namaLengkap || sesi.pengguna.nama,
          email: profilEmail.email,
          telepon: profilEmail.telepon || "",
          alamatLengkap: profilEmail.alamatDefault || "",
          kota: profilEmail.kotaDefault || "",
          provinsi: profilEmail.provinsiDefault || "",
          kodePos: profilEmail.kodePosDefault || "",
        },
      };
    }

    const adaAlamatLengkap = Boolean(
      profil.alamatDefault && profil.kotaDefault && profil.kodePosDefault
    );

    return {
      sukses: true,
      adaAlamat: adaAlamatLengkap,
      alamat: {
        namaLengkap: profil.namaLengkap || sesi.pengguna.nama,
        email: profil.email,
        telepon: profil.telepon || "",
        alamatLengkap: profil.alamatDefault || "",
        kota: profil.kotaDefault || "",
        provinsi: profil.provinsiDefault || "",
        kodePos: profil.kodePosDefault || "",
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Gagal mengambil alamat tersimpan pengguna:", error);
    }
    return { sukses: false, adaAlamat: false };
  }
}
