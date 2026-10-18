import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Mengeksekusi migrasi tabel autentikasi dan kolom pengguna_id...");

  await db.execute(sql`
    ALTER TABLE pelanggan ADD COLUMN IF NOT EXISTS pengguna_id TEXT UNIQUE;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pengguna" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "email_verified" boolean DEFAULT false NOT NULL,
      "image" text,
      "peran" varchar(30) DEFAULT 'pelanggan' NOT NULL,
      "nomor_telepon" varchar(30),
      "alamat_default" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sesi_pengguna" (
      "id" text PRIMARY KEY NOT NULL,
      "expires_at" timestamp with time zone NOT NULL,
      "token" text NOT NULL UNIQUE,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "ip_address" text,
      "user_agent" text,
      "user_id" text NOT NULL REFERENCES "pengguna"("id") ON DELETE CASCADE
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "akun_autentikasi" (
      "id" text PRIMARY KEY NOT NULL,
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "user_id" text NOT NULL REFERENCES "pengguna"("id") ON DELETE CASCADE,
      "access_token" text,
      "refresh_token" text,
      "id_token" text,
      "access_token_expires_at" timestamp with time zone,
      "refresh_token_expires_at" timestamp with time zone,
      "scope" text,
      "password" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "verifikasi_autentikasi" (
      "id" text PRIMARY KEY NOT NULL,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "batas_permintaan_auth" (
      "id" text PRIMARY KEY NOT NULL,
      "key" text NOT NULL,
      "count" integer NOT NULL,
      "last_request" bigint NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "alamat_pelanggan" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "pengguna_id" text NOT NULL REFERENCES "pengguna"("id") ON DELETE CASCADE,
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
    CREATE INDEX IF NOT EXISTS "idx_alamat_pengguna_id" ON "alamat_pelanggan"("pengguna_id");
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "preferensi_pengguna" (
      "pengguna_id" text PRIMARY KEY REFERENCES "pengguna"("id") ON DELETE CASCADE,
      "bahasa" varchar(10) DEFAULT 'id' NOT NULL,
      "mata_uang" varchar(10) DEFAULT 'IDR' NOT NULL,
      "ukuran_favorit" varchar(20),
      "mode_tampilan" varchar(20) DEFAULT 'dark' NOT NULL,
      "email_transaksi" boolean DEFAULT true NOT NULL,
      "email_marketing" boolean DEFAULT false NOT NULL,
      "diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "aktivitas_akun" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "pengguna_id" text NOT NULL REFERENCES "pengguna"("id") ON DELETE CASCADE,
      "jenis" varchar(50) NOT NULL,
      "waktu" timestamp with time zone DEFAULT now() NOT NULL,
      "ip_address" varchar(100),
      "user_agent" text,
      "metadata_aman" jsonb
    );
    CREATE INDEX IF NOT EXISTS "idx_aktivitas_pengguna_waktu" ON "aktivitas_akun"("pengguna_id", "waktu");
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "klaim_pesanan" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "pengguna_id" text NOT NULL REFERENCES "pengguna"("id") ON DELETE CASCADE,
      "pesanan_id" uuid NOT NULL REFERENCES "pesanan"("id") ON DELETE CASCADE,
      "status" varchar(30) DEFAULT 'menunggu_verifikasi' NOT NULL,
      "metode_verifikasi" varchar(50) NOT NULL,
      "dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  console.log("Migrasi autentikasi dan akun pelanggan berhasil diselesaikan.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Gagal migrasi autentikasi:", err);
  process.exit(1);
});
