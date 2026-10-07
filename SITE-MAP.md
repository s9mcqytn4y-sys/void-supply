# Arsitektur Informasi & Peta Situs (Information Architecture & Site Map) : VOID Supply

Dokumen ini mendefinisikan rancangan Arsitektur Informasi (_Information Architecture_) dan Peta Situs (_Site Map_) untuk situs web VOID Supply. Rancangan ini disusun berdasarkan riset kebutuhan persona Rian "The Trendsetter" Pratama di [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md), 5 fase di [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md), serta analisis celah kompetitor di [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md).

---

## 1. Diagram Pohon Arsitektur Informasi

Struktur navigasi utama situs web VOID Supply:

```text
Home (/)
├── Shop (/shop)
│   ├── ?category=[kategori]
│   ├── ?size=[ukuran]
│   └── ?sort=[urutan]
├── Product Detail (/products/[slug])
├── Cart (/cart)
├── Checkout (/checkout)
├── Account (/account)
│   ├── /account/orders (Riwayat Pesanan)
│   └── /account/profile (Pengaturan Profil & Alamat)
└── Order Tracking (/track/[orderId])
```

---

## 2. Pemetaan Halaman dengan 5 Stage Customer Journey

| Halaman Situs      | Rute URL           | Fase Perjalanan Pelanggan | Tujuan Utama Pengguna (_User Goal_)                                                                                     |
| :----------------- | :----------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| **Home**           | `/`                | Awareness                 | Membangun impresi visual pertama, memvalidasi reputasi merek, dan menyorot rilis terbatas (_limited drop_).             |
| **Shop**           | `/shop`            | Consideration             | Eksplorasi katalog merchandise lengkap dengan penyaringan kategori, ukuran, dan rentang harga yang cepat.               |
| **Product Detail** | `/products/[slug]` | Consideration & Decision  | Menghapus keraguan ukuran (_size confidence_), memeriksa tekstur bahan asli, dan mengecek ketersediaan stok real-time.  |
| **Cart**           | `/cart`            | Decision                  | Mengelola item belanja, memeriksa estimasi subtotal, dan menerapkan kupon promosi.                                      |
| **Checkout**       | `/checkout`        | Purchase                  | Menyelesaikan transaksi instan tanpa wajib registrasi (_One-Page Guest Checkout_), memilih kurir, dan bayar via QRIS.   |
| **Order Tracking** | `/track/[orderId]` | Retention                 | Memantau posisi kurir paket secara mandiri (_self-service tracking_) dari nomor resi pengiriman.                        |
| **Account**        | `/account`         | Retention                 | Mengakses arsip riwayat belanja (_order history_), menyimpan alamat favorit, dan mendapatkan akses awal rilis terbatas. |

---

## 3. Spesifikasi Rinci Setiap Halaman

### A. Home (`/`)

- **Peran Halaman:** Pintu gerbang utama visual toko (_Storefront Landing_).
- **Jenis Komponen:** Next.js 16 Server Component (RSC) dengan _Streaming SSR_.
- **Tujuan Pengguna:** Memahami identitas merek VOID Supply dalam waktu 3 detik pertama dan menemukan koleksi rilis terbaru tanpa hambatan.
- **Blok & Komponen Antarmuka Kunci:**
  1. _Header & Navigasi_: Logo merek, tautan katalog (_Shop_), tautan pelacakan pesanan (_Track_), ikon keranjang belanja (_Cart Badge_), dan ikon akun.
  2. _Hero Section_: Banner visual resolusi tinggi format WebP berkarakter streetwear dengan tipografi tegas, judul rilis terbatas (_Limited Drop Title_), dan tombol aksi (_CTA_) "Lihat Koleksi Terbaru".
  3. _Limited Drop Spotlight_: Panel penyorot koleksi edisi terbatas yang dilengkapi status kuota inventaris dan label ketersediaan.
  4. _Featured Product Grid_: Kartu produk terpopuler (foto tampak depan, harga, label stok, dan efek transisi hover halus).
  5. _Brand Value Highlights_: Tiga pilar jaminan belanja (Kualitas Katun Gramasi Tinggi, Transaksi QRIS Otomatis, Pengiriman Terlacak Real-Time).
  6. _Footer_: Navigasi kebijakan privasi, syarat ketentuan, kontak layanan pelanggan, dan tautan komunitas media sosial (Instagram, TikTok, Discord).
