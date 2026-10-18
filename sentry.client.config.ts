import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://045393121f8c4a6294692289bbf2467e@o4511009935261696.ingest.us.sentry.io/4512255103008768",

  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development",

  // Free Tier Budget Guard: 5% sampling in production to avoid hitting free-tier quotas (10k tx/month)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

  // Replay sampling (free tier friendly)
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Ignore noisy browser extension & client errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    "Network request failed",
    "Failed to fetch",
    "Load failed",
  ],

  // Sanitasi PII & Kredensial sebelum dikirim ke Sentry
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers["cookie"];
      delete event.request.headers["authorization"];
    }

    // Filter event breadcrumbs yang mengandung token atau kata sandi
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((crumb) => {
        if (crumb.data && typeof crumb.data === "object") {
          const sanitized = { ...crumb.data };
          for (const key of Object.keys(sanitized)) {
            if (/password|kataSandi|token|secret|authorization/i.test(key)) {
              sanitized[key] = "[TERLINDUNGI]";
            }
          }
          return { ...crumb, data: sanitized };
        }
        return crumb;
      });
    }

    return event;
  },

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
