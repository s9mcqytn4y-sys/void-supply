# VOID Supply Frontend Architecture

Dokumen ini mendefinisikan arsitektur rekayasa frontend (_Frontend Engineering Architecture_) untuk platform e-commerce streetwear VOID Supply. Arsitektur ini dirancang untuk menerjemahkan keputusan produk dan rancangan antarmuka ke dalam sistem kode Next.js 16 yang modular, terukur, dan aman.

---

## Application Goal

Aplikasi VOID Supply dirancang untuk menghadirkan pengalaman belanja merchandise streetwear edisi terbatas yang cepat, transparan, dan tanpa friksi:

1. **Kecepatan Konversi Seluler (Mobile-First < 60 Detik):** Mengingat 95% pengguna bertransaksi melalui smartphone, arsitektur harus menjamin alur belanja satu halaman (_One-Page Guest Checkout_) tuntas di bawah 60 detik.
2. **Kestabilan Performa Rilis Drop (_High-Concurrency Readiness_):** Mampu menangani lonjakan lalu lintas saat peluncuran rilis terbatas tanpa pergeseran tata letak (_Cumulative Layout Shift_ = 0) dan _Largest Contentful Paint_ (LCP) < 1.5 detik.
3. **Kepastian Data Inventaris Atomik:** Tidak ada penjualan barang melebihi stok (_overselling_) melalui validasi stok riil pada level database PostgreSQL 18.
4. **Isolasi Logika Domain Terkurasi:** Mencegah kekacauan kode dengan arsitektur berbasis fitur (_Feature-Based Architecture / Feature Sliced Thinking_).

---

## Tech Stack Decision

Keputusan penentuan teknologi pada VOID Supply didasarkan pada kebutuhan teknis dan batasan bisnis riil, bukan sekadar mengikuti tren:

| Layer                  | Pilihan Teknologi               | Alasan Rekayasa & Nilai Bisnis                                                                                                                                    |
| :--------------------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | **Next.js 16 (App Router)**     | Kombinasi Server Components untuk SEO katalog statis dan Server Actions untuk mutasi transaksi tanpa overhead API publik terpisah.                                |
| **UI Library**         | **React 19.3**                  | Dukungan primitif asynchronous terbaru, transisi aksi reaktif, dan performa hidrasi optimal.                                                                      |
| **Styling**            | **Tailwind CSS v4**             | Mesin kompilasi berbasis Rust yang cepat, zero runtime CSS overhead, dan token warna semantik streetwear.                                                         |
| **Client State**       | **Zustand 5**                   | Manajemen state browser sementara yang sangat ringan (< 1.5 kB), tanpa boilerplate reducers, dan mendukung persistensi LocalStorage untuk keranjang belanja tamu. |
| **Server State**       | **TanStack Query v5**           | Pengelolaan caching data server, deduplikasi request, dan sinkronisasi status pengiriman serta stok secara otomatis.                                              |
| **Runtime Validation** | **Zod 3**                       | Validasi skema saat runtime untuk memastikan integritas payload kiriman klien, respon API logistik, dan webhook pembayaran.                                       |
| **Form Management**    | **React Hook Form 7**           | Penanganan formulir pengiriman dan kontak yang performan tanpa re-render berlebih pada setiap ketukan input pengguna.                                             |
| **Database & ORM**     | **PostgreSQL 18 + Drizzle ORM** | Transaksi relasional aman dengan TypeScript inference langsung dari definisi skema tabel.                                                                         |
| **Payment Gateway**    | **Midtrans Snap**               | Dukungan kanal pembayaran digital lokal instan (QRIS, GoPay, Virtual Account Bank) dengan verifikasi otomatis.                                                    |
| **Logistics API**      | **Biteship API**                | Kalkulasi ongkos kirim multi-kurir lokal (JNE, SiCepat, J&T) dan pelacakan resi real-time terintegrasi.                                                           |
| **Testing**            | **Vitest 3 + Playwright**       | Pengujian unit komponen kilat via Vitest dan pengujian alur kritis end-to-end checkout via Playwright.                                                            |
| **Hosting**            | **Vercel**                      | Edge network global, deployment otomatis via integrasi Git, dan skalabilitas serverless terisolasi.                                                               |

