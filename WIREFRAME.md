# Perencanaan Wireframe (Wireframe Planning) : VOID Supply

Dokumen ini mendefinisikan perencanaan kawat tata letak (_Wireframe Planning_) komprehensif untuk antarmuka e-commerce VOID Supply. Rancangan ini disusun dari perspektif UI/UX Designer dan Graphic Designer Adobe XD dengan pendekatan _mobile-first_, berlandaskan riset pengguna pada [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md), 5 fase perjalanan pembeli pada [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md), analisis kompetitor di [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md), analisis celah peluang di [opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md), prinsip pengalaman pengguna di [ux-principles.md](file:///c:/Projects/VOID%20Supply/docs/research/ux-principles.md), arsitektur informasi pada [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md), serta pedoman arsitektur sistem pada [GEMINI.md](file:///c:/Projects/VOID%20Supply/GEMINI.md).

---

## 1. Fondasi Desain & Spesifikasi Adobe XD (_Design System Foundation_)

### A. Standar Artboard & Breakpoints Responsif

| Platform                         | Dimensi Artboard Adobe XD          | Grid System                  | Margin Luar    | Lebar Gutter | Target Area Sentuh (_Tap Target_)           |
| :------------------------------- | :--------------------------------- | :--------------------------- | :------------- | :----------- | :------------------------------------------ |
| **Mobile** (Prioritas Utama 95%) | `390 px x 844 px` (iPhone 14/15)   | 4 Kolom (Fluid)              | `16 px`        | `16 px`      | Minimal `44 px x 44 px` (Zona Ramah Jempol) |
| **Desktop**                      | `1440 px x 1024 px` (Standard Web) | 12 Kolom (Max-width 1280 px) | `80 px` / Auto | `24 px`      | Minimal `36 px x 36 px` (Cursor Target)     |

### B. Sistem Spacing (Skala Grid 8pt)

Semua jarak margin, padding, dan dimensi komponen dikunci pada kelipatan 8 pixel (dengan pengecualian 4 pixel untuk _micro-spacing_ label/badge):

- `xxs` : `4 px` (Padding chip, label badge, ikon internal spacing)
- `xs` : `8 px` (Jarak antar elemen teks sekunder, gap icon-to-label)
- `sm` : `16 px` (Padding kartu produk, margin kontainer mobile)
- `md` : `24 px` (Gap antar kartu dalam grid, jarak antar grup formulir)
- `lg` : `32 px` (Jarak antar seksi vertikal di mobile)
- `xl` : `48 px` (Jarak antar seksi di desktop, padding hero section)
- `2xl` : `64 px` (Header hero desktop banner)

### C. Tipografi & Hierarki Skala

- **Headings (Display & H1 - H3):** Font sans-serif geometris tegas (`Outfit` / `Inter Display`), berat _SemiBold_ (600) hingga _Bold_ (700). Karakter streetwear modern dan berenergi.
- **Body & Data UI:** Font sans-serif fungsional (`Inter`), berat _Regular_ (400) dan _Medium_ (500), rasio kontras warna terhadap latar belakang minimal 4.5:1 (Standar Aksesibilitas WCAG AA).

### D. Palet Warna UI & Token Adobe XD

- **Background Primer:** `#0B0B0B` (VOID Dark Black)
- **Background Kartu / Permukaan:** `#161616` (Deep Charcoal Surface)
- **Garis Batas / Border:** `#262626` (Subtle Divider Gray)
- **Teks Utama:** `#FFFFFF` (Pure White, Kontras 16.5:1)
- **Teks Sekunder / Keterangan:** `#A3A3A3` (Muted Silver, Kontras 5.2:1)
- **Warna Aksen / Status Interaktif:** `#E2F952` (Volt Safety Neon, kontras tajam untuk tombol CTA dan badge rilis terbatas)
- **Status Sukses / Kurir:** `#22C55E` (Emerald Green)
- **Status Peringatan / Stok Menipis:** `#F59E0B` (Amber Orange)
- **Status Galat / Stok Habis:** `#EF4444` (Coral Red)

---

## 2. Rencana Wireframe Halaman 1 : Homepage (`/`)

### A. Page Goal

**Convert visitor into product explorer**  
Mengubah pengunjung pertama kali menjadi penjelajah katalog produk yang antusias dalam 3 detik pertama dengan menyajikan impresi visual streetwear eksklusif dan kemudahan akses produk tanpa distraksi.

### B. Content Hierarchy (Sections Flow)

Alur konten vertikal terstruktur:

```text
Hero
 ↓
Featured Drop
 ↓
Brand Story
 ↓
Best Seller
 ↓
Community
 ↓
Footer
```

1. **Hero:** Visual foto model beresolusi tinggi WebP, tajuk koleksi terbatas terkini, dan tombol aksi (_CTA_) utama "Lihat Drop Terbaru".
2. **Featured Drop:** Sorotan artikel rilis terbatas utama lengkap dengan kuota inventaris sisa (_Stock Scarcity Meter_).
3. **Brand Story:** Narasi ringkas filosofi subkultur VOID Supply dan jaminan kualitas material (Katun Combed Heavyweight 16s/24s).
4. **Best Seller:** Grid artikel paling diminati untuk memandu pembeli baru ke produk terpopuler.
5. **Community:** Galeri bukti sosial (_User-Generated Content_) dan foto OOTD komunitas media sosial (Instagram/TikTok/Discord).
6. **Footer:** Tautan kebijakan toko, layanan bantuan, dan kanal komunikasi resmi.

### C. Component Requirement

- `Organism: SiteHeader` (Logo teks VOID, Menu Navigasi, Ikon Keranjang + Notifikasi Angka).
- `Organism: HeroBanner` (Foto WebP model streetwear, Display headline, Tombol CTA Volt Neon).
- `Molecule: DropSpotlightCard` (Foto produk rilis terbatas, sisa stok gudang, tombol lihat detail).
- `Molecule: BrandStoryBanner` (Teks narasi nilai subkultur dan 3 pilar kualitas material).
- `Organism: ProductGridBestSeller` (Grid produk 2 kolom mobile / 4 kolom desktop).
- `Organism: CommunityOOTDFeed` (Koleksi foto feed komunitas dengan tagar resmi VOID).
- `Organism: SiteFooter` (Tautan kebijakan, FAQ, panduan retur, kontak support).
- `Organism: MobileBottomBar` (Bilah navigasi 5 tombol yang melayang di sepertiga bawah ponsel).

### D. Interaction

- **Transisi Hero:** Dukungan swipe sentuh halus antar-banner rilis di mobile.
- **Hover Kartu Produk:** Menampilkan foto tampak belakang produk (_Alternate Angle_) saat disentuh atau disorot cursor.
- **Sticky Mobile Navigation:** Bilah navigasi bawah tetap melayang dengan efek kaca gelap (_dark blur_) saat digulir.

### E. Edge Case Evaluation

- **Koneksi Seluler Lambat:** Tampilkan _Skeleton Wireframe Loader_ abu-abu berdenyut pada area hero dan grid kartu produk.
- **Koleksi Habis Total (_Sold Out Drop_):** Ubah badge menjadi "Habis Terjual" dan sediakan formulir input WhatsApp instan untuk pengingat drop berikutnya.
- **Galat Jaringan Server:** Tampilkan kartu fallback ramah pengguna dengan tombol "Muat Ulang Halaman".

### F. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [=] MENU      VOID SUPPLY      (3)BAG |
+---------------------------------------+
| 1. HERO SECTION (390x420 px)          |
| [ Foto Model Streetwear Full-Width  ] |
| LIMITED DROP 04 : VOID IDENTITY       |
| [ JELAJAHI DROP SEKARANG (CTA) ]      |
+---------------------------------------+
| 2. FEATURED DROP                      |
| +-----------------------------------+ |
| | [Foto Produk Utama: Boxy Hoodie]  | |
| | ACID WASH BOXY HOODIE - CHARCOAL  | |
| | Status: [TERSISA 5 PCS DI GUDANG] | |
| | Rp 489.000          [BELI INSTAN] | |
| +-----------------------------------+ |
+---------------------------------------+
| 3. BRAND STORY                        |
| "VOID Supply lahir dari subkultur     |
| jalanan. Katun 24s gramasi berat tanpa|
| kompromi, potongan boxy presisi."     |
| [*] Heavy Cotton  [*] QRIS Instan     |
+---------------------------------------+
| 4. BEST SELLER                        |
| +-----------------+ +---------------+ |
| | [Foto Produk]   | | [Foto Produk] | |
| | OVS WASH TEE    | | RAW CARGO     | |
| | Rp 249.000      | | Rp 399.000    | |
| +-----------------+ +---------------+ |
+---------------------------------------+
| 5. COMMUNITY (#VOIDStreetwear)        |
| [Foto OOTD 1] [Foto OOTD 2] [OOTD 3] >|
| Gabung Discord Komunitas [GABUNG]     |
+---------------------------------------+
| 6. FOOTER                             |
| Kebijakan Retur | FAQ | Kontak Kami   |
+---------------------------------------+
| [Home*] [Shop] [Cart(3)] [Lacak] [Akun] | <- Sticky Bar
+---------------------------------------+
```

---

## 3. Rencana Wireframe Halaman 2 : Shop (`/shop`)

### A. Page Goal

**Fast & Frictionless Catalog Exploration**  
Memfasilitasi eksplorasi katalog produk terkurasi dalam waktu < 5 detik menggunakan taksonomi ramping 4 kategori MVP (menghindari kerumitan mega-menu massal).

### B. Content Hierarchy

1. **Pencarian Cepat:** Input bar pencarian dengan toleransi kata kunci.
2. **Kategori MVP 1-Tap:** Barisan chip horizontal (_All Products_, _New Drop_, _Best Seller_, _Archive_).
3. **Filter Mendalam & Urutan:** Tombol buka _Bottom Sheet Filter Drawer_ (ukuran S-XXL, rentang harga, ketersediaan).
4. **Grid Produk Responsif:** Tata letak 2 kolom di mobile dan 4 kolom di desktop.
5. **Indikator Stok Nyata:** Lencana stok langsung di kartu produk (_In Stock_, _Low Stock_, _Sold Out_).
6. **Pemuatan Berkelanjutan:** Tombol "Muat Lebih Banyak" yang hemat memori browser.

### C. Component Requirement

- `Molecule: MVPCategoryChipBar` (Tombol chip: Semua, Drop Baru, Terlaris, Arsip).
- `Organism: FilterDrawerMobile` (Laci geser bawah untuk filter ukuran dan slider harga).
- `Organism: CatalogProductGrid` (Grid produk 2 kolom mobile / 4 kolom desktop).
- `Molecule: ActiveFilterChips` (Tag filter aktif dengan tombol silang hapus).

### D. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [<] KEMBALI       KATALOG      (3)BAG |
+---------------------------------------+
| [Cari produk streetwear...         Q] |
+---------------------------------------+
| [All Products*] [New Drop] [Best Seller] [Archive] >
| [ FILTER & URUTKAN (UKURAN, HARGA) [v] ]
+---------------------------------------+
| MENAMPILKAN 16 PRODUK                 |
| +-----------------+ +---------------+ |
| | [Foto Produk]   | | [Foto Produk] | |
| | [LOW STOCK]     | | [IN STOCK]    | |
| | VOID ACID HOOD  | | OVS WASH TEE  | |
| | Rp 489.000      | | Rp 249.000    | |
| +-----------------+ +---------------+ |
| +-----------------+ +---------------+ |
| | [Foto Produk]   | | [Foto Produk] | |
| | [SOLD OUT]      | | [IN STOCK]    | |
| | ARCHIVE TEE 01  | | RAW CARGO     | |
| | Rp 249.000      | | Rp 399.000    | |
| +-----------------+ +---------------+ |
+---------------------------------------+
|       [ MUAT LEBIH BANYAK (16/32) ]   |
+---------------------------------------+
| [Home]  [Shop*] [Cart(3)] [Lacak] [Akun] | <- Sticky Bar
+---------------------------------------+
```

---

## 4. Rencana Wireframe Halaman 3 : Product Detail (`/products/[slug]`)

### A. Page Goal

**Remove buying anxiety**  
Menghapus seluruh kecemasan pembeli (keraguan ukuran pakaian, ketidakpastian ketebalan bahan, dan keraguan stok) guna memaksimalkan konversi belanja langsung.

### B. Content Hierarchy (Sections Flow)

Alur konten vertikal terstruktur:

```text
Gallery
 ↓
Product Info
 ↓
Variant
 ↓
Size Guide
 ↓
Material
 ↓
Shipping
 ↓
CTA
```

1. **Gallery:** Galeri foto multi-sudut format WebP (depan, belakang, tampak samping, dan foto makro serat kain asli tanpa filter saturasi).
2. **Product Info:** Judul artikel lengkap, edisi drop, dan harga produk transparan.
3. **Variant:** Pilihan tombol varian ukuran (S, M, L, XL, XXL) yang terhubung ke indikator stok aktual per varian.
4. **Size Guide:** Tautan dan modal pop-up panduan ukuran interaktif dengan profil fisik model foto asli.
5. **Material:** Rincian spesifikasi teknis kain (100% Katun Combed Heavyweight 16s/24s, sablon plastisol high-density, dan petunjuk pencucian).
6. **Shipping:** Kalkulator estimasi tarif dan durasi kurir cepat via kode pos / kota tujuan.
7. **CTA:** Tombol utama "Tambah ke Keranjang" dan "Beli Sekarang" yang selalu melayang di zona jempol bawah ponsel (_Sticky Bottom Action Bar_).

### C. Component Requirement

- `Organism: MediaGalleryMobile` (Carousel geser horizontal dengan indikator titik).
- `Molecule: ProductHeaderInfo` (Judul artikel, harga, status drop).
- `Molecule: VariantSelector` (Tombol chip ukuran dengan status stok dinamis).
- `Molecule: InteractiveSizeGuideModal` (Modal profil model pria 178 cm / 68 kg size L dan tabel sentimeter).
- `Organism: MaterialSpecificationAccordion` (Akordeon detail kain, sablon, dan instruksi perawatan).
- `Molecule: QuickShippingEstimator` (Input kode pos + output kurir Biteship).
- `Organism: StickyActionFooter` (Bilah bawah tetap melayang berisi varian terpilih dan tombol CTA belanja).

### D. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [<] KATALOG       VOID SUPPLY  (3)BAG |
+---------------------------------------+
| 1. GALLERY (390x400 px)               |
| [ Foto Model Streetwear Depan       ] |
| (o) [Foto Belakang] [Detail Serat Kain]|
+---------------------------------------+
| 2. PRODUCT INFO                       |
| LIMITED DROP 04                       |
| HEAVYWEIGHT OVERSIZED TEE - VOID BLK  |
| Rp 249.000                            |
+---------------------------------------+
| 3. VARIANT & REAL-TIME STOCK          |
| PILIH UKURAN:                         |
| [ S ]   [ M ]   [[ L ]]   [ XL ]  [XXL] |
| (Sisa 2) (Sisa 3) (Sisa 3) (Habis) (Habis) |
+---------------------------------------+
| 4. SIZE GUIDE                         |
| [? Buka Panduan Ukuran & Profil Model]|
| Model di foto: 178 cm / 68 kg (Size L)|
+---------------------------------------+
| 5. MATERIAL & CARE                    |
| - 100% Katun Combed Heavyweight 24s   |
| - Sablon High-Density Plastisol Gloss |
| - Jahitan Rantai Standar Ekspor       |
+---------------------------------------+
| 6. SHIPPING ESTIMATOR                 |
| [ Masukkan Kota / Kode Pos     ] [CEK]|
| JNE Reguler: Rp 14.000 (1-2 hari tiba)|
+---------------------------------------+
| 7. STICKY CTA (THUMB ZONE)            |
| Size: L | Rp 249.000   [+ TAMBAH KE BAG]
+---------------------------------------+
```

---

## 5. Rencana Wireframe Halaman 4 : Cart (`/cart`)

### A. Page Goal

**Frictionless Order Management**  
Menyajikan daftar item belanja transparan, memungkinkan perubahan jumlah kuantitas tanpa latensi muat ulang, dan menerapkan voucher promosi sebelum menuju checkout.

### B. Content Hierarchy

1. **Daftar Item Belanja:** Thumbnail 80x80 px, varian ukuran, harga satuan, kontrol kuantitas (+/-), dan tombol hapus.
2. **Kupon Promosi:** Input kode voucher dengan validasi pesan instan.
3. **Ringkasan Tagihan:** Subtotal produk, potongan voucher, dan estimasi ongkir.
4. **Navigasi Pembayaran:** Tombol utama "Lanjut ke Checkout" dan tombol sekunder "Lanjut Belanja".

### C. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [<] KEMBALI      KERANJANG (2 ITEM)   |
+---------------------------------------+
| DAFTAR ITEM BELANJA                   |
| +-----------------------------------+ |
| | [Foto]  OVS TEE - VOID BLACK      | |
| | 80x80   Size: L | Rp 249.000      | |
| |         [-]  1  [+]      [Hapus]  | |
| +-----------------------------------+ |
| +-----------------------------------+ |
| | [Foto]  BOX HOODIE - CHARCOAL     | |
| | 80x80   Size: L | Rp 489.000      | |
| |         [-]  1  [+]      [Hapus]  | |
| +-----------------------------------+ |
+---------------------------------------+
| KODE PROMOSI / VOUCHER                |
| [ Masukkan kode voucher...  ] [PAKAI] |
+---------------------------------------+
| RINGKASAN BELANJA                     |
| Subtotal Produk           Rp 738.000  |
| Diskon Voucher                  Rp 0  |
| ------------------------------------- |
| Total Sementara           Rp 738.000  |
+---------------------------------------+
| [ LANJUT KE CHECKOUT (Rp 738.000) ]   |
|           [ Lanjut Belanja ]          |
+---------------------------------------+
| [Home]  [Shop]  [Cart(2)]  [Lacak]  [Akun] | <- Sticky Bar
+---------------------------------------+
```

---

## 6. Rencana Wireframe Halaman 5 : Checkout (`/checkout`)

### A. Page Goal

**Complete purchase < 60 seconds**  
Menuntaskan transaksi pembelian dalam waktu di bawah 60 detik tanpa syarat registrasi akun (_One-Page Guest Checkout_), menghitung tarif kurir lokal via Biteship, dan memproses pembayaran otomatis via Midtrans Snap.

### B. Content Hierarchy (Sections Flow)

Alur konten vertikal terstruktur:

```text
Customer Data
 ↓
Shipping
 ↓
Payment
 ↓
Confirmation
```

1. **Customer Data:** Nama lengkap penerima, nomor WhatsApp aktif (untuk notifikasi pengiriman resi otomatis), dan alamat email opsional.
2. **Shipping:** Alamat jalan lengkap, kota/kabupaten, kecamatan, kode pos, serta kartu pilihan layanan ekspedisi kurir (JNE, SiCepat, J&T) dengan tarif dan estimasi tiba real-time.
3. **Payment:** Pemilihan metode pembayaran instan (QRIS GoPay/OVO/ShopeePay/BCA Mobile atau Virtual Account Bank).
4. **Confirmation:** Ringkasan biaya total akhir dan tombol aksi final "Bayar Pesanan Sekarang" yang memicu jendela modal pembayaran Midtrans Snap.

### C. Component Requirement

- `Molecule: CustomerContactSection` (Input Nama, No. WhatsApp terverifikasi, Email).
- `Molecule: AddressAndCourierSection` (Input alamat terstruktur + radio card kurir Biteship).
- `Molecule: PaymentMethodSection` (Radio selector QRIS instan vs Virtual Account).
- `Organism: OrderBillSummaryCard` (Subtotal, ongkos kirim kurir, total final).
- `Organism: MidtransSnapTriggerButton` (Tombol bayar aman dengan status loading pencegah double-click).

### D. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [<] KERANJANG     CHECKOUT INSTAN     |
+---------------------------------------+
| 1. CUSTOMER DATA                      |
| [ Nama Lengkap Penerima             ] |
| [ No. WhatsApp (Untuk Info Resi)    ] |
| [ Email (Opsional)                  ] |
+---------------------------------------+
| 2. SHIPPING & ADDRESS                 |
| [ Alamat Lengkap & No. Rumah        ] |
| [ Kota / Kabupaten                  ] |
| [ Kecamatan                         ] |
| [ Kode Pos                          ] |
| PILIH KURIR EKSPEDISI:                |
| (*) JNE Reguler (1-2 hari)  Rp 14.000 |
| ( ) SiCepat BEST (1 hari)   Rp 20.000 |
+---------------------------------------+
| 3. PAYMENT METHOD                     |
| [*] QRIS Instan (GoPay, OVO, Shopee)  |
| [ ] Virtual Account (BCA, Mandiri)    |
+---------------------------------------+
| 4. CONFIRMATION & BILL                |
| Subtotal (2 Produk)       Rp 738.000  |
| Ongkir JNE Reguler         Rp 14.000  |
| ------------------------------------- |
| Total Tagihan Final       Rp 752.000  |
|                                       |
|  [ BAYAR PESANAN SEKARANG (QRIS) ]    |
|   [*] Enkripsi SSL 256-Bit Terjamin   |
+---------------------------------------+
```

---

## 7. Rencana Wireframe Halaman 6 : Account Portal (`/account`)

### A. Page Goal

**Progressive Customer Hub**  
Memberikan akses riwayat transaksi masa lalu dan buku alamat bagi pelanggan tanpa membebani pembuatan kata sandi di awal belanja.

### B. Content Hierarchy

1. **Ringkasan Profil Pengguna:** Avatar, nama pembeli, email, tier status loyalitas rilis terbatas.
2. **Tab Navigasi Akun:** Riwayat Pesanan, Wishlist, Buku Alamat.
3. **Kartu Riwayat Pesanan:** Nomor faktur, tanggal, rincian barang, total belanja, dan tombol instan lacak pengiriman.
4. **Keluar Akun:** Tombol keluar dari sesi.

### C. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------+
| [=] MENU        AKUN SAYA      (0)BAG |
+---------------------------------------+
| [AVATAR]  RIAN PRATAMA                |
|           Status: [VOID DROP MEMBER]  |
+---------------------------------------+
| [ PESANAN (3)* ] [ WISHLIST ] [ ALAMAT]|
+---------------------------------------+
| PESANAN TERBARU                       |
| +-----------------------------------+ |
| | No. Faktur : #VOID-2026-8821      | |
| | Status     : [SEDANG DIKIRIM]     | |
| | 1x Oversized Heavyweight Tee (L)  | |
| | Total Tagihan : Rp 752.000        | |
| | [ LACAK PENGIRIMAN ]  [RINCIAN]   | |
| +-----------------------------------+ |
+---------------------------------------+
| [ Keluar Dari Akun ]                  |
+---------------------------------------+
| [Home]  [Shop]  [Cart]  [Lacak]  [Akun*]| <- Sticky Bar
+---------------------------------------+
```

---

## 8. Rencana Wireframe Halaman 7 : Order Tracking (`/track/[orderId]`)

### A. Page Goal

**Self-Service Logistics Tracking**  
Menyajikan status pergerakan paket kurir secara real-time dan mandiri berbasis webhook Biteship, meniadakan beban komplain pengiriman ke tim operasional toko.

### B. Content Hierarchy

1. **Header Status Pesanan:** Nomor faktur, status aktif kurir, estimasi tanggal tiba.
2. **Data Ekspedisi Logistik:** Nama kurir, nomor resi waybill resmi, dan tombol salin resi 1-tap.
3. **Garis Waktu Perjalanan Kurir:** Diagram garis vertikal dengan riwayat transit dan stempel waktu aktual.
4. **Rincian Alamat Penerima:** Alamat pengantaran dan nomor kontak penerima.
5. **Dukungan Layanan Pelanggan:** Tombol pintas hubungi WhatsApp jika terjadi kendala pengiriman.

### C. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------+
| [<] BERANDA       STATUS PESANAN      |
+---------------------------------------+
| FAKTUR: #VOID-2026-8821               |
| STATUS: [*] SEDANG DIKIRIM KURIR      |
| Estimasi Tiba: Besok, 08 Okt 2026     |
+---------------------------------------+
| EKSPEDISI LOGISTIK                    |
| Kurir      : JNE Reguler              |
| No. Resi   : JNE882199021234          |
|              [ SALIN NOMOR RESI ]     |
+---------------------------------------+
| GARIS WAKTU PENGIRIMAN (REAL-TIME)    |
| (o) 07 Okt 18:30 - JAKARTA PUSAT      |
|  |  Paket sedang dibawa kurir ke      |
|  |  alamat tujuan penerima            |
| (o) 07 Okt 09:15 - HUB LOGISTIK JKT   |
|  |  Paket tiba di fasilitas sortir    |
| (o) 06 Okt 21:00 - GUDANG VOID SUPPLY |
|     Paket diserahkan ke kurir JNE     |
+---------------------------------------+
| [ BUTUH BANTUAN DENGAN PENGIRIMAN? ]  |
+---------------------------------------+
| [Home]  [Shop]  [Cart]  [Lacak*] [Akun] | <- Sticky Bar
+---------------------------------------+
```

---

## 9. Matriks Komparasi Tata Letak (Mobile vs Desktop)

| Halaman Situs                           | Karakteristik Mobile (390 px Viewport)                                               | Karakteristik Desktop (1440 px Viewport)                                                    |
| :-------------------------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Homepage (`/`)**                      | Hero 1 Kolom Full-Width, 6 Seksi Linear, Grid Produk 2 Kolom, Sticky Bottom Bar      | Hero 12 Kolom Split Layout (Teks Kiri, Model Kanan), Grid Produk 4 Kolom, Header Horizontal |
| **Shop (`/shop`)**                      | Chip Kategori MVP 1-Tap, Filter via Bottom Sheet Drawer, Grid 2 Kolom                | Sidebar Filter Kolom Kiri Sticky, Grid 4 Kolom, Chip Kategori di Atas Grid                  |
| **Product Detail (`/products/[slug]`)** | Galeri Swipe Horizontal, 7 Seksi Linear, Sticky Bottom Action Bar di Thumb Zone      | Galeri Foto Vertikal 2 Kolom di Kiri, Panel Beli dan Spesifikasi Sticky di Kanan            |
| **Cart (`/cart`)**                      | Daftar Item Vertikal 1 Kolom, Ringkasan Belanja di Bawah, Tombol CTA Mengikuti Layar | Layout 2 Kolom (Daftar Belanja Kiri 8-Kolom, Ringkasan Tagihan Sticky Kanan 4-Kolom)        |
| **Checkout (`/checkout`)**              | Alur Linear Vertikal Satu Layar (4 Seksi), Modal Snap Pop-up                         | Layout 2 Kolom (Formulir Data Kiri 7-Kolom, Ringkasan Tagihan & Rincian Kanan 5-Kolom)      |
| **Account (`/account`)**                | Kartu Riwayat Bertumpuk Vertikal, Tombol Lacak Lebar Penuh                           | Dasbor Tabular dengan Navigasi Menu Samping dan Tabel Riwayat Pembelian Lengkap             |
| **Order Tracking (`/track/[orderId]`)** | Garis Waktu Vertikal Ramping, Tombol Salin Resi Lebar Ramah Jempol                   | Garis Waktu Horizontal/Vertikal Berdampingan dengan Peta Lokasi Ekspedisi Logistik          |

---

## 10. Panduan Alih Serah Desain ke Pengembang (_Handoff Guidelines_)

1. **Penggunaan Utilitas Tailwind CSS v4:** Seluruh nilai jarak wajib mengacu pada token Tailwind resmi (`p-2`, `p-4`, `p-6`, `p-8`) selaras dengan skala grid 8pt.
2. **Kesesuaian Target Sentuh:** Semua elemen tombol interaktif, chip filter, dan kontrol kuantitas wajib memiliki dimensi minimal `h-11` (44 pixel) untuk menjamin kenyamanan navigasi satu tangan.
3. **Pemberian Aksesibilitas ARIA:** Seluruh dialog modal (Panduan Ukuran, Drawer Filter, dan Snap Modal) wajib memiliki atribut `aria-modal="true"`, `role="dialog"`, dan kemampuan ditutup dengan tombol `Escape`.
4. **Optimasi Aset Gambar:** Semua aset visual wireframe dalam produksi diimplementasikan menggunakan format `.webp` dengan atribut `sizes` responsif untuk memastikan waktu muat di bawah 1.5 detik pada koneksi 4G seluler.
