# VOID Supply Wireframe Specification

Dokumen ini mendefinisikan spesifikasi kawat tata letak (_Wireframe Specification_) tingkat rekayasa untuk platform commerce streetwear VOID Supply. Rancangan ini menggabungkan prinsip desain tingkat lanjut (`/design-taste-frontend`), pedoman antarmuka web (`/web-design-guidelines`), arsitektur informasi pada [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md), serta pemetaan persona dan perjalanan pengguna pada [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md) dan [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md).

---

## 1. Fondasi Sistem Desain & Konfigurasi Baseline

Sesuai standar _high-agency frontend_, parameter dasar antarmuka dikunci pada konfigurasi terukur:

- **DESIGN_VARIANCE: 8** (Asimetris, editorial streetwear kontemporer, penataan ruang bernapas).
- **MOTION_INTENSITY: 6** (Fisika pegas _spring physics_, transisi halus _layoutId_, mikro-interaksi taktil, tanpa _gimmick_ berat).
- **VISUAL_DENSITY: 4** (Format editorial terkurasi, spasi bernapas, pemisah garis 1px tipis, anti-penumpukan kartu).

### A. Palet Warna & Kalibrasi Kontras (WCAG AA $\ge 4.5:1$)

- **Canvas Background:** `#0B0B0B` (VOID Off-Black, kanvas gelap pekat berbobot).
- **Neutral Surface:** `#161616` (Deep Charcoal, permukaan kartu produk dan kontainer input).
- **Borders & Dividers:** `#262626` (Subtle 1px border untuk membatasi hierarki tanpa _card overload_).
- **Primary Text:** `#FFFFFF` (Pure White, kontras 16.5:1).
- **Secondary / Muted Text:** `#A1A1AA` (Zinc-400 Neutral, kontras 5.8:1).
- **Controlled Accent:** `#E2F952` (Volt Safety Neon, saturasi terarah untuk tombol CTA utama, badge drop, dan indikator aktif).
- **Success / In-Stock:** `#22C55E` (Emerald Green).
- **Warning / Low Stock:** `#F59E0B` (Amber Orange).
- **Danger / Sold Out:** `#EF4444` (Coral Red).

### B. Tipografi Deterministik (Anti-Slop Font Stack)

- **Display & Heading 1 - 3:** `Outfit` / `Geist` (Display SemiBold 600 hingga Bold 700, _tracking-tighter_, _leading-none_). Menghadirkan karakter _streetwear_ modern tanpa tipografi generik.
- **Body Text & Form Labels:** `Geist` / `Outfit` (Regular 400 dan Medium 500, _leading-relaxed_, maksimal lebar kolom `65ch`).
- **Tabular Numbers & Data Code:** `JetBrains Mono` / `Geist Mono` (_font-variant-numeric: tabular-nums_ untuk harga Rupiah, sisa stok gudang, dimensi sentimeter, dan nomor resi kurir).

### C. Skala Spasi (Grid 8pt) & Radius Sudut

- **Spasi Grid:** `4px` (xxs), `8px` (xs), `16px` (sm), `24px` (md), `32px` (lg), `48px` (xl), `64px` (2xl).
- **Radius Sudut:**
  - `rounded-lg` (8px): Input text, chip kategori, tombol kontrol kuantitas.
  - `rounded-xl` (12px): Kartu produk, kontainer ringkasan checkout.
  - `rounded-2xl` (16px): Bottom sheet drawer, modal interaktif size guide.
  - `rounded-full` (9999px): Badge rilis, pill status ketersediaan stok, avatar.

### D. Rekayasa Ergonomi Seluler & Aksesibilitas

- **Viewport Stability:** Semua hero section wajib menggunakan `min-h-[100dvh]` (anti layout shift pada iOS Safari).
- **Tap Target Minimum:** Semua elemen interaktif (tombol, chip, radio button, kontrol kuantitas) wajib memiliki ukuran minimal `44px x 44px`.
- **Thumb Zone Architecture:** Aksi konversi primer melekat di sepertiga bawah layar (_Sticky Bottom Action Bar_).
- **Accessible States:** Seluruh kontrol memiliki indikator fokus terlihat (`focus-visible:ring-1 focus-visible:ring-[#E2F952]`), penanganan galat inline, dan skeleton loader abu-abu gelap terstruktur.

---

## 2. Spesifikasi Wireframe Halaman 1 : Homepage (`/`)

### A. Metadata Halaman

- **Page:** Homepage (`/`)
- **Goal:** Mengubah pengunjung pertama kali menjadi penjelajah katalog produk dalam 3 detik pertama (_Convert visitor into product explorer_).
- **Primary User:** Rian "The Trendsetter" Pratama (pengguna seluler 95%, mencari busana streetwear rilisan terbatas).
- **Success Metric:**
  - _Bounce Rate_ < 35%.
  - _Click-Through Rate (CTR) Hero CTA ke Katalog_ > 25%.
  - _Largest Contentful Paint (LCP)_ < 1.5 detik pada jaringan 4G.

### B. Content Hierarchy

#### Section 1: Editorial Hero & Limited Drop Banner

