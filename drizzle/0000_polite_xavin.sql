CREATE TYPE "public"."status_pembayaran" AS ENUM('menunggu_pembayaran', 'berhasil', 'kadaluarsa', 'gagal', 'dikembalikan');--> statement-breakpoint
CREATE TYPE "public"."status_pengiriman" AS ENUM('menunggu_resi', 'dalam_pengiriman', 'terkirim', 'gagal');--> statement-breakpoint
CREATE TYPE "public"."status_pesanan" AS ENUM('menunggu_pembayaran', 'diproses', 'dikirim', 'selesai', 'dibatalkan');--> statement-breakpoint
CREATE TYPE "public"."status_produk" AS ENUM('draft', 'aktif', 'habis', 'arsip');--> statement-breakpoint
CREATE TABLE "item_pesanan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pesanan_id" uuid NOT NULL,
	"varian_id" uuid,
	"nama_produk" varchar(255) NOT NULL,
	"nama_varian" varchar(50) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"harga_satuan" integer NOT NULL,
	"berat_gram" integer NOT NULL,
	"jumlah" integer NOT NULL,
	"subtotal_item" integer NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kategori" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"deskripsi" text,
	"urutan" integer DEFAULT 0 NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kategori_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "koleksi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"deskripsi" text,
	"nomor_drop" varchar(20),
	"banner_gambar" text,
	"apakah_aktif" boolean DEFAULT true NOT NULL,
	"rilis_pada" timestamp with time zone,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "koleksi_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pelanggan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_lengkap" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"telepon" varchar(30),
	"alamat_default" text,
	"kota_default" varchar(100),
	"provinsi_default" varchar(100),
	"kode_pos_default" varchar(10),
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pelanggan_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pembayaran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pesanan_id" uuid NOT NULL,
	"gateway" varchar(30) DEFAULT 'midtrans' NOT NULL,
	"gateway_order_id" varchar(100) NOT NULL,
	"gateway_transaction_id" varchar(100),
	"metode_pembayaran" varchar(50),
	"status_pembayaran" "status_pembayaran" DEFAULT 'menunggu_pembayaran' NOT NULL,
	"snap_token" varchar(255),
	"snap_redirect_url" text,
	"jumlah_bayar" integer NOT NULL,
	"dibayar_pada" timestamp with time zone,
	"metadata_gateway" jsonb,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pembayaran_pesanan_id_unique" UNIQUE("pesanan_id")
);
--> statement-breakpoint
CREATE TABLE "pengiriman" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pesanan_id" uuid NOT NULL,
	"kurir" varchar(50) NOT NULL,
	"layanan" varchar(50) NOT NULL,
	"nomor_resi" varchar(100),
	"berat_total_gram" integer NOT NULL,
	"biaya_ongkir" integer NOT NULL,
	"nama_penerima" varchar(150) NOT NULL,
	"telepon_penerima" varchar(30) NOT NULL,
	"alamat_lengkap" text NOT NULL,
	"kota" varchar(100) NOT NULL,
	"provinsi" varchar(100) NOT NULL,
	"kode_pos" varchar(10) NOT NULL,
	"status_pengiriman" "status_pengiriman" DEFAULT 'menunggu_resi' NOT NULL,
	"estimasi_hari" varchar(30) NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pengiriman_pesanan_id_unique" UNIQUE("pesanan_id")
);
--> statement-breakpoint
CREATE TABLE "pesanan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nomor_pesanan" varchar(50) NOT NULL,
	"pelanggan_id" uuid,
	"nama_pelanggan" varchar(150) NOT NULL,
	"email_pelanggan" varchar(255) NOT NULL,
	"telepon_pelanggan" varchar(30) NOT NULL,
	"status_pesanan" "status_pesanan" DEFAULT 'menunggu_pembayaran' NOT NULL,
	"subtotal" integer NOT NULL,
	"total_ongkir" integer NOT NULL,
	"total_diskon" integer DEFAULT 0 NOT NULL,
	"total_akhir" integer NOT NULL,
	"catatan" text,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pesanan_nomor_pesanan_unique" UNIQUE("nomor_pesanan")
);
--> statement-breakpoint
CREATE TABLE "produk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kategori_id" uuid NOT NULL,
	"nama" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"deskripsi" text NOT NULL,
	"harga_dasar" integer NOT NULL,
	"status" "status_produk" DEFAULT 'aktif' NOT NULL,
	"gambar_utama" text NOT NULL,
	"galeri_gambar" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"spesifikasi" jsonb,
	"panduan_ukuran" jsonb,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "produk_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "produk_ke_koleksi" (
	"produk_id" uuid NOT NULL,
	"koleksi_id" uuid NOT NULL,
	CONSTRAINT "produk_ke_koleksi_produk_id_koleksi_id_pk" PRIMARY KEY("produk_id","koleksi_id")
);
--> statement-breakpoint
CREATE TABLE "varian_produk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produk_id" uuid NOT NULL,
	"ukuran" varchar(10) NOT NULL,
	"warna" varchar(50) DEFAULT 'Hitam' NOT NULL,
	"sku" varchar(100) NOT NULL,
	"stok" integer DEFAULT 0 NOT NULL,
	"berat_gram" integer DEFAULT 500 NOT NULL,
	"harga" integer NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "varian_produk_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
ALTER TABLE "item_pesanan" ADD CONSTRAINT "item_pesanan_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_pesanan" ADD CONSTRAINT "item_pesanan_varian_id_varian_produk_id_fk" FOREIGN KEY ("varian_id") REFERENCES "public"."varian_produk"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengiriman" ADD CONSTRAINT "pengiriman_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_pelanggan_id_pelanggan_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."pelanggan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produk" ADD CONSTRAINT "produk_kategori_id_kategori_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produk_ke_koleksi" ADD CONSTRAINT "produk_ke_koleksi_produk_id_produk_id_fk" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produk_ke_koleksi" ADD CONSTRAINT "produk_ke_koleksi_koleksi_id_koleksi_id_fk" FOREIGN KEY ("koleksi_id") REFERENCES "public"."koleksi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "varian_produk" ADD CONSTRAINT "varian_produk_produk_id_produk_id_fk" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE cascade ON UPDATE no action;