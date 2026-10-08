# Data Layer Strategy

Dokumentasi ini menetapkan arsitektur lapisan data (_Data Layer Strategy_) resmi untuk platform e-commerce merchandise VOID Supply. Arsitektur ini mengatur klasifikasi data, pola isolasi tanggung jawab (_Layer Responsibility_), alur kerja Repository dan Service berorientasi fungsi, serta perancangan relasi basis data PostgreSQL melalui Drizzle ORM.

---

## 1. Server Data

Server Data mencakup seluruh informasi persisten yang bersumber dari basis data PostgreSQL atau sistem pihak ketiga tepercaya. Karakteristik utama dari Server Data adalah sifatnya yang berwibawa (_authoritative_), membutuhkan jaminan keamanan tingkat server, dan harus dilindungi dari manipulasi langsung di sisi peramban pengguna.

### Contoh Server Data pada VOID Supply:

- Katalog artikel produk, rincian varian stok fisik, kategori pakaian, dan kurasi koleksi drop berkala.
- Rekod faktur pesanan, item transaksi snapshot, riwayat pembayaran Midtrans, dan nomor resi Biteship.
- Data profil akun pelanggan dan alamat tersimpan.

### Mekanisme Pengelolaan:

1. **Server Components (Next.js 16 App Router):**
   Server Component menjadi pintu gerbang utama dalam membaca Server Data secara langsung pada lingkungan server node. Pola ini meniadakan latensi ganda bolak-balik klien-ke-server (_client-server roundtrips_) dan memangkas ukuran bundel JavaScript peramban karena logika kueri tidak pernah dikirim ke browser pembeli.
2. **TanStack Query (Client-Side Caching):**
   Digunakan secara selektif pada komponen interaktif yang membutuhkan pembaruan data berkala di sisi klien tanpa memuat ulang dokumen HTML secara keseluruhan, seperti pengecekan real-time ketersediaan stok drop atau kalkulasi estimasi ongkos kirim saat pengguna memilih alamat.

---

## 2. Client State

Client State merupakan data sementara yang hidup di memori peramban dan sepenuhnya dimiliki oleh sesi interaksi pengguna. Data ini bersifat sementara, sering bermutasi seiring tindakan antarmuka pengguna, dan tidak memerlukan persistensi langsung ke basis data utama setiap kali terjadi interaksi kecil.

### Contoh Client State pada VOID Supply:

- Status visibilitas laci keranjang belanja (_Cart Drawer Open/Close_).
- Pilihan varian ukuran sementara pada kartu produk sebelum ditekan tombol beli.
- Status pembukaan modal panduan ukuran garmen (_Size Guide Dialog_).
- Filter aktif pada halaman katalog (pilihan kategori atau pengurutan harga di sisi UI).

### Mekanisme Pengelolaan via Zustand:

Penyimpanan global klien dikelola oleh pustaka Zustand yang terisolasi. Khusus untuk tas belanja (_cart_), Zustand dipadukan dengan _middleware_ `persist` ke `localStorage` peramban. Pola ini memungkinkan calon pembeli menyimpan barang pilihan mereka tanpa kewajiban membuat akun terlebih dahulu.

---

## 3. Form State

Form State menangani data masukan pengguna yang sedang aktif diketikkan pada antarmuka formulir sebelum dikirimkan ke server. Lapisan ini menuntut validasi ketat, pelacakan status interaksi masukan (_dirty, touched, submitting_), dan penanganan pesan kesalahan yang ramah pengguna.

### Contoh Form State pada VOID Supply:

- Formulir informasi pengiriman checkout: nama lengkap, nomor WhatsApp, alamat jalan, kota tujuan, dan kode pos.
- Formulir pemilihan kurir pengiriman dan opsi paket layanan.
- Formulir input kupon promosi atau instruksi catatan paket.

### Mekanisme Pengelolaan:

Form State diorkestrasi menggunakan pustaka **React Hook Form** yang dipadukan dengan **Zod** melalui `@hookform/resolvers/zod`. Validasi berjalan secara instan pada sisi klien saat pengguna mengisi kolom input, sementara skema Zod yang sama digunakan kembali secara identik di Server Action untuk menjamin keamanan mutasi data di sisi server (_Single Source of Truth_).

