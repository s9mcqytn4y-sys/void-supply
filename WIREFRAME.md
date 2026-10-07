# Perencanaan Wireframe (Wireframe Planning) : VOID Supply

Dokumen ini mendefinisikan perencanaan kawat tata letak (_Wireframe Planning_) komprehensif untuk antarmuka e-commerce VOID Supply. Rancangan ini disusun dari perspektif UI/UX Designer dan Graphic Designer Adobe XD dengan pendekatan _mobile-first_, berlandaskan riset pengguna pada [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md), 5 fase perjalanan pembeli pada [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md), arsitektur informasi pada [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md), serta pedoman arsitektur sistem pada [GEMINI.md](file:///c:/Projects/VOID%20Supply/GEMINI.md).

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

## 2. Rencana Wireframe Halaman 1 : Home (`/`)

### A. Page Goal

Membangun kredibilitas merek dalam 3 detik pertama, memperkenalkan identitas streetwear eksklusif VOID Supply, serta mengarahkan pembeli langsung ke katalog rilis terbatas (_Limited Drop_) tanpa hambatan navigasi.

### B. Content Hierarchy

1. **Prioritas 1 (Hero Visual & Hook Utama):** Banner rilis terbatas, tajuk koleksi terkini, dan tombol aksi (_CTA_) utama "Lihat Drop Terbaru".
2. **Prioritas 2 (Limited Drop Spotlight):** Produk unggulan rilis terbatas lengkap dengan kuota inventaris sisa (_Stock Scarcity Meter_).
3. **Prioritas 3 (Kategori Cepat / Quick Categories):** Akses instan 1-tap ke kategori terpopuler (T-Shirt, Hoodie, Pants, Aksesoris).
4. **Prioritas 4 (Pilar Jaminan Belanja):** Bukti kualitas material (Katun Gramasi Berat), checkout cepat QRIS, dan resi kurir real-time.
5. **Prioritas 5 (Footer & Komunitas):** Tautan media sosial (TikTok, Instagram, Discord) dan kebijakan pengembalian produk.

### C. Component Requirement

- `Organism: SiteHeader` (Logo teks VOID, Menu Navigasi, Tombol Cari Cepat, Ikon Keranjang + Notifikasi Angka).
- `Organism: HeroBanner` (Foto model WebP, Headline teks Display, Tombol CTA Volt Neon).
- `Molecule: DropTimerCard` (Penghitung mundur rilis, lencana stok tersisa, tombol beli instan).
- `Molecule: ProductCard` (Thumbnail gambar WebP, badge status rilis, judul produk, label harga Rupiah).
- `Molecule: ValuePillar` (Ikon fungsional, judul jaminan, penjelasan singkat).
- `Organism: SiteFooter` (Kolom tautan legal, informasi kontak operasional, pendaftaran buletin drop).
- `Organism: MobileBottomBar` (Bilah navigasi 5 tombol yang tetap melayang di bagian bawah ponsel).

### D. Interaction

- **Transisi Hero:** Efek transisi halus saat menggeser banner koleksi (dukungan swipe sentuh di mobile).
- **Hover Kartu Produk:** Gambar berganti secara mulus menampilkan tampak belakang produk (_Alternate Angle_) saat cursor berada di atas kartu (desktop), atau saat disentuh ringan (mobile).
- **Navigasi Cepat Kategori:** Tap pada chip kategori langsung memfilter dan membawa pengguna ke halaman katalog `/shop?category=[kategori]`.
- **Sticky Mobile Navigation:** Bilah navigasi bawah tetap terlihat dengan efek latar belakang _blur_ (kaca gelap) saat halaman digulir.

### E. Edge Case Evaluation

- **Koneksi Seluler Lambat:** Tampilkan _Skeleton Wireframe_ abu-abu berdenyut pada area hero dan grid kartu produk selama proses pemuatan data.
- **Koleksi Habis Total (_Sold Out Drop_):** Ubah badge menjadi "Habis Terjual" dengan tombol "Ingatkan Drop Berikutnya" (membuka input WhatsApp instan).
- **Galat Jaringan Server:** Tampilkan kartu informasi galat di tengah layar dengan tombol "Muat Ulang Halaman".

### F. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [=] MENU      VOID SUPPLY      (3)BAG |
+---------------------------------------+
| [ HERO BANNER : 390x420 px          ] |
|                                       |
|  LIMITED DROP 04 : VOID IDENTITY      |
|  Koleksi Streetwear Oversized 2026    |
|  [ LIHAT KOLEKSI TERBARU (CTA) ]      |
+---------------------------------------+
| KATEGORI POPULER                      |
| [T-Shirt] [Hoodie] [Pants] [Caps] >   |
+---------------------------------------+
| SOROTAN RILIS TERBATAS                |
| +-----------------+ +---------------+ |
| | [Foto Produk]   | | [Foto Produk] | |
| | OVS T-SHIRT     | | BOX HOODIE    | |
| | Sisa 12 Pcs     | | Sisa 5 Pcs    | |
| | Rp 249.000      | | Rp 489.000    | |
| +-----------------+ +---------------+ |
+---------------------------------------+
| PILAR JAMINAN VOID                    |
| [*] Heavy Cotton 16s/24s Asli         |
| [*] Transaksi Instan QRIS Otomatis    |
| [*] Pengiriman Terlacak Real-Time     |
+---------------------------------------+
| FOOTER (Sosial Media & Kebijakan)     |
+---------------------------------------+
| [Home]  [Shop]  [Cart(3)]  [Lacak]  [Akun] | <- Sticky Bar
+---------------------------------------+
```

#### Desktop Viewport (1440 px)

```text
+----------------------------------------------------------------------------------------------------+
|  VOID SUPPLY        Katalog    Drop Terbaru    Tentang Kami    Lacak Pesanan       [Cari]  (3) Cart |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ HERO SECTION 12-KOLOM : 1440x600 px ]                                                           |
|  +---------------------------------------+  +----------------------------------------------------+ |
|  | LIMITED DROP COLLECTION : 04          |  | [ Gambar Utama Model Streetwear Resolusi Tinggi ]  | |
|  | Edisi Terbatas Boxy Fit Heavyweight   |  |                                                    | |
|  | Material Katun 24s Tanpa Jahitan      |  |                                                    | |
|  |                                       |  |                                                    | |
|  | [ BELANJA DROP SEKARANG ] [SIZE GUIDE] |  |                                                    | |
|  +---------------------------------------+  +----------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
|  KOLEKSI PILIHAN MINGGU INI                                                        [Lihat Semua ->]|
|  +----------------+  +----------------+  +----------------+  +----------------+                    |
|  | [Foto Produk 1]|  | [Foto Produk 2]|  | [Foto Produk 3]|  | [Foto Produk 4]|                    |
|  | VOID OVERSIZED |  | ACID WASH HOOD |  | CARGO PANTS    |  | HEAVYWEIGHT TEE|                    |
|  | Rp 249.000     |  | Rp 489.000     |  | Rp 399.000     |  | Rp 269.000     |                    |
|  | Sisa 8 Pcs     |  | Sisa 3 Pcs     |  | Sisa 14 Pcs    |  | Sisa 11 Pcs    |                    |
|  +----------------+  +----------------+  +----------------+  +----------------+                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Rencana Wireframe Halaman 2 : Shop (`/shop`)

