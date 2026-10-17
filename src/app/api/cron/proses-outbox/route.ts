import { NextResponse } from "next/server";
import { prosesAntreanOutbox } from "@/lib/services/outbox.service";

/**
 * Route Handler: Cron Worker Transactional Outbox (Module 02.15 Release Hardening)
 * Menjalankan antrean outbox pekerjaan (email & order Biteship) yang tertunda/gagal.
 * Diproteksi token CRON_SECRET untuk mencegah eksekusi tanpa izin.
 */
async function handleCronOutbox(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim().length === 0) {
      console.error("[CRON OUTBOX] CRON_SECRET belum dikonfigurasi pada environment server.");
      return NextResponse.json(
        { error: "Konfigurasi keamanan gagal: CRON_SECRET belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const isManual = url.searchParams.get("manual") === "true";
    const querySecret = url.searchParams.get("secret");

    const authHeader = req.headers.get("authorization");
    const headerToken = authHeader?.replace(/^Bearer\s+/i, "")?.trim();
    const token = headerToken || (isManual ? querySecret : null);

    if (!token || token !== cronSecret) {
      return NextResponse.json(
        { error: "Akses tidak diizinkan: Kredensial cron secret tidak valid." },
        { status: 401 }
      );
    }

    const limitParam = url.searchParams.get("limit");
    const batchLimit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 50) : 15;

    const hasil = await prosesAntreanOutbox(batchLimit);

    return NextResponse.json({
      status: "ok",
      totalDiproses: hasil.totalDiproses,
      totalBerhasil: hasil.totalBerhasil,
      totalGagal: hasil.totalGagal,
      rincian: hasil.rincian,
      dieksekusiPada: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON OUTBOX] Galat saat menjalankan worker antrean outbox:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleCronOutbox(req);
}

export async function POST(req: Request) {
  return handleCronOutbox(req);
}
