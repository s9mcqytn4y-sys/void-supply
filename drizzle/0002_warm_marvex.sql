ALTER TABLE "pesanan" ADD COLUMN "idempotensi_key" varchar(64);--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "kedaluwarsa_pada" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_idempotensi_key_unique" UNIQUE("idempotensi_key");