import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Mengeksekusi migrasi tabel administrasi dan buku besar stok...");

  // 1. Buat enum jenis_mutasi_stok jika belum ada
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "jenis_mutasi_stok" AS ENUM ('restock', 'koreksi_fisik', 'retur', 'rusak', 'pesanan');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 2. Tabel riwayat_mutasi_stok
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "riwayat_mutasi_stok" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "varian_id" uuid NOT NULL REFERENCES "varian_produk"("id") ON DELETE RESTRICT,
      "admin_id" text REFERENCES "pengguna"("id") ON DELETE SET NULL,
      "jenis_mutasi" "jenis_mutasi_stok" NOT NULL,
      "kuantitas_sebelum" integer NOT NULL,
      "perubahan" integer NOT NULL,
      "kuantitas_sesudah" integer NOT NULL,
      "nomor_referensi" varchar(100),
      "catatan" text,
      "dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "idx_mutasi_stok_varian" ON "riwayat_mutasi_stok" ("varian_id", "dibuat_pada");
    CREATE INDEX IF NOT EXISTS "idx_mutasi_stok_jenis" ON "riwayat_mutasi_stok" ("jenis_mutasi");
  `);

  // 3. Tabel catatan_operasional_pesanan
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "catatan_operasional_pesanan" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "pesanan_id" uuid NOT NULL REFERENCES "pesanan"("id") ON DELETE CASCADE,
      "admin_id" text REFERENCES "pengguna"("id") ON DELETE SET NULL,
      "isi_catatan" text NOT NULL,
      "tingkat_urgensi" varchar(20) DEFAULT 'normal' NOT NULL,
      "dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "idx_catatan_pesanan" ON "catatan_operasional_pesanan" ("pesanan_id", "dibuat_pada");
  `);

  // 4. Tabel audit_aktivitas_admin
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "audit_aktivitas_admin" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "admin_id" text NOT NULL REFERENCES "pengguna"("id") ON DELETE SET NULL,
      "tindakan" varchar(100) NOT NULL,
      "target_id" varchar(100),
      "ip_address" varchar(45),
      "user_agent" text,
      "payload_aman" jsonb,
      "dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "idx_audit_admin_tindakan" ON "audit_aktivitas_admin" ("admin_id", "dibuat_pada");
  `);

  console.log("Migrasi skema administrasi berhasil diselesaikan!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Gagal mengeksekusi migrasi skema admin:", err);
  process.exit(1);
});
