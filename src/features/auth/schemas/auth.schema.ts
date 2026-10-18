import { z } from "zod";

export const skemaEmail = z
  .string()
  .trim()
  .email("Format alamat email tidak valid.")
  .max(254, "Alamat email terlalu panjang.");

export const skemaKataSandi = z
  .string()
  .min(12, "Kata sandi wajib minimal 12 karakter untuk keamanan akun.")
  .max(128, "Kata sandi maksimal 128 karakter.");

export const skemaDaftarAkun = z
  .object({
    namaLengkap: z.string().trim().min(2, "Nama minimal 2 karakter.").max(150),
    email: skemaEmail,
    kataSandi: skemaKataSandi,
    setujuKetentuan: z.literal(true, {
      errorMap: () => ({ message: "Anda wajib menyetujui syarat & ketentuan layanan." }),
    }),
    setujuMarketing: z.boolean().default(false),
  })
  .strict();

export const skemaMasukAkun = z
  .object({
    email: skemaEmail,
    kataSandi: z.string().min(1, "Kata sandi wajib diisi."),
    ingatSaya: z.boolean().default(false),
    next: z.string().max(256).optional(),
  })
  .strict();

export const skemaLupaPassword = z
  .object({
    email: skemaEmail,
  })
  .strict();

export const skemaResetPassword = z
  .object({
    token: z.string().min(1, "Token verifikasi tidak valid."),
    kataSandiBaru: skemaKataSandi,
  })
  .strict();

export type DtoDaftarAkun = z.infer<typeof skemaDaftarAkun>;
export type DtoMasukAkun = z.infer<typeof skemaMasukAkun>;
export type DtoLupaPassword = z.infer<typeof skemaLupaPassword>;
export type DtoResetPassword = z.infer<typeof skemaResetPassword>;
