import { ambilSesiPengguna, type SesiPenggunaAktif } from "@/lib/auth/session";

export interface StafAdminAktif {
  id: string;
  nama: string;
  email: string;
  peran: "admin" | "operator";
}

/**
 * Server-authoritative Guard: Memverifikasi apakah sesi pengguna memiliki peran staf (admin atau operator).
 * Menolak keras akses jika peran adalah 'pelanggan' atau anonim.
 */
export async function verifikasiStafAdmin(): Promise<{
  sah: boolean;
  sesi: SesiPenggunaAktif | null;
  staf?: StafAdminAktif;
  pesan?: string;
}> {
  const sesi = await ambilSesiPengguna();

  if (!sesi?.pengguna?.id) {
    return {
      sah: false,
      sesi: null,
      pesan: "Sesi tidak ditemukan. Silakan masuk sebagai staf terlebih dahulu.",
    };
  }

  const peran = sesi.pengguna.peran?.toLowerCase();

  if (peran !== "admin" && peran !== "operator") {
    return {
      sah: false,
      sesi,
      pesan: "Akses Ditolak: Akun Anda tidak memiliki otorisasi operasional internal.",
    };
  }

  return {
    sah: true,
    sesi,
    staf: {
      id: sesi.pengguna.id,
      nama: sesi.pengguna.nama,
      email: sesi.pengguna.email,
      peran: peran as "admin" | "operator",
    },
  };
}

export interface AdminSajaAktif {
  id: string;
  nama: string;
  email: string;
  peran: "admin";
}

/**
 * Server-authoritative Guard: Memverifikasi apakah sesi pengguna memiliki peran 'admin'.
 * Menolak keras peran 'operator', 'pelanggan', atau anonim untuk tindakan administratif destruktif.
 */
export async function verifikasiHakAksesAdmin(): Promise<{
  sah: boolean;
  sesi: SesiPenggunaAktif | null;
  admin?: AdminSajaAktif;
  pesan?: string;
}> {
  const sesi = await ambilSesiPengguna();

  if (!sesi?.pengguna?.id) {
    return {
      sah: false,
      sesi: null,
      pesan: "Sesi tidak ditemukan. Silakan masuk sebagai administrator terlebih dahulu.",
    };
  }

  const peran = sesi.pengguna.peran?.toLowerCase();

  if (peran !== "admin") {
    return {
      sah: false,
      sesi,
      pesan: "Akses Ditolak: Tindakan ini memerlukan hak akses Administrator.",
    };
  }

  return {
    sah: true,
    sesi,
    admin: {
      id: sesi.pengguna.id,
      nama: sesi.pengguna.nama,
      email: sesi.pengguna.email,
      peran: "admin",
    },
  };
}

