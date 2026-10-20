import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/auth.schema";
import { tambahTugasOutboxLangsung } from "@/lib/services/outbox.service";

function ambilSecretAutentikasi(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  const isPublicDeployment =
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "staging" ||
    Boolean(process.env.VERCEL);

  if (!secret || secret.trim().length === 0) {
    if (isPublicDeployment && process.env.CI !== "true") {
      throw new Error(
        "FATAL: BETTER_AUTH_SECRET wajib dikonfigurasi pada lingkungan staging dan produksi."
      );
    }
    return "void-supply-dev-secret-only-local-testing-entropy-64bytes-key-2026";
  }

  if (isPublicDeployment && process.env.CI !== "true" && secret.trim().length < 32) {
    throw new Error(
      "FATAL: BETTER_AUTH_SECRET wajib memiliki panjang entropi minimal 32 karakter."
    );
  }

  return secret;
}

export const auth = betterAuth({
  secret: ambilSecretAutentikasi(),
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    "https://void-supply-lemon.vercel.app",
  trustedOrigins: [
    "https://void-supply-lemon.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.pengguna,
      session: authSchema.sesiPengguna,
      account: authSchema.akunAutentikasi,
      verification: authSchema.verifikasiAutentikasi,
      rateLimit: authSchema.batasPermintaanAuth,
    },
  }),
  user: {
    additionalFields: {
      peran: {
        type: "string",
        defaultValue: "pelanggan",
        returned: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, token }) => {
      const appUrl =
        process.env.BETTER_AUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
      const resetUrl = `${appUrl}/atur-ulang-password?token=${token}`;

      await tambahTugasOutboxLangsung({
        tipePekerjaan: "kirim_email",
        payload: {
          emailTujuan: user.email,
          namaPelanggan: user.name || "Pelanggan",
          tipe: "atur_ulang_password",
          subjek: "Permintaan Atur Ulang Kata Sandi // VOID Supply",
          tautan: resetUrl,
        },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const appUrl =
        process.env.BETTER_AUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
      const verificationUrl = `${appUrl}/verifikasi-email?token=${token}`;

      await tambahTugasOutboxLangsung({
        tipePekerjaan: "kirim_email",
        payload: {
          emailTujuan: user.email,
          namaPelanggan: user.name || "Pelanggan",
          tipe: "verifikasi_email",
          subjek: "Verifikasi Alamat Email // VOID Supply",
          tautan: verificationUrl,
        },
      });
    },
  },
  rateLimit: {
    storage: "database",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // 24 jam
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 menit
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Auth = typeof auth;
