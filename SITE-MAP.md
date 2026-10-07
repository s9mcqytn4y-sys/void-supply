# Arsitektur Informasi & Peta Situs (Information Architecture & Site Map V1) : VOID Supply

Dokumen ini mendefinisikan rancangan Arsitektur Informasi (_Information Architecture_) dan Peta Situs versi 1 (_Site Map V1_) untuk platform commerce streetwear VOID Supply. Rancangan ini berlandaskan riset persona pembeli dan admin pada [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md), pemetaan perjalanan pengguna pada [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md), benchmarking kompetitor di [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md), analisis celah peluang di [opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md), prinsip pengalaman pengguna di [ux-principles.md](file:///c:/Projects/VOID%20Supply/docs/research/ux-principles.md), serta spesifikasi kawat pada [WIREFRAME.md](file:///c:/Projects/VOID%20Supply/WIREFRAME.md).

---

## 1. Struktur Domain Bisnis & Arsitektur Route Next.js

Struktur arsitektur situs web VOID Supply dibagi ke dalam 4 domain bisnis utama. Pembagian ini bukan hanya struktur menu visual, melainkan fondasi langsung bagi:

- **Route Architecture Next.js App Router** (pemanfaatan Route Groups bertanda kurung).
- **Authorization Boundary** (pemisahan akses publik, transaksi aman, sesi pelanggan, dan rute admin terisolasi).
- **Folder Organization** (`src/app/(public)`, `src/app/(transaction)`, `src/app/(customer)`, `src/app/admin`).
- **Database Relationship & Middleware Isolation**.

```text
src/app
│
├── (public)/                                 -> [PUBLIC DOMAIN]
│   ├── page.tsx                              -> Home (/)
│   ├── shop/                                 -> Catalog (/shop)
│   │   ├── page.tsx                          -> ?category=(all|new-drop|best-seller|archive)
│   │   └── [slug]/page.tsx                   -> Product Detail (/products/[slug])
│   ├── collection/page.tsx                   -> Story Campaign (/collection)
│   ├── about/page.tsx                        -> Filosofi Brand (/about)
│   ├── faq/page.tsx                          -> Panduan Belanja & Garansi (/faq)
│   └── contact/page.tsx                      -> Saluran Bantuan (/contact)
│
├── (transaction)/                            -> [TRANSACTION DOMAIN]
│   ├── cart/page.tsx                         -> Cart Drawer / Page (/cart)
│   ├── checkout/page.tsx                     -> One-Page Guest Checkout (/checkout)
│   ├── order/[orderId]/page.tsx              -> Payment Result & Invoice (/order/[orderId])
│   └── track/[orderId]/page.tsx              -> Public Courier Tracking (/track/[orderId])
│
├── (customer)/                               -> [CUSTOMER DOMAIN]
│   ├── account/page.tsx                      -> Customer Portal (/account)
│   ├── account/orders/page.tsx               -> Order History (/account/orders)
│   ├── account/wishlist/page.tsx             -> Saved Wishlist (/account/wishlist)
│   └── account/address/page.tsx              -> Address Book (/account/address)
│
└── admin/                                    -> [ADMIN DOMAIN - Isolated Route]
    ├── page.tsx                              -> Dashboard (/admin)
    ├── products/page.tsx                     -> Katalog & Varian (/admin/products)
    ├── inventory/page.tsx                    -> Stok Atomik (/admin/inventory)
    ├── orders/page.tsx                       -> Kelola Resi & Midtrans (/admin/orders)
    ├── customers/page.tsx                    -> Direktori Pembeli (/admin/customers)
    └── promotions/page.tsx                   -> Kupon & Pengumuman (/admin/promotions)
```

---

## 2. Navigasi & Aturan Perilaku (Navigation Rules)

Seluruh navigasi platform wajib tunduk pada 5 aturan navigasi operasional:

1. **Aturan 2-Tap ke Produk:** Pengguna dapat mencapai halaman detail produk mana pun maksimal dalam 2 ketukan (_tap_) dari halaman Home.
2. **Keranjang Belanja Selalu Terjangkau:** Akses keranjang (_Cart_) selalu tersedia secara persisten baik melalui header maupun _bottom bar_ dengan indikator angka belanja aktif.
3. **Checkout Bebas Distraksi (_Distraction-Free Checkout_):** Pada rute `/checkout`, seluruh bilah menu umum, footer penuh, dan navigasi eksternal dihilangkan untuk meminimalkan _cart abandonment_.
4. **Isolasi Rute Admin:** Rute `/admin/*` diisolasi sepenuhnya dari rute publik dengan validasi sesi terenkripsi, bebas dari aset dan layout belanja publik.
5. **Ergonomi Ramah Jempol Seluler:** Mengingat 95% akses berasal dari smartphone, seluruh tombol aksi utama (_Primary CTA_) dan navigasi inti ditempatkan di sepertiga bawah layar (_Thumb Zone_) dengan batas minimum sentuh 44px.

---

## 3. Klarifikasi Ranah Publik: Collection vs. Archive

Untuk mencegah kebingungan pengguna antara tempat bertransaksi vs tempat membaca narasi, ditetapkan diferensiasi arsitektur yang tegas:

| Aspek                | Katalog Archive (`/shop?category=archive`)                        | Story Collection (`/collection`)                                      |
| :------------------- | :---------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **Tujuan Utama**     | Etalase produk lama dan arsip rilis terdahulu.                    | Narasi kampanye cerita (_Story Campaign_) dan tema rilisan.           |
| **Contoh Konten**    | _VOID Core Heavy Tee 2025_ (Status: _SOLD OUT_).                  | _VOID: Night Transmission Collection_ (Konsep subkultur bawah tanah). |
| **Fungsi Mental**    | Rekam jejak sejarah merek (_Brand History_) dan bukti kelangkaan. | Eksplorasi editorial (_Lookbook styling_) dan pengenalan nilai seni.  |
| **Aksi Pengguna**    | Melihat arsip, membandingkan rilis lama, mendaftar _waitlist_.    | Membaca narasi, menonton visual kampanye, menelusuri editorial foto.  |
| **Karakter Halaman** | Grid katalog e-commerce dengan harga arsip dan status stok.       | Layout editorial majalah dengan visual dominan dan tipografi naratif. |

---

## 4. Rasionalisasi Desain Kategori MVP (Anti-Mega Menu)

VOID Supply menolak taksonomi berbasis klasifikasi gudang internal yang rumit (T-Shirts, Longsleeves, Hoodies, Zip-Hoodies, Cargo Pants, Caps, Socks), dan memilih struktur berbasis model mental pembeli:

1. **All Products:** Menampilkan seluruh artikel merchandise aktif.
2. **New Drop:** Menyorot koleksi rilisan edisi terbatas terbaru (_Drop Culture_).
3. **Best Seller:** Menampilkan artikel paling diminati untuk mempercepat konversi pembeli baru.
4. **Archive:** Menampilkan arsip artikel edisi terbatas masa lalu untuk memperkuat prestise dan eksklusivitas merek.

### Mengapa Pendekatan Ini Dipilih?

- **Menghindari Sindrom Mega-Menu:** Merek massal seperti Erigo membebani pengguna dengan 10+ sub-kategori yang membutuhkan 3 sampai 4 ketukan di ponsel.
- **Sesuai Skala Brand Terkurasi:** Brand independen dengan volume artikel terkurasi (5-10 artikel per drop) akan terlihat kosong jika dibagi ke kategori konvensional.
- **1-Tap Quick Chip Bar:** Keempat kategori disajikan dalam chip bar horizontal yang ramah jangkauan jempol di smartphone.

---

## 5. Pemetaan Halaman dengan 5 Stage Customer Journey

| Domain          | Halaman Situs          | Rute URL                | Fase Perjalanan Pelanggan | Tujuan Pengguna (_User Goal / Page Purpose_)                                                             |
| :-------------- | :--------------------- | :---------------------- | :------------------------ | :------------------------------------------------------------------------------------------------------- |
| **Public**      | **Home**               | `/`                     | Awareness                 | Menangkap identitas merek dalam 3 detik pertama dan menemukan rilis terbatas terkini.                    |
| **Public**      | **Shop**               | `/shop`                 | Consideration             | Menjelajahi katalog terkurasi dengan filter 1-tap (All, New Drop, Best Seller, Archive).                 |
| **Public**      | **Product Detail**     | `/products/[slug]`      | Consideration & Decision  | Menghilangkan keraguan ukuran (_Size Confidence_), memeriksa kualitas kain asli, dan mengecek sisa stok. |
| **Public**      | **Collection**         | `/collection`           | Awareness & Consideration | Menikmati narasi konsep visual lookbook dan cerita tema rilisan terbatas.                                |
| **Public**      | **About VOID**         | `/about`                | Awareness & Trust         | Memvalidasi filosofi subkultur dan standar produksi material katun gramasi berat.                        |
| **Public**      | **FAQ & Contact**      | `/faq`, `/contact`      | Decision & Support        | Mengetahui panduan retur ukuran, estimasi kurir, dan saluran bantuan cepat.                              |
| **Transaction** | **Cart**               | `/cart`                 | Decision                  | Mengelola kuantitas item belanja, memasukkan kupon promo, dan meninjau subtotal tagihan.                 |
| **Transaction** | **Checkout**           | `/checkout`             | Purchase                  | Menyelesaikan transaksi belanja instan tanpa kewajiban registrasi akun (< 60 detik).                     |
| **Transaction** | **Payment Result**     | `/order/[orderId]`      | Purchase                  | Menerima verifikasi pembayaran lunas instan dari Midtrans Snap beserta faktur pesanan resmi.             |
| **Transaction** | **Order Tracking**     | `/track/[orderId]`      | Retention                 | Memantau pergerakan kurir secara mandiri (_self-service_) berbasis webhook Biteship.                     |
| **Customer**    | **Account & Orders**   | `/account`, `/orders`   | Retention                 | Mengakses riwayat transaksi masa lalu dan mengunduh bukti invoice digital.                               |
| **Customer**    | **Wishlist & Address** | `/wishlist`, `/address` | Retention                 | Menyimpan artikel favorit dan buku alamat untuk mempercepat transaksi berikutnya.                        |
| **Admin**       | **Dashboard & Ops**    | `/admin/*`              | Internal Operations       | Mengelola inventaris atomik, memproses resi kurir, dan memantau analitik omzet toko.                     |

---

## 6. Spesifikasi Hirarki Antarmuka Kunci

### A. Hirarki Halaman Detail Produk (Product Detail Page - 8 Step Mental Model)

Product Detail Page (PDP) adalah halaman paling strategis VOID Supply (_The Confidence Builder_). Susunan seksi disusun secara ketat mengikuti alur mental model pengguna:

> **Apa ini? $\rightarrow$ Apakah saya suka? $\rightarrow$ Apakah cocok? $\rightarrow$ Bagaimana beli?**

1. **Gallery:** Galeri multi-foto rasio 4:5 dengan foto pencahayaan alami dan foto makro tekstur rajutan kain.
2. **Product Identity:** Nama artikel, harga resmi dalam font monospace tabular, dan badge status rilis terbatas.
3. **Social Proof:** Indikator kuantitas terjual (_Sold count_) dan ulasan komunitas terverifikasi.
4. **Variant Selection:** Pilihan warna dan tombol ukuran (S, M, L, XL) dengan indikator kuota stok atomik.
5. **Size Confidence:** Modal panduan ukuran interaktif dengan parameter fisik model asli (_Tinggi: 178 cm, Berat: 68 kg, Pakai: Size L_) serta tabel dimensi sentimeter riil.
6. **Material Transparency:** Uraian spesifikasi kain (Katun Combed 24s Heavyweight, sablon High Density Plastisol) dan petunjuk perawatan.
7. **Shipping Estimate:** Kalkulator cepat estimasi biaya dan hari pengiriman kurir lokal.
8. **Primary CTA:** Tombol "Tambah ke Keranjang" dan "Beli Sekarang" melekat di bilah bawah (_Sticky Bottom Bar_) ramah jempol.

### B. Alur Checkout Linear (One-Page Guest Checkout)

Untuk menyederhanakan proses belanja dan mencegah resistensi pengguna, istilah yang digunakan berorientasi pada pengiriman barang fisik:

```text
Contact & Address  ──>  Shipping Method  ──>  Payment Selection  ──>  Order Confirmation
```

- **Contact & Address:** Menggantikan istilah teknis "Customer Data". Pengguna hanya mengisi email aktif, nomor WhatsApp (untuk notifikasi resi), dan alamat lengkap.
- **Shipping Method:** Pilihan kurir reguler/kilat terintegrasi Biteship API dengan ongkos kirim transparan.
- **Payment Selection:** Opsi pembayaran otomatis Midtrans Snap (QRIS GoPay/ShopeePay, Virtual Account BCA/Mandiri).
- **Order Confirmation:** Tinjauan ringkas faktur pesanan dan tombol eksekusi transaksi instan.

### C. Prioritas Rekayasa Domain Admin (Dimas Setyawan)

Pengembangan modul operasional internal disusun secara disiplin berdasarkan dampak kelangsungan bisnis:

```text
Storefront  ──>  Checkout  ──>  Payment Gateway  ──>  Order Management  ──>  Admin Dashboard
```

> **Catatan Rekayasa:** Bisnis tidak terhenti karena tampilan dashboard admin kurang mewah. Bisnis mati jika alur transaksi belanja pelanggan mengalami kegagalan. Karena itu, prioritas difokuskan penuh pada keandalan Storefront, Checkout, dan Pembayaran sebelum menyempurnakan fitur visual dashboard admin.

---

## 7. Evaluasi Navigasi Ponsel (Mobile Bottom Bar)

Dalam pengujian ergonomi satu tangan (_Thumb Zone_), komposisi bilah navigasi bawah dievaluasi untuk efisiensi harian:

| Opsi Navigasi                  | Konfigurasi 5 Ikon                                            | Evaluasi UX & Keputusan                                                                                                                                                            |
| :----------------------------- | :------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1 (Awal)**                  | Home $\cdot$ Shop $\cdot$ Cart $\cdot$ Track $\cdot$ Account  | Fitur _Track Order_ jarang diakses setiap sesi; menaruhnya di bilah navigasi utama dapat menyita ruang berharga.                                                                   |
| **V2 (Rekomendasi Wireframe)** | Home $\cdot$ Shop $\cdot$ Search $\cdot$ Cart $\cdot$ Account | Memasukkan _Search_ mempercepat penemuan produk; fitur _Track_ tetap dapat diakses instan melalui menu akun (`/account/orders`), email resi, atau tombol tautan cepat pada header. |
| **Keputusan Desain**           | _Revisit during wireframe testing_                            | Komposisi V2 diuji dalam wireframe interaktif untuk mengukur frekuensi penggunaan pencarian katalog vs pengecekan resi kurir.                                                      |
