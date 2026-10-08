# Next.js Architecture

Dokumen ini mendefinisikan arsitektur resmi aplikasi VOID Supply menggunakan Next.js 16 App Router dan React 19, mengatur pembagian tanggung jawab antara Server Component, Client Component, Server Action, serta pengorganisasian fitur e-commerce.

---

## Routing Strategy

Aplikasi memanfaatkan fitur Next.js 16 App Router dengan kombinasi arsitektur berbasis fitur (_Feature-Based Architecture_) dan segmentasi rute toko (_Store Route Groups_) di dalam direktori `src/app`:

```text
src/app/
├── (store)/                       # Konteks Pengalaman Belanja (Header Navigasi + Footer Toko)
│   ├── layout.tsx                 # Menyediakan Navbar Utama, Bottom Bar Mobile, dan Footer
│   ├── page.tsx                   # Halaman Utama (/)
│   ├── shop/                      # Katalog Penjelajahan Produk (/shop)
│   │   └── page.tsx
│   └── product/                   # Detail Artikel Pakaian (/product/[slug])
│       └── [slug]/
│           └── page.tsx
│
├── checkout/                      # Konteks Transaksi Mandiri Bebas Distraksi (/checkout)
│   ├── layout.tsx                 # Layout Khusus: Tanpa Bilah Menu Atas & Tanpa Footer Publik
│   └── page.tsx                   # Formulir Checkout Satu Halaman
│
├── api/                           # Titik Integrasi Layanan Eksternal & Webhook
│   └── webhooks/
│       └── midtrans/              # Webhook Penerima Notifikasi Pembayaran Midtrans
│           └── route.ts
│
├── layout.tsx                     # Root Layout: Konfigurasi Font Outfit/Geist, Metadata Global
├── not-found.tsx                  # Halaman Galat 404 Bertema Gelap Minimalis
└── globals.css                    # Impor Utilitas dan Definisi Desain Token Tailwind CSS v4
```

### Prinsip Utama Pembagian Rute

1. **Pemisahan Konteks (store):** Folder `(store)` mengelompokkan halaman etalase publik tanpa menambah segmen pada URL peramban, memastikan navigasi toko konsisten.
2. **Konteks Transaksi Terisolasi:** Rute `checkout/` memiliki tata letak terpisah tanpa navigasi publik untuk menjaga fokus pengguna menyelesaikan transaksi pembelian.
3. **Segmen Dinamis:** Parameter `[slug]` pada rute produk membaca identitas unik artikel secara langsung di peladen.

---

## Server Component Usage

Server Component merupakan model komputasi baku (_default_) pada Next.js 16 App Router. Komponen jenis ini dieksekusi secara eksklusif di lingkungan peladen Node.js dan tidak menyertakan berkas JavaScript ke peramban klien.

### Komponen yang Wajib Berupa Server Component

- **Halaman Katalog (`/shop`):** Mengambil daftar artikel langsung dari PostgreSQL 18 via Drizzle ORM berdasarkan kueri filter `searchParams`.
- **Halaman Detail Produk (`/product/[slug]`):** Mengambil detail spesifikasi pakaian, foto resolusi tinggi, data panduan ukuran, dan kuota sisa inventaris gudang.
- **Komponen Kartu Produk (`ProductCard`):** Menghasilkan elemen kartu 4:5 berupa dokumen HTML bersih dengan angka harga tabular.

### Alasan Rekayasa Pemilihan Server Component

1. **Performa LCP Maksimal:** Peladen langsung mengirimkan dokumen HTML dan CSS yang sudah selesai dikompilasi, sehingga peramban seluler dapat menampilkan konten dalam waktu kurang dari 1.5 detik pada koneksi 4G.
2. **Beban Bundel Nol (_Zero Client JavaScript_):** Pustaka basis data Drizzle ORM, driver `pg`, serta logika kalkulasi internal tetap berada di peladen tanpa menambah bobot berkas JavaScript yang harus diunduh pengguna.
3. **Optimasi Mesin Pencari Tingkat Tinggi:** Bot perayap Google dan media sosial dapat langsung membaca tag metadata OpenGraph, harga produk, dan deskripsi bahan tanpa perlu mengeksekusi JavaScript peramban.

---

## Client Component Usage

Client Component ditandai secara eksplisit dengan direktif `"use client"` pada baris teratas berkas. Komponen ini dirender terlebih dahulu menjadi HTML awal di peladen, lalu dihidupkan (_hydration_) oleh peramban untuk menangani interaksi pengguna.

### Arsitektur Client Island

VOID Supply menolak menjadikan keseluruhan halaman sebagai Client Component. Kami menerapkan paradigma _Client Island_, yaitu mengisolasi direktif `"use client"` hanya pada titik interaksi mikro spesifik:

```text
[ Server Component: ProductDetailPage ]
  ├── [ Server Component: MediaGallery (Foto Rasio 4:5) ]
  ├── [ Server Component: ProductInfo (Judul & Harga Monospace) ]
  ├── [ Client Island: SizeSelector ("use client") ] ──► Memilih Varian Ukuran S/M/L/XL
  ├── [ Server Component: MaterialSpecs (Deskripsi Bahan 24s) ]
  └── [ Client Island: StickyAddToCartBar ("use client") ] ──► Menambah Item ke Zustand
```

### Komponen yang Wajib Berupa Client Component