---

## Rendering Strategy

Next.js 16 App Router menyediakan 3 paradigma eksekusi yang diterapkan secara disiplin sesuai karakteristik data:

```text
[ Browser Klien ]
       │
       ├─► Akses Halaman (/shop, /products/[slug])
       │     └─► [ React Server Component (RSC) ]
       │           ├─ Render HTML di server
       │           ├─ Akses langsung Drizzle ORM / PostgreSQL
       │           └─ Kirim HTML statis + RSC payload ke browser (Zero JS bundle overhead)
       │
       ├─► Interaksi UI (Halaman Cart, Filter Tabs, Modal, Nav Drawer)
       │     └─► [ Client Component ("use client") ]
       │           ├─ State lokal browser (Zustand & React State)
       │           ├─ Event listeners (onClick, onTouch, onChange)
       │           └─ Micro-animations dan transisi Tailwind CSS v4
       │
       └─► Mutasi Transaksi (Submit Checkout, Verifikasi Voucher)
             └─► [ Server Action ("use server") ]
                   ├─ Eksekusi aman di server node runtime
                   ├─ Validasi skema Zod (checkoutSkema)
                   ├─ Transaksi database atomik Drizzle ORM
                   └─ Revalidasi cache via revalidatePath()
```

### 1. Server Component (Default)

- **Karakteristik:** Berjalan 100% di server, tidak menyertakan JavaScript ke bundel klien, ramah SEO, dan aman mengakses basis data langsung.
- **Penerapan pada VOID Supply:**
  - Halaman Beranda (`src/app/(public)/page.tsx`)
  - Katalog Produk (`src/app/(public)/shop/page.tsx`)
  - Halaman Detail Produk (`src/app/(public)/products/[slug]/page.tsx`)
  - Narasi Koleksi (`src/app/(public)/collection/page.tsx`)
  - Kebijakan & FAQ (`src/app/(public)/faq/page.tsx`)

### 2. Client Component (`"use client"`)

- **Karakteristik:** Memiliki akses ke state peramban, _event listeners_, _browser APIs_ (LocalStorage), dan interaksi taktil.
- **Penerapan pada VOID Supply:**
  - Halaman Keranjang (`src/app/(transaction)/cart/page.tsx` & komponen `CartView` yang membaca `useCartStore`).
  - `SizeSelector` & `SizeGuideModal` (interaksi pemilihan varian ukuran).
  - `ToastContainer` & `ToastItem` (notifikasi pop-up reaktif).
  - `NavigationDrawer` (menu hamburger seluler).
  - `CheckoutForm` (validasi interaktif React Hook Form).

### 3. Server Action (`"use server"`) & Route Handler

- **Server Action:** Digunakan untuk seluruh aksi mutasi formulir dan transaksi tertutup:
  - `buatPesanan()`: Validasi payload Zod, pencatatan transaksi di PostgreSQL, dan pembuatan token Snap Midtrans.
  - `cekOngkirBiteship()`: Pengecekan tarif pengiriman berdasarkan koordinat atau kode pos tujuan.
  - `verifikasiKodeVoucher()`: Pengecekan keabsahan kode promosi drop.
- **Route Handler (`src/app/api/...`):** Dikhususkan untuk komunikasi antar-server pihak ketiga:
  - `POST /api/midtrans/webhook`: Menerima notifikasi status pembayaran dari Midtrans dengan verifikasi SHA-512 signature key.
  - `POST /api/biteship/webhook`: Menerima pembaruan status pos pemeriksaan kurir secara asinkron.

---

## Folder Structure

