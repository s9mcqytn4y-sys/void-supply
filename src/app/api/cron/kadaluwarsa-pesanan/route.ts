import { NextResponse } from "next/server";
import { batalkanPesananKedaluwarsa } from "@/features/checkout/services/reservasi.service";

/**
 * Route Handler: Cron Expiry Reservasi Stok 15 Menit (Module 02.15)
 * Kompatibel dengan Vercel Cron, GitHub Actions scheduled workflow, atau scheduler eksternal.
 * Dilindungi token CRON_SECRET untuk mencegah eksekusi tanpa izin.
 */
async function handleCron(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim().length === 0) {
      console.error("[CRON KADALUWARSA] CRON_SECRET belum dikonfigurasi pada environment server.");
      return NextResponse.json(
        { error: "Konfigurasi keamanan gagal: CRON_SECRET belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();
    if (!token || token !== cronSecret) {
      return NextResponse.json(
        { error: "Akses tidak diizinkan: Kredensial cron secret tidak valid." },
        { status: 401 }
      );
    }

    const hasil = await batalkanPesananKedaluwarsa();

    if (!hasil.sukses) {
      console.error("[CRON KADALUWARSA] Operasi pembatalan gagal:", hasil.pesan);
      return NextResponse.json(
        {
          error: "Operasi pembatalan pesanan kedaluwarsa gagal.",
          pesan: hasil.pesan,
          dieksekusiPada: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      jumlahDibatalkan: hasil.jumlahDibatalkan,
      pesan: hasil.pesan,
      dieksekusiPada: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON KADALUWARSA] Galat saat menjalankan job pembersihan:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}