- **Kebutuhan State UI:**
  - _Loading_: Kerangka animasi abu-abu (_Skeleton Loader_) untuk kartu produk.
  - _Error_: Tampilan fallback ramah pengguna dengan tombol muat ulang data.

---

### B. Shop (`/shop`)

- **Peran Halaman:** Katalog eksplorasi seluruh produk merchandise (_Product Listing Page_).
- **Jenis Komponen:** RSC untuk _data fetching_ awal dipadukan dengan Client Component untuk interaktivitas filter URL parameters.
- **Tujuan Pengguna:** Menemukan produk yang cocok berdasarkan kategori spesifik (T-Shirt, Hoodie, Pants, Accessories), varian ukuran yang tersedia, dan rentang harga.
- **Blok & Komponen Antarmuka Kunci:**
  1. _Sticky Filter & Sort Bar_: Filter kategori produk, filter ukuran baju (S, M, L, XL, XXL), dan pengurutan (_Terbaru, Harga Terendah, Harga Tertinggi, Paling Populer_). Pada tampilan mobile, filter disajikan dalam laci geser (_bottom sheet / drawer_).
  2. _Active Filter Chips_: Indikator tag filter yang aktif dengan tombol hapus cepat per kriteria.
  3. _Product Grid Responsive_: Tata letak grid 2 kolom di smartphone dan 4 kolom di desktop. Setiap kartu produk memuat foto WebP tajam, judul produk, varian warna, harga retail, dan badge ketersediaan (_In Stock / Low Stock / Sold Out_).
  4. _Pagination / Infinite Scroll_: Tombol "Muat Lebih Banyak" (_Load More_) yang efisien tanpa membebani memori peramban ponsel.
- **Kebutuhan State UI:**
  - _Empty State_: Ditampilkan jika kombinasi filter tidak menghasilkan produk, dilengkapi tombol "Reset Semua Filter".
  - _Loading State_: Skeleton grid produk yang mempertahankan dimensi tata letak asli untuk mencegah lonjakan pergeseran tata letak (_Cumulative Layout Shift / CLS_).

---

### C. Product Detail (`/products/[slug]`)

- **Peran Halaman:** Halaman keputusan konversi penjualan produk (_Product Detail Page_).
- **Jenis Komponen:** RSC untuk _Search Engine Optimization (SEO)_ dinamis dan metadata OpenGraph, dipadukan dengan Client Component untuk pemilih varian dan keranjang.
- **Tujuan Pengguna:** Memvalidasi kecocokan potongan pakaian (_fit_), memeriksa detail bahan, dan memilih varian ukuran dengan kepastian stok.
- **Blok & Komponen Antarmuka Kunci:**
  1. _Product Media Gallery_: Galeri foto resolusi tinggi multi-sudut (depan, belakang, tampak samping, serta foto makro serat kain dan detail sablon). Dilengkapi kemampuan pembesaran (_zoom-in viewer_) tanpa filter saturasi berlebih.
  2. _Header Produk_: Judul produk lengkap, seri rilis edisi, dan harga produk transparan.
  3. _Interactive Size Guide_: Modal panduan ukuran interaktif yang menyertakan data fisik model foto (contoh: _Model Pria: 175 cm, 65 kg memakai ukuran L_) dan tabel dimensi sentimeter (panjang baju, lebar dada, panjang lengan).
  4. _Variant Selector_: Tombol pemilihan ukuran dan warna dengan indikator status stok real-time (_Real-Time Stock Badge_ per varian). Varian yang habis ditandai garis coret non-aktif.
  5. _Quick Shipping Estimator_: Input kode pos atau kota tujuan cepat untuk melihat estimasi tarif kurir sebelum masuk keranjang.
  6. _Action CTA Buttons_: Tombol primer "Tambah ke Keranjang" (_Add to Cart_) dan tombol sekunder "Beli Sekarang" (_Direct Checkout_). Jika stok habis, tombol bertransformasi menjadi "Beri Tahu Saya Saat Tersedia" (_Notify Me_).
  7. _Product Technical Accordion_: Deskripsi spesifikasi material (gramasi katun 16s/24s, jenis tinta sablon, instruksi pencucian agar sablon awet).