### A. Page Goal

Memudahkan pembeli mencari dan menyaring produk berdasarkan kategori, varian ukuran, dan rentang harga dalam waktu kurang dari 5 detik, serta menyajikan status ketersediaan stok yang transparan.

### B. Content Hierarchy

1. **Prioritas 1 (Filter Cepat & Pengurutan):** Carousel chip kategori horizontal dan tombol buka filter mendalam (_Filter Drawer_).
2. **Prioritas 2 (Grid Produk Responsif):** Daftar kartu produk 2 kolom di mobile dan 4 kolom di desktop.
3. **Prioritas 3 (Tag Filter Aktif):** Chip indikator filter yang sedang aktif dengan tombol hapus cepat per kriteria.
4. **Prioritas 4 (Status Ketersediaan):** Badge stok jelas (_Tersedia, Sisa Sedikit, Habis_).
5. **Prioritas 5 (Navigasi Paginasi / Load More):** Tombol pemuatan produk tambahan yang hemat memori browser.

### C. Component Requirement

- `Organism: FilterDrawer` (Laci geser bawah di mobile berisi pilihan ukuran S hingga XXL, rentang harga slider, jenis pakaian).
- `Molecule: FilterChipBar` (Barisan chip kategori yang dapat digulir horizontal dengan indikator aktif tegas).
- `Molecule: ActiveFilterList` (Daftar filter aktif dengan tombol silang hapus).
- `Organism: ProductGrid` (Grid produk 2 kolom mobile / 4 kolom desktop).
- `Molecule: EmptyStateCatalog` (Ilustrasi bersih saat filter tidak menemukan hasil dengan tombol reset).
- `Atom: StockBadge` (Lencana indikator stok dengan kode warna fungsional).

### D. Interaction

- **Akses Filter Mobile:** Tap tombol "Filter & Urutkan" membuka _Bottom Sheet_ dari bawah layar dengan transisi pegas halus.
- **Penyaringan Instan:** Memilih chip kategori langsung memperbarui daftar produk melalui query parameters URL tanpa memuat ulang seluruh halaman (_URL State Sync_).
- **Efek Reset:** Tombol "Reset Semua Filter" menghapus seluruh parameter pencarian dan mengembalikan katalog ke kondisi awal.

### E. Edge Case Evaluation

- **Hasil Filter Nol (0 Produk):** Tampilkan pesan "Kombinasi filter tidak ditemukan" disertai tombol aksi "Reset Semua Filter" dan rekomendasi produk terlaris di bawahnya.
- **Pemuatan Bertahap (_Infinite / Load More_):** Saat pengguna menekan "Muat Lebih Banyak", tombol berubah menampilkan indikator pemuatan spinner tanpa menggeser posisi scroll pengguna.
- **Koneksi Terputus di Tengah Penjelajahan:** Tampilkan notifikasi mengambang (_Toast_) "Koneksi terputus, klik untuk mencoba lagi".

