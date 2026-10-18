"use server";

import { z } from "zod";
import { db, pesanKontak } from "@/lib/db";
import { headers } from "next/headers";

const skemaPesanKontak = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter").max(150, "Nama maksimal 150 karakter"),
  email: z.string().trim().email("Format alamat email tidak valid").max(255),
  subjek: z.string().trim().max(255).optional(),
  pesan: z.string().trim().min(10, "Pesan minimal 10 karakter").max(2000, "Pesan maksimal 2000 karakter"),
});

export type InputPesanKontak = z.infer<typeof skemaPesanKontak>;

export interface HasilKirimPesanKontak {
  sukses: boolean;
  pesan: string;
  pesanId?: string;
}

/**
 * Server Action: Kirim Pesan Kontak Studio
 * Menyimpan pesan komunikasi pelanggan secara nyata ke database PostgreSQL (Anti-Slop R-26 & C-2)
 */
export async function kirimPesanKontakAction(
  input: InputPesanKontak
): Promise<HasilKirimPesanKontak> {
  const validasi = skemaPesanKontak.safeParse(input);

  if (!validasi.success) {
    const pesanGalat = validasi.error.errors[0]?.message || "Data formulir tidak valid.";
    return {
      sukses: false,
      pesan: pesanGalat,
    };
  }

  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipPengirim = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const { nama, email, subjek, pesan } = validasi.data;

    const [pesanTersimpan] = await db
      .insert(pesanKontak)
      .values({
        nama,
        email,
        subjek: subjek || "Pertanyaan Umum Studio",
        pesan,
        status: "baru",
        ipPengirim,
      })
      .returning({ id: pesanKontak.id });

    return {
      sukses: true,
      pesan: "Pesan Anda telah diterima oleh tim studio VOID Supply. Kami akan membalas melalui email dalam 1x24 jam kerja.",
      pesanId: pesanTersimpan?.id,
    };
  } catch (error) {
    console.error("Gagal menyimpan pesan kontak:", error);
    return {
      sukses: false,
      pesan: "Terjadi kendala pada server saat menyimpan pesan Anda. Silakan hubungi kami langsung via email studio@voidsupply.com.",
    };
  }
}
