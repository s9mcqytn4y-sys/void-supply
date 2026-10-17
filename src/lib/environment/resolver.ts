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

  const demoMode = process.env.DEMO_MODE ? process.env.DEMO_MODE === "true" : true;

  const rawAppEnv =
    process.env.APP_ENV ||
    (process.env.CI === "true" ? "test" : process.env.NODE_ENV || "development");
  const appEnv =
    rawAppEnv === "production" ? "production" : rawAppEnv === "staging" ? "staging" : "development";

  const rawNodeEnv = process.env.NODE_ENV || "development";
  const nodeEnv =
    rawNodeEnv === "production" ? "production" : rawNodeEnv === "test" ? "test" : "development";

  const midtransEnv = (process.env.MIDTRANS_ENV || "sandbox").toLowerCase();
  const biteshipEnv = (process.env.BITESHIP_ENV || "test").toLowerCase();
  const midtransIsProdFlag = process.env.MIDTRANS_IS_PRODUCTION === "true";

  // Guard DEMO_MODE: Melarang keras mode gateway live di lingkungan demo portofolio
  if (
    demoMode &&
    (midtransEnv === "production" ||
      midtransIsProdFlag ||
      biteshipEnv === "production" ||
      (appEnv === "production" && process.env.MIDTRANS_IS_PRODUCTION === "true"))
  ) {
    throw new Error(
      "DEMO_MODE hanya boleh menggunakan Midtrans Sandbox dan Biteship Testing."
    );
  }

  // 1. Resolusi Midtrans
  const isMidtransProd = !demoMode && (midtransEnv === "production" || midtransIsProdFlag);

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
  const isBiteshipProd = !demoMode && biteshipEnv === "production";

  const biteshipApiKey = isBiteshipProd
    ? process.env.BITESHIP_API_KEY_PRODUCTION || process.env.BITESHIP_API_KEY || ""
    : process.env.BITESHIP_API_KEY_SANDBOX ||
      process.env.BITESHIP_API_KEY ||
      "biteship_test.demo-placeholder";

  const biteshipOriginPostal = process.env.BITESHIP_ORIGIN_POSTAL_CODE || "10560";
  const biteshipWebhookHeaderKey =
    process.env.BITESHIP_WEBHOOK_HEADER_KEY || "x-void-biteship-secret";
  const biteshipWebhookSecret = process.env.BITESHIP_WEBHOOK_SECRET || undefined;

  // 3. Resolusi Site URL & Database
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const isDeployedEnv =
    Boolean(process.env.VERCEL) ||
    appEnv === "staging" ||
    appEnv === "production";

  if (isDeployedEnv && !process.env.DATABASE_URL && process.env.CI !== "true") {
    throw new Error(
      "DATABASE_URL wajib dikonfigurasi dan tidak boleh kosong pada staging/production Vercel."
    );
  }

  const databaseUrl =
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/void_supply";

  // 4. Resolusi Resend, Cron & Sentry
  const resendApiKey = process.env.RESEND_API_KEY || undefined;
  const cronSecret = process.env.CRON_SECRET || undefined;
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;

  const dataUnverified = {
    demoMode,
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
      webhookHeaderKey: biteshipWebhookHeaderKey,
      webhookSecret: biteshipWebhookSecret,
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
