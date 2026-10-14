CREATE TYPE "public"."status_faktur" AS ENUM('terbit', 'lunas', 'batal');--> statement-breakpoint
CREATE TYPE "public"."status_log_email" AS ENUM('antre', 'terkirim', 'gagal');--> statement-breakpoint
CREATE TYPE "public"."tingkat_keanggotaan" AS ENUM('bronze', 'silver', 'black');--> statement-breakpoint
CREATE TYPE "public"."tipe_diskon" AS ENUM('persentase', 'potongan_tetap');--> statement-breakpoint
CREATE TYPE "public"."tipe_email" AS ENUM('konfirmasi_pesanan', 'pembayaran_berhasil', 'resi_pengiriman', 'pesanan_batal');--> statement-breakpoint
CREATE TABLE "aturan_diskon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" varchar(50) NOT NULL,
	"nama" varchar(150) NOT NULL,
	"deskripsi" text,
	"tipe_diskon" "tipe_diskon" NOT NULL,
	"nilai_diskon" integer NOT NULL,
	"minimal_pembelian" integer DEFAULT 0 NOT NULL,
	"maksimal_potongan" integer,
	"kuota_penggunaan" integer DEFAULT 100 NOT NULL,
	"total_digunakan" integer DEFAULT 0 NOT NULL,
	"apakah_aktif" boolean DEFAULT true NOT NULL,
	"tanggal_mulai" timestamp with time zone,
	"tanggal_berakhir" timestamp with time zone,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "aturan_diskon_kode_unique" UNIQUE("kode"),
	CONSTRAINT "check_diskon_nilai" CHECK ("aturan_diskon"."nilai_diskon" > 0),
	CONSTRAINT "check_diskon_min_beli" CHECK ("aturan_diskon"."minimal_pembelian" >= 0)
);
--> statement-breakpoint
CREATE TABLE "faktur" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nomor_faktur" varchar(60) NOT NULL,
	"pesanan_id" uuid NOT NULL,
	"total_tagihan" integer NOT NULL,
	"status_faktur" "status_faktur" DEFAULT 'lunas' NOT NULL,
	"pdf_url" text,
	"metadata_faktur" jsonb,
	"diterbitkan_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "faktur_nomor_faktur_unique" UNIQUE("nomor_faktur"),
	CONSTRAINT "faktur_pesanan_id_unique" UNIQUE("pesanan_id")
);
--> statement-breakpoint
CREATE TABLE "keanggotaan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pelanggan_id" uuid,
	"email" varchar(255) NOT NULL,
	"tingkat" "tingkat_keanggotaan" DEFAULT 'bronze' NOT NULL,
	"poin" integer DEFAULT 0 NOT NULL,
	"total_belanja_akumulasi" integer DEFAULT 0 NOT NULL,
	"bergabung_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "keanggotaan_email_unique" UNIQUE("email"),
	CONSTRAINT "check_keanggotaan_poin" CHECK ("keanggotaan"."poin" >= 0)
);
--> statement-breakpoint
CREATE TABLE "log_email" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pesanan_id" uuid,
	"email_penerima" varchar(255) NOT NULL,
	"tipe_email" "tipe_email" NOT NULL,
	"subjek" varchar(255) NOT NULL,
	"status_pengiriman" "status_log_email" DEFAULT 'terkirim' NOT NULL,
	"driver" varchar(50) DEFAULT 'console_mock' NOT NULL,
	"payload_ringkasan" jsonb,
	"dikirim_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pelacakan_pengiriman" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pesanan_id" uuid NOT NULL,
	"nomor_resi" varchar(100) NOT NULL,
	"kurir" varchar(50) NOT NULL,
	"status_pelacakan" varchar(50) NOT NULL,
	"keterangan" text NOT NULL,
	"lokasi" varchar(150),
	"waktu_peristiwa" timestamp with time zone DEFAULT now() NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pesanan" ADD COLUMN "kode_voucher" varchar(50);--> statement-breakpoint
ALTER TABLE "faktur" ADD CONSTRAINT "faktur_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keanggotaan" ADD CONSTRAINT "keanggotaan_pelanggan_id_pelanggan_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."pelanggan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_email" ADD CONSTRAINT "log_email_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pelacakan_pengiriman" ADD CONSTRAINT "pelacakan_pengiriman_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;