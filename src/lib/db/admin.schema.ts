import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { varianProduk, pesanan } from "./schema";
import { pengguna } from "./auth.schema";

// 1. Enum Tipe Mutasi Stok
export const jenisMutasiStokEnum = pgEnum("jenis_mutasi_stok", [
  "restock",
  "koreksi_fisik",
  "retur",
  "rusak",
  "pesanan",
]);

// 2. Buku Besar Mutasi Stok (Immutable Inventory Ledger)
export const riwayatMutasiStok = pgTable(
  "riwayat_mutasi_stok",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    varianId: uuid("varian_id")
      .references(() => varianProduk.id, { onDelete: "restrict" })
      .notNull(),
    adminId: text("admin_id").references(() => pengguna.id, { onDelete: "set null" }),
    jenisMutasi: jenisMutasiStokEnum("jenis_mutasi").notNull(),
    kuantitasSebelum: integer("kuantitas_sebelum").notNull(),
    perubahan: integer("perubahan").notNull(), // positif jika stok bertambah, negatif jika berkurang
    kuantitasSesudah: integer("kuantitas_sesudah").notNull(),
    nomorReferensi: varchar("nomor_referensi", { length: 100 }), // misal nomor PO atau nomor order
    catatan: text("catatan"),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => ({
    idxVarianDibuat: index("idx_mutasi_stok_varian").on(tabel.varianId, tabel.dibuatPada),
    idxJenisMutasi: index("idx_mutasi_stok_jenis").on(tabel.jenisMutasi),
  })
);

// 3. Catatan Operasional Pesanan (Internal Order Notes)
export const catatanOperasionalPesanan = pgTable(
  "catatan_operasional_pesanan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pesananId: uuid("pesanan_id")
      .references(() => pesanan.id, { onDelete: "cascade" })
      .notNull(),
    adminId: text("admin_id").references(() => pengguna.id, { onDelete: "set null" }),
    isiCatatan: text("isi_catatan").notNull(),
    tingkatUrgensi: varchar("tingkat_urgensi", { length: 20 }).default("normal").notNull(), // 'normal' | 'penting' | 'kritis'
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => ({
    idxPesananCatatan: index("idx_catatan_pesanan").on(tabel.pesananId, tabel.dibuatPada),
  })
);

// 4. Log Audit Aktivitas Staf Admin (Security & Compliance Trail)
export const auditAktivitasAdmin = pgTable(
  "audit_aktivitas_admin",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: text("admin_id").references(() => pengguna.id, { onDelete: "set null" }),
    tindakan: varchar("tindakan", { length: 100 }).notNull(), // misal: 'mutasi_stok', 'inquire_midtrans', 'request_pickup_biteship'
    targetId: varchar("target_id", { length: 100 }), // ID entitas terkait
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    payloadAman: jsonb("payload_aman"),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => ({
    idxAdminTindakan: index("idx_audit_admin_tindakan").on(tabel.adminId, tabel.dibuatPada),
  })
);
