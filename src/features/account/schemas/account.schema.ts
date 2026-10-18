import { z } from "zod";

export const skemaAlamatPelanggan = z.object({
  id: z.string().uuid().optional(),
  label: z
    .string()
    .trim()
    .min(1, "Label alamat wajib diisi (contoh: Rumah, Studio, Kantor)")
    .max(40, "Label alamat maksimal 40 karakter"),
  namaPenerima: z
    .string()
    .trim()
    .min(2, "Nama penerima minimal 2 karakter")
    .max(150, "Nama penerima maksimal 150 karakter"),
  teleponPenerima: z
    .string()
    .trim()
    .min(9, "Nomor telepon minimal 9 digit")
    .max(30, "Nomor telepon maksimal 30 karakter")
    .regex(/^[0-9+\s\-()]+$/, "Format nomor telepon tidak valid"),
  alamatLengkap: z
    .string()
    .trim()
    .min(10, "Alamat lengkap minimal 10 karakter")
    .max(500, "Alamat lengkap maksimal 500 karakter"),
  provinsi: z
    .string()
    .trim()
    .min(2, "Provinsi wajib diisi")
    .max(100),
  kota: z
    .string()
    .trim()
    .min(2, "Kota / Kabupaten wajib diisi")
    .max(100),
  kecamatan: z
    .string()
    .trim()
    .max(100)
    .optional(),
  kodePos: z
    .string()
    .trim()
    .length(5, "Kode pos harus tepat 5 digit angka")
    .regex(/^[0-9]+$/, "Kode pos hanya boleh berisi angka"),
  apakahUtama: z.boolean().default(false),
  catatanKurir: z
    .string()
    .trim()
    .max(250, "Catatan kurir maksimal 250 karakter")
    .optional(),
});

export type InputAlamatPelanggan = z.infer<typeof skemaAlamatPelanggan>;

export const skemaUbahKataSandi = z.object({
  kataSandiLama: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  kataSandiBaru: z
    .string()
    .min(12, "Kata sandi baru minimal 12 karakter untuk standar keamanan tinggi")
    .max(128, "Kata sandi maksimal 128 karakter"),
  konfirmasiKataSandiBaru: z.string().min(1, "Konfirmasi kata sandi baru wajib diisi"),
}).refine((data) => data.kataSandiBaru === data.konfirmasiKataSandiBaru, {
  message: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru",
  path: ["konfirmasiKataSandiBaru"],
});

export type InputUbahKataSandi = z.infer<typeof skemaUbahKataSandi>;

export const skemaProfilAkun = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(150, "Nama lengkap maksimal 150 karakter"),
  nomorTelepon: z
    .string()
    .trim()
    .max(30)
    .optional(),
});

export type InputProfilAkun = z.infer<typeof skemaProfilAkun>;

export const skemaKlaimPesanan = z.object({
  nomorPesanan: z
    .string()
    .trim()
    .min(10, "Format nomor pesanan tidak valid (contoh: VOID-20261018-XXXXXXXX)")
    .max(50),
  tokenAkses: z
    .string()
    .trim()
    .uuid("Format token akses faktur harus berupa UUID v4 yang sah"),
});

export type InputKlaimPesanan = z.infer<typeof skemaKlaimPesanan>;
