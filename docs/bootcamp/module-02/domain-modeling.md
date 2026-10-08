# VOID Supply Domain Modeling

Dokumentasi ini menetapkan model domain resmi untuk platform e-commerce merchandise VOID Supply. Seluruh entitas bisnis, aturan tipe data TypeScript, skema validasi runtime Zod, manajemen aset visual, serta pemetaan tabel database PostgreSQL melalui Drizzle ORM dirancang dengan standar rekayasa siap produksi: tipe data ketat tanpa kompromi, representasi moneter berbasis bilangan bulat, jaminan integritas data historis transaksi, dan alur pengalaman pengguna yang responsif.

---

## 1. Product Entity

Entitas `Produk` bertindak sebagai induk katalog untuk setiap artikel busana yang dirilis berkala dalam format _drop-based release_. Setiap entitas produk menyimpan konsep desain, narasi visual, identifikasi kategori, serta spesifikasi material garmen.

### Atribut Produk

| Nama Atribut     | Tipe Data TypeScript   | Kolom Database                    | Deskripsi & Batasan                                                                       |
| :--------------- | :--------------------- | :-------------------------------- | :---------------------------------------------------------------------------------------- |
| `id`             | `string` (UUID v7)     | `id` (uuid, PK)                   | Kunci primer sistem terurut waktu (_time-ordered_).                                       |
| `nama`           | `string`               | `nama` (varchar 255)              | Nama resmi artikel streetwear, misal: _Void Heavyweight Tee 01_.                          |
| `slug`           | `string`               | `slug` (varchar 255, unik)        | URL-friendly slug unik untuk optimasi mesin pencari pada rute `/product/[slug]`.          |
| `deskripsi`      | `string`               | `deskripsi` (text)                | Uraian material katun, gramasi kain, dan panduan perawatan pakaian.                       |
| `kategori`       | `KategoriProduk`       | `kategori` (kategori_produk_enum) | Klasifikasi produk menggunakan enum: `outerwear`, `tshirt`, `pants`, atau `accessories`.  |
| `hargaDasar`     | `number` (integer IDR) | `harga_dasar` (integer)           | Nilai dasar acuan barang dalam Rupiah bulat tanpa pecahan sen.                            |
| `status`         | `StatusProduk`         | `status` (status_produk_enum)     | Status tayang katalog: `draft`, `aktif`, atau `diarsipkan`.                               |
| `gambarUtama`    | `string`               | `gambar_utama` (text)             | Jalur relatif berkas gambar utama produk berasio 4:5 di folder `public/images/products/`. |
| `galeriGambar`   | `string[]`             | `galeri_gambar` (jsonb)           | Koleksi URL foto lookbook sudut sekunder dan detail jahitan garmen.                       |
| `dibuatPada`     | `Date`                 | `dibuat_pada` (timestamp)         | Catatan waktu saat entitas pertama kali disimpan ke dalam database.                       |
| `diperbaruiPada` | `Date`                 | `diperbarui_pada` (timestamp)     | Waktu terakhir pembaruan atribut katalog dilakukan oleh administrator.                    |

---

## 2. Product Variant

Entitas `VarianProduk` merepresentasikan unit stok fisik (_Stock Keeping Unit_ atau SKU) yang dapat dibeli oleh pelanggan. Setiap varian memisahkan inventaris per ukuran, mencatat bobot riil untuk kalkulasi ongkir logistik, serta menjaga kuantitas stok agar tetap atomik.

### Atribut Varian Produk

