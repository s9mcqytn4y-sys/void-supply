# Next.js Architecture

Dokumen ini mendefinisikan arsitektur resmi aplikasi VOID Supply menggunakan Next.js 16 App Router dan React 19, mengatur pembagian tanggung jawab antara Server Component, Client Component, Server Action, serta pengorganisasian fitur e-commerce.

---

## Routing Strategy

Aplikasi memanfaatkan fitur App Router dengan pola segmentasi _Route Groups_ untuk memisahkan konteks tata letak secara fisik di dalam direktori `src/app`:

```text
src/app/
├── (public)/                      # Konteks Toko Publik (Header Navigasi + Footer Lengkap)
│   ├── layout.tsx                 # Menyediakan Navbar, Bottom Bar Mobile, dan Footer Toko
│   ├── page.tsx                   # Halaman Utama (/)
│   ├── shop/                      # Katalog Produk (/shop)
│   │   └── page.tsx
│   ├── products/                  # Detail Produk (/products/[slug])
│   │   └── [slug]/
│   │       └── page.tsx
│   └── cart/                      # Halaman Penuh Keranjang Belanja (/cart)
│       └── page.tsx
│
├── (checkout)/                    # Konteks Transaksi Bebas Distraksi (Distraction-Free)
│   ├── layout.tsx                 # Layout Khusus: Tanpa Navbar dan Tanpa Footer Publik
│   └── checkout/                  # Formulir Satu Halaman (/checkout)
│       └── page.tsx
│
├── (portal)/                      # Portal Layanan Pelanggan & Pelacakan
│   ├── layout.tsx                 # Layout Minimalis dengan Tombol Kembali ke Toko
│   ├── account/                   # Dasbor Akun Pelanggan (/account)
│   │   └── page.tsx
│   └── track/                     # Pelacakan Resi Kurir Publik (/track/[orderId])
│       └── [orderId]/
│           └── page.tsx
│
├── (api)/                         # Titik Akhir Integrasi Layanan Luar
│   └── api/
│       └── webhooks/
│           └── midtrans/          # Penerima Webhook Notifikasi Bayar (/api/webhooks/midtrans)
│               └── route.ts
│
├── layout.tsx                     # Root Layout: Font Geist/Outfit, Metadata HTML, Toast Provider
├── not-found.tsx                  # Halaman 404 Bertema Gelap Minimalis
└── globals.css                    # Definisi Token Utilitas Tailwind CSS v4
```

### Prinsip Utama Pembagian Rute

1. **Route Group Terisolasi:** Segmentasi folder menggunakan kurung buka-tutup seperti `(public)` dan `(checkout)` memungkinkan pemakaian file `layout.tsx` yang berbeda tanpa memengaruhi struktur URL peramban.
2. **Distraction-Free Checkout:** Jalur `(checkout)/checkout` memiliki tata letak sendiri yang secara fisik meniadakan bilah menu atas dan tautan footer, menjamin fokus pembeli terarah penuh pada penyelesaian pembayaran.
3. **Segmen Dinamis URL:** Segmen `[slug]` pada katalog produk dan `[orderId]` pada pelacakan kurir membaca parameter dinamis langsung dari URL peramban secara type-safe.

---

## Server Component Usage

Server Component merupakan model komputasi baku (_default_) pada Next.js 16 App Router. Komponen jenis ini dieksekusi secara eksklusif di lingkungan peladen Node.js dan tidak menyertakan berkas JavaScript ke peramban klien.

### Komponen yang Wajib Berupa Server Component

- **Halaman Katalog (`/shop`):** Mengambil daftar artikel langsung dari PostgreSQL 18 via Drizzle ORM berdasarkan kueri filter `searchParams`.
- **Halaman Detail Produk (`/products/[slug]`):** Mengambil detail spesifikasi pakaian, foto resolusi tinggi, data panduan ukuran, dan kuota sisa inventaris gudang.
- **Halaman Editorial & Koleksi (`/collection`):** Menampilkan narasi rilis drop terkini dan konten statis berbasis optimasi mesin pencari (_SEO_).
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

Aliran data dalam aplikasi terbagi menjadi dua siklus utama: siklus pembacaan data searah (_Read Flow_) dan siklus mutasi transaksi dua arah (_Mutation Flow_).

```text
Siklus Pembacaan Data (Read Flow):
Peramban ──(HTTP GET)──► Server Component ──► Drizzle ORM ──► PostgreSQL 18
                              │
                              ▼
                         HTML Stream ──► Peramban Menampilkan Konten Langsung

Siklus Mutasi Transaksi (Mutation Flow):
Formulir Klien ──(Server Action)──► buatPesanan() ──► Validasi Zod Runtime
                                                           │
                                                           ▼
Peladen Midtrans ◄──(Snap API)── Drizzle ORM Transaction ◄── (Valid)
       │
       ▼
Token Snap Kembali ke Klien ──► Peramban Membuka Dialog Pembayaran
```

