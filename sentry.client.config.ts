// This file configures the initialization of Sentry on the client browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://045393121f8c4a6294692289bbf2467e@o4511009935261696.ingest.us.sentry.io/4512255103008768",

  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development",

  // Free Tier Budget Guard: 10% sampling in production to avoid hitting free-tier quotas
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Replay sampling (free tier friendly)
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
