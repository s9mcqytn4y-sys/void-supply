# VOID Supply Folder Convention & Feature Architecture

Dokumen ini mendefinisikan konvensi struktur direktori dan arsitektur berbasis fitur (_Feature-Based Architecture / Feature Sliced Thinking_) pada basis kode VOID Supply.

---

## 1. Masalah Pendekatan Tradisional (Chaos of Flat Structure)

Pada banyak proyek frontend pemula, seluruh komponen ditumpuk dalam satu folder global:

```text
src/
└── components/
    ├── Button.tsx
    ├── ProductCard.tsx
    ├── ProductDetail.tsx
    ├── ProductAdmin.tsx
    ├── ProductForm.tsx
    ├── Cart.tsx
    ├── CartItem.tsx
    ├── CheckoutForm.tsx
    └── ShippingSelector.tsx
```

### Mengapa Pendekatan Datar Ini Gagal pada Skala Industri?

1. **Kehilangan Batas Konteks (_Loss of Context Boundary_):** Pengembang tidak tahu komponen mana yang dipakai untuk halaman publik, rute admin, atau dialog pop-up.
2. **Kopling Erat yang Berbahaya (_Tight Coupling_):** Mengubah satu baris kode di `ProductForm.tsx` dapat merusak halaman checkout tanpa disadari karena dependensi yang tidak terisolasi.
3. **Pencarian Berkas Lambat:** Dengan puluhan hingga ratusan komponen di satu folder, navigasi kode menjadi lambat dan rentan duplikasi.

---

## 2. Paradigma Feature Sliced Thinking

VOID Supply mengelompokkan kode berdasarkan **Domain Masalah Bisnis (_Business Features_)**, bukan jenis teknis berkas.

Setiap modul bisnis utama menjadi sebuah unit mandiri di dalam folder `src/features/`:

```text
src/features/
├── product/                                   # Domain Katalog, Varian Ukuran, & Panduan Bahan
├── cart/                                      # Domain Keranjang Belanja & Laci Samping
├── checkout/                                  # Domain Alur Transaksi Satu Halaman (Guest Checkout)
├── payment/                                   # Domain Gerbang Pembayaran Midtrans Snap
├── shipping/                                  # Domain Ongkos Kirim & Pelacakan Kurir Biteship
└── account/                                   # Domain Riwayat Pesanan & Verifikasi Pelanggan
```

---

## 3. Anatomi Internal Sebuah Feature

Setiap folder fitur memiliki struktur modular yang seragam:

```text
features/product/
├── components/                                # Komponen antarmuka khusus domain produk
│   ├── product-card.tsx                       # Kartu artikel katalog dengan badge stok
│   ├── variant-selector.tsx                   # Pemilih ukuran (S, M, L, XL) dengan kuota riil
│   ├── size-guide-modal.tsx                   # Modal dimensi tubuh & tabel sentimeter
│   └── product-gallery.tsx                    # Galeri foto editorial rasio 4:5
│
├── hooks/                                     # Custom React hooks untuk logika reaktif
│   ├── use-product-filter.ts                  # Filter kategori, ukuran, dan urutan harga
│   └── use-stock-checker.ts                   # Pengecekan sisa stok berkala
│
├── services/                                  # Akses basis data dan integrasi API
│   ├── product.service.ts                     # Query Drizzle ORM ke tabel 'produk'
│   └── stock.service.ts                       # Mutasi pengurangan stok atomik
│
├── schemas/                                   # Validasi skema runtime Zod
│   ├── product.schema.ts                      # Validasi input produk & varian
│   └── filter.schema.ts                       # Validasi query parameter URL (?category=...)
│
├── types/                                     # Definisi TypeScript domain produk
│   └── product.types.ts                       # Interface Produk, Varian, DimensiUkuran
│
└── index.ts                                   # Gerbang Public API (Barcode) fitur
```

---

## 4. Aturan Public API & Batas Akses Antar-Fitur

Untuk menjaga modularitas, kami menerapkan aturan akses ketat:

### Aturan 1: Impor Hanya Melalui `index.ts`

Fitur lain atau halaman `src/app` hanya boleh mengimpor modul melalui berkas gerbang utama (`index.ts`):

```typescript
// BENAR: Mengimpor melalui public API fitur
import { ProductCard, useStockChecker } from "@/features/product";

// SALAH: Mengimpor file internal fitur secara langsung (Melanggar Enkapsulasi)
import { ProductCard } from "@/features/product/components/product-card";
```

### Aturan 2: Penanganan Dependensi Silang

Jika Fitur `checkout` membutuhkan data dari Fitur `cart`, Fitur `checkout` membaca kontrak tipe atau store yang diekspor secara eksplisit oleh `features/cart/index.ts`. Fitur dilarang mengutak-atik komponen internal milik fitur lain.

---

## 5. Direktori Bersama (Shared Folders)

Kode yang tidak spesifik pada satu fitur bisnis ditempatkan di folder bersama tingkat atas:

| Direktori            | Peran & Batasan Tanggung Jawab                                                | Contoh Berkas                                                                 |
| :------------------- | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `src/components/ui/` | Komponen primitif antarmuka tanpa logika bisnis (_dumb UI components_).       | `button.tsx`, `input.tsx`, `modal.tsx`, `toast.tsx`, `badge.tsx`.             |
| `src/lib/`           | Utilitas umum, inisialisasi basis data, dan konfigurasi pustaka pihak ketiga. | `lib/db/` (Drizzle client), `lib/midtrans/`, `lib/biteship/`, `lib/utils.ts`. |
| `src/types/`         | Definisi tipe data global yang dipakai melintasi seluruh domain.              | `database.types.ts`, `api.types.ts`.                                          |
| `src/data/`          | Data statis awal atau mock seed untuk pengembangan offline.                   | `data/products.ts`.                                                           |

---

## 6. Standar Konvensi Penamaan (Naming Conventions)

Sesuai aturan arsitektur di [GEMINI.md](file:///c:/Projects/VOID%20Supply/GEMINI.md):

1. **Nama Berkas & Folder:** Gunakan `kebab-case` huruf kecil dengan tanda minus (contoh: `product-card.tsx`, `use-cart-store.ts`, `order-status.ts`).
2. **Komponen React:** Gunakan `PascalCase` (contoh: `ProductCard`, `CartDrawer`, `CheckoutForm`).
3. **Fungsi, Hooks, & Variabel:** Gunakan `camelCase` (contoh: `useCartStore`, `hitungTotalBelanja`, `formatRupiah`).
4. **Skema Zod & Tipe TypeScript:** Gunakan konvensi Bahasa Indonesia untuk entitas domain bisnis:
   - Zod Schema: `produkSkema`, `pesananSkema`, `checkoutSkema`.
   - TypeScript Types: `Produk`, `Pesanan`, `Pelanggan`, `StatusPembayaran`.
   - Server Actions: `buatPesanan()`, `ambilDaftarProduk()`, `prosesWebhookMidtrans()`.
