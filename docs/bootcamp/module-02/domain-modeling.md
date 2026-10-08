# VOID Supply Domain Modeling

Dokumentasi ini menetapkan model domain resmi untuk platform e-commerce merchandise VOID Supply. Seluruh entitas bisnis, aturan tipe data TypeScript, skema validasi runtime Zod, dan pemetaan tabel database PostgreSQL melalui Drizzle ORM dirancang dengan prinsip ketat: tipe data tanpa kompromi, representasi moneter berbasis bilangan bulat, serta jaminan integritas data historis transaksi.

---

## 1. Product Entity

Entitas `Produk` bertindak sebagai induk katalog untuk setiap artikel busana yang dirilis dalam format berkala (_drop-based release_). Satu entitas produk merepresentasikan desain konseptual, narasi visual, dan spesifikasi material umum.

### Atribut Produk

| Nama Atribut     | Tipe Data TypeScript   | Kolom Database                | Deskripsi & Batasan                                                           |
| :--------------- | :--------------------- | :---------------------------- | :---------------------------------------------------------------------------- |
| `id`             | `string` (UUID v4)     | `id` (uuid, PK)               | Pengidentifikasi unik produk di tingkat sistem.                               |
| `nama`           | `string`               | `nama` (varchar 255)          | Nama resmi artikel, contoh: _Void Heavyweight Oversized Tee 01_.              |
| `slug`           | `string`               | `slug` (varchar 255, unik)    | URL-friendly slug unik untuk routing SEO di `/product/[slug]`.                |
| `deskripsi`      | `string`               | `deskripsi` (text)            | Deskripsi spesifikasi kain, potongan, narasi grafis, dan instruksi perawatan. |
| `kategori`       | `KategoriProduk`       | `kategori` (varchar 50)       | Klasifikasi produk: `outerwear`, `tshirt`, `pants`, atau `accessories`.       |
| `hargaDasar`     | `number` (integer IDR) | `harga_dasar` (integer)       | Harga referensi dasar dalam satuan Rupiah tanpa sen.                          |
| `status`         | `StatusProduk`         | `status` (varchar 30)         | Status publikasi katalog: `draft`, `aktif`, atau `diarsipkan`.                |
| `gambarUtama`    | `string`               | `gambar_utama` (text)         | URL jalur gambar utama produk berasio 4:5.                                    |
| `galeriGambar`   | `string[]`             | `galeri_gambar` (jsonb)       | Koleksi URL foto lookbook dan detail teknis jahitan.                          |
| `dibuatPada`     | `Date`                 | `dibuat_pada` (timestamp)     | Waktu produk pertama kali dicatat ke dalam sistem.                            |
| `diperbaruiPada` | `Date`                 | `diperbarui_pada` (timestamp) | Waktu terakhir data produk diperbarui oleh admin.                             |

---

## 2. Product Variant

Entitas `VarianProduk` merepresentasikan unit stok fisik (_Stock Keeping Unit_ atau SKU) yang dapat dibeli oleh pelanggan. Setiap varian memiliki ukuran tertentu, bobot fisik untuk kalkulasi logistik, serta kuantitas inventaris terisolasi.

### Atribut Varian Produk

| Nama Atribut     | Tipe Data TypeScript    | Kolom Database                | Deskripsi & Batasan                                                   |
| :--------------- | :---------------------- | :---------------------------- | :-------------------------------------------------------------------- |
| `id`             | `string` (UUID v4)      | `id` (uuid, PK)               | Pengidentifikasi unik varian.                                         |
| `produkId`       | `string` (UUID v4)      | `produk_id` (uuid, FK)        | Kunci relasi mengarah ke tabel `produk`.                              |
| `ukuran`         | `UkuranProduk`          | `ukuran` (varchar 10)         | Pilihan ukuran resmi: `S`, `M`, `L`, `XL`, atau `XXL`.                |
| `sku`            | `string`                | `sku` (varchar 100, unik)     | Kode inventaris terstandarisasi, contoh: `VOID-NT04-TEE-BLK-L`.       |
| `stok`           | `number` (integer >= 0) | `stok` (integer)              | Jumlah stok fisik aktif yang siap dijual.                             |
| `beratGram`      | `number` (integer > 0)  | `berat_gram` (integer)        | Bobot aktual garmen per gram untuk perhitungan ongkos kirim Biteship. |
| `harga`          | `number` (integer IDR)  | `harga` (integer)             | Harga final varian dalam Rupiah (dapat berbeda antar ukuran khusus).  |
| `dibuatPada`     | `Date`                  | `dibuat_pada` (timestamp)     | Waktu varian pertama kali didaftarkan.                                |
| `diperbaruiPada` | `Date`                  | `diperbarui_pada` (timestamp) | Waktu pembaruan terakhir data varian atau penyesuaian stok.           |