### F. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [<] KEMBALI       KATALOG      (3)BAG |
+---------------------------------------+
| [Cari produk streetwear...         Q] |
+---------------------------------------+
| [Semua] [T-Shirt] [Hoodie] [Pants] >  | <- Chip Carousel
| [ FILTER & URUTKAN (2 AKTIF)     [v] ]|
+---------------------------------------+
| Filter Aktif: [Size: L x] [Pants x]   |
+---------------------------------------+
| MENAMPILKAN 14 PRODUK                 |
| +-----------------+ +---------------+ |
| | [Foto Produk]   | | [Foto Produk] | |
| | [LOW STOCK]     | | [IN STOCK]    | |
| | VOID ACID HOOD  | | OVS WASH TEE  | |
| | Hitam Charcoal  | | Ash Gray      | |
| | Rp 489.000      | | Rp 249.000    | |
| +-----------------+ +---------------+ |
| +-----------------+ +---------------+ |
| | [Foto Produk]   | | [Foto Produk] | |
| | [SOLD OUT]      | | [IN STOCK]    | |
| | CARGO RAW PANTS | | MINI SHOULDER | |
| | Rp 399.000      | | Rp 189.000    | |
| +-----------------+ +---------------+ |
+---------------------------------------+
|       [ MUAT LEBIH BANYAK (14/32) ]   |
+---------------------------------------+
| [Home]  [Shop]  [Cart(3)]  [Lacak]  [Akun] | <- Sticky Bar
+---------------------------------------+
```

#### Bottom Sheet Filter Mobile (Muncul Saat Tombol Filter Ditekan)

```text
+---------------------------------------+
| === TARIK UNTUK MENUTUP (DRAWER) ===  |
| FILTER & URUTKAN             [Reset]  |
+---------------------------------------+
| URUTKAN BERDASARKAN                   |
| (*) Rilis Terbaru   ( ) Harga Terendah|
| ( ) Paling Populer  ( ) Harga Tertinggi|
+---------------------------------------+
| PILIH UKURAN                          |
| [ S ]  [ M ]  [[ L ]]  [ XL ]  [ XXL ]|
+---------------------------------------+
| RENTANG HARGA                         |
| Rp 150.000 ---------------- Rp 600.000|
+---------------------------------------+
|     [ TERAPKAN FILTER (14 PRODUK) ]   |
+---------------------------------------+
```

---

## 4. Rencana Wireframe Halaman 3 : Product Detail (`/products/[slug]`)

### A. Page Goal

Menghapus keraguan pembeli terkait potongan ukuran pakaian (_Size Confidence_), menyajikan tekstur fisik kain melalui galeri foto makro, dan mendorong konversi langsung ke keranjang belanja atau checkout instan.

### B. Content Hierarchy

1. **Prioritas 1 (Galeri Foto Produk Multi-Sudut):** Gambar tampak depan, tampak belakang, tampak samping, serta foto detail serat kain.
2. **Prioritas 2 (Informasi Esensial & Status Stok):** Judul produk, edisi rilis, harga transparan, dan kuota stok real-time.
3. **Prioritas 3 (Pemilih Varian Ukuran & Panduan Ukuran):** Tombol ukuran S hingga XXL dengan indikator stok per varian, plus tautan modal panduan ukuran interaktif.
4. **Prioritas 4 (Tombol Aksi Belanja):** Tombol utama "Tambah ke Keranjang" dan tombol "Beli Sekarang".
5. **Prioritas 5 (Kalkulator Estimasi Ongkir Singkat):** Input kode pos cepat untuk melihat ongkos kirim sebelum menuju checkout.
6. **Prioritas 6 (Akordeon Spesifikasi Teknis):** Rincian bahan (katun 16s/24s), instruksi pencucian sablon, dan kebijakan penukaran barang.

### C. Component Requirement

- `Organism: MediaGallery` (Tampilan carousel geser horizontal di mobile dengan indikator titik navigasi, tampilan thumbnail grid di desktop).
- `Molecule: VariantSelector` (Tombol varian ukuran dengan penanda coret jika stok habis dan label sisa stok dinamis).
- `Molecule: SizeGuideModal` (Modal pop-up panduan ukuran berisi tabel sentimeter dan profil fisik model foto).
- `Molecule: ShippingEstimator` (Input kode pos sederhana dengan output daftar tarif kurir real-time).
- `Organism: StickyActionFooter` (Bilah melayang di bagian bawah layar ponsel berisi harga dan tombol CTA belanja).
- `Organism: ProductAccordion` (Menu buka-tutup spesifikasi material, detail jahitan, dan perawatan sablon).

### D. Interaction

- **Sticky Bottom Action Bar di Mobile:** Saat pengguna menggulir ke bawah untuk membaca detail bahan dan panduan ukuran, bilah aksi berisi nama varian terpilih dan tombol "Tambah ke Keranjang" tetap menempel di bagian bawah layar (_Thumb Zone_).
- **Pemilihan Ukuran:** Saat ukuran disentuh (misalnya ukuran L), label ketersediaan stok seketika diperbarui (contoh: "Sisa 3 Pcs di Gudang"). Jika varian habis, tombol utama otomatis berubah status menjadi non-aktif dengan label "Ukuran Ini Habis".
- **Panduan Ukuran Interaktif:** Tombol "Panduan Ukuran" membuka modal pop-up yang menyajikan rekomendasi ukuran berdasarkan tinggi dan berat badan pengguna.

### E. Edge Case Evaluation

- **Seluruh Varian Produk Habis Terjual:** Tombol aksi belanja dinonaktifkan permanen dan digantikan oleh formulir pendaftaran notifikasi restock via WhatsApp/Email.
- **Satu Varian Habis, Varian Lain Tersedia:** Tombol varian yang habis diberi garis coret dan tidak dapat ditekan, sementara varian yang tersedia tetap dapat dipilih secara normal.
- **Foto Produk Gagal Dimuat:** Tampilkan gambar pengganti abu-abu bersih berkarakter VOID Supply tanpa memecahkan proporsi tata letak galeri.

### F. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [<] KATALOG       VOID SUPPLY  (3)BAG |
+---------------------------------------+
| [ GALERI FOTO PRODUK : 390x400 px   ] |
|                                       |
| [ Foto 1/4 : Tampak Depan Model     ] |
|                                       |
|               (o) ( ) ( ) ( )         |
+---------------------------------------+
| LIMITED DROP 04                       |
| HEAVYWEIGHT OVERSIZED TEE - VOID BLK  |
| Rp 249.000                            |
| Status: [SISA 8 PCS DI GUDANG]        |
+---------------------------------------+
| PILIH UKURAN        [? Panduan Ukuran]|
| [ S ]   [ M ]   [[ L ]]   [ XL ]  [X-XXL] |
| (Sisa 2) (Sisa 3) (Sisa 3) (Habis) (Habis) |
+---------------------------------------+
| ESTIMASI ONGKIR CEPAT                 |
| [ Masukkan Kota / Kode Pos     ] [CEK]|
| JNE Reguler: Rp 12.000 (1-2 hari)     |
+---------------------------------------+
| [v] SPESIFIKASI MATERIAL & JAHITAN    |
| - 100% Cotton Combed Heavyweight 24s  |
| - Sablon High-Density Plastisol Gloss |
| - Jahitan Rantai Standar Ekspor       |
| [>] PETUNJUK PERAWATAN & PENCUCIAN    |
| [>] KEBIJAKAN RETUR & TUKAR SIZE      |
+---------------------------------------+
| [STICKY BOTTOM BAR DI THUMB ZONE]     |
| L | Rp 249.000     [+ TAMBAH KE BAG]  |
+---------------------------------------+
```

