"use server";

import { z } from "zod";
import { db, pesanKontak, outboxPekerjaan } from "@/lib/db";
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

// In-Memory IP Rate Limiter (Maks 3 pengiriman per 10 menit per IP)
const ipRateLimiter = new Map<string, { hitCount: number; expiresAt: number }>();
const BATAS_PENGIRIMAN_MAKS = 3;
const WINDOW_MS = 10 * 60 * 1000; // 10 menit

function cekBatasPengiriman(ip: string): boolean {
  const sekarang = Date.now();
  const catatan = ipRateLimiter.get(ip);

  if (!catatan || sekarang > catatan.expiresAt) {
    ipRateLimiter.set(ip, { hitCount: 1, expiresAt: sekarang + WINDOW_MS });
    return true;
  }

  if (catatan.hitCount >= BATAS_PENGIRIMAN_MAKS) {
    return false;
  }

  catatan.hitCount += 1;
  return true;
}

/**
 * Server Action: Kirim Pesan Kontak Studio
 * Menyimpan pesan komunikasi pelanggan secara nyata ke database PostgreSQL (Anti-Slop R-26 & C-2)
 * Dilengkapi proteksi rate limit dan transactional outbox notification.
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

    if (!cekBatasPengiriman(ipPengirim)) {
      return {
        sukses: false,
        pesan: "Batas pengiriman formulir tercapai (maksimal 3 kali dalam 10 menit). Silakan tunggu sebentar atau hubungi kami langsung di support@voidsupply.com.",
      };
    }

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

    // Daftarkan notifikasi transactional outbox untuk pemrosesan asinkron
    await db.insert(outboxPekerjaan).values({
      tipePekerjaan: "kirim_email_kontak",
      payload: {
        pesanId: pesanTersimpan?.id,
        nama,
        email,
        subjek: subjek || "Pertanyaan Umum Studio",
        cuplikanPesan: pesan.slice(0, 150),
      },
      status: "antre",
    });

    return {
      sukses: true,
      pesan: "Pesan Anda telah diterima oleh tim studio VOID Supply. Kami akan membalas melalui email dalam 1x24 jam kerja.",
      pesanId: pesanTersimpan?.id,
    };
  } catch (error) {
    console.error("Gagal menyimpan pesan kontak:", error);
    return {
      sukses: false,
      pesan: "Terjadi kendala pada server saat menyimpan pesan Anda. Silakan hubungi kami langsung via email support@voidsupply.com.",
    };
  }
}