- **Purpose:** Membangun prestise subkultur, mengumumkan tema rilis terkini, dan mengarahkan konversi langsung ke katalog.
- **Component & UI Anatomy:**
  - `HeroContainer`: Full width, `min-h-[100dvh]` di mobile dan `min-h-[85vh]` di desktop.
  - `VisualMedia`: Foto WebP model streetwear berlatar pencahayaan sinematik dengan gradien gelap bawah (_fade to #0B0B0B_).
  - `Badge`: Pill status `[LIMITED DROP 04 : NIGHT TRANSMISSION]` dengan dot aksen Volt Neon (`#E2F952`).
  - `Headline`: Display typography 48px mobile / 72px desktop `RAW ARCHITECTURE & HEAVYWEIGHT SILHOUETTES`.
  - `PrimaryCTA`: Tombol 48px `[JELAJAHI DROP SEKARANG]` berwarna hitam dengan latar Volt Neon `#E2F952`, _active:scale-[0.98]_.
  - `SecondaryLink`: Teks bertaut `[BACA NARASI KOLEKSI]` menuju `/collection`.

#### Section 2: Drop Spotlight & Scarcity Meter

- **Purpose:** Menyorot artikel utama rilis terbaru dan menyajikan transparansi kuota stok untuk memicu keputusan cepat.
- **Component & UI Anatomy:**
  - `SpotlightCard`: Kontainer latar `#161616` berbingkai `border-[#262626]`.
  - `ProductAsset`: Foto produk berasio 4:5 dengan label status `[TERSISA 5 PCS DI GUDANG]`.
  - `InfoBlock`: Nama artikel `ACID WASH BOXY HOODIE - CHARCOAL`, harga monospace `Rp 489.000`.
  - `QuickAction`: Tombol instan `[BELI SEKARANG]`.

#### Section 3: Brand Pillars & Material Transparency

- **Purpose:** Menghilangkan keraguan kualitas bahan dengan menguraikan 3 pilar standar produksi pakaian VOID Supply.
- **Component & UI Anatomy:**
  - `GridPillars`: 3 kolom data terpisah garis vertikal tipis `border-[#262626]` (tanpa penumpukan kartu generik).
  - `Pillar 1`: _100% Heavyweight Cotton 24s/16s_ (gramasi tebal, jatuh kain stabil, kerah anti melar).
  - `Pillar 2`: _High Density Plastisol Print_ (sablon presisi tinggi, tahan cuci mesin).
  - `Pillar 3`: _Direct-to-Community Dispatch_ (pengiriman lokal instan via Biteship dan pembayaran QRIS otomatis).

#### Section 4: Best Seller Curated Grid

- **Purpose:** Memandu pembeli baru ke artikel terpopuler untuk meminimalkan waktu penjelajahan.
- **Component & UI Anatomy:**
  - `SectionHeader`: Tajuk `ARTIKEL TERLARIS` dengan tautan `[LIHAT SEMUA (16)]`.
  - `ProductGrid`: 2 kolom di mobile (`gap-4`), 4 kolom di desktop (`gap-6`).
  - `ProductCard`: Thumbnail 4:5, indikator stok dot hijau/kuning, nama artikel, harga monospace tabular.

#### Section 5: Community Showcase (#VOIDStreetwear)

- **Purpose:** Bukti sosial autentik dari pembeli nyata di komunitas Instagram/TikTok/Discord.
- **Component & UI Anatomy:**
  - `CommunityFeed`: Barisan horizontal scroll 4 foto OOTD nyata berasio 1:1.
  - `DiscordBanner`: Banner ajakan bergabung ke server komunitas VOID Supply.

#### Section 6: Minimalist Footer

- **Purpose:** Akses kebijakan toko, garansi penukaran ukuran, dan tautan legalitas.
- **Component & UI Anatomy:**
  - `FooterLinks`: Kebijakan Retur 7 Hari, Panduan Ukuran, FAQ, Kontak Bantuan WhatsApp.
  - `Copyright`: Identitas resmi brand dan sertifikat enkripsi SSL.

### C. Interaction

- **Hero Swiper:** Dukungan sapuan jari halus (_touch-swipe_) antar foto editorial rilis drop.
- **Card Hover:** Foto berganti ke sudut tampak belakang (_alternate angle_) saat kursor diarahkan atau disentuh.
- **Tactile Feedback:** Efek tekan fisik (`active:scale-[0.98]`) pada setiap tombol aksi.
- **Persistent Bottom Bar:** Navigasi 5 ikon melayang di bagian bawah layar ponsel dengan efek kaca gelap berbingkai halus (`backdrop-blur-md bg-[#0B0B0B]/90 border-t border-[#262626]`).

### D. Responsive Behavior

- **Mobile (< 768px):** Tata letak linier 1 kolom, hero layar penuh, grid produk 2 kolom rapat, bilah bawah ramah jempol.
- **Desktop ($\ge 1024px$):** Asymmetric split hero (konten teks tebal di kiri, galeri model di kanan), grid produk 4 kolom terkurasi, header horizontal dengan dropdown mini.

### E. Engineering Impact

- **Next.js:** Halaman Server Component (`page.tsx`) di bawah route group `src/app/(public)`.
- **State Management:** Tombol keranjang membaca kuantitas reaktif dari `useCartStore` Zustand.
- **Asset Optimization:** Next.js `<Image>` dengan atribut `priority` pada Hero Banner dan `loading="lazy"` di bawah lipatan layar.

### F. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------------------+
| [=] MENU            VOID SUPPLY            (3)BAG | <- Header (h-14)
+---------------------------------------------------+
| 1. EDITORIAL HERO (min-h-[100dvh])                |
| [ Foto Model Streetwear Pencahayaan Sinematik   ] |
|                                                   |
| (*) LIMITED DROP 04 : NIGHT TRANSMISSION          |
| RAW ARCHITECTURE & HEAVYWEIGHT SILHOUETTES        |
|                                                   |
| [  JELAJAHI DROP SEKARANG (Rp 249k+)  ] (h-12)    |
| [  BACA NARASI KOLEKSI ->  ]                      |
+---------------------------------------------------+
| 2. FEATURED DROP SPOTLIGHT                        |
| +-----------------------------------------------+ |
| | [Foto Produk Utama Rasio 4:5]                 | |
| | ACID WASH BOXY HOODIE - CHARCOAL              | |
| | [!] TERSISA 5 PCS DI GUDANG                   | |
| | Rp 489.000                     [BELI INSTAN]  | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
| 3. PILAR KUALITAS BAHAN                           |
| | 100% Heavy Cotton 24s | High-Density Print |   |
| | Jahitan Rantai Presisi| Kirim Cepat Biteship |  |
+---------------------------------------------------+
| 4. BEST SELLER (GRID 2 KOLOM)                     |
| +---------------------+   +---------------------+ |
| | [Foto Produk 4:5]   |   | [Foto Produk 4:5]   | |
| | (*) IN STOCK        |   | (!) LOW STOCK       | |
| | OVS WASH TEE        |   | RAW CARGO PANTS     | |
| | Rp 249.000          |   | Rp 399.000          | |
| +---------------------+   +---------------------+ |
+---------------------------------------------------+
| 5. COMMUNITY SHOWCASE (#VOIDStreetwear)           |
| [Foto OOTD 1] [Foto OOTD 2] [Foto OOTD 3] [ > ]   |
| Gabung Discord Komunitas: discord.gg/voidsupply   |
+---------------------------------------------------+
| 6. FOOTER & SUPPORT                               |
| Kebijakan Retur 7 Hari | Panduan Ukuran | FAQ     |
| (c) 2026 VOID Supply. All rights reserved.        |
+---------------------------------------------------+
| [Home*]   [Shop]   [Search]   [Cart(3)]   [Akun]  | <- Bottom Bar (h-16)
+---------------------------------------------------+
```

---

## 3. Spesifikasi Wireframe Halaman 2 : Shop (`/shop`)

### A. Metadata Halaman

- **Page:** Shop Catalog (`/shop`)
- **Goal:** Eksplorasi katalog yang cepat dan tanpa friksi di bawah 5 detik (_Fast & Frictionless Catalog Exploration_).
- **Primary User:** Pembeli yang mencari artikel tertentu berdasarkan ukuran atau status rilis.
- **Success Metric:**
  - Waktu ke klik produk pertama < 5 detik.
  - _Add-to-cart conversion rate_ dari katalog > 12%.

### B. Content Hierarchy

#### Section 1: Quick Search & Pill Filters (1-Tap MVP Categories)

- **Purpose:** Memungkinkan penjelajahan langsung ke 4 pilar mental model pembeli (_All Products_, _New Drop_, _Best Seller_, _Archive_).
- **Component & UI Anatomy:**
  - `SearchBar`: Input pencarian 44px dengan ikon kaca pembesar dan tombol bersihkan instan.
  - `QuickChipBar`: Barisan chip horizontal dengan status aktif bergaris bawah Volt Neon (`all`, `new-drop`, `best-seller`, `archive`).
  - `FilterDrawerTrigger`: Tombol 44px `[FILTER & URUTKAN]` untuk membuka kontrol lanjutan.

#### Section 2: Active Filter Tags & Result Count

- **Purpose:** Memberikan kepastian visual terhadap parameter yang sedang diterapkan.
- **Component & UI Anatomy:**
  - `ResultsCounter`: Teks `MENAMPILKAN 16 ARTIKEL`.
  - `ActiveTags`: Chip tag berikon silang pembatal filter (contoh: `[Size: L (x)]`, `[Urutkan: Termurah (x)]`).

#### Section 3: Responsive Product Catalog Grid

- **Purpose:** Menampilkan daftar produk terkurasi secara jelas dengan data ketersediaan stok riil.
- **Component & UI Anatomy:**
  - `GridContainer`: 2 kolom di mobile (`gap-4`), 4 kolom di desktop (`gap-6`).
  - `ProductCard`:
    - Media: Foto rasio 4:5 dengan sudut `rounded-xl`.
    - Badges: Tag pojok kiri atas `[NEW DROP]`, `[ARCHIVE - SOLD OUT]`, atau `[LOW STOCK]`.
    - Typography: Nama artikel (Font Display 14px), harga monospace tabular (Font Mono 14px).
    - Sizing Chips: Mini chip ukuran yang tersedia `[S] [M] [L] [XL]`.

#### Section 4: Pagination / Infinite Load Trigger

- **Purpose:** Menjaga kestabilan memori seluler tanpa pemuatan data berlebih.
- **Component & UI Anatomy:**
  - `LoadMoreButton`: Tombol 44px `[MUAT ARTIKEL LAINNYA (16/24)]`.

### C. Interaction

- **Filter Drawer (Mobile):** Membuka panel laci geser dari bawah (_Bottom Sheet_) dengan transisi pegas, memuat pilihan ukuran S-XL, slider harga, dan tombol konfirmasi `[TERAPKAN FILTER (16)]`.
- **Instant URL Synchronization:** Perubahan filter langsung menyelaraskan parameter URL search params (`?category=new-drop&size=L`) tanpa memuat ulang halaman (_shallow routing_).
- **Card Quick View:** Menahan sentuhan kartu produk menampilkan pratinjau cepat stok ukuran yang tersedia.

### D. Responsive Behavior

- **Mobile (< 768px):** Barisan chip horizontal dapat digeser menyamping (_overflow-x-auto_), filter detail berada di dalam Bottom Sheet Drawer, grid 2 kolom.
- **Desktop ($\ge 1024px$):** Sidebar filter statis di sebelah kiri (lebar 260px sticky), grid produk 4 kolom di sebelah kanan.

### E. Engineering Impact

- **Next.js:** Server Component yang membaca `searchParams` untuk query database Drizzle ORM PostgreSQL.
- **Performance:** Optimasi caching TanStack Query dan _Suspense boundary_ dengan fallback skeleton card.

### F. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------------------+
| [<] BERANDA              KATALOG           (3)BAG |
+---------------------------------------------------+
| [ Cari artikel, hoodie, kaos...                Q ]| <- Input h-11
+---------------------------------------------------+
| [All Products*]  [New Drop]  [Best Seller] [Archive] > Quick Chips
| [ (Filter & Urutkan: Ukuran, Harga)           [v] ]
+---------------------------------------------------+
| MENAMPILKAN 16 ARTIKEL            [Filter Aktif: L x]
+---------------------------------------------------+
| +---------------------+   +---------------------+ |
| | [Foto Produk 4:5]   |   | [Foto Produk 4:5]   | |
| | [NEW DROP]          |   | [IN STOCK]          | |
| | VOID ACID HOODIE    |   | OVS WASH TEE        | |
| | Rp 489.000          |   | Rp 249.000          | |
| | [S] [M] [[L]] [XL]  |   | [S] [M] [L]         | |
| +---------------------+   +---------------------+ |
| +---------------------+   +---------------------+ |
| | [Foto Produk 4:5]   |   | [Foto Produk 4:5]   | |
| | [ARCHIVE - SOLDOUT] |   | [LOW STOCK: 2 PCS]  | |
| | CORE TEE 2025       |   | RAW CARGO PANTS     | |
| | Rp 249.000          |   | Rp 399.000          | |
| | (Habis Terjual)     |   | [M] [L]             | |
| +---------------------+   +---------------------+ |
+---------------------------------------------------+
|         [ MUAT ARTIKEL LAINNYA (16/24) ]          |
+---------------------------------------------------+
| [Home]   [Shop*]   [Search]   [Cart(3)]   [Akun]  | <- Bottom Bar
+---------------------------------------------------+
```

---

## 4. Spesifikasi Wireframe Halaman 3 : Product Detail (`/products/[slug]`)

### A. Metadata Halaman

- **Page:** Product Detail Page (`/products/[slug]`)
- **Goal:** Menghilangkan seluruh keraguan belanja online (_Zero-Hesitation Confidence Builder_) melalui transparansi ukuran, bahan, dan stok nyata.
- **Primary User:** Pembeli yang tertarik pada artikel tertentu namun ragu apakah ukurannya pas dan bahannya sesuai ekspektasi.
- **Success Metric:**
  - _Add-to-Cart Conversion Rate_ > 18%.
  - Tingkat interaksi ke modal Panduan Ukuran > 40%.
  - Tingkat retur akibat kesalahan ukuran < 2%.

### B. Content Hierarchy (8-Step Mental Model)

Alur informasi disusun secara presisi menjawab 4 pertanyaan bertahap calon pembeli:

> _Apa ini? $\rightarrow$ Apakah saya suka? $\rightarrow$ Apakah cocok? $\rightarrow$ Bagaimana beli?_

#### Step 1: High-Fidelity Media Gallery (Rasio 4:5)

- **Purpose:** Menyajikan visual fisik asli pakaian tanpa manipulasi filter saturasi warna.
- **Component & UI Anatomy:**
  - `CarouselContainer`: Galeri geser rasio 4:5 dengan indikator nomor foto (1/5).
  - `Asset 1`: Foto model tampak depan dengan pencahayaan alami.
  - `Asset 2`: Foto model tampak belakang (_back graphic detail_).
  - `Asset 3`: Foto sudut samping (_silhouette & drop-shoulder cut_).
  - `Asset 4`: Foto makro ekstrem serat kain (_fabric weave closeup_).
  - `Asset 5`: Foto makro sablon grafis (_print texture closeup_).

#### Step 2: Product Identity & Status Badge

- **Purpose:** Menyajikan identitas resmi artikel dan harga transparan.
- **Component & UI Anatomy:**
  - `DropTag`: Pill `[LIMITED DROP 04]`.
  - `ProductTitle`: Heading 24px `HEAVYWEIGHT OVERSIZED TEE - VOID BLACK`.
  - `PriceTag`: Monospace tabular 20px `Rp 249.000`.

#### Step 3: Social Proof & Verifikasi Komunitas

- **Purpose:** Memvalidasi kepercayaan melalui bukti pembelian nyata.
- **Component & UI Anatomy:**
  - `SocialProofBar`: Ikon api `[Terjual 148 pcs]` dipadukan dengan bintang ulasan `[4.9 / 5.0 (38 ulasan pembeli)]`.

#### Step 4: Variant & Real-Time Stock Selector

- **Purpose:** Memilih varian ukuran dengan kepastian sisa stok gudang atomik.
- **Component & UI Anatomy:**
  - `SizeSelector`: Tombol chip ukuran (S, M, L, XL, XXL) berdimensi minimal 44px x 44px.
  - `StockIndicator`: Label status di bawah tiap tombol (`Sisa 2`, `Sisa 3`, `Habis`). Tombol ukuran yang habis diberi tanda coret dan status _disabled_.

#### Step 5: Size Confidence & Real Model Profiler (Fitur Strategis P0)

- **Purpose:** Menghilangkan ketakutan salah ukuran (_Fit Anxiety_) dengan referensi tubuh nyata.
- **Component & UI Anatomy:**
  - `ModelBadge`: Kotak ringkas `Model di foto: Pria 178 cm / 68 kg mengenakan Size L (Oversized Fit)`.
  - `SizeGuideModalTrigger`: Tautan garis bawah berikon pita ukur `[Buka Panduan Ukuran & Dimensi Lengkap]`.
  - `ModalContent`:
    - Tabel dimensi sentimeter: Lebar Dada, Panjang Badan, Panjang Lengan.
    - Rekomendasi berdasarkan tinggi/berat badan.

#### Step 6: Material & Craftsmanship Transparency

- **Purpose:** Menghilangkan keraguan ketebalan dan ketahanan bahan pakaian.
- **Component & UI Anatomy:**
  - `MaterialAccordion`:
    - Bahan: 100% Katun Combed Heavyweight 24s (gramasi 210-220 gsm).
    - Cetak: Sablon High Density Plastisol tahan pecah.
    - Pola: Boxy drop-shoulder cut dengan kerah ribbed 3cm anti-melar.
    - Petunjuk Cuci: Cuci dingin terbalik, jangan disetrika langsung pada sablon.

#### Step 7: Instant Shipping Estimator

- **Purpose:** Memberikan kepastian biaya pengiriman sebelum masuk ke keranjang.
- **Component & UI Anatomy:**
  - `EstimatorBox`: Input nama kota/kecamatan + output tarif kurir reguler instan Biteship API.

#### Step 8: Thumb-Zone Sticky Action Bar

- **Purpose:** Memastikan tombol aksi beli selalu dapat ditekan satu tangan di mana pun posisi scroll layar.
- **Component & UI Anatomy:**
  - `StickyBar`: Melayang di dasar layar ponsel dengan latar `#0B0B0B` berbingkai atas tipis `border-[#262626]`.
  - `Summary`: Menampilkan ukuran terpilih dan total harga.
  - `Buttons`: Tombol primer Volt Neon `[+ KERANJANG]` dan tombol sekunder `[BELI SEKARANG]`.

### C. Interaction

- **Size Guide Drawer Modal:** Klik tautan memicu pembukaan modal dari bawah layar dengan transisi pegas, tombol tutup `[X]`, dan dukungan tutup via tombol _Escape_.
- **Variant Change:** Memilih tombol ukuran secara otomatis memperbarui indikator kuota stok dan mengaktifkan tombol beli.
- **Add-to-Cart Trigger:** Menekan tombol memicu animasi getar taktil halus, penambahan kuantitas ke badge keranjang, dan pembukaan drawer keranjang samping (_Cart Drawer Slide-in_).

### D. Responsive Behavior

- **Mobile (< 768px):** Galeri foto swipe horizontal, urutan 8 seksi linier bertumpuk, tombol beli sticky di dasar layar ponsel.
- **Desktop ($\ge 1024px$):** Split layout 2 kolom: Galeri foto vertikal 2 kolom di sebelah kiri (scrollable), panel identitas produk, spesifikasi, dan tombol beli statis di sebelah kanan (_sticky right column_).

### E. Engineering Impact

- **Next.js:** Server Component dengan _Server Action_ untuk validasi stok atomik Drizzle ORM saat ukuran dipilih.
- **Cart Store:** Interaksi penambahan item tersinkronisasi ke Zustand `useCartStore` dengan persistensi _LocalStorage_.

### F. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------------------+
| [<] KATALOG              PRODUK            (3)BAG |
+---------------------------------------------------+
| 1. MEDIA GALLERY (Rasio 4:5 - 390x440 px)         |
| [ Foto Model Streetwear Pencahayaan Alami       ] |
| (o) [Depan]  [Belakang]  [Samping]  [Serat Kain]  |
+---------------------------------------------------+
| 2. PRODUCT IDENTITY                               |
| [LIMITED DROP 04]                                 |
| HEAVYWEIGHT OVERSIZED TEE - VOID BLACK            |
| Rp 249.000 (Monospace Tabular)                    |
+---------------------------------------------------+
| 3. SOCIAL PROOF                                   |
| [*] Terjual 148 pcs  |  (★) 4.9 (38 Ulasan)       |
+---------------------------------------------------+
| 4. VARIANT & REAL-TIME STOCK SELECTOR             |
| PILIH UKURAN:                                     |
| [ S ]      [ M ]      [[ L ]]     [ XL ]    [XXL] |
| (Sisa 2)  (Sisa 4)   (Sisa 3)    (Habis)   (Habis)|
+---------------------------------------------------+
| 5. SIZE CONFIDENCE (P0 FEATURE)                   |
| +-----------------------------------------------+ |
| | [i] Model Foto: Pria 178 cm / 68 kg (Size L)  | |
| | [? Buka Panduan Ukuran & Dimensi Lengkap ->]  | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
| 6. MATERIAL & CRAFTSMANSHIP                       |
| [v] SPESIFIKASI BAHAN & PERAWATAN                 |
| - 100% Cotton Combed Heavyweight 24s (220 GSM)    |
| - High-Density Plastisol Print                    |
| - Boxy Drop-Shoulder Silhouette                   |
+---------------------------------------------------+
| 7. SHIPPING ESTIMATOR                             |
| [ Masukkan Kota Tujuan...                 ] [CEK] |
| Estimasi JNE Reguler: Rp 14.000 (1-2 hari tiba)   |
+---------------------------------------------------+
| [Size: L]  Rp 249.000    [ + KERANJANG ] [ BELI ] | <- Sticky Action Bar
+---------------------------------------------------+
```

---

## 5. Spesifikasi Wireframe Halaman 4 : Cart (`/cart`)

### A. Metadata Halaman

- **Page:** Shopping Cart (`/cart` & Cart Drawer)
- **Goal:** Pengelolaan item belanjaan yang transparan dan tanpa hambatan (_Frictionless Order Management_).
- **Primary User:** Pembeli yang ingin memeriksa kembali daftar belanjaan, menyesuaikan jumlah barang, dan memasukkan kode promosi sebelum membayar.
- **Success Metric:**
  - Rasio konversi Cart ke Checkout > 70%.
  - Waktu di halaman keranjang < 30 detik.

### B. Content Hierarchy

#### Section 1: Cart Items List

- **Purpose:** Memungkinkan verifikasi artikel dan penyesuaian kuantitas secara langsung.
- **Component & UI Anatomy:**
  - `ItemCard`: Latar `#161616` berbingkai `border-[#262626]`.
  - `Thumbnail`: Foto produk berukuran 80px x 100px.
  - `ItemDetails`: Nama artikel, varian ukuran terpilih (Size L), dan harga satuan monospace tabular.
  - `QuantityControls`: Kontrol kuantitas 44px `[-]` `[Jumlah]` `[+]` dengan batas stok gudang.
  - `RemoveAction`: Tombol ikon tempat sampah dengan konfirmasi instan.

#### Section 2: Promo Code Input

- **Purpose:** Menerapkan kode kupon diskon komunitas atau rilis khusus.
- **Component & UI Anatomy:**
  - `PromoBox`: Input kode 44px + tombol `[TERAPKAN]`. Umpan balik status validasi langsung (warna hijau jika valid, merah jika kedaluwarsa).

#### Section 3: Cost Summary Breakdown

- **Purpose:** Transparansi rincian biaya tanpa biaya tersembunyi.
- **Component & UI Anatomy:**
  - `SummaryBlock`:
    - Subtotal Produk: `Rp 738.000`.
    - Potongan Diskon Promo: `- Rp 50.000`.
    - Estimasi Ongkir: Dihitung saat checkout.
    - Total Sementara: `Rp 688.000` (ditekankan dalam font tebal 18px).

#### Section 4: Primary Checkout Action

- **Purpose:** Mengarahkan pembeli langsung ke halaman transaksi pengiriman.
- **Component & UI Anatomy:**
  - `CheckoutCTA`: Tombol lebar penuh 48px berlatar Volt Neon `#E2F952` `[LANJUT KE CHECKOUT (Rp 688.000)]`.
  - `ContinueShopping`: Tombol sekunder bertaut `[Lanjut Belanja]`.

### C. Interaction

- **Live Quantity Mutation:** Mengubah tombol `[+]` atau `[-]` langsung memperbarui subtotal secara atomik tanpa memuat ulang halaman (_zero page reload_).
- **Empty Cart State:** Jika item dihapus seluruhnya, tampilkan ilustrasi editorial bertema gelap dengan pesan `Keranjang Anda masih kosong` dan tombol CTA `[JELAJAHI DROP TERBARU]`.

### D. Responsive Behavior

- **Mobile (< 768px):** Tampil sebagai halaman vertikal penuh atau drawer samping kanan (_slide-over drawer_).
- **Desktop ($\ge 1024px$):** Layout 2 kolom: Daftar belanjaan di kolom kiri (lebar 65%), ringkasan tagihan sticky di kolom kanan (lebar 35%).

### E. Engineering Impact

- **State Management:** Terhubung penuh ke Zustand `useCartStore`.
- **Stock Guard:** Kuantitas maksimal pada tombol `[+]` dikunci oleh sisa inventaris riil dari PostgreSQL.

### F. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------------------+
| [<] KEMBALI              KERANJANG (2)            |
+---------------------------------------------------+
| DAFTAR ITEM BELANJA                               |
| +-----------------------------------------------+ |
| | [Foto]  HEAVYWEIGHT OVS TEE - BLACK           | |
| | 80x100  Size: L | Rp 249.000                  | |
| |         [-]   1   [+]            [ Hapus (x) ]| |
| +-----------------------------------------------+ |
| +-----------------------------------------------+ |
| | [Foto]  ACID WASH BOXY HOODIE                 | |
| | 80x100  Size: L | Rp 489.000                  | |
| |         [-]   1   [+]            [ Hapus (x) ]| |
| +-----------------------------------------------+ |
+---------------------------------------------------+
| KODE VOUCHER / DISKON                             |
| [ Masukkan kode voucher...             ] [PAKAI]  |
+---------------------------------------------------+
| RINGKASAN BELANJA                                 |
| Subtotal Produk                        Rp 738.000 |
| Diskon Promo (VOIDDROP)              - Rp  50.000 |
| Estimasi Ongkos Kirim            (Dihitung nanti) |
| ------------------------------------------------- |
| Total Sementara                        Rp 688.000 |
+---------------------------------------------------+
|   [ LANJUT KE CHECKOUT (Rp 688.000) ] (h-12 CTA)  |
|               [ < Lanjut Belanja ]                |
+---------------------------------------------------+
| [Home]   [Shop]   [Search]   [Cart(2)*]   [Akun]  | <- Bottom Bar
+---------------------------------------------------+
```

---

## 6. Spesifikasi Wireframe Halaman 5 : Checkout (`/checkout`)

### A. Metadata Halaman

- **Page:** One-Page Guest Checkout (`/checkout`)
- **Goal:** Menuntaskan transaksi pembelian dalam waktu di bawah 60 detik tanpa friksi registrasi (_Complete purchase < 60 seconds_).
- **Primary User:** Pembeli yang ingin segera mengamankan barang edisi terbatas dan membayarnya via QRIS atau transfer instan.
- **Success Metric:**
  - _Checkout Abandonment Rate_ < 20%.
  - _Payment Success Rate_ > 85%.
  - Waktu penyelesaian checkout rata-rata < 60 detik.

### B. Content Hierarchy (Distraction-Free Architecture)

Halaman checkout menerapkan prinsip **Navigation Rule 3: Distraction-Free Checkout** (bilah menu utama, banner promosi, dan bottom bar dihilangkan agar fokus pembeli 100% terarah pada penyelesaian transaksi).

#### Section 1: Contact & Address (Bukan Istilah Kaku "Customer Data")

- **Purpose:** Mengumpulkan data esensial untuk pengiriman barang fisik dan pengiriman nomor resi otomatis.
- **Component & UI Anatomy:**
  - `ContactBlock`:
    - Nama Lengkap Penerima.
    - Nomor WhatsApp Aktif (untuk notifikasi status kurir otomatis).
    - Alamat Email (untuk bukti faktur tagihan).
  - `AddressBlock`:
    - Alamat Jalan & Nomor Rumah.
    - Kota / Kabupaten & Kecamatan (auto-complete terintegrasi Biteship API).
    - Kode Pos (5 digit numerik).

#### Section 2: Shipping Method & Courier Selection

- **Purpose:** Memilih kurir pengiriman lokal dengan tarif dan durasi kedatangan transparan.
- **Component & UI Anatomy:**
  - `CourierRadioGroup`: Kartu radio 44px dengan logo kurir, nama layanan, estimasi hari tiba, dan harga.
    - Opsi 1: JNE Reguler (1-2 hari) - Rp 14.000.
    - Opsi 2: SiCepat BEST (1 hari) - Rp 20.000.
    - Opsi 3: J&T Express (2-3 hari) - Rp 13.000.

#### Section 3: Payment Method Selection

- **Purpose:** Memilih kanal pembayaran digital instan lokal terintegrasi Midtrans Snap.
- **Component & UI Anatomy:**
  - `PaymentSelector`:
    - Opsi 1: QRIS Instan (GoPay, OVO, ShopeePay, BCA Mobile) - Verifikasi otomatis detik itu juga.
    - Opsi 2: Virtual Account Bank (BCA, Mandiri, BNI, BRI).

#### Section 4: Final Order Bill & Execution

- **Purpose:** Meninjau angka tagihan akhir dan mengeksekusi pembayaran secara aman.
- **Component & UI Anatomy:**
  - `FinalBillCard`:
    - Subtotal Produk: `Rp 688.000`.
    - Ongkos Kirim (JNE Reguler): `Rp 14.000`.
    - Kode Unik / Biaya Layanan: `Rp 0`.
    - **Total Tagihan Akhir:** `Rp 702.000`.
  - `SecurityBadge`: Ikon gembok hijau `[Enkripsi SSL 256-Bit & Pembayaran Aman Midtrans]`.
  - `ExecutionButton`: Tombol lebar penuh 48px `[BAYAR SEKARANG (Rp 702.000)]`.

### C. Interaction

- **City & District Autocomplete:** Mengetik nama kecamatan langsung memunculkan saran resmi database Biteship untuk menghindari kesalahan ongkir.
- **Selection State:** Memilih opsi kurir secara otomatis memperbarui nilai total tagihan akhir dengan transisi angka halus.
- **Payment Modal Launch:** Menekan tombol "Bayar Sekarang" mengubah tombol menjadi status berputar (_Spinner loading state_) guna mencegah _double submit_, lalu membuka modal resmi Midtrans Snap.

### D. Responsive Behavior

- **Mobile (< 768px):** Formulir bertumpuk linier 1 kolom, fokus satu arah ke bawah, tombol bayar sticky di dasar layar.
- **Desktop ($\ge 1024px$):** Layout 2 kolom: Formulir Kontak, Alamat, dan Pilihan Kurir di sebelah kiri (lebar 60%), Panel Ringkasan Pesanan dan Tombol Bayar sticky di sebelah kanan (lebar 40%).

### E. Engineering Impact

- **Next.js:** Server Action `buatPesanan()` dengan validasi Zod schema `checkoutSkema` dan mutasi transaksi atomik Drizzle ORM.
- **Integration:** Pemanggilan server-to-server API Biteship untuk rate check dan Midtrans Core API untuk pembuatan transaksi Snap token.

### F. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------------------+
| [<] KERANJANG            CHECKOUT AMAN     [Gembok]| <- Distraction-Free Header
+---------------------------------------------------+
| 1. KONTAK & ALAMAT PENGIRIMAN                     |
| [ Nama Lengkap Penerima                         ] |
| [ No. WhatsApp (Untuk Notifikasi Resi)          ] |
| [ Email Penerima (Invoice Digital)              ] |
| [ Alamat Lengkap, No. Rumah, Patokan            ] |
| [ Kota / Kecamatan (Auto-complete Biteship)     ] |
| [ Kode Pos                                      ] |
+---------------------------------------------------+
| 2. PILIHAN KURIR PENGIRIMAN                       |
| (*) JNE Reguler (1-2 hari)             Rp 14.000  |
| ( ) SiCepat BEST (1 hari)              Rp 20.000  |
| ( ) J&T Express (2-3 hari)             Rp 13.000  |
+---------------------------------------------------+
| 3. METODE PEMBAYARAN                              |
| (*) QRIS Instan (GoPay, OVO, ShopeePay, BCA)      |
| ( ) Virtual Account (BCA, Mandiri, BNI)           |
+---------------------------------------------------+
| 4. RINGKASAN TAGIHAN                              |
| Subtotal (2 Produk)                    Rp 688.000 |
| Ongkir (JNE Reguler)                   Rp  14.000 |
| ------------------------------------------------- |
| Total Pembayaran                       Rp 702.000 |
|                                                   |
|    [ BAYAR SEKARANG (Rp 702.000) ] (h-12 CTA)     |
|       [*] Transaksi Diamankan oleh Midtrans       |
+---------------------------------------------------+
(Bilah Menu & Navigasi Bawah Ditiadakan Demi Fokus Konversi)
```

---

## 7. Spesifikasi Wireframe Halaman 6 : Akun & Portal Pelanggan (`/account`)

### A. Metadata Halaman

- **Page:** Customer Portal (`/account`)
- **Goal:** Memudahkan pelanggan memantau riwayat pesanan edisi terbatas, melacak status pengiriman paket, dan mengelola alamat tanpa beban registrasi password konvensional.
- **Primary User:** Pembeli setia yang ingin memastikan pesanan rilis terbarunya sudah diproses dan dikirim oleh gudang VOID Supply.
- **Success Metric:**
  - Waktu akses status pesanan terkini < 3 detik.
  - Penurunan tiket pertanyaan status pesanan di WhatsApp hingga 40%.

### B. Content Hierarchy

#### Section 1: Customer Profile Header (Hybrid Guest-First)

- **Purpose:** Menampilkan identitas pembeli aktif, nomor kontak, dan status keanggotaan komunitas.
- **Component & UI Anatomy:**
  - `ProfileBadge`: Avatar monokrom dengan inisial nama, nama penerima terdaftar, dan nomor WhatsApp (+62 812-xxxx-xxxx).
  - `CommunityPill`: Tag keanggotaan `[VOID INSIDER : ACTIVE DROP]`.
  - `QuickActions`: Tombol pintas `[Kelola Alamat]` dan `[Keluar Sesi]`.

#### Section 2: Order Status Segmented Tabs

- **Purpose:** Menyaring riwayat transaksi berdasarkan tahap pemrosesan gudang dan kurir.
- **Component & UI Anatomy:**
  - `StatusTabs`: Barisan tab tersegmentasi horizontal (`Semua`, `Menunggu Pembayaran`, `Diproses`, `Dikirim`, `Selesai`).
  - `ActiveIndicator`: Garis bawah aktif Volt Neon (`#E2F952`) dengan transisi halus.

#### Section 3: Order History Card List

- **Purpose:** Menyajikan ringkasan setiap transaksi dengan nomor referensi dan status pengiriman riil.
- **Component & UI Anatomy:**
  - `OrderCard`: Kontainer latar `#161616` berbingkai `border-[#262626] rounded-xl`.
  - `CardHeader`: Nomor pesanan monospace tabular `VOID-20261008-0042`, tanggal transaksi, dan badge status kurir (`[DIKIRIM : JNE REGULER]`).
  - `CardItems`: Barisan ringkas thumbnail foto artikel 4:5, nama kaos/hoodie, ukuran terpilih, kuantitas, dan total tagihan.
  - `CardFooter`: Tombol aksi 44px `[LACAK PENGIRIMAN]` berlatar Volt Neon dan tombol sekunder `[LIHAT FAKTUR RESMI]`.

#### Section 4: Saved Address Book

- **Purpose:** Menyimpan alamat rumah utama untuk mempercepat transaksi pada drop berikutnya.
- **Component & UI Anatomy:**
  - `AddressCard`: Nama penerima, nomor WhatsApp, alamat jalan lengkap, kota, kecamatan, dan kode pos.
  - `ActionButtons`: Tombol `[Ubah Alamat]` dan `[+ Tambah Alamat Baru]`.

### C. Interaction & Responsive Behavior

- **Tab Switching:** Berpindah tab menyaring daftar transaksi secara instan di sisi klien tanpa memuat ulang halaman.
- **Mobile (< 768px):** Kartu pesanan bertumpuk linier 1 kolom, tab horizontal dapat digeser menyamping.
- **Desktop (>= 1024px):** Layout 2 kolom: Sidebar navigasi profil di kiri (lebar 280px), daftar pesanan dan rincian transaksi di kanan.

### D. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------------------+
| [<] BERANDA                 AKUN SAYA       (3)BAG|
+---------------------------------------------------+
| 1. PROFIL PELANGGAN (HYBRID GUEST-FIRST)          |
| [ (RP) Rian Pratama | +62 812-8821-xxxx         ] |
| [*] STATUS KOMUNITAS: VOID INSIDER DROP 04        |
+---------------------------------------------------+
| 2. TAB STATUS PESANAN                             |
| [Semua*]  [Menunggu Bayar]  [Diproses]  [Dikirim] |
+---------------------------------------------------+
| 3. DAFTAR PESANAN TERAKHIR                        |
| +-----------------------------------------------+ |
| | Order: #VOID-20261008-0042        [DIKIRIM]   | |
| | Tanggal: 08 Okt 2026, 01:15 WIB               | |
| | --------------------------------------------- | |
| | [Foto] HEAVYWEIGHT OVS TEE - BLACK            | |
| |        Size: L (1 pcs)           Rp 249.000   | |
| | Total Tagihan (Termasuk Ongkir): Rp 263.000   | |
| |                                               | |
| | [ LACAK RESI KURIR -> ] (h-11)   [Faktur PDF] | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
| 4. BUKU ALAMAT UTAMA                              |
| +-----------------------------------------------+ |
| | Rian Pratama (Rumah Utama)                    | |
| | Jl. Kaliurang KM 5, Gang Pandega Marta No. 12 | |
| | Sleman, D.I. Yogyakarta 55281                 | |
| | [Ubah Alamat]               [+ Alamat Baru]   | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
| [Home]   [Shop]   [Search]   [Cart(3)]   [Akun*]  | <- Bottom Bar
+---------------------------------------------------+
```

---

## 8. Spesifikasi Wireframe Halaman 7 : Pelacakan Pengiriman Kurir (`/track/[orderId]`)

### A. Metadata Halaman

- **Page:** Public Courier Order Tracking (`/track/[orderId]`)
- **Goal:** Menghadirkan transparansi perjalanan paket kurir secara real-time dari gudang VOID Supply di Sleman ke pintu rumah pembeli tanpa perlu login.
- **Primary User:** Pembeli yang menerima tautan resi via notifikasi otomatis WhatsApp dan ingin mengecek posisi paket pakaian.
- **Success Metric:**
  - Waktu muat status resi < 1.5 detik.
  - Akurasi data status kurir 100% tersinkronisasi via Biteship Tracking API.

### B. Content Hierarchy

#### Section 1: Tracking Header & Courier Info

- **Purpose:** Menampilkan nomor resi resmi dan estimasi tanggal barang tiba.
- **Component & UI Anatomy:**
  - `CourierHeader`: Logo kurir rekanan (JNE / SiCepat / J&T), jenis layanan (Reguler / BEST / EZ).
  - `TrackingCodeBlock`: Nomor resi monospace tabular `JNE-88291048201` dilengkapi tombol 44px `[SALIN NOMOR RESI]`.
  - `EstimatedArrival`: Label kepastian `Estimasi Tiba: Besok, 09 Okt 2026 (Sore Hari)`.

#### Section 2: Interactive Vertical Timeline

- **Purpose:** Memvisualisasikan setiap pos pemeriksaan perjalanan paket fisik secara kronologis.
- **Component & UI Anatomy:**
  - `TimelineContainer`: Garis vertikal kontras dengan penanda titik lingkar status.
  - `Checkpoint 1 (Aktif)`: `[08 Okt 14:30] Paket telah tiba di Sorting Hub Yogyakarta`.
  - `Checkpoint 2`: `[08 Okt 10:15] Paket diserahkan ke kurir JNE Express`.
  - `Checkpoint 3`: `[08 Okt 08:00] Pesanan dikemas dan diberi label oleh Gudang VOID Sleman`.
  - `Checkpoint 4`: `[07 Okt 23:45] Pembayaran pesanan terverifikasi otomatis via Midtrans`.

#### Section 3: Destination & Item Summary

- **Purpose:** Memastikan kecocokan barang pesanan dan alamat tujuan.
- **Component & UI Anatomy:**
  - `PackageOverview`: Daftar 2 artikel pakaian dalam paket berasio 4:5.
  - `MaskedAddress`: Alamat penerima dengan enkripsi privasi sebagian (Rian P***, Sleman, D.I. Yogyakarta).

#### Section 4: Direct Support Action

- **Purpose:** Saluran bantuan cepat jika paket mengalami keterlambatan operasional kurir.
- **Component & UI Anatomy:**
  - `HelpBanner`: Tombol 44px `[HUBUNGI CS VIA WHATSAPP]` untuk bantuan investigasi kurir.

### C. Diagram Wireframe Tata Letak (Mobile 390 px)

```text
+---------------------------------------------------+
| [<] KEMBALI           PELACAKAN PAKET       [Bantuan]
+---------------------------------------------------+
| 1. INFORMASI KURIR & RESI RESMI                   |
| JNE EXPRESS (Layanan Reguler 1-2 Hari)            |
| No. Resi: JNE-88291048201       [SALIN RESI (x)]  |
| Status Terkini: DALAM PERJALANAN (ON PROCESS)     |
| Estimasi Tiba: Jumat, 09 Okt 2026                 |
+---------------------------------------------------+
| 2. LINIMASA PERJALANAN PAKET (TIMELINE VERTIKAL)  |
| (*) 08 Okt 14:30 | Tiba di Sorting Hub Maguwoharjo|
|  |                 Paket diteruskan ke Hub Tujuan |
| (o) 08 Okt 10:15 | Diterima Agen JNE Cabang Sleman|
|  |                 Paket dipindai kurir penjemput |
| (o) 08 Okt 08:00 | Pesanan dikemas Warehouse VOID |
|  |                 Label resi dicetak             |
| (o) 07 Okt 23:45 | Pembayaran Terkonfirmasi       |
+---------------------------------------------------+
| 3. RINGKASAN ISI PAKET                            |
| +-----------------------------------------------+ |
| | [Foto] ACID WASH BOXY HOODIE - Size L         | |
| | Tujuan: Rian P***, Sleman, DI Yogyakarta      | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
| 4. BANTUAN KENDALA PENGIRIMAN                     |
| [ Butuh Bantuan? Tanya Tim Gudang di WhatsApp ]   |
+---------------------------------------------------+
| [Home]   [Shop]   [Search]   [Cart(3)]   [Akun]   | <- Bottom Bar
+---------------------------------------------------+
```

---

## 9. Spesifikasi Komponen Global & Primitif Antarmuka Terpadu

Bagian ini mendefinisikan rancangan 9 komponen antarmuka yang digunakan secara konsisten di seluruh platform VOID Supply. Seluruh komponen dirancang memenuhi standar Anti-Slop, Mobile-First, serta aksesibilitas WCAG AA (tap target minimum 44px, kontras tinggi, navigasi keyboard).

### 9.1. Komponen Cart Slide-Over Drawer

- **Fungsi:** Komponen laci keranjang belanja melayang yang terbuka secara otomatis saat pengguna menekan tombol `[+ KERANJANG]` pada halaman detail produk atau katalog.
- **Anatomi UI:**
  - `BackdropOverlay`: Lapisan gelap semi-transparan berlatar `bg-black/80 backdrop-blur-sm` dengan transisi opacity 200ms.
  - `DrawerPanel`: Lebar 380px di desktop (geser dari sisi kanan layar), lebar 100% di mobile (slide-in bottom sheet).
  - `DrawerHeader`: Judul `Keranjang Belanja (N)` font Display 18px, tombol tutup ikon silang 44px `[X]`.
  - `DrawerBody (Scrollable)`:
    - Daftar kartu produk ringkas: Thumbnail 80px x 100px, nama artikel, varian ukuran, harga tabular monospace.
    - Kontrol kuantitas 44px `[-]` `[Qty]` `[+]` dengan proteksi batas sisa stok riil.
    - Tombol hapus instan `[Hapus]`.
    - Empty state editorial jika keranjang kosong: Pesan `Keranjang Anda masih kosong` + tombol `[Jelajahi Rilis Terbaru]`.
  - `DrawerFooter (Sticky Bottom)`:
    - Baris rincian subtotal produk dan estimasi diskon.
    - Tombol CTA utama 48px berlatar Volt Neon `#E2F952` bertuliskan `[LANJUT KE CHECKOUT (Rp xxx.xxx)]`.
    - Tombol sekunder `[Lanjut Belanja]` untuk menutup laci.
- **Aksesibilitas & Interaksi:**
  - Menutup otomatis saat menekan tombol `Escape` keyboard atau mengetuk area backdrop.
  - Penguncian gulir layar latar (`overflow-hidden` pada `<body>`) saat drawer terbuka.

### 9.2. Komponen Toast Notification System

- **Fungsi:** Memberikan umpan balik instan non-intrusif atas aksi pengguna (contoh: berhasil tambah ke keranjang, kode kupon tersalin, stok menipis, atau transaksi gagal).
- **Arsitektur:** Terkelola via Zustand store (`useToastStore`) terintegrasi dengan styling utilitas Tailwind CSS v4 tanpa dependensi pihak ketiga baru.
- **Posisi Layar:**
  - Mobile (< 768px): Bagian atas layar (`top-4 left-4 right-4`), aman dari jangkauan jempol dan tidak menghalangi bilah navigasi bawah.
  - Desktop (>= 1024px): Sudut kanan bawah layar (`bottom-6 right-6 max-w-sm`).
- **4 Varian Toast Semantik:**
  - `Success`: Bingkai kiri hijau emerald (`border-l-4 border-[#22C55E] bg-[#161616]`), ikon centang tebal, contoh: `Artikel berhasil ditambahkan ke keranjang`.
  - `Warning`: Bingkai kiri amber orange (`border-l-4 border-[#F59E0B] bg-[#161616]`), ikon peringatan, contoh: `Sisa stok ukuran L tersisa 2 pcs di gudang`.
  - `Error`: Bingkai kiri coral red (`border-l-4 border-[#EF4444] bg-[#161616]`), ikon silang, contoh: `Koneksi gagal. Silakan coba kembali`.
  - `Info`: Bingkai kiri volt neon (`border-l-4 border-[#E2F952] bg-[#161616]`), ikon informasi, contoh: `Kode kupon VOIDDROP berhasil diterapkan`.
- **Anatomi & Durasi:**
  - Ikon status (20px), judul singkat, deskripsi pesan, dan tombol silang tutup 44px `[X]`.
  - Timer penghilangan otomatis (_auto-dismiss_) 3000ms dengan visual bar durasi menipis.
  - Aksesibilitas ARIA: `role="status"`, `aria-live="polite"`.

### 9.3. Komponen Mobile Navigation Drawer (Hamburger Menu)

- **Fungsi:** Panel navigasi laci komprehensif pada tampilan seluler saat pengguna menekan ikon menu `[=]` di header utama.
- **Anatomi UI:**
  - Lebar drawer: `w-[320px] max-w-[85vw]` dengan latar `#0B0B0B` berbingkai kanan tipis `border-[#262626]`.
  - Header: Identitas teks `VOID SUPPLY` dan tombol tutup 44px `[X]`.
  - Bilah Pencarian Cepat: Input pencarian artikel langsung di dalam drawer.
  - Tautan Navigasi Editorial:
    - `KATALOG UTAMA (/shop)`
    - `RILIS TERBARU (/shop?category=new-drop)`
    - `NARASI KOLEKSI (/collection)`
    - `TENTANG VOID (/about)`
    - `PANDUAN BELANJA & UKURAN (/faq)`
  - Saluran Komunitas: Tautan resmi Discord VOID Streetwear, Instagram, TikTok.
  - Footer Drawer: Tombol akses profil akun pelanggan dan tombol bantuan cepat WhatsApp.

### 9.4. Komponen Profile & Authentication Modal (Hybrid Guest-First)

- **Fungsi:** Modal interaktif untuk mengakses data pelanggan tanpa membebankan kata sandi rumit bagi calon pembeli.
- **Alur 2 Langkah (2-Step Authentication Flow):**
  - Langkah 1: Pengguna memasukkan nomor WhatsApp aktif (awalan +62) atau alamat email. Menekan tombol `[KIRIM KODE AKSES KILAT]`.
  - Langkah 2: Muncul 6 kotak sel kode OTP verifikasi otomatis. Setelah 6 digit terisi lengkap, sistem memvalidasi dan langsung mengarahkan ke halaman akun pengguna.
- **State Pengguna Terotentikasi:**
  - Menampilkan ringkasan pesanan aktif, alamat tersimpan, dan opsi keluar sesi dengan aman.

### 9.5. Komponen Modal Dialog & Pop-up

- **Fungsi:** Dialog jendela terfokus untuk menampilkan konten esensial tanpa meninggalkan konteks halaman belanja saat ini.
- **Varian Modal 1: Size Guide & Body Dimensions Modal:**
  - Terbuka saat menekan tautan `[Buka Panduan Ukuran]` pada halaman detail produk.
  - Berisi tabel ukuran metrik sentimeter (Lebar Dada, Panjang Baju, Panjang Lengan) untuk ukuran S, M, L, XL, XXL.
  - Disertai sketsa ilustrasi petunjuk pengukuran pakaian di atas permukaan rata.
- **Varian Modal 2: Confirmation Dialog:**
  - Digunakan saat menghapus item belanjaan dari keranjang atau membatalkan pesanan.
  - Memuat judul pertanyaan konfirmasi, teks penjelasan singkat, tombol batal `[Kembali]`, dan tombol aksi bahaya `[Ya, Hapus]`.
- **Aksesibilitas Modal:**
  - Peran ARIA `role="dialog"` dan `aria-modal="true"`.
  - Penguncian fokus keyboard (_Focus Trap_) di dalam modal, tombol tutup terlihat jelas, dan penutupan via tombol Escape.

### 9.6. Komponen Form Controls & Validation States

- **Fungsi:** Kontrol masukan data formulir yang dirancang ramah jempol seluler dan bebas kebingungan.
- **Spesifikasi Standar Input:**
  - Tinggi minimum input: `48px` (`h-12`).
  - Latar input: `#161616`, bingkai `border border-[#262626] rounded-lg`, warna teks `#FFFFFF`.
  - Label: Display 14px di atas input, warna zinc netral `#A1A1AA`.
  - Pesan Bantuan / Galat: Teks 12px di bawah input.
- **4 Status Visual Formulir:**
  1. `Default`: Bingkai netral `border-[#262626]`.
  2. `Focus Active`: Cincin fokus aksen Volt Neon `focus-visible:ring-1 focus-visible:ring-[#E2F952] border-[#E2F952]`.
  3. `Validation Error`: Bingkai merah terang `border-[#EF4444]`, pesan galat teks merah di bawah input, ikon peringatan mini.
  4. `Disabled`: Opasitas rendah `opacity-50 cursor-not-allowed bg-[#111111]`.
- **Kontrol Khusus:**
  - Input Nomor WhatsApp: Prefix kaku `+62` di sisi kiri input dengan pemisah garis 1px.
  - Auto-complete Lokasi Biteship: Input teks terhubung dengan daftar rekomendasi kelurahan/kecamatan melayang.

### 9.7. Komponen Dropdown & Selection Menu

- **Fungsi:** Menu seleksi opsi mengambang untuk pengurutan katalog produk dan pemilihan opsi kurir.
- **Anatomi UI:**
  - Tombol Pemicu: Kontainer 44px dengan teks opsi terpilih dan ikon panah chevron `[v]`.
  - Panel Menu Melayang: Latar `#161616` berbingkai `border-[#262626] rounded-xl shadow-2xl`, elevasi tinggi di atas elemen lain.
  - Opsi Item: Daftar baris 44px dengan teks putih, efek sorot latar saat diarahkan (`hover:bg-[#262626]`), dan tanda centang aksen pada opsi aktif.
  - Navigasi Keyboard: Mendukung navigasi panah atas/bawah, pemilihan via tombol Enter, dan penutupan via tombol Escape.

### 9.8. Komponen Segmented Tabs

- **Fungsi:** Navigasi berganti konten dalam satu halaman tanpa memicu perpindahan URL atau muat ulang browser.
- **Penerapan Utama:**
  - Tabs Filter Katalog Shop: `[All Products]`, `[New Drop]`, `[Best Seller]`, `[Archive]`.
  - Tabs Status Pesanan Akun: `[Semua]`, `[Menunggu Bayar]`, `[Diproses]`, `[Dikirim]`, `[Selesai]`.
  - Tabs Informasi Produk: `[Spesifikasi Bahan]`, `[Panduan Ukuran]`, `[Ulasan Pembeli]`.
- **Perilaku Visual:**
  - Tab aktif ditandai dengan garis bawah tebal 2px berwarna Volt Neon `#E2F952` dan teks putih terang.
  - Tab tidak aktif menggunakan warna zinc sekunder `#A1A1AA` dengan efek transisi warna saat hover.

### 9.9. Standar Motion & Fisika Transisi Tailwind CSS v4

- **Filosofi Gerak:** Halus, taktil, dan cepat. Menghindari animasi dekoratif lambat yang menghambat keputusan pembelian pengguna.
- **Spesifikasi Transisi Antarmuka:**
  - Durasi Mikro-Interaksi: `duration-150` sampai `duration-200` dengan kurva percepatan keluar (`ease-out`).
  - Umpan Balik Tombol Sentuh: `active:scale-[0.98] transition-transform duration-100` pada seluruh tombol aksi utama.
  - Transisi Slide-In Drawer / Modal: Animasi berbasis akselerasi GPU (`transform-gpu`) untuk menjamin 60 frame per detik tanpa jeda patah pada smartphone.
  - Pemuatan Skeleton: Animasi pulsa halus warna abu-abu gelap terstruktur (`bg-zinc-800/60 animate-pulse rounded-lg`) yang memetakan persis bentuk komponen akhir.

---

## 10. Matriks Komparasi Tata Letak Global (Mobile vs Desktop)

| Halaman                                 | Mobile Viewport (390 px)                                                 | Desktop Viewport (1440 px)                                                           |
| :-------------------------------------- | :----------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Homepage (`/`)**                      | Hero 1 kolom full-width, 6 seksi linier, grid 2 kolom, sticky bottom bar | Split hero (teks kiri, model kanan), grid produk 4 kolom, header navigasi horizontal |
| **Shop (`/shop`)**                      | Chip bar horizontal geser, filter via Bottom Sheet Drawer, grid 2 kolom  | Sidebar filter statis di kiri (260px), grid produk 4 kolom di kanan                  |
| **Product Detail (`/products/[slug]`)** | Galeri swipe horizontal, 8 seksi linier mental model, sticky action bar  | Galeri 2 kolom vertikal di kiri, panel beli dan spesifikasi sticky di kanan          |
| **Cart (`/cart` & Drawer)**             | Bottom sheet drawer instan, rincian vertikal 1 kolom                     | Slide-over drawer kanan (380px), layout halaman 2 kolom (65% item, 35% ringkasan)    |
| **Checkout (`/checkout`)**              | Formulir linier 1 kolom bebas distraksi, tombol bayar bawah              | Layout 2 kolom (Formulir pengiriman kiri 60%, ringkasan dan bayar kanan 40%)         |
| **Account (`/account`)**                | Kartu riwayat pesanan bertumpuk vertikal, segmented tabs geser           | Layout 2 kolom: Sidebar profil di kiri (280px), daftar pesanan dan tabel di kanan    |
| **Order Tracking (`/track/[orderId]`)** | Garis waktu kurir vertikal, tombol salin resi ramah jempol               | Garis waktu vertikal berdampingan dengan kartu rincian paket dan alamat tujuan       |

---

## 11. Panduan Alih Serah Desain ke Pengembang (Developer Handoff)

1. **Implementasi Tailwind CSS v4:** Gunakan nilai utilitas baku sesuai skala grid 8pt (`p-2`, `p-4`, `p-6`, `p-8`) dan palet warna semantik (`bg-[#0B0B0B]`, `bg-[#161616]`, `border-[#262626]`, `text-[#E2F952]`).
2. **Kepatuhan Aksesibilitas Target Sentuh:** Semua kontrol interaktif (tombol, chip varian, input radio, kontrol kuantitas) wajib memiliki tinggi dan lebar minimal `44px` (`h-11` atau `h-12`).
3. **Motion & Fisika Pegas Native:** Gunakan transisi CSS performa tinggi tanpa overhead bundle (`duration-200 ease-out transform-gpu`) dan hindari animasi dekoratif linear lambat.
4. **Optimasi Media:** Gunakan format WebP untuk seluruh foto katalog dengan rasio aspek terkunci `4:5` untuk mencegah pergeseran tata letak kumulatif (_Cumulative Layout Shift / CLS_).
5. **State Antarmuka Menyeluruh:** Setiap komponen yang terhubung ke data wajib menyediakan 3 status utama: _Loading State_ (skeleton loader abu-abu gelap), _Empty State_ (ilustrasi minimalis bertema gelap), dan _Error State_ (pesan galat jelas dengan tombol coba lagi).
