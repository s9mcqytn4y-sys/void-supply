CREATE TYPE "public"."status_outbox" AS ENUM('antre', 'diproses', 'berhasil', 'gagal');--> statement-breakpoint
ALTER TYPE "public"."status_log_email" ADD VALUE 'simulasi' BEFORE 'gagal';--> statement-breakpoint
CREATE TABLE "outbox_pekerjaan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipe_pekerjaan" varchar(50) NOT NULL,
	"pesanan_id" uuid,
	"payload" jsonb NOT NULL,
	"status" "status_outbox" DEFAULT 'antre' NOT NULL,
	"percobaan" integer DEFAULT 0 NOT NULL,
	"maksimal_percobaan" integer DEFAULT 5 NOT NULL,
	"pesan_kesalahan" text,
	"dieksekusi_pada" timestamp with time zone,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pengiriman" ADD COLUMN "kode_layanan_kurir" varchar(50);--> statement-breakpoint
ALTER TABLE "pengiriman" ADD COLUMN "biteship_order_id" varchar(100);--> statement-breakpoint
ALTER TABLE "pengiriman" ADD COLUMN "biteship_tracking_id" varchar(100);--> statement-breakpoint
ALTER TABLE "pengiriman" ADD COLUMN "biaya_pengiriman_aktual" integer;--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "hash_token_akses" varchar(64);--> statement-breakpoint
ALTER TABLE "outbox_pekerjaan" ADD CONSTRAINT "outbox_pekerjaan_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;