| Nama Atribut     | Tipe Data TypeScript    | Kolom Database                | Deskripsi & Batasan                                                 |
| :--------------- | :---------------------- | :---------------------------- | :------------------------------------------------------------------ |
| `id`             | `string` (UUID v7)      | `id` (uuid, PK)               | Kunci primer varian fisik.                                          |
| `produkId`       | `string` (UUID v7)      | `produk_id` (uuid, FK)        | Kunci asing terindeks yang merujuk langsung ke tabel `produk`.      |
| `ukuran`         | `UkuranProduk`          | `ukuran` (ukuran_produk_enum) | Standarisasi ukuran pakaian: `S`, `M`, `L`, `XL`, atau `XXL`.       |
| `sku`            | `string`                | `sku` (varchar 100, unik)     | Kode identifikasi terstruktur, contoh: `VOID-D04-TEE-BLK-L`.        |
| `stok`           | `number` (integer >= 0) | `stok` (integer)              | Kuantitas unit fisik tersedia dengan batasan `CHECK (stok >= 0)`.   |
| `beratGram`      | `number` (integer > 0)  | `berat_gram` (integer)        | Berat riil garmen dalam gram untuk kalkulasi ongkir kurir Biteship. |
| `harga`          | `number` (integer IDR)  | `harga` (integer)             | Harga transaksi final varian dalam mata uang Rupiah.                |
| `dibuatPada`     | `Date`                  | `dibuat_pada` (timestamp)     | Timestamp inisiasi varian fisik.                                    |
| `diperbaruiPada` | `Date`                  | `diperbarui_pada` (timestamp) | Waktu terakhir penyesuaian kuantitas stok varian.                   |

### Relasi & Keamanan Mutasi Stok

Satu entitas `Produk` menaungi banyak entitas `VarianProduk`. Ketika checkout berlangsung dengan lonjakan lalu lintas tinggi pada drop terbatas, mutasi pemotongan stok pada Server Action wajib menjalankan klausa kueri `FOR UPDATE` terhadap baris varian terpilih untuk mencegah _overselling_.

---

## 3. Order Entity & Item Pesanan

Entitas `Pesanan` mengikat kontrak transaksi finansial antara pembeli dan toko, mencakup rincian penerima, kalkulasi subtotal, diskon promosi, dan ongkos kirim.

### Atribut Pesanan

| Nama Atribut       | Tipe Data TypeScript   | Kolom Database                         | Deskripsi & Batasan                                                               |
| :----------------- | :--------------------- | :------------------------------------- | :-------------------------------------------------------------------------------- |
| `id`               | `string` (UUID v7)     | `id` (uuid, PK)                        | Kunci primer pesanan.                                                             |
| `nomorPesanan`     | `string`               | `nomor_pesanan` (varchar 50, unik)     | Format pengenal publik, contoh: `VOID-20261008-9K2P`.                             |
| `pelangganId`      | `string \| null`       | `pelanggan_id` (uuid, FK nullable)     | Referensi akun pelanggan terdaftar (bernilai null untuk pesanan tamu).            |
| `namaPelanggan`    | `string`               | `nama_pelanggan` (varchar 150)         | Identitas lengkap pembeli untuk verifikasi kurir logistik.                        |
| `emailPelanggan`   | `string`               | `email_pelanggan` (varchar 255)        | Surel aktif untuk transmisi dokumen faktur dan pelacakan paket.                   |
| `teleponPelanggan` | `string`               | `telepon_pelanggan` (varchar 30)       | Nomor WhatsApp pemesan yang tervalidasi skema Zod format Indonesia.               |
| `statusPesanan`    | `StatusPesanan`        | `status_pesanan` (status_pesanan_enum) | State machine pesanan dalam bentuk discriminated union.                           |
| `subtotal`         | `number` (integer IDR) | `subtotal` (integer)                   | Akumulasi harga seluruh item pesanan sebelum kalkulasi logistik.                  |
| `totalOngkir`      | `number` (integer IDR) | `total_ongkir` (integer)               | Ongkos kirim resmi dari kurir rekanan.                                            |
| `totalDiskon`      | `number` (integer IDR) | `total_diskon` (integer)               | Potongan harga promosi (default: 0).                                              |
| `totalAkhir`       | `number` (integer IDR) | `total_akhir` (integer)                | Nilai tagihan final yang wajib dilunasi (`subtotal + totalOngkir - totalDiskon`). |
| `catatan`          | `string \| null`       | `catatan` (text, nullable)             | Catatan instruksi penanganan paket dari pembeli.                                  |
| `dibuatPada`       | `Date`                 | `dibuat_pada` (timestamp)              | Waktu pesanan berhasil dibuat pada sistem kasir checkout.                         |
| `diperbaruiPada`   | `Date`                 | `diperbarui_pada` (timestamp)          | Waktu terakhir status pesanan diperbarui oleh webhook atau admin.                 |

