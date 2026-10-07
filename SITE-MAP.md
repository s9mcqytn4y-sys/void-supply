# Arsitektur Informasi & Peta Situs (Information Architecture & Site Map V1) : VOID Supply

Dokumen ini mendefinisikan rancangan Arsitektur Informasi (_Information Architecture_) dan Peta Situs versi 1 (_Site Map V1_) untuk situs web VOID Supply. Rancangan ini disusun berdasarkan riset kebutuhan persona pembeli dan admin pada [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md), 5 fase perjalanan pada [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md), analisis kompetitor pada [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md), analisis celah peluang pada [opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md), prinsip pengalaman pengguna pada [ux-principles.md](file:///c:/Projects/VOID%20Supply/docs/research/ux-principles.md), serta diterjemahkan ke dalam tata letak kawat pada [WIREFRAME.md](file:///c:/Projects/VOID%20Supply/WIREFRAME.md).

---

## 1. Diagram Pohon Arsitektur Informasi (Site Map V1)

Struktur navigasi situs web VOID Supply dibagi ke dalam 4 domain utama: **Public**, **Transaction**, **Customer**, dan **Admin**:

```text
VOID Supply Website (/)
│
├── [PUBLIC DOMAIN]
│   ├── Home (/)
│   ├── Shop (/shop)
│   │   ├── All Products (/shop?category=all)
│   │   ├── New Drop (/shop?category=new-drop)
│   │   ├── Best Seller (/shop?category=best-seller)
│   │   └── Archive (/shop?category=archive)
│   ├── Product Detail (/products/[slug])
│   ├── Collection (/collection)
│   ├── About VOID (/about)
│   ├── FAQ (/faq)
│   └── Contact (/contact)
│
├── [TRANSACTION DOMAIN]
│   ├── Cart (/cart)
│   ├── Checkout (/checkout)
│   ├── Payment Result (/order/[orderId])
│   └── Order Tracking (/track/[orderId])
│
├── [CUSTOMER DOMAIN]
│   ├── Account Portal (/account)
│   ├── Order History (/account/orders)
│   ├── Wishlist (/account/wishlist)
│   └── Address Book (/account/address)
│
└── [ADMIN DOMAIN] (Operations - Persona Dimas Setyawan)
    ├── Dashboard (/admin)
    ├── Products (/admin/products)
    ├── Inventory (/admin/inventory)
    ├── Orders (/admin/orders)
    ├── Customers (/admin/customers)
    └── Promotions (/admin/promotions)
```

---

## 2. Rasionalisasi Desain Kategori MVP (Anti-Mega Menu)

### Keputusan Arsitektur Kategori Katalog

Alih-alih membuat puluhan kategori produk yang rumit (seperti T-Shirts, Longsleeves, Hoodies, Zip-Hoodies, Cargo Pants, Caps, Socks), VOID Supply merampingkan taksonomi MVP menjadi 4 pilar kurasi:

1. **All Products:** Menampilkan seluruh katalog merchandise yang aktif.
2. **New Drop:** Menyorot koleksi rilisan edisi terbatas terbaru (_Drop Culture_).
3. **Best Seller:** Menampilkan artikel paling diminati untuk mempercepat konversi pembeli baru.
4. **Archive:** Menampilkan arsip artikel edisi terbatas masa lalu (sebagian berstatus _Sold Out_) untuk memperkuat prestise, reputasi sejarah, dan eksklusivitas merek.

### Mengapa Pendekatan Ini Dipilih?

- **Menghindari Sindrom "Mega Menu Erigo":** Merek e-commerce massal sering membanjiri pengguna dengan 10+ kategori turunan yang membingungkan di layar ponsel dan membutuhkan 3 hingga 4 ketukan.
- **Sesuai Skala Brand Bertumbuh:** VOID Supply adalah merek independen dengan volume artikel terkurasi. Struktur yang ramping memungkinkan pengguna menjelajahi seluruh produk dalam hitungan detik.
- **Ergonomi Filter Cepat di Smartphone:** Keempat kategori ini dapat disajikan dalam barisan chip horizontal 1-tap (_Quick Chip Bar_) yang ramah jangkauan jempol.

---

## 3. Pemetaan Halaman dengan 5 Stage Customer Journey

| Domain          | Halaman Situs          | Rute URL                | Fase Perjalanan Pelanggan | Tujuan Pengguna (_User Goal_)                                                                              |
| :-------------- | :--------------------- | :---------------------- | :------------------------ | :--------------------------------------------------------------------------------------------------------- |
| **Public**      | **Home**               | `/`                     | Awareness                 | Memahami identitas merek dalam 3 detik pertama dan menemukan rilis terbaru.                                |
| **Public**      | **Shop**               | `/shop`                 | Consideration             | Eksplorasi katalog terkurasi dengan filter 1-tap (All, New Drop, Best Seller, Archive).                    |
| **Public**      | **Product Detail**     | `/products/[slug]`      | Consideration & Decision  | Menghilangkan keraguan ukuran (_Size Confidence_), melihat tekstur kain asli, dan mengecek stok real-time. |
| **Public**      | **Collection**         | `/collection`           | Awareness & Consideration | Menikmati narasi konsep visual lookbook dan cerita tema rilisan terbatas.                                  |
| **Public**      | **About VOID**         | `/about`                | Awareness & Trust         | Memvalidasi filosofi merek dan standar kualitas material katun gramasi berat.                              |
| **Public**      | **FAQ & Contact**      | `/faq`, `/contact`      | Decision & Support        | Mengetahui panduan retur ukuran, estimasi kurir, dan saluran bantuan cepat.                                |
| **Transaction** | **Cart**               | `/cart`                 | Decision                  | Mengelola item belanjaan, menerapkan voucher diskon, dan meninjau subtotal.                                |
| **Transaction** | **Checkout**           | `/checkout`             | Purchase                  | Menyelesaikan transaksi instan tanpa wajib registrasi akun (< 60 detik).                                   |
| **Transaction** | **Payment Result**     | `/order/[orderId]`      | Purchase                  | Memverifikasi pembayaran lunas otomatis dari Midtrans Snap dan nomor faktur.                               |
| **Transaction** | **Order Tracking**     | `/track/[orderId]`      | Retention                 | Memantau pergerakan kurir secara mandiri (_self-service_) berbasis webhook Biteship.                       |
| **Customer**    | **Account & Orders**   | `/account`, `/orders`   | Retention                 | Mengakses riwayat belanja masa lalu dan mengunduh bukti invoice transaksi.                                 |
| **Customer**    | **Wishlist & Address** | `/wishlist`, `/address` | Retention                 | Menyimpan artikel favorit dan buku alamat untuk mempercepat transaksi berikutnya.                          |
| **Admin**       | **Dashboard & Ops**    | `/admin/*`              | Internal Management       | Mengelola inventaris atomik, memproses resi, dan memantau analitik harian.                                 |

---

## 4. Spesifikasi Rinci Modul Halaman

### A. Public Domain

#### 1. Home (`/`)

- **Tujuan Halaman:** Mengubah pengunjung pertama menjadi penjelajah produk (_Convert visitor into product explorer_).
- **Urutan Seksi:** Hero $\rightarrow$ Featured Drop $\rightarrow$ Brand Story $\rightarrow$ Best Seller $\rightarrow$ Community $\rightarrow$ Footer.
- **Komponen Kunci:** Banner visual WebP beresolusi tinggi, penyorot kuota stok rilis terbatas, pilar kualitas katun gramasi berat, dan galeri komunitas media sosial.

#### 2. Shop (`/shop`)

- **Tujuan Halaman:** Eksplorasi katalog yang cepat dan fleksibel di bawah 5 detik.
- **Kategori MVP:** All Products, New Drop, Best Seller, Archive.
- **Komponen Kunci:** Quick Chip Bar kategori, Bottom Sheet Filter Drawer (ukuran S-XXL, rentang harga), grid produk responsif 2 kolom mobile / 4 kolom desktop, dan badge stok real-time.

#### 3. Product Detail (`/products/[slug]`)

- **Tujuan Halaman:** Menghapus ketakutan belanja online (_Remove buying anxiety_).
- **Urutan Seksi:** Gallery $\rightarrow$ Product Info $\rightarrow$ Variant $\rightarrow$ Size Guide $\rightarrow$ Material $\rightarrow$ Shipping $\rightarrow$ CTA.
- **Komponen Kunci:** Galeri foto multi-sudut makro tekstur kain, pemilih ukuran dengan indikator sisa stok, modal Interactive Size Guide berprofil model asli, kalkulator ongkir cepat, dan Sticky Bottom Action Bar di zona jempol.

#### 4. Collection (`/collection`), About (`/about`), FAQ (`/faq`), Contact (`/contact`)

- **Tujuan Halaman:** Memperkuat cerita kultur streetwear (_Storytelling_), transparansi standar produksi, dan saluran bantuan pelanggan terpercaya.

### B. Transaction Domain

#### 1. Cart (`/cart`)

- **Tujuan Halaman:** Pengelolaan item pesanan sementara dengan persistensi lokal via Zustand.
- **Komponen Kunci:** Baris item dengan kontrol kuantitas (+/-), input voucher diskon, ringkasan kalkulasi tagihan, dan tombol navigasi ke checkout.

#### 2. Checkout (`/checkout`)

- **Tujuan Halaman:** Menyelesaikan transaksi belanja di bawah 60 detik (_Complete purchase <60s_).
- **Urutan Seksi:** Customer Data $\rightarrow$ Shipping $\rightarrow$ Payment $\rightarrow$ Confirmation.
- **Komponen Kunci:** Formulir linear satu layar (One-Page Guest Checkout), kurir lokal real-time via Biteship, pemilihan metode bayar Midtrans Snap QRIS / Virtual Account, dan indikator keamanan SSL.

#### 3. Payment Result (`/order/[orderId]`) & Order Tracking (`/track/[orderId]`)

- **Tujuan Halaman:** Konfirmasi pembayaran instan dan pelacakan kurir logistik mandiri tanpa perlu bertanya manual ke admin toko.
- **Komponen Kunci:** Lencana status transaksi lunas, nomor faktur pesanan, garis waktu pergerakan kurir real-time, dan tombol salin resi 1-tap.

### C. Customer Domain

#### 1. Account Portal (`/account`) & Order History (`/account/orders`)

- **Tujuan Halaman:** Akses riwayat pesanan progresif via tautan Magic Link atau nomor faktur + WhatsApp tanpa kewajiban kata sandi.

#### 2. Wishlist (`/account/wishlist`) & Address Book (`/account/address`)

- **Tujuan Halaman:** Menyimpan artikel rilis terbatas yang diincar dan mempercepat proses isi alamat pada pembelian berikutnya.

### D. Admin Domain (Operasional Dimas "Operations" Setyawan)

Berdasarkan analisis kebutuhan persona admin pada [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md):

1. **Dashboard (`/admin`):** Ringkasan metrik penjualan harian, rasio konversi keranjang, dan status transaksi lunas.
2. **Products (`/admin/products`):** Penambahan dan pengeditan katalog, pengelolaan foto resolusi tinggi, dan penentuan varian ukuran.
3. **Inventory (`/admin/inventory`):** Pengawasan stok atomik real-time, peringatan stok menipis (_low stock alert_), dan pencegahan penjualan berlebih (_overselling_).
4. **Orders (`/admin/orders`):** Pemrosesan pesanan masuk, verifikasi status Midtrans, pembuatan resi kurir otomatis via Biteship, dan cetak label pengiriman.
5. **Customers (`/admin/customers`):** Database kontak pembeli (WhatsApp terverifikasi) dan riwayat nilai transaksi pelanggan (CLV).
6. **Promotions (`/admin/promotions`):** Pengaturan kode voucher promosi, potongan harga edisi drop, dan banner pengumuman situs web.

---

## 5. Navigasi Ponsel Pintar (Mobile Bottom Bar)

Untuk memastikan seluruh alur perjalanan pengguna dapat dijangkau oleh satu tangan pada layar ponsel (sesuai prinsip _Thumb-Zone Centric Ergonomics_):

| Tombol Navigasi   | Ikon              | Rute Target        | Indikator Status & Peran                        |
| :---------------- | :---------------- | :----------------- | :---------------------------------------------- |
| **Beranda**       | Home Icon         | `/`                | Pintu gerbang visual dan rilis terbaru.         |
| **Katalog**       | Grid Icon         | `/shop`            | Akses instan katalog dengan 4 kategori MVP.     |
| **Keranjang**     | Shopping Bag Icon | `/cart`            | Badge angka dinamis berisi jumlah item belanja. |
| **Lacak Pesanan** | Truck Icon        | `/track/[orderId]` | Akses mandiri pelacakan status resi kurir.      |
| **Akun**          | User Icon         | `/account`         | Akses profil, riwayat pesanan, dan wishlist.    |
