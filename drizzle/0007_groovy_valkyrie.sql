CREATE TABLE "arsip_faktur" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faktur_id" uuid NOT NULL,
	"nomor_faktur" varchar(60) NOT NULL,
	"snapshot_payload" jsonb NOT NULL,
	"hash_integrity" varchar(64) NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pembayaran" ADD COLUMN "nomor_va" varchar(60);--> statement-breakpoint
ALTER TABLE "pembayaran" ADD COLUMN "bank_va" varchar(30);--> statement-breakpoint
ALTER TABLE "pembayaran" ADD COLUMN "qr_string" text;--> statement-breakpoint
ALTER TABLE "pembayaran" ADD COLUMN "instruksi_pembayaran" jsonb;--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "diterima_pada" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "garansi_berakhir_pada" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "catatan_penerima" text;--> statement-breakpoint
ALTER TABLE "arsip_faktur" ADD CONSTRAINT "arsip_faktur_faktur_id_faktur_id_fk" FOREIGN KEY ("faktur_id") REFERENCES "public"."faktur"("id") ON DELETE cascade ON UPDATE no action;