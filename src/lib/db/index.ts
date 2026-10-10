import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/void_supply";

// Konfigurasi pool koneksi yang resilien terhadap lonjakan traffic dan serverless SSR
const clientOptions: postgres.Options<{}> = {
  max: process.env.DB_MAX_CONNECTIONS ? Number(process.env.DB_MAX_CONNECTIONS) : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Menghindari prepared statements conflicts pada connection pooler
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