#### Modal Panduan Ukuran (Muncul Saat Tap Panduan Ukuran)

```text
+---------------------------------------+
| PANDUAN UKURAN (SIZE GUIDE)       [X] |
+---------------------------------------+
| PROFIL MODEL DI FOTO:                 |
| Pria: 178 cm / 68 kg (Memakai Size L) |
+---------------------------------------+
| TABEL DIMENSI FISIK (CM):             |
| Size | Lebar Dada | Panjang | Lengan  |
|  S   |    54      |   70    |   23    |
|  M   |    57      |   73    |   24    |
|  L   |    60      |   76    |   25    |
|  XL  |    63      |   78    |   26    |
| XXL  |    66      |   80    |   27    |
+---------------------------------------+
|      [ MENGERTI, TUTUP PANDUAN ]      |
+---------------------------------------+
```

---

## 5. Rencana Wireframe Halaman 4 : Cart (`/cart`)

### A. Page Goal

Menyajikan daftar item belanja secara transparan, memungkinkan perubahan jumlah kuantitas tanpa jeda halaman, memfasilitasi penerapan kupon diskon, serta mengarahkan pembeli langsung ke proses checkout.

### B. Content Hierarchy

1. **Prioritas 1 (Daftar Item Belanja):** Foto thumbnail, judul produk, varian ukuran terpilih, harga satuan, pengatur kuantitas (+/-), dan tombol hapus item.
2. **Prioritas 2 (Penerapan Voucher Promosi):** Input kupon diskon dengan tombol terapkan instan.
3. **Prioritas 3 (Ringkasan Pesanan):** Baris subtotal belanja, potongan voucher promosi, dan estimasi total biaya.
4. **Prioritas 4 (Tombol Menuju Pembayaran):** Tombol aksi utama "Lanjut ke Pembayaran" dan tombol sekunder "Eksplorasi Produk Lain".

### C. Component Requirement