### Relasi & Penguncian Inventaris

1. **Relasi Satu ke Banyak:** Satu entitas `Produk` memiliki satu atau lebih entitas `VarianProduk`.
2. **Penguncian Atomik Transaksi:** Saat proses mutasi pemotongan stok pada Server Action checkout, sistem wajib mengeksekusi kueri `FOR UPDATE` pada baris `varian_produk` yang bersangkutan. Hal ini mengeliminasi _race condition_ dan _overselling_ saat peluncuran drop eksklusif dengan lalu lintas tinggi.

---

## 3. Order Entity

Entitas `Pesanan` menyimpan kontrak transaksi komersial antara pelanggan dengan toko. Pesanan bersifat terikat dan mengelola kalkulasi finansial menyeluruh mulai dari nilai barang, ongkos kirim, hingga diskon.

### Atribut Pesanan

| Nama Atribut       | Tipe Data TypeScript   | Kolom Database                     | Deskripsi & Batasan                                                                |
| :----------------- | :--------------------- | :--------------------------------- | :--------------------------------------------------------------------------------- |
| `id`               | `string` (UUID v4)     | `id` (uuid, PK)                    | Kunci primer pesanan.                                                              |
| `nomorPesanan`     | `string`               | `nomor_pesanan` (varchar 50, unik) | Format pengenal publik terstruktur, contoh: `VOID-20261008-0089`.                  |
| `pelangganId`      | `string \| null`       | `pelanggan_id` (uuid, FK nullable) | Referensi akun pelanggan (bernilai null untuk pesanan tamu).                       |
| `namaPelanggan`    | `string`               | `nama_pelanggan` (varchar 150)     | Nama lengkap pemesan untuk keperluan verifikasi dan label paket.                   |
| `emailPelanggan`   | `string`               | `email_pelanggan` (varchar 255)    | Alamat surel aktif untuk transmisi bukti faktur dan tautan pelacakan.              |
| `teleponPelanggan` | `string`               | `telepon_pelanggan` (varchar 30)   | Nomor WhatsApp pemesan untuk konfirmasi kurir pengiriman.                          |
| `statusPesanan`    | `StatusPesanan`        | `status_pesanan` (varchar 40)      | Discriminated union status alur pesanan.                                           |
| `subtotal`         | `number` (integer IDR) | `subtotal` (integer)               | Total akumulasi harga seluruh item pesanan sebelum ongkir.                         |
| `totalOngkir`      | `number` (integer IDR) | `total_ongkir` (integer)           | Biaya pengiriman logistik resmi dari kurir rekanan.                                |
| `totalDiskon`      | `number` (integer IDR) | `total_diskon` (integer)           | Potongan harga voucher atau promosi (default: 0).                                  |
| `totalAkhir`       | `number` (integer IDR) | `total_akhir` (integer)            | Nilai final yang wajib dibayar pelanggan (`subtotal + totalOngkir - totalDiskon`). |
| `catatan`          | `string \| null`       | `catatan` (text, nullable)         | Instruksi khusus dari pembeli mengenai penanganan paket.                           |
| `dibuatPada`       | `Date`                 | `dibuat_pada` (timestamp)          | Waktu pesanan dibuat di sistem checkout.                                           |
| `diperbaruiPada`   | `Date`                 | `diperbarui_pada` (timestamp)      | Waktu terakhir perubahan status atau rincian pesanan.                              |

### Entitas Item Pesanan (`item_pesanan`)

Untuk menjamin keaslian data audit dan melindungi integritas finansial, entitas `item_pesanan` menerapkan pola **Snapshot Imutabel Lengkap**. Data produk dan varian disalin secara permanen ke dalam baris item pesanan saat transaksi dibuat:

```typescript
export interface ItemPesanan {
  readonly id: string;
  readonly pesananId: string;
  readonly varianId: string | null;
  readonly namaProduk: string;
  readonly namaVarian: string;
  readonly sku: string;
  readonly hargaSatuan: number;
  readonly beratGram: number;
  readonly jumlah: number;
  readonly subtotalItem: number;
  readonly dibuatPada: Date;
}
```

