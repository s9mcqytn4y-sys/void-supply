import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { produk, varianProduk, pesanan } from "./schema";

// 1. Core Model Better Auth (Tabel Pengguna & Sesi)
export const pengguna = pgTable(
  "pengguna",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    peran: varchar("peran", { length: 30 }).default("pelanggan").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    index("idx_pengguna_email").on(tabel.email),
    index("idx_pengguna_peran").on(tabel.peran),
  ]
);

export const sesiPengguna = pgTable(
  "sesi_pengguna",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    index("idx_sesi_pengguna_id").on(tabel.userId),
    uniqueIndex("uq_sesi_token").on(tabel.token),
  ]
);

export const akunAutentikasi = pgTable(
  "akun_autentikasi",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    index("idx_akun_auth_pengguna").on(tabel.userId),
    uniqueIndex("uq_akun_provider_account").on(tabel.providerId, tabel.accountId),
  ]
);

export const verifikasiAutentikasi = pgTable(
  "verifikasi_autentikasi",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    index("idx_verifikasi_identifier").on(tabel.identifier),
  ]
);

export const batasPermintaanAuth = pgTable(
  "batas_permintaan_auth",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    count: integer("count").default(0).notNull(),
    lastRequest: timestamp("last_request", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    uniqueIndex("uq_rate_limit_key").on(tabel.key),
  ]
);

// 2. Customer Account & Address Book
export const alamatPelanggan = pgTable(
  "alamat_pelanggan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    penggunaId: text("pengguna_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 40 }).notNull(),
    namaPenerima: varchar("nama_penerima", { length: 150 }).notNull(),
    teleponPenerima: varchar("telepon_penerima", { length: 30 }).notNull(),
    alamatLengkap: text("alamat_lengkap").notNull(),
    provinsi: varchar("provinsi", { length: 100 }).notNull(),
    kota: varchar("kota", { length: 100 }).notNull(),
    kecamatan: varchar("kecamatan", { length: 100 }),
    kodePos: varchar("kode_pos", { length: 10 }).notNull(),
    apakahUtama: boolean("apakah_utama").default(false).notNull(),
    catatanKurir: text("catatan_kurir"),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
    diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    index("idx_alamat_pengguna_id").on(tabel.penggunaId),
  ]
);

// 3. User Preferences & CRM Consent
export const preferensiPengguna = pgTable("preferensi_pengguna", {
  penggunaId: text("pengguna_id")
    .primaryKey()
    .references(() => pengguna.id, { onDelete: "cascade" }),
  bahasa: varchar("bahasa", { length: 10 }).default("id").notNull(),
  mataUang: varchar("mata_uang", { length: 10 }).default("IDR").notNull(),
  ukuranFavorit: varchar("ukuran_favorit", { length: 20 }),
  modeTampilan: varchar("mode_tampilan", { length: 20 }).default("dark").notNull(),
  emailTransaksi: boolean("email_transaksi").default(true).notNull(),
  emailMarketing: boolean("email_marketing").default(false).notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Wishlist / Koleksi Favorit
export const wishlist = pgTable(
  "wishlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    penggunaId: text("pengguna_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "cascade" }),
    produkId: uuid("produk_id")
      .notNull()
      .references(() => produk.id, { onDelete: "cascade" }),
    varianIdPreferensi: uuid("varian_id_preferensi").references(() => varianProduk.id, {
      onDelete: "set null",
    }),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    uniqueIndex("uq_wishlist_pengguna_produk").on(tabel.penggunaId, tabel.produkId),
    index("idx_wishlist_pengguna").on(tabel.penggunaId),
  ]
);

// 5. Keranjang Akun Persisten Lintas Perangkat
export const keranjangAkun = pgTable(
  "keranjang_akun",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    penggunaId: text("pengguna_id")
      .notNull()
      .unique()
      .references(() => pengguna.id, { onDelete: "cascade" }),
    versi: integer("versi").default(1).notNull(),
    diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    uniqueIndex("uq_keranjang_akun_pengguna").on(tabel.penggunaId),
  ]
);

