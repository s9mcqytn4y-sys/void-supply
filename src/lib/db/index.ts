import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/void_supply";

const isLocalhost =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("::1");

const isVercelServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Konfigurasi pool koneksi yang resilien terhadap lonjakan traffic dan serverless SSR
const clientOptions: postgres.Options<{}> = {
  max: isVercelServerless ? 1 : process.env.DB_MAX_CONNECTIONS ? Number(process.env.DB_MAX_CONNECTIONS) : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Menghindari prepared statements conflicts pada connection pooler
  ssl: isLocalhost ? false : "require",
};

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Singleton instance connection pool di dev maupun production
const conn = globalForDb.conn ?? postgres(connectionString, clientOptions);
if (!globalForDb.conn) {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
export * from "./schema";