- `Molecule: CartItemRow` (Thumbnail mini 80x80 px, detail varian, kontrol tombol kuantitas, tombol hapus ikon tempat sampah).
- `Molecule: PromoCodeInput` (Kolom input kode kupon dengan validasi pesan umpan balik visual).
- `Molecule: CartOrderSummary` (Kotak kalkulasi subtotal, diskon, dan total akhir).
- `Molecule: EmptyCartPlaceholder` (Tampilan ramah saat keranjang kosong dengan tombol menuju katalog).
- `Atom: TrustIcon` (Ikon jaminan keamanan transaksi dan garansi tukar ukuran).

### D. Interaction

- **Perubahan Kuantitas Produk:** Menekan tombol `+` atau `-` langsung memperbarui subtotal di keranjang secara instan di sisi klien melalui Zustand store tanpa memuat ulang halaman.
- **Penghapusan Item:** Menekan tombol hapus menampilkan konfirmasi singkat atau opsi "Batal Hapus" (_Undo Toast_ selama 4 detik).
- **Penerapan Kupon:** Jika kode kupon valid, baris diskon langsung tertera dengan warna aksen hijau; jika tidak valid, kolom input bergetar ringan (_shake animation_) dengan teks galat merah yang jelas.

### E. Edge Case Evaluation

- **Keranjang Belanja Kosong:** Jika tidak ada produk di keranjang, tampilkan ilustrasi tas belanja minimalis, pesan "Keranjang belanja Anda masih kosong", serta tombol aksi "Lihat Koleksi Terbaru".
- **Stok Item Mendadak Berkurang di Gudang:** Jika stok barang habis saat masih di dalam keranjang, tampilkan peringatan merah di atas kartu item terkait: "Stok ukuran ini baru saja habis oleh pembeli lain" beserta tombol otomatis sesuaikan kuantitas.
- **Kuantitas Melebihi Kuota Stok Tersedia:** Tombol penambah `+` dinonaktifkan secara otomatis saat jumlah item di keranjang telah mencapai batas maksimal stok yang ada di gudang.

### F. Diagram Wireframe Tata Letak

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
| Ongkos Kirim          Dihitung saat   |
|                             checkout  |
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

Menyelesaikan transaksi belanja dalam waktu kurang dari 60 detik tanpa friksi registrasi paksa (_One-Page Guest Checkout_), menghitung ongkos kirim kurir lokal secara real-time via Biteship, dan memproses pembayaran otomatis via Midtrans Snap (QRIS, VA Bank).

### B. Content Hierarchy

1. **Prioritas 1 (Identitas & Alamat Pengiriman):** Nama lengkap penerima, nomor WhatsApp aktif (untuk pengiriman notifikasi resi otomatis), alamat rumah/kantor, serta kode pos tujuan.
2. **Prioritas 2 (Layanan Kurir Pengiriman):** Pilihan ekspedisi logistik (JNE, SiCepat, J&T) beserta estimasi hari tiba dan tarif ongkir real-time.
3. **Prioritas 3 (Ringkasan Biaya Akhir):** Kalkulasi subtotal barang, ongkos kirim kurir terpilih, dan total tagihan final.
4. **Prioritas 4 (Metode Pembayaran Terpadu):** Pemilihan kanal bayar instan (QRIS GoPay/OVO/ShopeePay, Virtual Account BCA/Mandiri).
5. **Prioritas 5 (Tombol Final Pembayaran):** Tombol aksi utama "Bayar Pesanan Sekarang" dengan jaminan keamanan transaksi.

### C. Component Requirement

- `Molecule: CustomerContactForm` (Input Nama, Nomor WhatsApp, Email opsional).
- `Molecule: DeliveryAddressForm` (Alamat lengkap, Provinsi, Kota/Kabupaten, Kecamatan, Kode Pos dengan fitur pelengkapan otomatis).
- `Molecule: CourierSelectorGroup` (Daftar kartu radio pilihan kurir yang menampilkan nama ekspedisi, durasi pengiriman, dan biaya ongkir).
- `Organism: CheckoutSummaryCard` (Rincian seluruh tagihan transparan tanpa biaya tersembunyi).
- `Molecule: PaymentMethodSelector` (Pilihan QRIS instan dan Transfer Bank Virtual Account).
- `Organism: MidtransSnapTrigger` (Integrasi pop-up pembayaran instan Snap SDK).

### D. Interaction

- **Alur Linear Satu Halaman (_Linear One-Page Flow_):** Pengguna mengisi data dari atas ke bawah tanpa harus berpindah-pindah layar atau membuka akordeon bertingkat yang membingungkan.
- **Kalkulasi Ongkir Real-Time:** Begitu kode pos atau kecamatan diinput, daftar layanan ekspedisi langsung memuat estimasi ongkos kirim secara otomatis via API Biteship.
- **Aktivasi Pembayaran Midtrans Snap:** Saat tombol "Bayar Pesanan Sekarang" ditekan, jendela modal pembayaran Midtrans Snap langsung terbuka di layar tanpa mengalihkan pengguna ke situs eksternal. Tombol utama dinonaktifkan sementara untuk mencegah transaksi ganda.

