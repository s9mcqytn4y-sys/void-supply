import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://045393121f8c4a6294692289bbf2467e@o4511009935261696.ingest.us.sentry.io/4512255103008768",

  environment: process.env.APP_ENV || process.env.NODE_ENV || "development",

  // Free Tier Budget Guard: 5% sampling in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

  // Sanitasi data sensitif sebelum dikirim ke server Sentry
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers["cookie"];
      delete event.request.headers["authorization"];
    }

    if (event.request?.data && typeof event.request.data === "object") {
      const payload = { ...event.request.data } as Record<string, unknown>;
      for (const key of Object.keys(payload)) {
        if (/password|kataSandi|token|secret|kunci|cvv/i.test(key)) {
          payload[key] = "[TERLINDUNGI]";
        }
      }
      event.request.data = payload;
    }

    return event;
  },

  dataCollection: {
    // userInfo: false,
    // httpBodies: [],
  },
});
