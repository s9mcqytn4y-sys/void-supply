import { skemaKonfigurasiEnvironment, type KonfigurasiEnvironment } from "./schema";

let cacheKonfigurasi: KonfigurasiEnvironment | null = null;

/**
 * Resolver Environment Terpusat VOID Supply
 * Mengisolasi pemilihan credential agar setiap domain service (Midtrans, Biteship, Resend)
 * tidak membuat logika fallback lingkungan secara mandiri.
 */
export function selesaikanKonfigurasiEnvironment(): KonfigurasiEnvironment {
  if (cacheKonfigurasi) {
    return cacheKonfigurasi;
  }

  const rawAppEnv =
    process.env.APP_ENV ||
    (process.env.CI === "true" ? "test" : process.env.NODE_ENV || "development");
  const appEnv =
    rawAppEnv === "production" ? "production" : rawAppEnv === "staging" ? "staging" : "development";

  const rawNodeEnv = process.env.NODE_ENV || "development";
  const nodeEnv =
    rawNodeEnv === "production" ? "production" : rawNodeEnv === "test" ? "test" : "development";

  // 1. Resolusi Midtrans
  const isMidtransProd =
    process.env.CI !== "true" &&
    (process.env.MIDTRANS_IS_PRODUCTION === "true" ||
      process.env.MIDTRANS_ENV === "production" ||
      (appEnv === "production" && process.env.MIDTRANS_IS_PRODUCTION !== "false"));

  const midtransServerKey = isMidtransProd
    ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION || process.env.MIDTRANS_SERVER_KEY || ""
    : process.env.MIDTRANS_SERVER_KEY_SANDBOX ||
      process.env.MIDTRANS_SERVER_KEY ||
      "SB-Mid-server-demo-xxxxxxxxxxxx";

  const midtransClientKey = isMidtransProd
    ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION ||
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
      ""
    : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX ||
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
      "SB-Mid-client-demo-xxxxxxxxxxxx";

  const allowPaymentMock =
    process.env.ALLOW_PAYMENT_MOCK === "true" &&
    (process.env.CI === "true" || appEnv !== "production");

  // 2. Resolusi Biteship
  const isBiteshipProd =
    process.env.CI !== "true" &&
    (process.env.BITESHIP_ENV === "production" ||
      (appEnv === "production" && process.env.BITESHIP_ENV !== "sandbox"));

  const biteshipApiKey = isBiteshipProd
    ? process.env.BITESHIP_API_KEY_PRODUCTION || process.env.BITESHIP_API_KEY || ""
    : process.env.BITESHIP_API_KEY_SANDBOX ||
      process.env.BITESHIP_API_KEY ||
      "biteship_test.demo-placeholder";

  const biteshipOriginPostal = process.env.BITESHIP_ORIGIN_POSTAL_CODE || "10560";

  // 3. Resolusi Site URL & Database
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const databaseUrl =
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/void_supply";

  // 4. Resolusi Resend & Cron
  const resendApiKey = process.env.RESEND_API_KEY || undefined;
  const cronSecret = process.env.CRON_SECRET || undefined;
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;

  const dataUnverified = {
    appEnv,
    nodeEnv,
    siteUrl,
    databaseUrl,
    midtrans: {
      isProduction: isMidtransProd,
      serverKey: midtransServerKey,
      clientKey: midtransClientKey,
      allowPaymentMock,
    },
    biteship: {
      isProduction: isBiteshipProd,
      apiKey: biteshipApiKey,
      originPostalCode: biteshipOriginPostal,
    },
    resend: {
      apiKey: resendApiKey,
      fromEmail: "VOID Supply <orders@voidsupply.com>",
    },
    cron: {
      secret: cronSecret,
    },
    sentry: {
      dsn: sentryDsn,
    },
  };

  const hasilParse = skemaKonfigurasiEnvironment.safeParse(dataUnverified);
  if (!hasilParse.success) {
    console.error("[ENV RESOLVER ERROR]: Konfigurasi lingkungan gagal tervalidasi:", hasilParse.error.format());
    if (appEnv === "production" && process.env.CI !== "true") {
      throw new Error("Konfigurasi environment produksi tidak valid.");
    }
  }

  cacheKonfigurasi = (hasilParse.success ? hasilParse.data : dataUnverified) as KonfigurasiEnvironment;
  return cacheKonfigurasi;
}

/**
 * Reset cache konfigurasi (berguna untuk testing)
 */
export function resetCacheKonfigurasi(): void {
  cacheKonfigurasi = null;
}
