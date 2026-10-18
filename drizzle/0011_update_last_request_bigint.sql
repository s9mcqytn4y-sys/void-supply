ALTER TABLE "batas_permintaan_auth" ALTER COLUMN "last_request" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "batas_permintaan_auth" ALTER COLUMN "last_request" TYPE bigint USING EXTRACT(EPOCH FROM last_request)::bigint * 1000;
