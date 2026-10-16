import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { pesanan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{
    nomorPesanan: string;
  }>;
}

/**
 * SEC-05: Token Order Access Exchange Route
 * Menerima token akses via query param, memverifikasi kecocokan nomor pesanan,
 * kemudian menetapkan temporary HttpOnly session cookie (Max-Age 15 menit)
 * dan mengalihkan pembeli ke URL bersih /pesanan/[nomorPesanan] tanpa eksposur token di browser history.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { nomorPesanan } = await context.params;
  const token = request.nextUrl.searchParams.get("token")?.trim();

  const targetUrl = new URL(`/pesanan/${nomorPesanan}`, request.nextUrl.origin);

  if (!token) {
    return NextResponse.redirect(targetUrl);
  }

  try {
    // Verifikasi keberadaan order dan token akses (mendukung hash SHA-256 & plain token)
    const [order] = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        tokenAkses: pesanan.tokenAkses,
        hashTokenAkses: pesanan.hashTokenAkses,
      })
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    const hashedInput = crypto.createHash("sha256").update(token).digest("hex");
    const isTokenValid =
      order &&
      ((Boolean(order.hashTokenAkses) && order.hashTokenAkses === hashedInput) ||
       (Boolean(order.tokenAkses) && order.tokenAkses === token));

    if (!isTokenValid) {
      // Token tidak valid atau order tidak ditemukan, redirect ke halaman publik tanpa cookie
      return NextResponse.redirect(targetUrl);
    }

    // Set HttpOnly cookie selama 15 menit (900 detik) dengan cakupan path /
    const response = NextResponse.redirect(targetUrl);
    response.cookies.set(`void_order_token_${nomorPesanan}`, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 900,
    });

    return response;
  } catch (error) {
    console.error("[SEC-05 ACCESS] Gagal menukarkan token akses pesanan:", error);
    return NextResponse.redirect(targetUrl);
  }
}