### Entitas Item Pesanan (`item_pesanan`)

Tabel `item_pesanan` menerapkan pola **Snapshot Imutabel Lengkap** untuk menjaga audit finansial jangka panjang. Jika pengelola toko mengubah harga kaos atau merevisi nama artikel di masa mendatang, faktur pesanan terdahulu tetap otentik dan terlindungi dari distorsi data:

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

---

## 4. Payment Entity

Entitas `Pembayaran` mengelola sesi transaksi online melalui integrasi gerbang pembayaran Midtrans Snap.

### Atribut Pembayaran

| Nama Atribut           | Tipe Data TypeScript              | Kolom Database                               | Deskripsi & Batasan                                                       |
| :--------------------- | :-------------------------------- | :------------------------------------------- | :------------------------------------------------------------------------ |
| `id`                   | `string` (UUID v7)                | `id` (uuid, PK)                              | Kunci primer data pembayaran.                                             |
| `pesananId`            | `string` (UUID v7)                | `pesanan_id` (uuid, FK unik)                 | Relasi satu ke satu mengarah ke tabel `pesanan`.                          |
| `gateway`              | `'midtrans'`                      | `gateway` (varchar 30)                       | Identitas penyedia pembayaran daring.                                     |
| `gatewayOrderId`       | `string`                          | `gateway_order_id` (varchar 100)             | Nomor referensi pesanan yang dikirimkan ke Midtrans Snap.                 |
| `gatewayTransactionId` | `string \| null`                  | `gateway_transaction_id` (varchar 100)       | ID transaksi resmi dari Midtrans setelah pembayaran dimulai oleh pembeli. |
| `metodePembayaran`     | `MetodePembayaran \| null`        | `metode_pembayaran` (varchar 50)             | Kanal bayar aktif: `bank_transfer`, `gopay`, `qris`, atau `credit_card`.  |
| `statusPembayaran`     | `StatusPembayaran`                | `status_pembayaran` (status_pembayaran_enum) | Status gerbang pembayaran dalam format discriminated union.               |
| `snapToken`            | `string \| null`                  | `snap_token` (varchar 255)                   | Token sesi Snap yang dihasilkan oleh Server Service Layer.                |
| `snapRedirectUrl`      | `string \| null`                  | `snap_redirect_url` (text)                   | URL pengalihan antarmuka Snap Midtrans.                                   |
| `jumlahBayar`          | `number` (integer IDR)            | `jumlah_bayar` (integer)                     | Nominal total yang ditagihkan kepada gateway.                             |
| `dibayarPada`          | `Date \| null`                    | `dibayar_pada` (timestamp, nullable)         | Waktu pelunasan pembayaran yang telah diverifikasi signature webhook.     |
| `metadataGateway`      | `Record<string, unknown> \| null` | `metadata_gateway` (jsonb)                   | Salinan mentah payload webhook Midtrans untuk audit forensik.             |
| `dibuatPada`           | `Date`                            | `dibuat_pada` (timestamp)                    | Waktu awal pembuatan sesi pembayaran.                                     |
| `diperbaruiPada`       | `Date`                            | `diperbarui_pada` (timestamp)                | Waktu pembaruan status transaksi terakhir.                                |

---

## 5. Shipping Entity

Entitas `Pengiriman` mengelola pengiriman logistik paket barang, data alamat tujuan, dan sinkronisasi resi kurir via Biteship API.

### Atribut Pengiriman