---

## 4. Data Flow

Pergerakan data pada VOID Supply menganut alur searah (_Unidirectional Layered Flow_) yang tegas. Setiap lapisan memiliki batas yurisdiksi yang terisolasi tanpa lompatan tanggung jawab langsung:

```text
Basis Data (PostgreSQL 18)
          │
          ▼
    Drizzle ORM
          │
          ▼
   Repository Layer (src/features/*/repositories)
          │
          ▼
    Service Layer (src/features/*/services)
          │
          ▼
   Server Component (src/app/*/page.tsx)
          │
          ▼
     UI Component (src/features/*/components)
```

### Penegasan Batas Tanggung Jawab (_Layer Responsibility_):

| Lapisan Kode                | Hak Akses & Tanggung Jawab yang Diperbolehkan                                                                                                            | Larangan Keras (_Strict Boundaries_)                                                                                                        |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Component Layer**         | Merender antarmuka visual, menerima props, menangani event interaksi pengguna, dan memanggil hooks.                                                      | Dilarang menjalankan kueri SQL/Drizzle, dilarang mengakses API gateway eksternal, dan dilarang membaca environment secrets secara langsung. |
| **Service Layer**           | Mengorkestrasi logika bisnis, mentransformasi bentuk data mentah menjadi DTO antarmuka, mengeksekusi validasi domain, dan memanggil integrasi eksternal. | Dilarang merender JSX/HTML dan dilarang menulis sintaks kueri database tingkat rendah secara langsung.                                      |
| **Repository Layer**        | Menjalankan kueri basis data langsung menggunakan Drizzle ORM, mengelola operasi transaksi atomik, dan menangani penguncian baris inventaris.            | Dilarang memuat logika bisnis terapan atau manipulasi status antarmuka pengguna.                                                            |
| **Lib Layer (`src/lib/*`)** | Menyediakan klien SDK mandiri pihak ketiga (Midtrans Snap, Biteship API, koneksi pool PostgreSQL).                                                       | Dilarang mengonsumsi kode fitur secara melingkar (_no circular dependencies_).                                                              |

---

## 5. Repository Pattern

Pola Repository bertindak sebagai abstraksi tipis di atas Drizzle ORM untuk mengisolasi operasi kueri basis data dari logika bisnis aplikasi. Berdasarkan standar rekayasa modern Next.js 16, Repository diimplementasikan sebagai **Functional Object Module** guna memaksimalkan efisiensi _tree-shaking_ dan mempermudah proses pembuatan _unit test_ di Vitest:

### Contoh Struktur `product.repository.ts`

```typescript
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { produk, varianProduk, kategori } from "@/lib/db/schema";

export const productRepository = {
  async temukanSemuaAktif() {
    return db.query.produk.findMany({
      where: eq(produk.status, "aktif"),
      with: {
        varian: true,
        kategoriRelasi: true,
      },
      orderBy: [desc(produk.dibuatPada)],
    });
  },

  async temukanBerdasarkanSlug(slug: string) {
    return db.query.produk.findFirst({
      where: and(eq(produk.slug, slug), eq(produk.status, "aktif")),
      with: {
        varian: true,
        kategoriRelasi: true,
      },
    });
  },

  async temukanBerdasarkanKategori(kategoriSlug: string) {
    return db.query.produk.findMany({
      where: eq(produk.status, "aktif"),
      with: {
        varian: true,
        kategoriRelasi: {
          where: eq(kategori.slug, kategoriSlug),
        },
      },
      orderBy: [desc(produk.dibuatPada)],
    });
  },
};

export type ProductRepository = typeof productRepository;
```

---

## 6. Service Pattern

Lapisan Service bertindak sebagai pusat pengambilan keputusan dan orkestrasi aturan bisnis. Service mengonsumsi Repository untuk mengambil data, menerapkan aturan domain (seperti perhitungan ketersediaan stok, penentuan badge status drop, atau kalkulasi diskon), dan mengembalikan data dalam kontrak tipe yang bersih ke Server Component:

### Contoh Struktur `catalog.service.ts`

```typescript
import { productRepository } from "../repositories/product.repository";
import type { ProdukRingkasan, ProdukDetail } from "../types/product.type";

export const catalogService = {
  async ambilDaftarKatalog(): Promise<ProdukRingkasan[]> {
    const daftarProduk = await productRepository.temukanSemuaAktif();

    return daftarProduk.map((item) => {
      const totalStok = item.varian.reduce((akumulator, v) => akumulator + v.stok, 0);
      const varianTersedia = item.varian.filter((v) => v.stok > 0);

      return {
        id: item.id,
        nama: item.nama,
        slug: item.slug,
        kategori: item.kategori,
        hargaDasar: item.hargaDasar,
        gambarUtama: item.gambarUtama,
        totalStok,
        apakahHabis: totalStok === 0,
        apakahStokMenipis: totalStok > 0 && totalStok < 10,
        ukuranTersedia: varianTersedia.map((v) => v.ukuran),
      };
    });
  },

  async ambilDetailProduk(slug: string): Promise<ProdukDetail | null> {
    const item = await productRepository.temukanBerdasarkanSlug(slug);
    if (!item) return null;

    return {
      id: item.id,
      nama: item.nama,
      slug: item.slug,
      deskripsi: item.deskripsi,
      kategori: item.kategori,
      hargaDasar: item.hargaDasar,
      gambarUtama: item.gambarUtama,
      galeriGambar: item.galeriGambar as string[],
      varian: item.varian.map((v) => ({
        id: v.id,
        ukuran: v.ukuran,
        sku: v.sku,
        stok: v.stok,
        beratGram: v.beratGram,
        harga: v.harga,
      })),
    };
  },
};

export type CatalogService = typeof catalogService;
```

---

## 7. Database Relationship

Skema relasional basis data untuk katalog VOID Supply dirancang mengikuti model domain e-commerce berkala (_drop-based merchandise_), memisahkan taksonomi kategori fisik dengan kurasi peluncuran koleksi eksklusif:

### Diagram Relasi Entitas

```text
kategori (1) ─────────────< (N) produk (1) ─────────────< (N) varian_produk
                                  │
                                  │ (M)
                                  ▼
                         produk_ke_koleksi (Junction)
                                  ▲
                                  │ (N)
                               koleksi (1)
```

### Prinsip Relasi:

1. **Produk ke Kategori (1:N):** Setiap artikel busana bernaung di bawah 1 Kategori utama yang permanen (misal: _Outerwear_, _T-Shirt_, _Pants_, atau _Accessories_) melalui kolom `produk.kategori_id`.
2. **Produk ke Koleksi (M:N):** Satu produk dapat dimasukkan ke dalam beberapa kurasi koleksi atau kampanye peluncuran berkala (misal: dimasukkan ke dalam _Drop 04: Night Transmission_ dan sekaligus _All-Black Capsule_) melalui tabel perantara `produk_ke_koleksi`.
3. **Produk ke Varian Produk (1:N):** Satu produk menaungi beberapa varian fisik ukuran (`S`, `M`, `L`, `XL`, `XXL`) dengan kuantitas stok independen dan kode SKU unik.

### Definisi Skema Tabel Drizzle ORM Lengkap

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabel Kategori Produk (Taksonomi Fisik)
export const kategori = pgTable("kategori", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").default(0).notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Tabel Koleksi / Drops (Kurasi Rilis Berkala)
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

// Tabel Induk Produk
export const produk = pgTable("produk", {
  id: uuid("id").defaultRandom().primaryKey(),
  kategoriId: uuid("kategori_id")
    .references(() => kategori.id, { onDelete: "restrict" })
    .notNull(),
  nama: varchar("nama", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  deskripsi: text("deskripsi").notNull(),
  hargaDasar: integer("harga_dasar").notNull(),
  status: varchar("status", { length: 30 }).default("aktif").notNull(),
  gambarUtama: text("gambar_utama").notNull(),
  galeriGambar: text("galeri_gambar").array().notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Tabel Junction Produk ke Koleksi (M:N)
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

// Konfigurasi Relasi Drizzle ORM
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
```