_Rasional Arsitektur:_ Jika pengelola toko mengubah harga kaos dari Rp 389.000 menjadi Rp 429.000 atau mengubah nama artikel di masa depan, catatan faktur dan riwayat transaksi pembeli terdahulu tetap otentik serta tidak mengalami mutasi nilai.

---

## 4. Payment Entity

Entitas `Pembayaran` mengelola status pembayaran transaksi daring melalui integrasi gerbang pembayaran Midtrans Snap.

### Atribut Pembayaran

| Nama Atribut           | Tipe Data TypeScript              | Kolom Database                         | Deskripsi & Batasan                                                         |
| :--------------------- | :-------------------------------- | :------------------------------------- | :-------------------------------------------------------------------------- |
| `id`                   | `string` (UUID v4)                | `id` (uuid, PK)                        | Kunci primer data pembayaran.                                               |
| `pesananId`            | `string` (UUID v4)                | `pesanan_id` (uuid, FK)                | Relasi unik menuju tabel `pesanan`.                                         |
| `gateway`              | `'midtrans'`                      | `gateway` (varchar 30)                 | Identitas penyedia gerbang pembayaran.                                      |
| `gatewayOrderId`       | `string`                          | `gateway_order_id` (varchar 100)       | ID pesanan yang didaftarkan ke Midtrans Snap API.                           |
| `gatewayTransactionId` | `string \| null`                  | `gateway_transaction_id` (varchar 100) | ID transaksi resmi dari sistem Midtrans setelah pembayaran dimulai.         |
| `metodePembayaran`     | `MetodePembayaran \| null`        | `metode_pembayaran` (varchar 50)       | Kanal bayar terpilih: `bank_transfer`, `gopay`, `qris`, atau `credit_card`. |
| `statusPembayaran`     | `StatusPembayaran`                | `status_pembayaran` (varchar 40)       | Discriminated union status gerbang pembayaran.                              |
| `snapToken`            | `string \| null`                  | `snap_token` (varchar 255)             | Token sesi Snap yang dihasilkan Server Service Layer.                       |
| `snapRedirectUrl`      | `string \| null`                  | `snap_redirect_url` (text)             | URL pengalihan halaman pembayaran Midtrans.                                 |
| `jumlahBayar`          | `number` (integer IDR)            | `jumlah_bayar` (integer)               | Nominal yang ditagihkan kepada gateway.                                     |
| `dibayarPada`          | `Date \| null`                    | `dibayar_pada` (timestamp, nullable)   | Waktu penyelesaian pembayaran terverifikasi webhook.                        |
| `metadataGateway`      | `Record<string, unknown> \| null` | `metadata_gateway` (jsonb)             | Salinan mentah muatan payload webhook Midtrans untuk audit forensik.        |
| `dibuatPada`           | `Date`                            | `dibuat_pada` (timestamp)              | Waktu sesi pembayaran diinisiasi.                                           |
| `diperbaruiPada`       | `Date`                            | `diperbarui_pada` (timestamp)          | Waktu terakhir status pembayaran dimutasi.                                  |

---

## 5. Shipping Entity

Entitas `Pengiriman` menangani informasi logistik paket pesanan, alamat tujuan domestik, serta sinkronisasi nomor resi kurir melalui integrasi Biteship API.

### Atribut Pengiriman

