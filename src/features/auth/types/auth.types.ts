export type KodeKesalahanAuth =
  | "VALIDASI_GAGAL"
  | "BELUM_LOGIN"
  | "EMAIL_BELUM_VERIFIKASI"
  | "AKSES_DITOLAK"
  | "DATA_TIDAK_DITEMUKAN"
  | "KONFLIK_DATA"
  | "TERLALU_BANYAK_PERMINTAAN"
  | "LAYANAN_TIDAK_TERSEDIA";

export type HasilAksiAuth<T> =
  | {
      sukses: true;
      kode: "BERHASIL";
      data: T;
    }
  | {
      sukses: false;
      kode: KodeKesalahanAuth;
      pesan: string;
      kesalahanField?: Record<string, string[]>;
    };