| Nama Atribut       | Tipe Data TypeScript   | Kolom Database                               | Deskripsi & Batasan                                                |
| :----------------- | :--------------------- | :------------------------------------------- | :----------------------------------------------------------------- |
| `id`               | `string` (UUID v7)     | `id` (uuid, PK)                              | Kunci primer data logistik.                                        |
| `pesananId`        | `string` (UUID v7)     | `pesanan_id` (uuid, FK unik)                 | Relasi satu ke satu mengarah ke tabel `pesanan`.                   |
| `kurir`            | `string`               | `kurir` (varchar 50)                         | Kode kurir terpilih, contoh: `jne`, `sicepat`, atau `jnt`.         |
| `layanan`          | `string`               | `layanan` (varchar 50)                       | Kategori servis kurir, seperti `reguler`, `cargo`, atau `instant`. |
| `nomorResi`        | `string \| null`       | `nomor_resi` (varchar 100, nullable)         | Nomor resi resmi dari pihak kurir logistik.                        |
| `beratTotalGram`   | `number` (integer > 0) | `berat_total_gram` (integer)                 | Bobot gabungan seluruh item dalam satu paket kiriman.              |
| `biayaOngkir`      | `number` (integer IDR) | `biaya_ongkir` (integer)                     | Tarif final ongkos kirim paket pesanan.                            |
| `namaPenerima`     | `string`               | `nama_penerima` (varchar 150)                | Nama individu penerima barang di tempat tujuan.                    |
| `teleponPenerima`  | `string`               | `telepon_penerima` (varchar 30)              | Nomor telepon kontak penerima paket.                               |
| `alamatLengkap`    | `string`               | `alamat_lengkap` (text)                      | Alamat detail mencakup jalan, nomor hunian, dan patokan lokasi.    |
| `kota`             | `string`               | `kota` (varchar 100)                         | Kota atau kabupaten lokasi penerima.                               |
| `provinsi`         | `string`               | `provinsi` (varchar 100)                     | Provinsi wilayah pengiriman paket.                                 |
| `kodePos`          | `string`               | `kode_pos` (varchar 10)                      | Kode pos area tujuan paket pengiriman.                             |
| `statusPengiriman` | `StatusPengiriman`     | `status_pengiriman` (status_pengiriman_enum) | Tahapan siklus logistik pengiriman paket.                          |
| `estimasiHari`     | `string`               | `estimasi_hari` (varchar 30)                 | Perkiraan durasi paket sampai di tujuan, misal: _2-3 hari_.        |
| `dibuatPada`       | `Date`                 | `dibuat_pada` (timestamp)                    | Waktu pembuatan manifest logistik di sistem.                       |
| `diperbaruiPada`   | `Date`                 | `diperbarui_pada` (timestamp)                | Waktu terakhir status pelacakan kurir diperbarui.                  |

---

## 6. Format Pengkodean ID Otomatis

Untuk memastikan kecepatan pencarian database dan kemudahan identifikasi fisik oleh manusia, format ID distandarisasi sebagai berikut:

1. **Primary Key Internal (UUID v7):**
   Seluruh tabel database menggunakan UUID v7 yang berbasis stempel waktu terurut (_time-ordered_). Karakteristik ini memaksimalkan efisiensi penulisan indeks B-Tree pada PostgreSQL 18 dan meniadakan fragmentasi indeks yang kerap terjadi pada UUID v4 acak.
2. **Nomor Pesanan Bisnis (`VOID-YYYYMMDD-XXXX`):**
   - Format: `VOID-` + Tanggal ISO ringkas (contoh: `20261008`) + `-` + 4 karakter alfanumerik acak aman (_Crockford base32_, meniadakan karakter ambigu seperti O, 0, I, dan 1).
   - Contoh riil: `VOID-20261008-9K2P`.
3. **SKU Inventaris Varian (`VOID-[DROP]-[KAT]-[WARNA]-[UKURAN]`):**
   - Format: Prefiks jenama + nomor drop + kode kategori + kode warna kain + ukuran fisik.
   - Contoh riil: `VOID-D04-TEE-BLK-L`, `VOID-D04-JKT-VOD-XL`.
4. **Identifier Pelanggan (`CUST-YYYYMMDD-XXXX`):**
   - Contoh: `CUST-20261008-7H3M`.