### Penjelasan Tahapan Aliran Data

1. **Pembacaan Katalog:** Peramban memanggil alamat URL katalog produk. Server Component membaca parameter kueri URL secara langsung, menjalankan perintah query Drizzle ORM ke PostgreSQL, dan menyalurkan aliran dokumen HTML ke peramban.
2. **Mutasi Keranjang Klien:** Saat pembeli menekan tombol beli, mutasi berlangsung secara sinkron pada Zustand store di memori peramban tanpa membebani lalu lintas jaringan server.
3. **Penyelesaian Transaksi:** Ketika formulir checkout dikirim, Server Action memvalidasi data masukan secara runtime menggunakan Zod skema, membuka blok transaksi atomik pada basis data untuk memverifikasi stok, memanggil gateway Midtrans untuk meminta Snap Token, lalu mengembalikan token tersebut agar peramban dapat memunculkan jendela pembayaran digital.

---

## Feature Structure

Penerapan struktur folder mengadopsi paradigma _Feature-Sliced Thinking_ yang berpusat pada domain bisnis di dalam direktori `src/features/`. Setiap modul fitur mengisolasi komponen antarmuka, tipe TypeScript, skema validasi, dan fungsi aksi ke dalam satu direktori mandiri:

```text
src/features/
├── product/                       # Fitur Katalog & Detail Produk
│   ├── components/                # ProductCard, ProductGrid, SizeSelector, MediaGallery
│   ├── types/                     # Produk, VarianProduk, KategoriProduk
│   ├── schemas/                   # produkSkema, filterKatalogSkema
│   └── queries/                   # ambilDaftarProduk, ambilProdukBySlug
│
├── cart/                          # Fitur Pengelolaan Keranjang Belanja
│   ├── components/                # CartItemList, CartSummary, CartEmptyState
│   ├── hooks/                     # useCartStore (Zustand + LocalStorage Persist)
│   └── types/                     # ItemKeranjang, CartState
│
├── checkout/                      # Fitur Alur Pembayaran & Transaksi
│   ├── components/                # CheckoutForm, CourierSelector, PaymentMethodRadio
│   ├── actions/                   # buatPesanan (Next.js Server Action)
│   ├── schemas/                   # checkoutSkema (Zod Form Validation)
│   └── types/                     # FormCheckoutValues, OpsiKurir, StatusPembayaran
│
└── order/                         # Fitur Pesanan & Pelacakan Kurir
    ├── components/                # OrderTimeline, CourierTrackerCard, OrderHistoryList
    ├── queries/                   # ambilDetailPesanan, cekStatusResiBiteship
    └── types/                     # Pesanan, CheckpointKurir, StatusPengiriman
```

### Aturan Isolasi Antar Fitur

- Fitur diperbolehkan mengimpor kode utilitas bersama dari direktori `src/components/ui/`, `src/lib/`, atau `src/types/`.
- Fitur dilarang mengimpor modul privat internal milik fitur lain secara langsung tanpa melalui berkas ekspor publik yang telah ditentukan.

---

## Commerce Flow

Siklus lengkap pengalaman belanja pembeli di platform VOID Supply dirancang berlangsung cepat, transparan, dan bebas hambatan registrasi:

```text
[ 1. Discovery ]       Halaman Beranda (/) atau Katalog (/shop)
                              │
                              ▼
[ 2. Evaluation ]      Detail Produk (/products/[slug])
                       Pilih Ukuran S/M/L/XL & Cek Panduan Dimensi
                              │
                              ▼
[ 3. Staging ]         Halaman Keranjang Penuh (/cart)
                       Periksa Rincian Artikel & Masukkan Kupon Promo
                              │
                              ▼
[ 4. Execution ]       Checkout Satu Halaman (/checkout)
                       Isi Kontak WhatsApp, Alamat Pengiriman, dan Pilihan Kurir
                              │
                              ▼
[ 5. Settlement ]      Dialog Pembayaran Midtrans Snap
                       Selesaikan Tagihan via QRIS Instan atau Virtual Account
                              │
                              ▼
[ 6. Verification ]    Webhook Midtrans (/api/webhooks/midtrans)
                       Verifikasi Hash SHA-512 & Update Status Jadi "dibayar"
                              │
                              ▼
[ 7. Fulfillment ]     Pelacakan Pengiriman Kurir (/track/[orderId])
                       Pantau Perjalanan Paket Fisik dari Gudang Sleman ke Rumah
```

Dengan arsitektur terintegrasi ini, VOID Supply menghadirkan pengalaman belanja modern yang aman, responsif, dan terukur bagi komunitas penggemar busana streetwear.