| Nama Atribut       | Tipe Data TypeScript   | Kolom Database                       | Deskripsi & Batasan                                              |
| :----------------- | :--------------------- | :----------------------------------- | :--------------------------------------------------------------- |
| `id`               | `string` (UUID v4)     | `id` (uuid, PK)                      | Kunci primer data logistik.                                      |
| `pesananId`        | `string` (UUID v4)     | `pesanan_id` (uuid, FK)              | Kunci relasi satu ke satu mengarah ke tabel `pesanan`.           |
| `kurir`            | `string`               | `kurir` (varchar 50)                 | Kode kurir terpilih, contoh: `jne`, `sicepat`, `jnt`.            |
| `layanan`          | `string`               | `layanan` (varchar 50)               | Jenis servis kurir, contoh: `reguler`, `next_day`, `cargo`.      |
| `nomorResi`        | `string \| null`       | `nomor_resi` (varchar 100, nullable) | Nomor resi pelacakan paket resmi dari kurir logistik.            |
| `beratTotalGram`   | `number` (integer > 0) | `berat_total_gram` (integer)         | Bobot gabungan seluruh item dalam paket.                         |
| `biayaOngkir`      | `number` (integer IDR) | `biaya_ongkir` (integer)             | Tarif final ongkos kirim yang dibayarkan pelanggan.              |
| `namaPenerima`     | `string`               | `nama_penerima` (varchar 150)        | Nama individu penerima barang di lokasi tujuan.                  |
| `teleponPenerima`  | `string`               | `telepon_penerima` (varchar 30)      | Nomor telepon kontak darurat penerima paket.                     |
| `alamatLengkap`    | `string`               | `alamat_lengkap` (text)              | Rincian nama jalan, nomor bangunan, RT/RW, dan patokan lokasi.   |
| `kota`             | `string`               | `kota` (varchar 100)                 | Kota atau kabupaten tujuan pengiriman.                           |
| `provinsi`         | `string`               | `provinsi` (varchar 100)             | Wilayah administratif provinsi penerima paket.                   |
| `kodePos`          | `string`               | `kode_pos` (varchar 10)              | Kode pos wilayah tujuan penerima paket.                          |
| `statusPengiriman` | `StatusPengiriman`     | `status_pengiriman` (varchar 40)     | Discriminated union siklus hidup pengiriman paket.               |
| `estimasiHari`     | `string`               | `estimasi_hari` (varchar 30)         | Rentang estimasi waktu paket tiba di tujuan (misal: _2-3 hari_). |
| `dibuatPada`       | `Date`                 | `dibuat_pada` (timestamp)            | Waktu manifest pengiriman dibuat di sistem.                      |
| `diperbaruiPada`   | `Date`                 | `diperbarui_pada` (timestamp)        | Waktu terakhir status pelacakan logistik diperbarui.             |

---

## 6. TypeScript Rules

Penerapan TypeScript pada repositori VOID Supply menganut standar keamanan ketat untuk meniadakan celah galat kompilasi dan runtime:

### A. Strict Type Safety & Larangan Mutlak `any`

Penggunaan tipe `any` dilarang tanpa toleransi di seluruh berkas proyek. Apabila bentuk data eksternal belum dapat dipastikan pada saat parsing, gunakan tipe `unknown` lalu verifikasi secara ketat melalui skema Zod sebelum dipakai oleh logika bisnis.

### B. Single Source of Truth via Zod Inference

Tipe data domain tidak didefinisikan secara manual secara terpisah dari validasi. Seluruh antarmuka model diturunkan secara langsung dari skema Zod menggunakan operator `z.infer`:

```typescript
import { z } from "zod";

export const varianProdukSkema = z.object({
  id: z.string().uuid(),
  produkId: z.string().uuid(),
  ukuran: z.enum(["S", "M", "L", "XL", "XXL"]),
  sku: z.string().min(3),
  stok: z.number().int().nonnegative(),
  beratGram: z.number().int().positive(),
  harga: z.number().int().positive(),
  dibuatPada: z.date(),
  diperbaruiPada: z.date(),
});

export type VarianProduk = z.infer<typeof varianProdukSkema>;
```

### C. Discriminated Unions untuk State Mutasi

Status siklus transaksi, status pembayaran, dan proses pengiriman wajib dinyatakan dalam bentuk _discriminated unions_ guna memastikan bahwa properti yang relevan hanya dapat diakses saat status valid:

```typescript
export type StatusPesanan =
  | { status: "menunggu_pembayaran"; batasWaktuPembayaran: Date }
  | { status: "diproses"; dibayarPada: Date }
  | { status: "dikirim"; nomorResi: string; kurir: string }
  | { status: "selesai"; diterimaPada: Date }
  | { status: "dibatalkan"; alasanPembatalan: string };

export type StatusPembayaran =
  | { status: "menunggu_pembayaran"; snapToken: string }
  | { status: "berhasil"; transactionId: string; dibayarPada: Date }
  | { status: "gagal"; pesanGalat: string }
  | { status: "kadaluwarsa"; kadaluwarsaPada: Date };

export type StatusPengiriman =
  | { status: "menunggu_resi" }
  | { status: "manifested"; nomorResi: string }
  | { status: "on_transit"; lokasiTerkini: string }
  | { status: "delivered"; diterimaOleh: string; waktuDiterima: Date }
  | { status: "returned"; alasanRetur: string };
```

### D. Integritas Moneter Berbasis Integer IDR

Semua atribut harga, ongkos kirim, diskon, dan subtotal dinyatakan sebagai bilangan bulat murni (`number` bulat tanpa koma desimal). Angka Rp 389.000 disimpan sebagai nilai `389000`. Hal ini mencegah cacat pembulatan floating-point IEEE 754 dalam penghitungan akumulasi keranjang belanja dan rekonsiliasi pembayaran.

