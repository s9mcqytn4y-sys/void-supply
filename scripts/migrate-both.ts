import postgres from "postgres";

async function migrateUrl(url: string, label: string) {
  console.log(`Menjalankan migrasi pada ${label}...`);
  try {
    const client = postgres(url, { max: 1 });
    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipe_produk') THEN
          CREATE TYPE "tipe_produk" AS ENUM('standar', 'pre_order', 'bundle');
        END IF;
      END$$;
    `;
    await client`ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "tipe_produk" "tipe_produk" DEFAULT 'standar' NOT NULL;`;
    await client`ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "estimasi_pre_order_hari" integer;`;
    await client`ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "metadata_bundle" jsonb;`;
    await client`ALTER TABLE "item_pesanan" ADD COLUMN IF NOT EXISTS "tipe_produk" varchar(30) DEFAULT 'standar' NOT NULL;`;
    await client`ALTER TABLE "item_pesanan" ADD COLUMN IF NOT EXISTS "catatan_pre_order" text;`;
    await client.end();
    console.log(`✓ Sukses migrasi pada ${label}!`);
  } catch (err) {
    console.error(`Gagal pada ${label}:`, err);
  }
}

async function main() {
  const localUrl = "postgresql://postgres:postgres@localhost:5432/void_supply";
  await migrateUrl(localUrl, "Local PostgreSQL (localhost:5432/void_supply)");

  if (process.env.DATABASE_URL) {
    await migrateUrl(process.env.DATABASE_URL, "Target DATABASE_URL (.env)");
  }
  process.exit(0);
}

main();
