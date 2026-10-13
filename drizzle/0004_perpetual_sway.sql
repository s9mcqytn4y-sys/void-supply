ALTER TABLE "pesanan" ADD COLUMN "hash_payload" varchar(64);--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "percobaan_rekonsiliasi" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "rekonsiliasi_terakhir_pada" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "perlu_tinjauan_manual" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "pesanan" SET "token_akses" = gen_random_uuid() WHERE "token_akses" IS NULL;