CREATE TABLE "pesan_kontak" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subjek" varchar(255),
	"pesan" text NOT NULL,
	"status" varchar(50) DEFAULT 'baru' NOT NULL,
	"ip_pengirim" varchar(100),
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL
);