- **Kebutuhan State UI:**
  - _Out of Stock State_: Formulir pendaftaran minat via WhatsApp atau email untuk restock.
  - _Variant Selected State_: Pembaruan harga dan kuota stok otomatis saat ukuran diubah.

---

### D. Cart (`/cart`)

- **Peran Halaman:** Pengelola sementara item pesanan sebelum tahap pembayaran (_Shopping Cart_).
- **Jenis Komponen:** Client Component yang tersinkronisasi dengan _Zustand LocalStorage Store_.
- **Tujuan Pengguna:** Memeriksa kembali daftar belanjaan, menyesuaikan jumlah kuantitas, memasukkan kode voucher diskon, dan memastikan total belanjaan akurat.
- **Blok & Komponen Antarmuka Kunci:**
  1. _Cart Items Table/List_: Daftar item pesanan yang memuat gambar thumbnail mini, judul produk, varian ukuran terpilih, harga satuan, pengatur kuantitas (+/-), dan tombol hapus item.
  2. _Coupon Code Box_: Formulir input kode kupon diskon atau voucher promosi dengan validasi pesan instan.
  3. _Order Summary Card_: Rincian subtotal produk, diskon kupon yang diterapkan, dan catatan biaya pengiriman yang akan dihitung pada tahap checkout.
  4. _Navigation CTA_: Tombol utama "Lanjutkan ke Checkout" dan tombol sekunder "Lanjut Berbelanja".
- **Kebutuhan State UI:**
  - _Empty Cart State_: Tampilan kosong yang ramah dengan ilustrasi tas belanja bersih dan tombol aksi menuju halaman Shop.
  - _Stock Conflict State_: Peringatan dinamis jika ada item di keranjang yang kuota stoknya berkurang atau habis sebelum checkout.

---

### E. Checkout (`/checkout`)

- **Peran Halaman:** Pusat penyelesaian transaksi tanpa friksi (_One-Page Guest Checkout_).
- **Jenis Komponen:** Client Component teroptimasi dengan Server Actions untuk validasi data instan via Zod.
- **Tujuan Pengguna:** Menyelesaikan pembayaran belanja dalam waktu di bawah 60 detik tanpa kewajiban registrasi akun.
- **Blok & Komponen Antarmuka Kunci:**
  1. _Bagian 1 : Data Pengiriman_: Formulir ringkas mencakup Nama Penerima, Nomor WhatsApp aktif (untuk notifikasi resi otomatis), Alamat Lengkap Rumah/Kantor, dan Kode Pos.
  2. _Bagian 2 : Pilihan Layanan Logistik_: Integrasi API Biteship real-time yang memuat opsi kurir (JNE Regular/YES, SiCepat, J&T) beserta estimasi hari tiba dan biaya ongkir yang dihitung otomatis berdasarkan berat paket dan kota tujuan.
  3. _Bagian 3 : Ringkasan Tagihan_: Subtotal belanja, ongkos kirim terpilih, potongan diskon voucher, dan total pembayaran akhir.
  4. _Bagian 4 : Gerbang Pembayaran Terpadu_: Integrasi antarmuka Midtrans Snap yang mendukung pembayaran instan QRIS (GoPay, OVO, ShopeePay, BCA/Mandiri Mobile), Virtual Account bank, dan Kartu Debit/Kredit.
  5. _Security Trust Badges_: Indikator enkripsi SSL dan logo resmi Midtrans untuk memberikan rasa aman kepada pembeli.
- **Kebutuhan State UI:**
  - _Calculating Shipping_: Indikator animasi kalkulasi ongkir saat alamat atau kurir diubah.
  - _Processing Payment_: Tombol bayar dinonaktifkan sementara untuk mencegah transaksi ganda (_double charge_).
  - _Payment Success_: Pengalihan otomatis ke halaman konfirmasi pesanan dengan nomor faktur resmi.

---

### F. Account (`/account`)