### E. Edge Case Evaluation

- **API Kurir Terkendala / Timeout:** Tampilkan opsi kurir darurat dengan tarif tetap rata (_Flat Rate Shipping_) agar proses transaksi pembeli tidak terhenti.
- **Nomor WhatsApp Salah Format:** Tampilkan pesan bantuan langsung di bawah kolom: "Gunakan format nomor ponsel aktif Indonesia, contoh: 08123456789".
- **Pembeli Menutup Pop-Up Snap Sebelum Membayar:** Simpan pesanan dengan status "Menunggu Pembayaran", kirimkan tautan pembayaran cadangan via WhatsApp otomatis, dan sediakan tombol "Lanjutkan Pembayaran".

### F. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

```text
+---------------------------------------+
| [<] KERANJANG     CHECKOUT INSTAN     |
+---------------------------------------+
| 1. DATA PENERIMA                      |
| [ Nama Lengkap Penerima             ] |
| [ No. WhatsApp (Untuk Info Resi)    ] |
| [ Email (Opsional)                  ] |
+---------------------------------------+
| 2. ALAMAT PENGIRIMAN                  |
| [ Alamat Lengkap & No. Rumah        ] |
| [ Kota / Kabupaten                  ] |
| [ Kecamatan                         ] |
| [ Kode Pos                          ] |
+---------------------------------------+
| 3. PILIH KURIR PENGIRIMAN             |
| (*) JNE Reguler (1-2 hari)  Rp 14.000 |
| ( ) SiCepat BEST (1 hari)   Rp 20.000 |
| ( ) J&T Express (2-3 hari)  Rp 13.000 |
+---------------------------------------+
| 4. METODE PEMBAYARAN                  |
| [*] QRIS Instan (GoPay, OVO, Shopee)  |
| [ ] Virtual Account (BCA, Mandiri)    |
+---------------------------------------+
| 5. RINGKASAN TAGIHAN                  |
| Subtotal (2 Produk)       Rp 738.000  |
| Ongkos Kirim (JNE Reg)     Rp 14.000  |
| Potongan Voucher                Rp 0  |
| ------------------------------------- |
| Total Pembayaran          Rp 752.000  |
+---------------------------------------+
|  [ BAYAR PESANAN SEKARANG (QRIS) ]    |
|   [*] Enkripsi SSL 256-Bit Terjamin   |
+---------------------------------------+
```

---

## 7. Rencana Wireframe Halaman 6 : Account (`/account`)

### A. Page Goal

Menjadi pusat pengelolaan akun pengguna yang fleksibel (_Progressive Account Access_), menyediakan arsip riwayat pesanan masa lalu, memudahkan pemantauan resi belanja, serta menyimpan data alamat untuk mempercepat transaksi berikutnya tanpa membebani pembeli di awal.

### B. Content Hierarchy

1. **Prioritas 1 (Status Autentikasi Pengguna):** Formulir login instan via Magic Link / OTP bagi pengguna belum login, atau Ringkasan Profil bagi pengguna aktif.
2. **Prioritas 2 (Riwayat Pesanan Terkini):** Kartu pesanan aktif dan pesanan masa lalu lengkap dengan status transaksi, nomor faktur, dan tombol lacak.
3. **Prioritas 3 (Buku Alamat Tersimpan):** Pengelolaan alamat pengiriman utama dan alamat cadangan.
4. **Prioritas 4 (Pengaturan Akun & Keluar):** Opsi perbarui nomor kontak dan tombol keluar dari sesi akun.

### C. Component Requirement

- `Molecule: ProgressiveAuthCard` (Formulir input email atau nomor WhatsApp untuk pengiriman tautan login instan).
- `Molecule: UserProfileBadge` (Avatar pengguna, nama lengkap, kontak terverifikasi, dan tier loyalitas).
- `Organism: OrderHistoryList` (Daftar kartu transaksi memuat tanggal, nominal belanja, rincian barang, dan lencana status).
- `Molecule: SavedAddressCard` (Kartu alamat pengiriman dengan tombol jadikan utama dan ubah alamat).
- `Atom: TabNavigation` (Tab pemisah antara riwayat pesanan dan pengaturan profil).

### D. Interaction

- **Akses Cepat Pengguna Tamu:** Pembeli yang bertransaksi sebagai tamu dapat memasukkan nomor faktur dan nomor WhatsApp mereka untuk langsung melihat pesanan tanpa harus membuat kata sandi baru.
- **Peralihan Tab:** Berpindah antara tab "Riwayat Pesanan" dan "Alamat Saya" secara instan tanpa memuat ulang halaman.
- **Tautan Instan Lacak:** Menekan tombol "Lacak Pesanan" pada kartu riwayat langsung membawa pengguna ke halaman pelacakan kurir `/track/[orderId]`.

### E. Edge Case Evaluation

