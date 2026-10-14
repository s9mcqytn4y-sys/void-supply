import { z } from "zod";

/**
 * ENV-01 & ENV-02: Strict Environment Schema & Startup Validator
 * Memastikan bahwa jika aplikasi berjalan di environment produksi,
 * kunci Midtrans produksi valid dan tidak tertukar dengan sandbox key.
 */
export const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
    NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
    NEXT_PUBLIC_SITE_URL: z.string().default("http://localhost:3000"),
    NEXT_PUBLIC_APP_NAME: z.string().default("VOID Supply"),
    MIDTRANS_IS_PRODUCTION: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    MIDTRANS_SERVER_KEY: z.string().optional(),
    MIDTRANS_SERVER_KEY_SANDBOX: z.string().optional(),
    MIDTRANS_SERVER_KEY_PRODUCTION: z.string().optional(),
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().optional(),
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX: z.string().optional(),
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION: z.string().optional(),
    ALLOW_PAYMENT_MOCK: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    BITESHIP_API_KEY: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  })
  .superRefine((data, ctx) => {
    const isProduction =
      data.MIDTRANS_IS_PRODUCTION ||
      (data.NODE_ENV === "production" && process.env.VERCEL_ENV === "production");

    if (isProduction) {
      const serverKey =
        data.MIDTRANS_SERVER_KEY_PRODUCTION || data.MIDTRANS_SERVER_KEY;
      if (!serverKey || serverKey.includes("xxxxxxxxxxxx") || serverKey.startsWith("SB-")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["MIDTRANS_SERVER_KEY_PRODUCTION"],
          message:
            "ENV-02: MIDTRANS_SERVER_KEY_PRODUCTION wajib diisi dengan production key asli (bukan sandbox SB-*) saat MIDTRANS_IS_PRODUCTION aktif.",
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

let parsedEnvCache: Env | null = null;

export function validasiEnvironment(): Env {
  if (parsedEnvCache) return parsedEnvCache;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("[STARTUP ENV VALIDATION FAILED]:", result.error.format());
    // Di lingkungan produksi, gagalkan startup secara fail-closed
    if (process.env.NODE_ENV === "production" && process.env.CI !== "true") {
      throw new Error(
        `Gagal memvalidasi variabel lingkungan: ${result.error.issues.map((i) => i.message).join(", ")}`
      );
    }
  }

  parsedEnvCache = (result.success ? result.data : process.env) as Env;
  return parsedEnvCache;
}