---

## 7. Skema Validasi Zod & Lokalisasi Pesan (i18n)

Sesuai panduan _i18n-localization_, semua pesan validasi runtime Zod, status peringatan, dan notifikasi toast menggunakan kamus terstruktur (`src/lib/i18n/id.ts` dengan fallback `en.ts`) yang dipanggil melalui helper fungsi `t()` berorientasi tipe data ketat:

### Kamus Pesan Terstruktur (`src/lib/i18n/id.ts`)

```typescript
export const kamusPesanId = {
  validasi: {
    produk: {
      namaWajib: "Nama produk tidak boleh kosong.",
      ukuranWajib: "Silakan pilih ukuran pakaian terlebih dahulu.",
      stokKurang: "Kuantitas pesanan melebihi ketersediaan stok fisik kami.",
    },
    pelanggan: {
      emailTidakValid: "Format alamat surel tidak valid.",
      teleponTidakValid: "Nomor WhatsApp wajib diawali 08 atau +62 dengan 10-13 digit.",
      alamatWajib: "Alamat tujuan pengiriman lengkap wajib diisi.",
    },
  },
  toast: {
    sukses: {
      tambahKeranjang: "Item berhasil ditambahkan ke tas belanja.",
      pesananDibuat: "Pesanan berhasil dibuat. Membuka pembayaran Midtrans.",
      pembayaranBerhasil: "Pembayaran terkonfirmasi. Kami segera memproses pesanan Anda.",
    },
    peringatan: {
      stokMenipis: "Stok artikel ini tersisa kurang dari 5 buah.",
      sesiBerakhir: "Sesi checkout Anda akan berakhir dalam 5 menit.",
    },
    galat: {
      pembayaranGagal: "Pembayaran belum berhasil diselesaikan. Silakan coba kembali.",
      koneksiBiteship: "Gagal mengambil tarif pengiriman. Coba beberapa saat lagi.",
    },
  },
} as const;

export type KamusPesan = typeof kamusPesanId;
```

### Penerapan pada Skema Zod Produk & Checkout

```typescript
import { z } from "zod";
import { kamusPesanId } from "@/lib/i18n/id";

export const varianProdukSkema = z.object({
  id: z.string().uuid(),
  produkId: z.string().uuid(),
  ukuran: z.enum(["S", "M", "L", "XL", "XXL"], {
    errorMap: () => ({ message: kamusPesanId.validasi.produk.ukuranWajib }),
  }),
  sku: z.string().regex(/^VOID-D\d{2}-[A-Z]{3}-[A-Z]{3}-[A-Z0-9]{1,3}$/),
  stok: z.number().int().nonnegative(),
  beratGram: z.number().int().positive(),
  harga: z.number().int().positive(),
  dibuatPada: z.date(),
  diperbaruiPada: z.date(),
});

export const checkoutSkema = z.object({
  namaPelanggan: z.string().min(3),
  emailPelanggan: z.string().email(kamusPesanId.validasi.pelanggan.emailTidakValid),
  teleponPelanggan: z
    .string()
    .regex(/^(?:\+62|62|0)8[1-9][0-9]{7,10}$/, kamusPesanId.validasi.pelanggan.teleponTidakValid),
  alamatLengkap: z.string().min(10, kamusPesanId.validasi.pelanggan.alamatWajib),
  kota: z.string().min(2),
  provinsi: z.string().min(2),
  kodePos: z.string().regex(/^\d{5}$/),
  varianId: z.string().uuid(kamusPesanId.validasi.produk.ukuranWajib),
  jumlah: z.number().int().positive(),
});

export type VarianProduk = z.infer<typeof varianProdukSkema>;
export type CheckoutForm = z.infer<typeof checkoutSkema>;
```

---

## 8. Tata Kelola Aset Statis di `public/**`

Seluruh media gambar disimpan secara terstruktur di folder publik dengan aturan penamaan terstandarisasi untuk menjamin performa CDN dan kemudahan _caching_:

### Struktur Direktori Aset

```text
public/
├── images/
│   ├── products/
│   │   └── drop-04/
│   │       ├── void-tee-01-front.webp      # Tampilan depan rasio 4:5
│   │       ├── void-tee-01-back.webp       # Tampilan belakang rasio 4:5
│   │       ├── void-tee-01-detail.webp     # Detail tekstur kain rasio 4:5
│   │       └── ...
│   ├── lookbook/
│   │   └── drop-04-editorial-hero.webp     # Banner utama rute /shop
│   └── branding/
│       ├── logo-void.svg
│       └── icon-void.svg
└── og/
    └── drop-04-og.jpg                      # Gambar kartu preview media sosial (1200x630px)
```

### Standar Penamaan & Rasio Berkas

1. Format Berkas: Huruf kecil dengan tanda hubung kebab-case (`[slug-produk]-[sudut-pandang].webp`).
2. Rasio Standar Produk: **4:5 Vertical Portrait** (resolusi acuan master: 1200x1500px).
3. Format Kompresi: WebP atau AVIF dengan kualitas kompresi 82-85% untuk mempertahankan detail benang katun tanpa memperberat ukuran berkas (ukuran ideal di bawah 180 KB per foto).
4. Validasi Unggah Foto Administrator: Maksimal 5 MB per gambar, rasio aspek wajib antara 0.79 hingga 0.81 (toleransi 4:5), serta hanya menerima tipe MIME `image/webp`, `image/jpeg`, atau `image/png`.

---

## 9. Strategi Pemuatan Gambar (Lazy Loading) & Indikator Proses

1. **Prioritas LCP (_Largest Contentful Paint_):**
   Empat produk teratas pada halaman katalog rute `/shop` wajib menggunakan atribut `priority={true}` pada komponen `next/image` untuk memastikan pemuatan tercepat tanpa penundaan jaringan (LCP < 1.5 detik).
2. **Pemuatan Bertahap (_Lazy Loading_):**
   Seluruh produk urutan ke-5 ke bawah menggunakan pemuatan otomatis `loading="lazy"` dengan efek transisi _blur-up placeholder_ menggunakan Base64 LQIP (_Low Quality Image Placeholder_) yang halus.
3. **Indikator Status Pemrosesan (_Process States_):**
   - _Loading State:_ Menggunakan skeleton card berkedip tipis (warna abu-abu gelap neutral-900 ke neutral-800) dengan rasio identik 4:5 untuk mencegah pergeseran tata letak (_Cumulative Layout Shift_ = 0).
   - _Empty State:_ Menampilkan visual tipografi editorial minimalis saat artikel dalam kategori tertentu belum tersedia.
   - _Error State:_ Menampilkan tombol coba lagi dengan batas interaksi minimal 44px tap target.

---

## 10. Anatomi Komponen Antarmuka `ProductCard`

Komponen kartu produk dirancang mengikuti standar visual streetwear internasional dengan hirarki elemen yang presisi:

```text
┌─────────────────────────────────────────────────────────┐
│ [BADGE: DROP 04]                      [STOK: 3 TERSISA] │  <- 1. Tag Koleksi & Indikator Stok
│                                                         │
│                                                         │
│                                                         │
│                   GAMBAR PRODUK (4:5)                   │  <- 2. Wadah Foto Rasio 4:5
│            (Hover: Transisi Lembut Sudut Belakang)      │
│                                                         │
│                                                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ PILIH UKURAN: [ S ] [ M ] [ L ] [ XL ] [ XXL ]    │  │  <- 3. Quick Size Selector Pills
│  └───────────────────────────────────────────────────┘  │     (Hover Desktop / Tap Mobile)
└─────────────────────────────────────────────────────────┘
  VOID HEAVYWEIGHT TEE 01                                    <- 4. Judul Artikel (Outfit Font)
  TSHIRT / OVERSIZED FIT                                     <- 5. Kategori Busana
  Rp 389.000                                                 <- 6. Format Harga Rupiah Bulat
```

