import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { PgDatabase } from "drizzle-orm/pg-core";
import postgres from "postgres";
import ws from "ws";
import * as schema from "./schema";
import * as authSchema from "./auth.schema";

export const combinedSchema = {
  ...schema,
  ...authSchema,
  user: authSchema.pengguna,
  session: authSchema.sesiPengguna,
  account: authSchema.akunAutentikasi,
  verification: authSchema.verifikasiAutentikasi,
  rateLimit: authSchema.batasPermintaanAuth,
};

// Konfigurasi WebSocket constructor untuk runtime Node.js jika belum tersedia secara native
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const isDeployedEnv =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  process.env.NODE_ENV === "production" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "production";

if (isDeployedEnv && !process.env.DATABASE_URL && process.env.CI !== "true") {
  throw new Error(
    "DATABASE_URL wajib dikonfigurasi pada deployment staging/produksi Vercel (koneksi pooled)."
  );
}

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/void_supply";

const isLocalhost =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("::1");

const isNeon =
  !isLocalhost &&
  (connectionString.includes("neon.tech") || Boolean(process.env.NEON_BRANCH));

const isVercelServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

type AppDatabase = PgDatabase<any, typeof combinedSchema>;

const globalForDb = globalThis as unknown as {
  db: AppDatabase | undefined;
  neonPool: Pool | undefined;
  pgConn: postgres.Sql | undefined;
};

function createDatabaseClient(): AppDatabase {
  if (isNeon) {
    const pool =
      globalForDb.neonPool ??
      new Pool({
        connectionString,
        max: isVercelServerless ? 5 : Number(process.env.DB_MAX_CONNECTIONS || 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

    if (!globalForDb.neonPool) {
      globalForDb.neonPool = pool;
    }

    return drizzleNeon(pool, { schema: combinedSchema }) as unknown as AppDatabase;
  }

  // Fallback ke postgres.js untuk environment local / CI tanpa WebSocket proxy
  const clientOptions: postgres.Options<{}> = {
    max: isVercelServerless ? 1 : Number(process.env.DB_MAX_CONNECTIONS || 10),
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: isLocalhost ? false : "require",
  };

  const conn = globalForDb.pgConn ?? postgres(connectionString, clientOptions);
  if (!globalForDb.pgConn) {
    globalForDb.pgConn = conn;
  }

  return drizzlePostgres(conn, { schema: combinedSchema }) as unknown as AppDatabase;
}

export const db: AppDatabase = globalForDb.db ?? createDatabaseClient();
if (!globalForDb.db) {
  globalForDb.db = db;
}

export * from "./schema";
