# User Persona : VOID Supply

Dokumen ini memuat analisis persona pengguna untuk situs web VOID Supply berdasarkan riset kompetitor utama (_Erigo_, _Thanksinsomnia_, dan _Screamous_). Dokumen ini dilengkapi dengan pemetaan _Context of Use_, _Emotional Driver_, _Buying Journey_, _User Need Layer_, dan _Priority Matrix_.

Dokumen turunan perjalanan pengguna dapat dilihat pada [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md).
Dokumen riset kompetitor terkait dapat dilihat pada [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md).
Dokumen arsitektur informasi situs web dapat dilihat pada [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md).
Dokumen perencanaan wireframe antarmuka dapat dilihat pada [WIREFRAME.md](file:///c:/Projects/VOID%20Supply/WIREFRAME.md).

---

## 1. Primary Buyer (Pembeli Merchandise)

### Profil Dasar Pembeli

- **Persona Name:** Rian "The Trendsetter" Pratama
- **Age:** 21 tahun
- **Occupation:** Mahasiswa dan Content Creator Lepas
- **Digital Behavior:**
  - Sangat aktif di Instagram, TikTok, dan Discord setiap hari.
  - Mengakses situs web 95% melalui smartphone (mobile-first user).
  - Terbiasa bertransaksi menggunakan pembayaran digital seperti QRIS, GoPay, OVO, dan ShopeePay.
  - Sering melihat konten OOTD (_Outfit of the Day_) dan ulasan _streetwear_ di media sosial sebelum memutuskan membeli.
- **Shopping Behavior:**
  - Sering membeli produk _apparel_ secara impulsif saat peluncuran koleksi terbatas (_limited drop_) atau kampanye diskon gajian.
  - Memperhatikan detail visual produk, kepresisian potong pakaian (_fit_), dan reputasi merek di kalangan komunitas _streetwear_.
  - Menyukai kemudahan belanja tanpa perlu membuat akun (_guest checkout_).

### Context of Use Pembeli (Kapan dan Di Mana Masalah Terjadi)

- **Waktu Penggunaan:** Malam hari antara pukul 20.00 hingga 23.00 WIB (waktu bersantai setelah aktivitas harian) atau saat perjalanan pulang kuliah (pukul 16.30 hingga 18.00 WIB).
- **Lokasi Penggunaan:** Dalam transportasi umum (KRL, bus komuter), kamar tidur, atau kafe tempat berkumpul bersama teman sebaya.
- **Perangkat & Konektivitas:** Smartphone layar 6 hingga 6.7 inci dengan koneksi data seluler 4G/5G yang kecepatannya dapat berfluktuasi sewaktu berada di perjalanan.
- **Implikasi Desain UX:**
  - Wajib ringan dan cepat dimuat (Core Web Vitals optimal) agar tidak gagal saat jaringan seluler lemah.
  - Area sentuh (_tap target_) tombol aksi minimal 44px agar nyaman dioperasikan dengan satu tangan.
  - Kontras visual jelas dan mendukung kenyamanan mata saat diakses dalam pencahayaan redup di malam hari.

### Emotional Goals & Drivers Pembeli

- **Kebutuhan Emosional:** Identitas (_Identity_), rasa memiliki (_Belonging_), ekspresi diri (_Expression_), status komunitas (_Status_), dan pengakuan (_Community_).
- **Pernyataan Emosional Utama:**
  > "Saya ingin mengenakan pakaian dari merek yang membuat saya merasa bangga menjadi bagian dari komunitas streetwear modern dan percaya diri menunjukkan karakter otentik saya di hadapan lingkaran pertemanan."
- **Motivasi Tersembunyi:** Ketakutan tertinggal tren (_Fear of Missing Out / FOMO_) terhadap produk edisi terbatas (_limited drop_) yang memiliki nilai prestise di mata komunitas.

### Buying Journey Pembeli

1. **Trigger (Pemicu):** Melihat unggahan reels TikTok atau Instagram dari kreator konten streetwear yang mengenakan kaos VOID Supply edisi terbatas.
2. **Research (Riset Awal):** Mengeklik tautan di bio media sosial, masuk ke halaman katalog produk, lalu menelusuri galeri foto dan detail visual bahan kain.
3. **Compare (Perbandingan):** Membuka panduan ukuran (_size chart_), mencocokkan dengan pakaian favoritnya, membaca ulasan foto pembeli asli (_user-generated content_), serta mengecek estimasi ongkos kirim.
4. **Purchase (Pembelian):** Memilih ukuran, menekan tombol beli langsung (_express checkout_), memilih metode bayar QRIS atau e-wallet, lalu menyelesaikan pembayaran dalam hitungan detik.
5. **Share (Advokasi):** Menerima paket produk dalam kemasan eksklusif, mengambil foto unboxing / OOTD, lalu mengunggahnya ke Instagram Story atau TikTok dengan menyebutkan akun merek VOID Supply.

### User Need Layer Pembeli (Problem ke Feature)

| Problem                                                                               | User Need                                                                                  | UX Principle                           | Feature Needed                                                                                           |
| :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Pembeli ragu apakah ukuran baju pas di badan karena standar tiap merek berbeda.       | Mengetahui kecocokan ukuran secara akurat sebelum membayar agar terhindar dari salah beli. | _Provide Clarity & Reduce Uncertainty_ | Panduan ukuran interaktif dilengkapi tinggi/berat badan model foto dan rekomendasi ukuran.               |
| Foto produk sering tidak menunjukkan tekstur asli kain dan detail sablon.             | Melihat tekstur bahan, kerapian jahitan, dan warna asli produk secara detail.              | _Visual Authenticity & Transparency_   | Galeri produk resolusi tinggi dengan fitur _zoom-in_ dan foto detail kain asli tanpa filter berlebih.    |
| Proses checkout terlalu panjang dan mengharuskan registrasi akun yang membuang waktu. | Menyelesaikan pesanan secepat mungkin sebelum produk edisi terbatas kehabisan stok.        | _Reduce Friction & Streamline Flow_    | _One-Page Guest Checkout_ dengan kalkulasi ongkir instan dan pembayaran QRIS/E-Wallet via Midtrans Snap. |
| Pembeli kecewa saat produk impian tiba-tiba habis tanpa opsi tindak lanjut.           | Mengetahui kepastian restock agar tidak ketinggalan saat produk tersedia kembali.          | _Empowerment & Continuous Engagement_  | Tombol _Notify Me When Available_ via integrasi notifikasi WhatsApp atau email.                          |

### Persona Priority Matrix (Primary Buyer)

| Kebutuhan Pengguna (_User Need_)                                  | Dampak Bisnis & UX (_Impact_) | Tingkat Prioritas (_Priority_) |
| :---------------------------------------------------------------- | :---------------------------- | :----------------------------- |
| Kepastian ukuran pakaian (_Size confidence_)                      | High                          | **P0** (Wajib rilis pertama)   |
| Detail visual & keaslian produk (_Product visual detail_)         | High                          | **P0** (Wajib rilis pertama)   |
| Checkout cepat tanpa registrasi (_Fast guest checkout_)           | High                          | **P1** (Fokus fase peluncuran) |
| Notifikasi ketersediaan stok (_Waitlist / Notify me_)             | Medium                        | **P2** (Fase penyempurnaan)    |
| Ulasan komunitas & galeri foto pembeli (_Community review & UGC_) | Medium                        | **P2** (Fase penyempurnaan)    |

---

## 2. Secondary User (Admin / Owner VOID Supply)

### Profil Dasar Admin

- **Persona Name:** Dimas "Operations" Setyawan
- **Age:** 29 tahun
- **Occupation:** Brand Owner / E-Commerce Manager VOID Supply
- **Digital Behavior:**
  - Menggunakan laptop di kantor dan smartphone saat mobilitas luar untuk memantau operasional toko online.
  - Mengandalkan dasbor analitik harian untuk melihat tingkat konversi, penjualan produk, dan lalu lintas pengunjung.
  - Terbiasa mengelola beberapa kanal penjualan (_marketplace_, situs web, dan gerai fisik).
- **Shopping Behavior (Manajemen Platform):**
  - Memilih platform e-commerce yang efisien, berbiaya terjangkau, dan mudah dikelola tanpa memerlukan kode rumit setiap pembaruan.
  - Mengutamakan sistem yang terhubung langsung dengan gerbang pembayaran dan agregator logistik otomatis.

### Context of Use Admin (Kapan dan Di Mana Masalah Terjadi)

- **Waktu Penggunaan:** Pukul 09.00 hingga 17.00 WIB (jam kerja operasional pemrosesan pesanan dan kurir _pick-up_) serta pukul 21.00 hingga 23.00 WIB (evaluasi penjualan harian dan pembaruan stok saat peluncuran _drop_ baru).
- **Lokasi Penggunaan:** Kantor studio VOID Supply, gudang penyimpanan stok pakaian, atau saat bepergian via smartphone.
- **Perangkat & Konektivitas:** Laptop kerja (layar 14 hingga 15 inci) dengan koneksi Wi-Fi kantor, serta smartphone Android/iOS saat pemantauan jarak jauh.
- **Implikasi Desain UX:**
  - Dasbor admin harus responsif dan memiliki tata letak tabel data yang bersih dengan pemfilteran status yang cepat.
  - Tindakan massal (_bulk action_) untuk pencetakan label resi dan pengubahan status pesanan.
  - Indikator peringatan stok menipis (_low stock badge_) yang mencolok agar tidak terjadi penjualan berlebih (_overselling_).

### Emotional Goals & Drivers Admin

- **Kebutuhan Emosional:** Ketenangan pikiran (_Peace of Mind_), kendali operasional (_Operational Control_), efisiensi waktu, dan kebanggaan terhadap pertumbuhan merek.
- **Pernyataan Emosional Utama:**
  > "Saya ingin memiliki sistem operasional yang berjalan otomatis dan dapat diandalkan, sehingga pesanan pelanggan tertangani dengan rapi tanpa drama salah stok atau keterlambatan pengiriman."

### Buying & Management Journey Admin

1. **Trigger:** Lonjakan volume pesanan harian dari media sosial yang tidak lagi mampu ditangani melalui pencatatan manual atau chat WhatsApp admin.
2. **Setup & Input:** Mendaftarkan data produk, menentukan varian ukuran, mengunggah foto produk, dan mengisi kuota inventaris awal ke dalam basis data.
3. **Operational Monitoring:** Memantau pesanan masuk secara real-time, memeriksa status pembayaran lunas dari Midtrans, dan memverifikasi alamat tujuan pembeli.
4. **Fulfillment:** Mengenerate resi otomatis via integrasi Biteship, mencetak label pengiriman, dan menyerahkan paket ke kurir logistik.
5. **Evaluation & Retargeting:** Melihat laporan analitik tingkat konversi penjualan, mengevaluasi produk paling diminati, dan menyiapkan promosi diskon berikutnya.

### User Need Layer Admin (Problem ke Feature)

| Problem                                                                                                | User Need                                                                                    | UX Principle                              | Feature Needed                                                                               |
| :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------- |
| Pembaruan stok manual rawan selisih data dan menyebabkan penjualan melebihi kapasitas (_overselling_). | Inventaris berkurang otomatis segera setelah pembayaran transaksi terkonfirmasi.             | _Single Source of Truth & Real-Time Sync_ | Sistem inventaris terintegrasi dengan basis data relasional PostgreSQL dan Drizzle ORM.      |
| Pembuatan label alamat dan input nomor resi pengiriman memakan waktu staf gudang.                      | Otomatisasi pembuatan resi dan pelacakan kurir secara terpadu.                               | _Automate Repetitive Work_                | Integrasi Biteship API untuk penerbitan resi instan dan pencetakan label pengiriman pesanan. |
| Pembeli sering membatalkan transaksi di tengah jalan (_abandoned cart_).                               | Mengetahui tingkat keberhasilan transaksi dan menghubungi kembali calon pembeli potensial.   | _Actionable Visibility_                   | Laporan status transaksi (Pending, Success, Expired) dan fitur pengingat pesanan tertunda.   |
| Pengaturan banner promosi diskon mendadak sering membutuhkan bantuan pengembang kode.                  | Fleksibilitas dalam mengaktifkan kode kupon atau diskon potongan harga langsung dari dasbor. | _Administrative Control & Agility_        | Modul manajemen kupon promosi dan banner kampanye diskon di halaman admin.                   |

### Persona Priority Matrix (Secondary User / Admin)

| Kebutuhan Pengguna (_User Need_)                                   | Dampak Bisnis & Operasional (_Impact_) | Tingkat Prioritas (_Priority_) |
| :----------------------------------------------------------------- | :------------------------------------- | :----------------------------- |
| Manajemen inventaris & stok otomatis (_Stock management_)          | Critical                               | **P0** (Wajib rilis pertama)   |
| Pemrosesan pesanan & resi kurir (_Order processing & fulfillment_) | Critical                               | **P0** (Wajib rilis pertama)   |
| Manajemen kupon & banner promosi (_Promotion & coupon management_) | High                                   | **P1** (Fokus fase peluncuran) |
| Analitik penjualan & rasio konversi (_Analytics & reporting_)      | Medium                                 | **P2** (Fase penyempurnaan)    |
