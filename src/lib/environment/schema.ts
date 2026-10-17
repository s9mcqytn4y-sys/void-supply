import { z } from "zod";

/**
 * Skema Validasi Environment Terpusat VOID Supply
 * Menjamin pemetaan deterministik kredensial pihak ketiga (Midtrans, Biteship, Resend, Sentry)
 * berdasarkan APP_ENV eksplisit, mencegah kebocoran atau kesalahan penggunaan key di production.
 */
export const skemaKonfigurasiEnvironment = z.object({
  demoMode: z.boolean().default(true),
  appEnv: z.enum(["development", "staging", "production"]).default("development"),
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  siteUrl: z.string().default("http://localhost:3000"),
  databaseUrl: z.string().min(1, "DATABASE_URL wajib terdefinisi."),
  midtrans: z.object({
    isProduction: z.boolean(),
    serverKey: z.string().min(1, "Server Key Midtrans wajib diisi."),
    clientKey: z.string().min(1, "Client Key Midtrans wajib diisi."),
    allowPaymentMock: z.boolean().default(false),
  }),
  biteship: z.object({
    isProduction: z.boolean(),
    apiKey: z.string().min(1, "API Key Biteship wajib diisi."),
    originPostalCode: z.string().default("10560"),
    webhookHeaderKey: z.string().default("x-void-biteship-secret"),
    webhookSecret: z.string().optional(),
  }),
  resend: z.object({
    apiKey: z.string().optional(),
    fromEmail: z.string().default("VOID Supply <orders@voidsupply.com>"),
  }),
  cron: z.object({
    secret: z.string().optional(),
  }),
  sentry: z.object({
    dsn: z.string().optional(),
  }),
});

export type KonfigurasiEnvironment = z.infer<typeof skemaKonfigurasiEnvironment>;
