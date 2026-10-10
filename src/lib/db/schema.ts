import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// 0. PostgreSQL Enums (Life Cycle & State Machine)
export const statusProdukEnum = pgEnum("status_produk", ["draft", "aktif", "habis", "arsip"]);

export const statusPesananEnum = pgEnum("status_pesanan", [
  "menunggu_pembayaran",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
]);

export const statusPembayaranEnum = pgEnum("status_pembayaran", [
  "menunggu_pembayaran",
  "berhasil",
  "kadaluarsa",
  "gagal",
  "dikembalikan",
]);

export const statusPengirimanEnum = pgEnum("status_pengiriman", [
  "menunggu_resi",
  "dalam_pengiriman",
  "terkirim",
  "gagal",
]);

// 1. Tabel Pelanggan (Customer Profile & Buyer Entity)
export const pelanggan = pgTable("pelanggan", {
  id: uuid("id").defaultRandom().primaryKey(),
  namaLengkap: varchar("nama_lengkap", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  telepon: varchar("telepon", { length: 30 }),
  alamatDefault: text("alamat_default"),
  kotaDefault: varchar("kota_default", { length: 100 }),
  provinsiDefault: varchar("provinsi_default", { length: 100 }),
  kodePosDefault: varchar("kode_pos_default", { length: 10 }),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Tabel Kategori Produk (Taksonomi Fisik Busana)
export const kategori = pgTable("kategori", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").default(0).notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Tabel Koleksi / Drops (Kurasi Rilis Terbatas)
export const koleksi = pgTable("koleksi", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: varchar("nama", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  deskripsi: text("deskripsi"),
  nomorDrop: varchar("nomor_drop", { length: 20 }),
  bannerGambar: text("banner_gambar"),
  apakahAktif: boolean("apakah_aktif").default(true).notNull(),
  rilisPada: timestamp("rilis_pada", { withTimezone: true }),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Interface Tipe Data Garmen Spesifik (JSONB)
export interface SpesifikasiGarmen {
  material: {
    komposisi: string;
    gramasi: string;
    pewarnaan: string;
    finishing: string;
  };
  konstruksi: {
    jahitan: string;
    kerahRib: string;
    teknikGrafis: string;
    label: string;
  };
  perawatan: {
    suhuCuci: string;
    bahanKimia: string;
    pengeringan: string;
    penyetrikaan: string;
  };
}

export interface DimensiUkuranGarmen {
  ukuran: string;
  panjangBadan?: number;
  lebarDada?: number;
  panjangLengan?: number;
  panjangCelana?: number;
  lingkarPinggang?: number;
  lebarPaha?: number;
  lingkarKepala?: number;
}

// 4. Tabel Induk Produk (Master Artikel Merchandise)
export const produk = pgTable(
  "produk",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kategoriId: uuid("kategori_id")
      .references(() => kategori.id, { onDelete: "restrict" })
      .notNull(),
    nama: varchar("nama", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    deskripsi: text("deskripsi").notNull(),
    hargaDasar: integer("harga_dasar").notNull(),
    status: statusProdukEnum("status").default("aktif").notNull(),
    gambarUtama: text("gambar_utama").notNull(),
    galeriGambar: jsonb("galeri_gambar").$type<string[]>().default([]).notNull(),
    spesifikasi: jsonb("spesifikasi").$type<SpesifikasiGarmen>(),
    panduanUkuran: jsonb("panduan_ukuran").$type<DimensiUkuranGarmen[]>(),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
    diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => ({
    checkHargaDasar: check("check_produk_harga_dasar", sql`${tabel.hargaDasar} >= 0`),
  })
);

// 5. Tabel Junction Produk ke Koleksi (M:N)
export const produkKeKoleksi = pgTable(
  "produk_ke_koleksi",
  {
    produkId: uuid("produk_id")
      .references(() => produk.id, { onDelete: "cascade" })
      .notNull(),
    koleksiId: uuid("koleksi_id")
      .references(() => koleksi.id, { onDelete: "cascade" })
      .notNull(),
  },
  (tabel) => ({
    pk: primaryKey({ columns: [tabel.produkId, tabel.koleksiId] }),
  })
);

// 6. Tabel Varian Fisik dan Stok (SKU per Ukuran & Warna)
export const varianProduk = pgTable(
  "varian_produk",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    produkId: uuid("produk_id")
      .references(() => produk.id, { onDelete: "cascade" })
      .notNull(),
    ukuran: varchar("ukuran", { length: 10 }).notNull(),
    warna: varchar("warna", { length: 50 }).default("Hitam").notNull(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    stok: integer("stok").default(0).notNull(),
    beratGram: integer("berat_gram").default(500).notNull(),
    harga: integer("harga").notNull(),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
    diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => ({
    checkStok: check("check_varian_stok", sql`${tabel.stok} >= 0`),
    checkHarga: check("check_varian_harga", sql`${tabel.harga} >= 0`),
    checkBerat: check("check_varian_berat", sql`${tabel.beratGram} > 0`),
  })
);

// 7. Tabel Transaksi Pesanan
export const pesanan = pgTable(
  "pesanan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nomorPesanan: varchar("nomor_pesanan", { length: 50 }).notNull().unique(),
    pelangganId: uuid("pelanggan_id").references(() => pelanggan.id, { onDelete: "set null" }),
    namaPelanggan: varchar("nama_pelanggan", { length: 150 }).notNull(),
    emailPelanggan: varchar("email_pelanggan", { length: 255 }).notNull(),
    teleponPelanggan: varchar("telepon_pelanggan", { length: 30 }).notNull(),
    statusPesanan: statusPesananEnum("status_pesanan").default("menunggu_pembayaran").notNull(),
    subtotal: integer("subtotal").notNull(),
    totalOngkir: integer("total_ongkir").notNull(),
    totalDiskon: integer("total_diskon").default(0).notNull(),
    totalAkhir: integer("total_akhir").notNull(),
    catatan: text("catatan"),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
    diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => ({
    checkSubtotal: check("check_pesanan_subtotal", sql`${tabel.subtotal} >= 0`),
    checkTotalAkhir: check("check_pesanan_total_akhir", sql`${tabel.totalAkhir} >= 0`),
  })
);

// 8. Tabel Item Transaksi (Snapshot Imutabel)
export const itemPesanan = pgTable(
  "item_pesanan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pesananId: uuid("pesanan_id")
      .references(() => pesanan.id, { onDelete: "cascade" })
      .notNull(),
    varianId: uuid("varian_id").references(() => varianProduk.id, { onDelete: "set null" }),
    namaProduk: varchar("nama_produk", { length: 255 }).notNull(),
    namaVarian: varchar("nama_varian", { length: 50 }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    hargaSatuan: integer("harga_satuan").notNull(),
    beratGram: integer("berat_gram").notNull(),
    jumlah: integer("jumlah").notNull(),
    subtotalItem: integer("subtotal_item").notNull(),
    dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  },
  (tabel) => ({
    checkJumlah: check("check_item_jumlah", sql`${tabel.jumlah} > 0`),
    checkHargaSatuan: check("check_item_harga_satuan", sql`${tabel.hargaSatuan} >= 0`),
  })
);

// 9. Tabel Pembayaran Gateway (Midtrans)
export const pembayaran = pgTable("pembayaran", {
  id: uuid("id").defaultRandom().primaryKey(),
  pesananId: uuid("pesanan_id")
    .references(() => pesanan.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  gateway: varchar("gateway", { length: 30 }).default("midtrans").notNull(),
  gatewayOrderId: varchar("gateway_order_id", { length: 100 }).notNull(),
  gatewayTransactionId: varchar("gateway_transaction_id", { length: 100 }),
  metodePembayaran: varchar("metode_pembayaran", { length: 50 }),
  statusPembayaran: statusPembayaranEnum("status_pembayaran")
    .default("menunggu_pembayaran")
    .notNull(),
  snapToken: varchar("snap_token", { length: 255 }),
  snapRedirectUrl: text("snap_redirect_url"),
  jumlahBayar: integer("jumlah_bayar").notNull(),
  dibayarPada: timestamp("dibayar_pada", { withTimezone: true }),
  metadataGateway: jsonb("metadata_gateway"),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// 10. Tabel Logistik dan Pengiriman (Biteship)
export const pengiriman = pgTable("pengiriman", {
  id: uuid("id").defaultRandom().primaryKey(),
  pesananId: uuid("pesanan_id")
    .references(() => pesanan.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  kurir: varchar("kurir", { length: 50 }).notNull(),
  layanan: varchar("layanan", { length: 50 }).notNull(),
  nomorResi: varchar("nomor_resi", { length: 100 }),
  beratTotalGram: integer("berat_total_gram").notNull(),
  biayaOngkir: integer("biaya_ongkir").notNull(),
  namaPenerima: varchar("nama_penerima", { length: 150 }).notNull(),
  teleponPenerima: varchar("telepon_penerima", { length: 30 }).notNull(),
  alamatLengkap: text("alamat_lengkap").notNull(),
  kota: varchar("kota", { length: 100 }).notNull(),
  provinsi: varchar("provinsi", { length: 100 }).notNull(),
  kodePos: varchar("kode_pos", { length: 10 }).notNull(),
  statusPengiriman: statusPengirimanEnum("status_pengiriman").default("menunggu_resi").notNull(),
  estimasiHari: varchar("estimasi_hari", { length: 30 }).notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Konfigurasi Relasi Drizzle ORM
export const pelangganRelasi = relations(pelanggan, ({ many }) => ({
  pesanan: many(pesanan),
}));

export const kategoriRelasi = relations(kategori, ({ many }) => ({
  produk: many(produk),
}));

export const koleksiRelasi = relations(koleksi, ({ many }) => ({
  produkKoleksi: many(produkKeKoleksi),
}));

export const produkRelasi = relations(produk, ({ one, many }) => ({
  kategoriRelasi: one(kategori, {
    fields: [produk.kategoriId],
    references: [kategori.id],
  }),
  varian: many(varianProduk),
  koleksiRelasi: many(produkKeKoleksi),
}));

export const produkKeKoleksiRelasi = relations(produkKeKoleksi, ({ one }) => ({
  produk: one(produk, {
    fields: [produkKeKoleksi.produkId],
    references: [produk.id],
  }),
  koleksi: one(koleksi, {
    fields: [produkKeKoleksi.koleksiId],
    references: [koleksi.id],
  }),
}));

export const varianProdukRelasi = relations(varianProduk, ({ one }) => ({
  produk: one(produk, {
    fields: [varianProduk.produkId],
    references: [produk.id],
  }),
}));

export const pesananRelasi = relations(pesanan, ({ many, one }) => ({
  pelanggan: one(pelanggan, {
    fields: [pesanan.pelangganId],
    references: [pelanggan.id],
  }),
  items: many(itemPesanan),
  pembayaran: one(pembayaran, {
    fields: [pesanan.id],
    references: [pembayaran.pesananId],
  }),
  pengiriman: one(pengiriman, {
    fields: [pesanan.id],
    references: [pengiriman.pesananId],
  }),
}));