- **Peran Halaman:** Hub retensi dan pengelolaan data pelanggan (_Customer Portal_).
- **Jenis Komponen:** Hybrid RSC dan Client Component (Progressive Account Access).
- **Tujuan Pengguna:** Mengakses riwayat belanja masa lalu, mengunduh bukti invoice, dan memperbarui alamat pengiriman tanpa dipaksa membuat akun di awal pembelian.
- **Blok & Komponen Antarmuka Kunci:**
  1. _Akses Progresif (Tamu / Belum Login)_:
     - Opsi login cepat menggunakan verifikasi _Magic Link_ via Email atau OTP WhatsApp berdasarkan nomor transaksi sebelumnya.
  2. _Dasbor Akun Terdaftar_:
     - _Profil Ringkas_: Nama pengguna, email, nomor kontak tersimpan, dan tier status pelanggan loyalitas.
     - _Riwayat Pesanan (`/account/orders`)_: Kartu pesanan masa lalu yang memuat nomor faktur, tanggal transaksi, total belanja, status pembayaran, dan tautan instan ke pelacakan kurir.
     - _Buku Alamat (`/account/profile`)_: Alamat utama pengiriman tersimpan untuk mempercepat pembelian di masa depan.
- **Kebutuhan State UI:**
  - _Unauthenticated_: Tampilan login / verifikasi pesanan yang bersih.
  - _Empty Orders State_: Tampilan khusus bagi pengguna yang baru pertama kali mendaftar tanpa riwayat pesanan sebelumnya.

---

### G. Order Tracking (`/track/[orderId]`)

- **Peran Halaman:** Pusat pelacakan status pesanan dan paket kurir secara mandiri (_Self-Service Order Tracking_).
- **Jenis Komponen:** Next.js Server Component dengan sinkronisasi _webhook_ kurir Biteship.
- **Tujuan Pengguna:** Mengetahui kepastian posisi barang fisik secara transparan tanpa perlu bertanya manual ke admin toko.
- **Blok & Komponen Antarmuka Kunci:**
  1. _Status Header_: Nomor pesanan (Invoice ID), tanggal pembelian, dan lencana status utama (_Menunggu Pembayaran, Diproses Gudang, Sedang Dikirim, Selesai_).
  2. _Live Shipment Timeline_: Diagram garis waktu visual pergerakan kurir logistik (diterima kurir, di pusat sortir, dalam perjalanan antar kota, sedang diantar kurir ke alamat, paket diterima).
  3. _Informasi Ekspedisi_: Nama kurir pengiriman (contoh: JNE Reguler), nomor resi resmi (_Waybill Number_) dengan tombol "Salin Resi", dan nama kurir pengantar jika tersedia.
  4. _Rincian Paket_: Ringkasan item barang yang dipesan dan alamat tujuan akhir.
  5. _Layanan Bantuan Terpadu_: Tombol pintas "Butuh Bantuan Pesanan?" yang menghubungkan ke tim dukungan operasional jika terjadi kendala pengiriman.
- **Kebutuhan State UI:**
  - _Tracking Active_: Riwayat kurir terperinci lengkap dengan stempel waktu terkini.
  - _Delivered State_: Pesan ucapan selamat dan ajakan membagikan foto OOTD ke Instagram dengan tagar resmi VOID Supply.
  - _Invalid Order ID_: Pesan galat informatif jika nomor pesanan tidak ditemukan di basis data.

---

## 4. Navigasi Ponsel Pintar (_Mobile Bottom Navigation_)

Untuk mengoptimalkan kenyamanan penggunaan satu tangan pada persona Rian yang 95% mengakses via smartphone, situs web dilengkapi bilah navigasi bawah (_Sticky Mobile Bottom Bar_):

| Tombol Navigasi   | Ikon              | Rute Target        | Indikator Status                       |
| :---------------- | :---------------- | :----------------- | :------------------------------------- |
| **Beranda**       | Home Icon         | `/`                | Aktif saat di halaman depan            |
| **Katalog**       | Grid Icon         | `/` atau `/shop`   | Aktif saat menjelajahi produk          |
| **Keranjang**     | Shopping Bag Icon | `/cart`            | Badge angka dinamis berisi jumlah item |
| **Lacak Pesanan** | Truck Icon        | `/track/[orderId]` | Akses instan pelacakan resi            |
| **Akun**          | User Icon         | `/account`         | Indikator profil pengguna              |
