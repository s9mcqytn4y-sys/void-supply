ALTER TYPE "public"."status_pembayaran" ADD VALUE 'menunggu_refund' BEFORE 'dikembalikan';--> statement-breakpoint
ALTER TABLE "audit_aktivitas_admin" ALTER COLUMN "admin_id" DROP NOT NULL;