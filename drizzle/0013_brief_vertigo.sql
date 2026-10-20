DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipe_produk') THEN
    CREATE TYPE "public"."tipe_produk" AS ENUM('standar', 'pre_order', 'bundle');
  END IF;
END$$;
--> statement-breakpoint
ALTER TABLE "batas_permintaan_auth" ALTER COLUMN "last_request" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "batas_permintaan_auth" ALTER COLUMN "last_request" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "item_pesanan" ADD COLUMN IF NOT EXISTS "tipe_produk" varchar(30) DEFAULT 'standar' NOT NULL;--> statement-breakpoint
ALTER TABLE "item_pesanan" ADD COLUMN IF NOT EXISTS "catatan_pre_order" text;--> statement-breakpoint
ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "tipe_produk" "tipe_produk" DEFAULT 'standar' NOT NULL;--> statement-breakpoint
ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "estimasi_pre_order_hari" integer;--> statement-breakpoint
ALTER TABLE "produk" ADD COLUMN IF NOT EXISTS "metadata_bundle" jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_outbox_status_dieksekusi" ON "outbox_pekerjaan" USING btree ("status","dieksekusi_pada");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pesanan_status_dibuat" ON "pesanan" USING btree ("status_pesanan","dibuat_pada");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pesanan_pelanggan_id" ON "pesanan" USING btree ("pelanggan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pesanan_kedaluwarsa_pada" ON "pesanan" USING btree ("kedaluwarsa_pada");