### Rincian Interaksi Anatomi Kartu:

1. **Wadah Gambar Rasio 4:5:** Menggunakan kontainer `relative aspect-[4/5] overflow-hidden bg-neutral-900 rounded-none` dengan efek transisi gambar sekunder halus berdurasi 300ms saat kursor melintas.
2. **Badge Tag Rilis & Status:** Badge teks tegas monokrom di sudut kiri atas (`DROP 04`), berpadu dengan peringatan darurat stok di sudut kanan atas (`HAMPIR HABIS` jika stok < 5, atau overlay gelap semi-transparan `HABIS TERJUAL` jika seluruh stok varian kosong).
3. **Quick Size Pills:** Tombol pilihan ukuran cepat di bagian bawah kontainer gambar yang muncul halus saat hover (atau selalu terlihat dengan tinggi tap target 44px di mobile). Varian yang memiliki stok 0 diberi gaya garis coret dan status nonaktif.
4. **Tipografi & Harga Rupiah:** Judul artikel tebal kapital, sub-kategori bernada abu-abu netral, dan harga diformat menggunakan fungsi bawaan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.

---

## 11. Database Mapping Lengkap (Drizzle ORM & PostgreSQL 18)

Berikut adalah skema tabel resmi Drizzle ORM yang mengintegrasikan seluruh aturan enum PostgreSQL, batasan relasi (_foreign keys & constraints_), dan indeks teroptimasi:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Definisi Enum Database PostgreSQL
export const kategoriProdukEnum = pgEnum("kategori_produk", [
  "outerwear",
  "tshirt",
  "pants",
  "accessories",
]);
export const statusProdukEnum = pgEnum("status_produk", ["draft", "aktif", "diarsipkan"]);
export const ukuranProdukEnum = pgEnum("ukuran_produk", ["S", "M", "L", "XL", "XXL"]);
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
  "gagal",
  "kadaluwarsa",
]);
export const statusPengirimanEnum = pgEnum("status_pengiriman", [
  "menunggu_resi",
  "manifested",
  "on_transit",
  "delivered",
  "returned",
]);

// Tabel Induk Produk
export const produk = pgTable("produk", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  deskripsi: text("deskripsi").notNull(),
  kategori: kategoriProdukEnum("kategori").notNull(),
  hargaDasar: integer("harga_dasar").notNull(),
  status: statusProdukEnum("status").default("aktif").notNull(),
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
  ukuran: ukuranProdukEnum("ukuran").notNull(),
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
  statusPesanan: statusPesananEnum("status_pesanan").default("menunggu_pembayaran").notNull(),
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
  statusPengiriman: statusPengirimanEnum("status_pengiriman").default("menunggu_resi").notNull(),
  estimasiHari: varchar("estimasi_hari", { length: 30 }).notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).defaultNow().notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).defaultNow().notNull(),
});

// Definisi Relasi Antar Tabel
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

## 12. Strategi Indeks dan Skalabilitas Kueri

Kombinasi indeks berikut diaplikasikan untuk menjamin operasi basis data tetap efisien:

1. **Indeks Unik Berkecepatan O(1):**
   - `produk.slug`: Pencarian detail artikel secara instan saat pembeli mengakses URL `/product/[slug]`.
   - `varian_produk.sku`: Validasi ketersediaan stok fisik dan pemindaian barcode garmen.
   - `pesanan.nomor_pesanan`: Pencarian riwayat transaksi oleh pembeli tanpa membebankan pemindaian seluruh tabel.
2. **Indeks Foreign Key untuk Operasi `JOIN`:**
   - Indeks pada `varian_produk.produk_id`, `item_pesanan.pesanan_id`, `pembayaran.pesanan_id`, dan `pengiriman.pesanan_id`.
3. **Composite Index Pencarian Dashboard Transaksi:**
   - Indeks gabungan pada `(status_pesanan, dibuat_pada)` untuk mempercepat agregasi pesanan aktif dan pembersihan berkala atas transaksi kedaluwarsa.
