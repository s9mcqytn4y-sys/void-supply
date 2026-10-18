ALTER TYPE "public"."tipe_email" ADD VALUE 'verifikasi_email';--> statement-breakpoint
ALTER TYPE "public"."tipe_email" ADD VALUE 'lupa_password';--> statement-breakpoint
ALTER TYPE "public"."tipe_email" ADD VALUE 'perubahan_keamanan';--> statement-breakpoint
ALTER TYPE "public"."tipe_email" ADD VALUE 'notifikasi_akun';--> statement-breakpoint
CREATE TABLE "aktivitas_akun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pengguna_id" text NOT NULL,
	"jenis" varchar(50) NOT NULL,
	"waktu" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(100),
	"user_agent" text,
	"metadata_aman" jsonb
);
--> statement-breakpoint
CREATE TABLE "akun_autentikasi" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alamat_pelanggan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pengguna_id" text NOT NULL,
	"label" varchar(40) NOT NULL,
	"nama_penerima" varchar(150) NOT NULL,
	"telepon_penerima" varchar(30) NOT NULL,
	"alamat_lengkap" text NOT NULL,
	"provinsi" varchar(100) NOT NULL,
	"kota" varchar(100) NOT NULL,
	"kecamatan" varchar(100),
	"kode_pos" varchar(10) NOT NULL,
	"apakah_utama" boolean DEFAULT false NOT NULL,
	"catatan_kurir" text,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batas_permintaan_auth" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"last_request" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "batas_permintaan_auth_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "item_keranjang_akun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keranjang_id" uuid NOT NULL,
	"varian_id" uuid NOT NULL,
	"jumlah" integer NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keranjang_akun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pengguna_id" text NOT NULL,
	"versi" integer DEFAULT 1 NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "keranjang_akun_pengguna_id_unique" UNIQUE("pengguna_id")
);
--> statement-breakpoint
CREATE TABLE "klaim_pesanan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pengguna_id" text NOT NULL,
	"pesanan_id" uuid NOT NULL,
	"status" varchar(30) DEFAULT 'menunggu_verifikasi' NOT NULL,
	"metode_verifikasi" varchar(50) NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengguna" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"peran" varchar(30) DEFAULT 'pelanggan' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pengguna_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "preferensi_pengguna" (
	"pengguna_id" text PRIMARY KEY NOT NULL,
	"bahasa" varchar(10) DEFAULT 'id' NOT NULL,
	"mata_uang" varchar(10) DEFAULT 'IDR' NOT NULL,
	"ukuran_favorit" varchar(20),
	"mode_tampilan" varchar(20) DEFAULT 'dark' NOT NULL,
	"email_transaksi" boolean DEFAULT true NOT NULL,
	"email_marketing" boolean DEFAULT false NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sesi_pengguna" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sesi_pengguna_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifikasi_autentikasi" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pengguna_id" text NOT NULL,
	"produk_id" uuid NOT NULL,
	"varian_id_preferensi" uuid,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pelanggan" ADD COLUMN "pengguna_id" text;--> statement-breakpoint
ALTER TABLE "aktivitas_akun" ADD CONSTRAINT "aktivitas_akun_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "akun_autentikasi" ADD CONSTRAINT "akun_autentikasi_user_id_pengguna_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alamat_pelanggan" ADD CONSTRAINT "alamat_pelanggan_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_keranjang_akun" ADD CONSTRAINT "item_keranjang_akun_keranjang_id_keranjang_akun_id_fk" FOREIGN KEY ("keranjang_id") REFERENCES "public"."keranjang_akun"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_keranjang_akun" ADD CONSTRAINT "item_keranjang_akun_varian_id_varian_produk_id_fk" FOREIGN KEY ("varian_id") REFERENCES "public"."varian_produk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keranjang_akun" ADD CONSTRAINT "keranjang_akun_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "klaim_pesanan" ADD CONSTRAINT "klaim_pesanan_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "klaim_pesanan" ADD CONSTRAINT "klaim_pesanan_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferensi_pengguna" ADD CONSTRAINT "preferensi_pengguna_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi_pengguna" ADD CONSTRAINT "sesi_pengguna_user_id_pengguna_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_produk_id_produk_id_fk" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_varian_id_preferensi_varian_produk_id_fk" FOREIGN KEY ("varian_id_preferensi") REFERENCES "public"."varian_produk"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_aktivitas_pengguna_waktu" ON "aktivitas_akun" USING btree ("pengguna_id","waktu");--> statement-breakpoint
CREATE INDEX "idx_akun_auth_pengguna" ON "akun_autentikasi" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_akun_provider_account" ON "akun_autentikasi" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_alamat_pengguna_id" ON "alamat_pelanggan" USING btree ("pengguna_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_rate_limit_key" ON "batas_permintaan_auth" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_item_keranjang_varian" ON "item_keranjang_akun" USING btree ("keranjang_id","varian_id");--> statement-breakpoint
CREATE INDEX "idx_item_keranjang_id" ON "item_keranjang_akun" USING btree ("keranjang_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_keranjang_akun_pengguna" ON "keranjang_akun" USING btree ("pengguna_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_klaim_pengguna_pesanan" ON "klaim_pesanan" USING btree ("pengguna_id","pesanan_id");--> statement-breakpoint
CREATE INDEX "idx_pengguna_email" ON "pengguna" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_pengguna_peran" ON "pengguna" USING btree ("peran");--> statement-breakpoint
CREATE INDEX "idx_sesi_pengguna_id" ON "sesi_pengguna" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_sesi_token" ON "sesi_pengguna" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_verifikasi_identifier" ON "verifikasi_autentikasi" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_wishlist_pengguna_produk" ON "wishlist" USING btree ("pengguna_id","produk_id");--> statement-breakpoint
CREATE INDEX "idx_wishlist_pengguna" ON "wishlist" USING btree ("pengguna_id");--> statement-breakpoint
ALTER TABLE "pelanggan" ADD CONSTRAINT "pelanggan_pengguna_id_unique" UNIQUE("pengguna_id");