- **Pengguna Belum Memiliki Transaksi:** Tampilkan status kosong ramah dengan pesan "Anda belum memiliki riwayat belanja di VOID Supply" beserta tombol pintas "Mulai Belanja Koleksi Terbaru".
- **Tautan Login Magic Link Kadaluwarsa:** Tampilkan notifikasi galat yang jelas dengan tombol aksi 1-tap "Kirim Ulang Tautan Masuk".
- **Sesi Login Berakhir:** Arahkan pengguna kembali ke formulir login progresif dengan pesan bahwa sesi telah diperbarui demi keamanan.

### F. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px) - Tampilan Pengguna Terdaftar

```text
+---------------------------------------+
| [=] MENU        AKUN SAYA      (0)BAG |
+---------------------------------------+
| [AVATAR]  RIAN PRATAMA                |
|           rian.pratama@gmail.com      |
|           Status: [VOID MEMBER]       |
+---------------------------------------+
| [ RIWAYAT PESANAN (3) ] [ ALAMAT (1) ]|
+---------------------------------------+
| PESANAN TERBARU                       |
| +-----------------------------------+ |
| | No. Faktur : #VOID-2026-8821      | |
| | Tanggal    : 07 Okt 2026          | |
| | Status     : [SEDANG DIKIRIM]     | |
| | --------------------------------- | |
| | 1x Oversized Heavyweight Tee (L)  | |
| | 1x Boxy Acid Hoodie (L)           | |
| | Total Tagihan : Rp 752.000        | |
| |                                   | |
| | [ LACAK PENGIRIMAN ]  [RINCIAN]   | |
| +-----------------------------------+ |
| +-----------------------------------+ |
| | No. Faktur : #VOID-2026-7512      | |
| | Tanggal    : 15 Sep 2026          | |
| | Status     : [SELESAI DITERIMA]   | |
| | Total      : Rp 249.000           | |
| | [ BELI LAGI ]         [INVOICE]   | |
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

Menyajikan status pergerakan paket logistik secara transparan dan mandiri (_Self-Service Logistics Tracking_) berdasar integrasi webhook kurir Biteship, meniadakan kecemasan pembeli, dan mencegah beban pertanyaan manual ke admin toko.

### B. Content Hierarchy

1. **Prioritas 1 (Header Status Pesanan):** Nomor faktur pesanan, lencana status terkini (_Paket Sedang Dikirim_), dan estimasi hari tiba.
2. **Prioritas 2 (Garis Waktu Perjalanan Kurir / Live Timeline):** Garis waktu vertikal terperinci mencakup stempel jam, tanggal, lokasi perhentian transit, dan status pergerakan kurir.
3. **Prioritas 3 (Data Ekspedisi & Tombol Salin Resi):** Nama kurir pengiriman (JNE Reguler), nomor resi resmi, serta tombol salin resi cepat.
4. **Prioritas 4 (Rincian Paket & Alamat Tujuan):** Ringkasan barang yang berada di dalam paket dan alamat penerima.
5. **Prioritas 5 (Pusat Bantuan & Komunitas):** Tombol bantuan kendala pengiriman dan ajakan berbagi OOTD jika pesanan sudah diterima.

### C. Component Requirement

- `Molecule: TrackingStatusHeader` (Nomor order besar, status berpendar, dan indikator tanggal).
- `Organism: ShipmentTimeline` (Diagram garis vertikal dengan penanda titik hijau pada tahap aktif, riwayat stempel waktu dari Biteship).
- `Molecule: WaybillCopyCard` (Kolom nomor resi dengan tombol aksi salin 1-tap yang menampilkan umpan balik teks "Tersalin").
- `Molecule: DeliveryAddressCard` (Ringkasan nama penerima dan alamat pengantaran).
- `Molecule: DeliveryHelpAction` (Tombol pintas WhatsApp operasional jika paket terlambat dari estimasi).

### D. Interaction

- **Salin Nomor Resi 1-Tap:** Menekan tombol "Salin Resi" menyalin nomor waybill ke clipboard ponsel dan mengubah teks tombol menjadi "Tersalin!" selama 2 detik.
- **Pembaruan Status Otomatis:** Garis waktu pengiriman tersinkronisasi langsung dengan status pelacakan kurir tanpa pembeli perlu mengetik ulang nomor resi.
- **Kondisi Selesai Diterima:** Jika paket berstatus "Diterima", bagian atas halaman otomatis menampilkan kartu ucapan terima kasih dengan ajakan membagikan foto OOTD ke Instagram story dengan tagar resmi VOID Supply.

### E. Edge Case Evaluation

- **Nomor Pesanan Tidak Ditemukan:** Jika pengguna mengakses ID pesanan yang tidak terdaftar, tampilkan pesan galat informatif dengan kolom pencarian manual untuk memasukkan nomor pesanan yang benar.
- **Resi Baru Dibuat (Belum Terdata di Server Kurir):** Tampilkan status informatif: "Nomor resi telah diterbitkan oleh gudang VOID Supply. Data pelacakan logistik akan terbarui dalam 1x24 jam".
- **Pengiriman Tertahan / Kendala Alamat:** Tampilkan lencana peringatan warna kuning dengan tombol pintas langsung ke dukungan pelanggan untuk konfirmasi alamat.

### F. Diagram Wireframe Tata Letak

#### Mobile Viewport (390 px)

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
|                                       |
| (o) 07 Okt 18:30 - JAKARTA PUSAT      |
|  |  Paket sedang dibawa kurir ke      |
|  |  alamat tujuan penerima            |
|  |                                    |
| (o) 07 Okt 09:15 - HUB LOGISTIK JKT   |
|  |  Paket tiba di fasilitas sortir    |
|  |                                    |
| (o) 06 Okt 21:00 - GUDANG VOID SUPPLY |
|  |  Paket diserahkan ke kurir JNE     |
|  |                                    |
| (o) 06 Okt 14:00 - SISTEM VOID        |
|     Pembayaran QRIS Terverifikasi     |
+---------------------------------------+
| TUJUAN PENGIRIMAN                     |
| Rian Pratama (+62 812-3456-7890)      |
| Jl. Senopati No. 42, Kebayoran Baru   |
| Jakarta Selatan, DKI Jakarta 12190    |
+---------------------------------------+
| BUTUH BANTUAN DENGAN PENGIRIMAN?      |
| [ HUBUNGI DUKUNGAN VIA WHATSAPP ]     |
+---------------------------------------+
| [Home]  [Shop]  [Cart]  [Lacak*] [Akun] | <- Sticky Bar
+---------------------------------------+
```