export const itemKeranjangAkun = pgTable(
  "item_keranjang_akun",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    keranjangId: uuid("keranjang_id")
      .notNull()
      .references(() => keranjangAkun.id, { onDelete: "cascade" }),
    varianId: uuid("varian_id")
      .notNull()
      .references(() => varianProduk.id, { onDelete: "cascade" }),
    jumlah: integer("jumlah").notNull(),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    uniqueIndex("uq_item_keranjang_varian").on(tabel.keranjangId, tabel.varianId),
    index("idx_item_keranjang_id").on(tabel.keranjangId),
  ]
);

// 6. Security Event & Audit Log
export const aktivitasAkun = pgTable(
  "aktivitas_akun",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    penggunaId: text("pengguna_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "cascade" }),
    jenis: varchar("jenis", { length: 50 }).notNull(),
    waktu: timestamp("waktu", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: text("user_agent"),
    metadataAman: jsonb("metadata_aman"),
  },
  (tabel) => [
    index("idx_aktivitas_pengguna_waktu").on(tabel.penggunaId, tabel.waktu),
  ]
);

// 7. Klaim Pesanan Historis (Guest Order Linker)
export const klaimPesanan = pgTable(
  "klaim_pesanan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    penggunaId: text("pengguna_id")
      .notNull()
      .references(() => pengguna.id, { onDelete: "cascade" }),
    pesananId: uuid("pesanan_id")
      .notNull()
      .references(() => pesanan.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 30 }).default("menunggu_verifikasi").notNull(),
    metodeVerifikasi: varchar("metode_verifikasi", { length: 50 }).notNull(),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => [
    uniqueIndex("uq_klaim_pengguna_pesanan").on(tabel.penggunaId, tabel.pesananId),
  ]
);

// Konfigurasi Relasi Domain Akun & Autentikasi
export const penggunaRelasi = relations(pengguna, ({ many, one }) => ({
  sesi: many(sesiPengguna),
  akun: many(akunAutentikasi),
  alamat: many(alamatPelanggan),
  preferensi: one(preferensiPengguna, {
    fields: [pengguna.id],
    references: [preferensiPengguna.penggunaId],
  }),
  wishlist: many(wishlist),
  keranjang: one(keranjangAkun, {
    fields: [pengguna.id],
    references: [keranjangAkun.penggunaId],
  }),
  aktivitas: many(aktivitasAkun),
  klaim: many(klaimPesanan),
}));

export const alamatPelangganRelasi = relations(alamatPelanggan, ({ one }) => ({
  pengguna: one(pengguna, {
    fields: [alamatPelanggan.penggunaId],
    references: [pengguna.id],
  }),
}));

export const wishlistRelasi = relations(wishlist, ({ one }) => ({
  pengguna: one(pengguna, {
    fields: [wishlist.penggunaId],
    references: [pengguna.id],
  }),
  produk: one(produk, {
    fields: [wishlist.produkId],
    references: [produk.id],
  }),
  varianPreferensi: one(varianProduk, {
    fields: [wishlist.varianIdPreferensi],
    references: [varianProduk.id],
  }),
}));

export const keranjangAkunRelasi = relations(keranjangAkun, ({ one, many }) => ({
  pengguna: one(pengguna, {
    fields: [keranjangAkun.penggunaId],
    references: [pengguna.id],
  }),
  items: many(itemKeranjangAkun),
}));

export const itemKeranjangAkunRelasi = relations(itemKeranjangAkun, ({ one }) => ({
  keranjang: one(keranjangAkun, {
    fields: [itemKeranjangAkun.keranjangId],
    references: [keranjangAkun.id],
  }),
  varian: one(varianProduk, {
    fields: [itemKeranjangAkun.varianId],
    references: [varianProduk.id],
  }),
}));