VOID Supply menolak struktur datar yang mencampur seluruh komponen dalam satu folder (`src/components/Button.tsx`, `Cart.tsx`, `Product.tsx`). Kami menerapkan arsitektur modular berbasis domain fitur (_Feature-Based Architecture_):

```text
src/
├── app/                                       # Routing App Router & Route Groups
│   ├── (public)/                              # Domain Publik (SEO & Content)
│   │   ├── page.tsx                           # Home
│   │   ├── shop/                              # Catalog
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx                # Product Detail
│   │   ├── collection/page.tsx                # Lookbook Editorial
│   │   └── faq/page.tsx                       # Panduan & Ukuran
│   ├── (transaction)/                         # Domain Transaksi Bebas Distraksi
│   │   ├── cart/page.tsx                      # Halaman Keranjang Mandiri (Dedicated Full Page)
│   │   ├── checkout/page.tsx                  # One-Page Guest Checkout
│   │   └── order/[orderId]/page.tsx           # Status Pembayaran & Faktur
│   ├── (customer)/                            # Domain Portal Pelanggan
│   │   ├── account/page.tsx                   # Dasbor Riwayat & Alamat
│   │   └── track/[orderId]/page.tsx           # Pelacakan Publik Kurir
│   ├── admin/                                 # Domain Admin Terisolasi
│   ├── api/                                   # Route Handlers (Webhooks)
│   ├── layout.tsx                             # Root Layout Global
│   └── globals.css                            # Konfigurasi Tailwind CSS v4
│
├── features/                                  # Logika Inti Domain Bisnis
│   ├── product/                               # Fitur Katalog & Varian
│   │   ├── components/                        # ProductCard, VariantSelector, SizeGuide
│   │   ├── hooks/                             # useProductDetail, useStock
│   │   ├── services/                          # product.service.ts (Query Drizzle)
│   │   ├── schemas/                           # product.schema.ts (Zod)
│   │   ├── types/                             # product.types.ts
│   │   └── index.ts                           # Public API Feature Barcode
│   ├── cart/                                  # Fitur Keranjang Belanja
│   ├── checkout/                              # Fitur Formulir Checkout
│   ├── payment/                               # Fitur Integrasi Midtrans
│   └── shipping/                              # Fitur Kurir Biteship
│
├── components/                                # Komponen Bersama Lintas Fitur
│   └── ui/                                    # Primitif UI (Button, Input, Badge, Toast, Modal)
│
├── lib/                                       # Utilitas & Klien Eksternal
│   ├── db/                                    # Koneksi Drizzle ORM & Definisi Skema Tabel
│   ├── midtrans/                              # Inisialisasi Snap Client
│   ├── biteship/                              # Klien HTTP Biteship
│   └── utils.ts                               # cn() tailwind-merge helper
│
├── types/                                     # Global Types & Domain Enums
└── data/                                      # Data Statis Awal (products.ts)
```

---

## Data Flow

Alur data dalam aplikasi memisahkan secara tegas antara data server yang memerlukan otentisitas database dan data klien yang bersifat sementara:

```text
[ Katalog Produk ]
PostgreSQL (Drizzle ORM) ──► Server Component ──► HTML Browser (Cache Tag: 'products')

[ Penambahan Keranjang ]
User Tap [+ KERANJANG] ──► Zustand Store (useCartStore) ──► LocalStorage Persist
                                     │
                                     ▼
                     Navigasi /cart atau Toast Konfirmasi
                            (Dedicated Full Page)

[ Transaksi Checkout ]
Form Klien (React Hook Form)
        │
        ▼ (Validasi Client Zod)
Server Action: buatPesanan()
        │
        ├─► Validasi Ulang Server Zod (checkoutSkema)
        ├─► Pengecekan Sisa Stok Atomik (PostgreSQL Lock)
        ├─► Request Snap Token ke Midtrans API
        ├─► Simpan Pesanan ke Tabel 'pesanan'
        └─► Kembalikan Snap Token ke Klien
        │
        ▼
Buka Modal Midtrans Snap di Browser ──► User Bayar QRIS / VA
        │
        ▼
Midtrans Webhook ──► /api/midtrans/webhook ──► Update Status 'DIBAYAR' di PostgreSQL
                                                    │
                                                    ▼
                                            Kirim Notifikasi Resi Biteship
```