---

## 7. Database Mapping

Pemetaan entitas domain TypeScript ke tabel relasional PostgreSQL 18 dijalankan dengan Drizzle ORM (`src/lib/db/schema.ts`). Semua penamaan tabel dan kolom konsisten mematuhi konvensi Bahasa Indonesia:

### Hubungan Relasi Antar Tabel

```
produk (1) ─────────────< (N) varian_produk
  │
  │
pesanan (1) ────────────< (N) item_pesanan >──────────── (0..1) varian_produk (snapshot FK)
  │
  ├─── (1) ───────────── (1) pembayaran
  │
  └─── (1) ───────────── (1) pengiriman
```

### Definisi Skema Tabel Drizzle ORM

```typescript
import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabel Induk Produk
export const produk = pgTable("produk", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  deskripsi: text("deskripsi").notNull(),
  kategori: varchar("kategori", { length: 50 }).notNull(),
  hargaDasar: integer("harga_dasar").notNull(),
  status: varchar("status", { length: 30 }).default("aktif").notNull(),
  gambarUtama: text("gambar_utama").notNull(),
  galeriGambar: jsonb("galeri_gambar").$type<string[]>().default([]).notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Tabel Varian Fisik dan Stok
export const varianProduk = pgTable("varian_produk", {
  id: uuid("id").defaultRandom().primaryKey(),
  produkId: uuid("produk_id")
    .references(() => produk.id, { onDelete: "cascade" })
    .notNull(),
  ukuran: varchar("ukuran", { length: 10 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  stok: integer("stok").default(0).notNull(),
  beratGram: integer("berat_gram").default(500).notNull(),
  harga: integer("harga").notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Tabel Transaksi Pesanan
export const pesanan = pgTable("pesanan", {
  id: uuid("id").defaultRandom().primaryKey(),
  nomorPesanan: varchar("nomor_pesanan", { length: 50 }).notNull().unique(),
  pelangganId: uuid("pelanggan_id"),
  namaPelanggan: varchar("nama_pelanggan", { length: 150 }).notNull(),
  emailPelanggan: varchar("email_pelanggan", { length: 255 }).notNull(),
  teleponPelanggan: varchar("telepon_pelanggan", { length: 30 }).notNull(),
  statusPesanan: varchar("status_pesanan", { length: 40 }).default("menunggu_pembayaran").notNull(),
  subtotal: integer("subtotal").notNull(),
  totalOngkir: integer("total_ongkir").notNull(),
  totalDiskon: integer("total_diskon").default(0).notNull(),
  totalAkhir: integer("total_akhir").notNull(),
  catatan: text("catatan"),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Tabel Baris Item Transaksi (Snapshot Imutabel)
export const itemPesanan = pgTable("item_pesanan", {
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
});

// Tabel Pembayaran Gateway
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
  statusPembayaran: varchar("status_pembayaran", { length: 40 })
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

// Tabel Logistik dan Pengiriman
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
  statusPengiriman: varchar("status_pengiriman", { length: 40 }).default("menunggu_resi").notNull(),
  estimasiHari: varchar("estimasi_hari", { length: 30 }).notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Relasi Drizzle ORM
export const produkRelasi = relations(produk, ({ many }) => ({
  varian: many(varianProduk),
}));

export const varianProdukRelasi = relations(varianProduk, ({ one }) => ({
  produk: one(produk, {
    fields: [varianProduk.produkId],
    references: [produk.id],
  }),
}));

export const pesananRelasi = relations(pesanan, ({ many, one }) => ({
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
```

---

## 8. Strategi Indeks dan Performa Kueri

Untuk memastikan performa kueri optimal dan mencegah beban tabel saat pesanan melonjak, indeks berikut wajib diterapkan pada PostgreSQL:

1. **Indeks Unik Berkecepatan Tinggi:**
   - `produk.slug` (pencarian halaman katalog produk berkecepatan O(1)).
   - `varian_produk.sku` (pencarian stok dan pemindaian barcode fisik).
   - `pesanan.nomor_pesanan` (pencarian status pesanan oleh pembeli dan admin).
2. **Foreign Key Indexing:**
   - Indeks pada `varian_produk.produk_id` dan `item_pesanan.pesanan_id` untuk mempercepat operasi `JOIN`.
3. **Composite Index Pencarian Status Transaksi:**
   - Indeks gabungan pada `(status_pesanan, dibuat_pada)` untuk mempercepat kueri dashboard admin dan pembersihan pesanan kedaluwarsa secara berkala.