- **Pengelola Keranjang Belanja Klien (`useCartStore`):** Menyimpan daftar belanja tamu ke memori peramban dengan sinkronisasi `localStorage`.
- **Formulir Transaksi Checkout (`CheckoutForm`):** Mengelola masukan teks pengguna, interaktivitas radio kurir, dan validasi formulir via React Hook Form.
- **Sistem Umpan Balik Notifikasi (`ToastContainer`):** Menampilkan peringatan visual mengambang saat aksi berhasil atau gagal dieksekusi.
- **Modal Panduan Ukuran (`SizeGuideModal`):** Dialog jendela pop-up interaktif yang merespons penekanan tombol dan penutupan via tombol Escape.

---

## Data Flow

Aplikasi menerapkan pola aliran data berlapis (_Layered Data Flow_) dengan menyisipkan **Server Service Layer** di antara lapisan Drizzle ORM dan Server Component:

```text
DATABASE (PostgreSQL 18)
        │
        ▼
   Drizzle ORM
        │
        ▼
Server Service Layer (features/*/services/)
        │
        ▼
  Server Component
        │
        ▼
  React Component
        │
        ▼
User Interaction (Klik Tambah Keranjang / Submit Form)
        │
        ▼
Server Action / API Route
        │
        ▼
Database Update (Mutasi Atomik PostgreSQL)
```

### Penjelasan Tahapan Aliran Data

1. **Lapisan Basis Data & ORM:** PostgreSQL 18 bertindak sebagai sumber data utama, dipetakan secara type-safe menggunakan skema Drizzle ORM.
2. **Server Service Layer:** Layanan server (seperti `productService.getProducts()`) mengenkapsulasi kueri bisnis, filter kategori, dan kalkulasi diskon sebelum diserahkan ke komponen tampilan.
3. **Penyajian Server Component:** Server Component memanggil Service Layer secara langsung di peladen dan mengalirkan HTML murni ke peramban tanpa latensi API tambahan.
4. **Interaksi & Mutasi:** Interaksi pengguna memicu pembaruan state lokal atau memanggil Server Action untuk mengeksekusi mutasi aman kembali ke basis data.

---

## Feature Structure

Penerapan struktur folder menggabungkan App Router dengan arsitektur berbasis fitur (_Feature-Based Architecture_) di bawah direktori `src/features/`. Setiap fitur bisnis memiliki modul mandiri yang mengisolasi komponen antarmuka, service bisnis peladen, skema validasi Zod, dan tipe TypeScript:

```text
src/
├── app/
│   ├── (store)/
│   │   ├── page.tsx               # Beranda Toko
│   │   ├── shop/                  # Katalog Artikel
│   │   └── product/               # Rincian Produk
│   ├── checkout/                  # Halaman Transaksi
│   └── api/                       # Webhook & API Routes
│
├── features/
│   ├── product/                   # Domain Produk & Katalog
│   │   ├── components/            # ProductCard, ProductGrid, SizeSelector
│   │   ├── services/              # productService (Kueri Drizzle ORM Sisi Server)
│   │   ├── schemas/               # produkSkema, filterKatalogSkema (Zod)
│   │   └── types/                 # Produk, VarianProduk, KategoriProduk
│   │
│   ├── cart/                      # Domain Keranjang Belanja
│   │   ├── components/            # CartItemList, CartSummary, CartEmptyState
│   │   ├── hooks/                 # useCartStore (Zustand State & LocalStorage)
│   │   └── types/                 # ItemKeranjang, CartState
│   │
│   ├── checkout/                  # Domain Alur Checkout Transaksi
│   │   ├── components/            # CheckoutForm, AddressForm, CourierSelector
│   │   ├── actions/               # buatPesanan (Next.js Server Action)
│   │   ├── schemas/               # checkoutSkema (Validasi Form Zod)
│   │   └── types/                 # FormCheckoutValues, OpsiKurir
│   │
│   └── payment/                   # Domain Gateway Pembayaran Midtrans
│       ├── services/              # midtransService (Snap Token & Verifikasi SHA-512)
│       └── types/                 # StatusPembayaran, MidtransWebhookPayload
│
├── components/
│   ├── ui/                        # Komponen Primitif (Button, Input, Badge, Toast)
│   └── layout/                    # Komponen Tata Letak (Navbar, Footer, MobileNav)
│
├── lib/
│   ├── db/                        # Konfigurasi Koneksi Drizzle ORM & PostgreSQL
│   ├── utils/                     # Fungsi Pembantu Umum (formatRupiah, cn)
│   └── validations/               # Validasi Lingkungan Runtime (envSkema)
│
└── types/                         # Kontrak Tipe Global Aplikasi
```

### Aturan Isolasi Antar Fitur

- Setiap fitur memegang tanggung jawab penuh atas logika bisnis domainnya sendiri.
- Komponen bersama lintas fitur diletakkan pada `src/components/ui/` atau `src/components/layout/`.
- Logika kueri database untuk fitur dilarang ditulis acak di dalam komponen, melainkan wajib diorganisir di dalam folder `services/` milik fitur terkait.

---

## Commerce Flow

Alur siklus pembelian barang di platform VOID Supply menerapkan urutan deterministik berikut:

```text
User klik Add Cart
        │
        ▼
Zustand update cart (useCartStore + LocalStorage)
        │
        ▼
Checkout (/checkout)
        │
        ▼
Create Order (Server Action buatPesanan + Validasi Zod)
        │
        ▼
Midtrans API (Pembuatan Snap Token Resmi di Peladen)
        │
        ▼
Payment Success (Pelunasan Pembeli via QRIS atau Virtual Account)
        │
        ▼
Update Order Status (Webhook Midtrans Verifikasi SHA-512 ──► Status "dibayar")
```

Dengan arsitektur terintegrasi ini, VOID Supply menghadirkan alur transaksi e-commerce yang modular, aman, responsif, dan mudah dipelihara dalam jangka panjang.