---

## 9. Matriks Komparasi Tata Letak (Mobile vs Desktop)

| Halaman Situs                           | Karakteristik Mobile (390 px Viewport)                                                  | Karakteristik Desktop (1440 px Viewport)                                                             |
| :-------------------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **Home (`/`)**                          | Hero 1 Kolom Full-Width, Carousel Chip Kategori, Grid Produk 2 Kolom, Sticky Bottom Bar | Hero 12 Kolom Split Layout (Teks Kiri, Model Kanan), Grid Produk 4 Kolom, Header Navigasi Horizontal |
| **Shop (`/shop`)**                      | Filter via Slide-over Drawer / Bottom Sheet, Grid 2 Kolom, Tombol Muat Lebih Banyak     | Filter Sidebar Kolom Kiri Tetap (Sticky), Grid 4 Kolom, Paginasi Nomor Terstruktur                   |
| **Product Detail (`/products/[slug]`)** | Galeri Swipe Horizontal, Varian Ukuran Chip, Sticky Bottom Action Bar di Thumb Zone     | Galeri Foto Vertikal 2 Kolom di Kiri, Panel Beli dan Spesifikasi Sticky di Kanan                     |
| **Cart (`/cart`)**                      | Daftar Item Vertikal 1 Kolom, Ringkasan Belanja di Bawah, Tombol CTA Mengikuti Layar    | Layout 2 Kolom (Daftar Belanja Kiri 8-Kolom, Ringkasan Tagihan Sticky Kanan 4-Kolom)                 |
| **Checkout (`/checkout`)**              | Alur Linear Vertikal Satu Layar, Formulir Ringkas, Modal Snap Pop-up                    | Layout 2 Kolom (Formulir Data Kiri 7-Kolom, Ringkasan Tagihan & Rincian Kanan 5-Kolom)               |
| **Account (`/account`)**                | Kartu Riwayat Bertumpuk Vertikal, Tombol Lacak Lebar Penuh                              | Dasbor Tabular dengan Navigasi Menu Samping dan Tabel Riwayat Pembelian Lengkap                      |
| **Order Tracking (`/track/[orderId]`)** | Garis Waktu Vertikal Ramping, Tombol Salin Resi Lebar Ramah Jempol                      | Garis Waktu Horizontal/Vertikal Berdampingan dengan Peta Lokasi Ekspedisi Logistik                   |

---

## 10. Panduan Alih Serah Desain ke Pengembang (_Handoff Guidelines_)

1. **Penggunaan Utilitas Tailwind CSS v4:** Seluruh nilai jarak wajib mengacu pada token Tailwind resmi (`p-2`, `p-4`, `p-6`, `p-8`) selaras dengan skala grid 8pt.
2. **Kesesuaian Target Sentuh:** Semua elemen tombol interaktif, chip filter, dan kontrol kuantitas wajib memiliki dimensi minimal `h-11` (44 pixel) untuk menjamin kenyamanan navigasi satu tangan.
3. **Pemberian Aksesibilitas ARIA:** Seluruh dialog modal (Panduan Ukuran, Drawer Filter, dan Snap Modal) wajib memiliki atribut `aria-modal="true"`, `role="dialog"`, dan kemampuan ditutup dengan tombol `Escape`.
4. **Optimasi Aset Gambar:** Semua aset visual wireframe dalam produksi diimplementasikan menggunakan format `.webp` dengan atribut `sizes` responsif untuk memastikan waktu muat di bawah 1.5 detik pada koneksi 4G seluler.
