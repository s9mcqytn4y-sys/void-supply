DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipe_produk') THEN
    CREATE TYPE "tipe_produk" AS ENUM('standar', 'pre_order', 'bundle');
  END IF;
END$$;
--> statement-breakpoint
ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "tipe_produk" "tipe_produk" DEFAULT 'standar' NOT NULL;
--> statement-breakpoint
ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "estimasi_pre_order_hari" integer;
--> statement-breakpoint
ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "metadata_bundle" jsonb;
--> statement-breakpoint
ALTER TABLE "item_pesanan" ADD COLUMN IF NOT EXISTS "tipe_produk" varchar(30) DEFAULT 'standar' NOT NULL;
--> statement-breakpoint
ALTER TABLE "item_pesanan" ADD COLUMN IF NOT EXISTS "catatan_pre_order" text;
