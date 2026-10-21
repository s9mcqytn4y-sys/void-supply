CREATE TYPE "public"."jenis_mutasi_stok" AS ENUM('restock', 'koreksi_fisik', 'retur', 'rusak', 'pesanan');--> statement-breakpoint
CREATE TABLE "audit_aktivitas_admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" text NOT NULL,
	"tindakan" varchar(100) NOT NULL,
	"target_id" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text,
	"payload_aman" jsonb,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catatan_operasional_pesanan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pesanan_id" uuid NOT NULL,
	"admin_id" text,
	"isi_catatan" text NOT NULL,
	"tingkat_urgensi" varchar(20) DEFAULT 'normal' NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riwayat_mutasi_stok" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"varian_id" uuid NOT NULL,
	"admin_id" text,
	"jenis_mutasi" "jenis_mutasi_stok" NOT NULL,
	"kuantitas_sebelum" integer NOT NULL,
	"perubahan" integer NOT NULL,
	"kuantitas_sesudah" integer NOT NULL,
	"nomor_referensi" varchar(100),
	"catatan" text,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_aktivitas_admin" ADD CONSTRAINT "audit_aktivitas_admin_admin_id_pengguna_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."pengguna"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catatan_operasional_pesanan" ADD CONSTRAINT "catatan_operasional_pesanan_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catatan_operasional_pesanan" ADD CONSTRAINT "catatan_operasional_pesanan_admin_id_pengguna_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."pengguna"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_mutasi_stok" ADD CONSTRAINT "riwayat_mutasi_stok_varian_id_varian_produk_id_fk" FOREIGN KEY ("varian_id") REFERENCES "public"."varian_produk"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_mutasi_stok" ADD CONSTRAINT "riwayat_mutasi_stok_admin_id_pengguna_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."pengguna"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_admin_tindakan" ON "audit_aktivitas_admin" USING btree ("admin_id","dibuat_pada");--> statement-breakpoint
CREATE INDEX "idx_catatan_pesanan" ON "catatan_operasional_pesanan" USING btree ("pesanan_id","dibuat_pada");--> statement-breakpoint
CREATE INDEX "idx_mutasi_stok_varian" ON "riwayat_mutasi_stok" USING btree ("varian_id","dibuat_pada");--> statement-breakpoint
CREATE INDEX "idx_mutasi_stok_jenis" ON "riwayat_mutasi_stok" USING btree ("jenis_mutasi");