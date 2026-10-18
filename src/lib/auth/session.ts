import { headers } from "next/headers";
import { auth } from "./auth";

export interface SesiPenggunaAktif {
  pengguna: {
    id: string;
    nama: string;
    email: string;
    emailDiverifikasi: boolean;
    gambar?: string | null;
    peran: string;
  };
  sesi: {
    id: string;
    token: string;
    kedaluwarsaPada: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Mengambil sesi terotentikasi server-authoritative menggunakan header permintaan aktif.
 */
export async function ambilSesiPengguna(): Promise<SesiPenggunaAktif | null> {
  try {
    const headerList = await headers();
    const dataSesi = await auth.api.getSession({
      headers: headerList,
    });

    if (!dataSesi?.user || !dataSesi?.session) {
      return null;
    }

    return {
      pengguna: {
        id: dataSesi.user.id,
        nama: dataSesi.user.name,
        email: dataSesi.user.email,
        emailDiverifikasi: Boolean(dataSesi.user.emailVerified),
        gambar: dataSesi.user.image,
        peran: (dataSesi.user as Record<string, unknown>).peran as string || "pelanggan",
      },
      sesi: {
        id: dataSesi.session.id,
        token: dataSesi.session.token,
        kedaluwarsaPada: new Date(dataSesi.session.expiresAt),
        ipAddress: dataSesi.session.ipAddress,
        userAgent: dataSesi.session.userAgent,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Gagal memverifikasi sesi server:", error);
    }
    return null;
  }
}