---

## Security Boundary

Keamanan aplikasi dijaga melalui 4 lapisan batas (_Security Boundaries_):

1. **Secret Isolation (.env vs .env.local):** Kredensial rahasia (`MIDTRANS_SERVER_KEY`, `BITESHIP_API_KEY`, `DATABASE_URL`) hanya dieksekusi di lingkungan server Node.js. Variabel publik yang diekspos ke browser wajib diberi prefix `NEXT_PUBLIC_`.
2. **Zero Trust pada Client Payload:** Server Action tidak pernah mempercayai harga atau data produk yang dikirimkan oleh browser. Harga selalu dibaca ulang secara deterministik dari database PostgreSQL menggunakan ID produk yang tervalidasi.
3. **Webhook Cryptographic Signature Verification:** Endpoint `/api/midtrans/webhook` memverifikasi hash SHA-512 `signature_key` dari Midtrans sebelum mengubah status pembayaran.
4. **Isolasi Rute Administratif:** Rute `/admin/*` dilindungi middleware pemeriksaan sesi terenkripsi dan tidak membagikan modul klien dengan rute belanja publik.

---

## Deployment Flow

Aplikasi dideploy menggunakan pipeline otomatis berbasis Git ke platform Vercel:

```text
Developer Push ke branch 'main'
             │
             ▼
[ GitHub CI Quality Gate ]
 ├─ Typecheck: tsc --noEmit
 ├─ Linting: eslint .
 ├─ Unit Test: vitest run
 └─ Build Dry-Run: next build
             │
             ▼ (Jika lolos gate)
[ Vercel Production Build ]
 ├─ Resolusi Environment Variables Vercel Dashboard
 ├─ Turbopack Compilation
 ├─ Optimasi Aset Statis & WebP Image Generation
 └─ Deployment ke Edge Global Network (Zero-Downtime)
```

---

## Tanya Jawab Kesiapan Rekayasa (Interview Readiness)

### Pertanyaan 1: "Kenapa Halaman Produk menggunakan Server Component?"

**Jawaban:**
Karena data produk lebih banyak bersifat _server state_, membutuhkan optimasi mesin pencari (SEO), dan tidak membutuhkan _event listener_ browser yang kompleks. Menggunakan Server Component menghasilkan HTML langsung dari server dengan nol ukuran berkas JavaScript (_zero client-side bundle_), sehingga waktu muat halaman (_First Contentful Paint_) sangat cepat di koneksi seluler.

### Pertanyaan 2: "Kenapa keranjang belanja menggunakan Zustand?"

**Jawaban:**
Karena interaksi keranjang adalah _client state_ sementara yang sering dimutasi oleh pengguna (tambah item, ubah kuantitas, buka/tutup laci) tanpa harus selalu melakukan _network request_ ke server. Zustand sangat ringan (< 1.5 kB), bebas dari _boilerplate_, dan memiliki _middleware persist_ bawaan untuk menyimpan isi keranjang ke LocalStorage sehingga tidak hilang saat tab ditutup.

### Pertanyaan 3: "Kenapa kita membutuhkan Zod jika TypeScript sudah digunakan?"

**Jawaban:**
Karena sistem tipe TypeScript hanya bekerja saat kompilasi (_compile-time_) dan dihapus seluruhnya saat kode dijalankan (_runtime_). TypeScript tidak dapat mencegah galat jika data eksternal (masukan formulir pengguna, respon API logistik, atau webhook) memiliki tipe yang salah. Zod menyediakan validasi skema saat aplikasi berjalan (_runtime validation_), menjamin data yang masuk ke basis data benar-benar sesuai kontrak.
