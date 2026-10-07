# Analisis Riset Kompetitor Mendalam : VOID Supply

Dokumen ini memuat riset komparatif mendalam terhadap tiga merek pakaian dan _streetwear_ terkemuka di Indonesia: **Erigo**, **Thanksinsomnia**, dan **Screamous**.

Analisis ini membedah arsitektur navigasi, katalog, alur pembelian, strategi visual, hingga analisis pasar dan teknis untuk mengidentifikasi kelemahan serta celah peluang (_Opportunity Gap_) yang belum diselesaikan oleh kompetitor di pasar.

Dokumen ini terintegrasi langsung dengan:

- Analisis Celah Peluang: [opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md)
- Prinsip Desain Pengalaman Pengguna: [ux-principles.md](file:///c:/Projects/VOID%20Supply/docs/research/ux-principles.md)
- Profil Persona Pengguna: [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md)
- Peta Perjalanan Pelanggan: [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md)
- Arsitektur Informasi: [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md)
- Perencanaan Wireframe: [WIREFRAME.md](file:///c:/Projects/VOID%20Supply/WIREFRAME.md)

---

## 1. Kerangka Analisis Kompetitor (Analysis Framework)

Setiap kompetitor dianalisis melalui lensa fokus utama masing-masing serta parameter teknis spesifik:

1. **Competitor A (Erigo):** Fokus pada _Mass Market Apparel_ (Navigasi, Katalog, Filter, Halaman Produk, Alur Checkout).
2. **Competitor B (Thanksinsomnia):** Fokus pada _Brand Identity & Streetwear Culture_ (Storytelling, Hierarki Visual, Fotografi & Estetika).
3. **Competitor C (Screamous):** Fokus pada _Large Catalog E-Commerce_ (Penemuan Produk, Inventaris & Manajemen Stok, Promosi & Bundling).
4. **Dimensi Global Komparatif:** Bahasa visual, tipografi, teori warna, target pasar, kebutuhan bisnis, SEO, tagline, dan strategi pemasaran.

---

## 2. Analisis Mendalam Competitor A : Erigo (Mass Market Apparel)

- **Domain Resmi:** `erigostore.co.id`
- **Fokus Utama:** Pakaian kasual massal dengan skala volume produksi dan distribusi raksasa.
- **Tagline Operasional:** _"Expanding to the World"_ / _"Fashion for Everyone"_
- **Target Pasar Utama:** Segmen demografi luas usia 15 hingga 35 tahun (pelajar, mahasiswa, pekerja muda) di seluruh kota Indonesia hingga kota tier 2 dan tier 3.

### A. Navigasi (Navigation)

- **Struktur Menu:** Menggunakan menu megamenu di desktop dan hamburger drawer di mobile dengan kedalaman menu bertingkat (Pria, Wanita, Koleksi Kolaborasi, Aksesoris, Promo Flash Sale).
- **Hambatan UX:** Terlalu banyak kategori turunan yang tumpang-tindih (contoh: Kaos Kasual, Kaos Grafis, Kaos Basic, Kaos Oversize dipisah ke dalam tautan berbeda). Pengguna mobile memerlukan 3 hingga 4 ketukan hanya untuk melihat koleksi t-shirt terbaru.
- **Kecepatan Akses:** Bar navigasi sering tertutup oleh banner promosi mengambang (_sticky top banner_) dan popup kupon pendaftaran, mengurangi area pandang efektif di ponsel layar 6 inci.

### B. Katalog (Catalog)

- **Densitas Produk:** Menampilkan ratusan SKU secara simultan. Grid mobile menggunakan format 2 kolom padat dengan label diskon persentase besar berwarna merah mencolok.
- **Paginasi vs Infinite Scroll:** Menerapkan paginasi numerik konvensional yang memperlambat penjelajahan di perangkat seluler.
- **Karakter Kartu Produk:** Lebih menonjolkan persentase diskon harga coret (misal: "Diskon 70%") daripada nilai material atau keunikan desain grafis.

### C. Filter & Pencarian (Filter)

- **Fungsionalitas Filter:** Menyediakan filter dasar (Kategori, Ukuran, Warna, Rentang Harga).
- **Kelemahan Filter:** Filter ukuran tidak terintegrasi secara real-time dengan status ketersediaan stok aktual. Pengguna sering memilih filter ukuran "L", namun ketika halaman produk dibuka, varian ukuran L pada warna tertentu ternyata sudah habis.
- **Interaksi Mobile Drawer:** Drawer filter di mobile lambat merespons karena beban skrip analitik pelacakan iklan yang berat.

### D. Halaman Produk (Product Page)

- **Penyajian Visual:** Foto studio standar dengan model lokal dan internasional berlatar belakang putih atau abu-abu polos. Minim foto makro yang memperlihatkan serat kain, tekstur rib leher, atau detail jahitan.
- **Panduan Ukuran (Size Chart):** Berupa gambar tabel JPEG statis berisi angka sentimeter. Sulit dibaca di layar smartphone karena teks angka menjadi sangat kecil dan kabur saat diperbesar.
- **Ajakan Bertindak (CTA):** Tombol "Beli Sekarang" dan "Tambah ke Keranjang" bersaing dengan tombol opsi "Beli di Shopee / TikTok Shop", yang mengakibatkan kebocoran konversi (_conversion leakage_) ke platform pihak ketiga.

### E. Alur Pembayaran (Checkout)

- **Tingkat Friksi:** Tinggi. Mengharuskan pembuatan akun atau login sebelum masuk ke rincian alamat pengiriman.
- **Ketergantungan Marketplace:** Pengguna sengaja diarahkan ke akun Shopee atau Tokopedia resmi untuk mendapatkan subsidi ongkos kirim gratis. Akibatnya, situs web resmi gagal menjadi kanal penjualan mandiri yang efisien dan data first-party pembeli tidak terkelola secara optimal.

---

## 3. Analisis Mendalam Competitor B : Thanksinsomnia (Brand Identity & Streetwear Culture)

- **Domain Resmi:** `thanksinsomnia.net`
- **Fokus Utama:** Eksklusivitas subkultur streetwear, skateboard, ilustrasi grafis independen, dan rilisan terbatas (_drop culture_).
- **Tagline Operasional:** _"Stay Raw, Stay Authentic"_ / Narasi visual subkultur perkotaan.
- **Target Pasar Utama:** Komunitas Gen Z perkotaan usia 18 hingga 26 tahun (skaters, pegiat seni jalanan, musisi independen, penggemar fashion streetwear underground).

### A. Narasi & Konsep Rilisan (Storytelling)

- **Konsep Rilis Terbatas:** Menggunakan mekanisme _drop system_ (misalnya: rilis koleksi kolaborasi anime atau artis ilustrator tertentu dengan kuota terbatas).
- **Penyampaian Cerita:** Setiap artikel memiliki narasi tematik yang mendalam di media sosial dan lookbook digital. Merek berhasil membangun ikatan emosional kuat dan rasa kepemilikan (_belonging_) di kalangan komunitasnya.
- **Pemberian Status Eksklusif:** Produk yang bertuliskan _Sold Out_ tidak langsung dihapus dari etalase, melainkan sengaja dipajang untuk menciptakan efek prestise psikologis dan urgensi (_FOMO_) untuk rilis berikutnya.

### B. Hierarki Visual (Visual Hierarchy)

- **Estetika Brutalist & Minimalis:** Latar belakang gelap atau putih polos kontras dengan tipografi sans-serif tebal bergaya punk/jalanan. Ruang negatif (_negative space_) dimanfaatkan dengan baik untuk menonjolkan karya seni grafis.
- **Kelemahan Hierarki:** Terlalu mengorbankan fungsionalitas demi estetika seni. Hirarki teks penting seperti harga, stok varian, dan kebijakan retur sering kali diletakkan dengan font berukuran sangat kecil (10-12px) dengan kontras rendah yang sulit dibaca di luar ruangan.
- **Tata Letak Halaman:** Navigasi katalog minimalis namun minim bantuan penemuan produk (_search discovery_).

### C. Fotografi & Pengarahan Seni (Photography)

- **Gaya Pemotretan:** Foto editorial berbasis luar ruangan (_on-location lookbook_) di jalanan kota, arena skatepark, atau studio bernuansa temaram dengan filter analog film.
- **Daya Tarik:** Menjual gaya hidup dan identitas komunitas secara sempurna. Pembeli merasa membeli tiket masuk ke skena streetwear tertentu.
- **Kelemahan Informatif:** Minim foto detail fisik pakaian (detail serat katun, ketebalan rib kerah, penampakan jahitan). Pembeli tidak dapat memverifikasi kualitas fisik bahan secara objektif sebelum paket tiba di rumah.

---

## 4. Analisis Mendalam Competitor C : Screamous (Large Catalog E-Commerce)

- **Domain Resmi:** `screamous.com`
- **Fokus Utama:** Pelopor distro independen Bandung dengan portofolio pakaian kasual pria harian (_daily wear_) yang sangat besar.
- **Tagline Operasional:** _"Since 2004 - The Timeless Daily Apparel"_
- **Target Pasar Utama:** Generasi milenial dan Gen Z usia 20 hingga 35 tahun yang mencari pakaian kasual berkualitas andal dengan desain tidak terlalu mencolok.

### A. Penemuan Produk (Product Discovery)

- **Struktur Katalog:** Menampilkan ratusan artikel pakaian yang mencakup kaos polos, kemeja flannel, jaket parka, celana chino, dan dompet.
- **Pencarian & Kurasi:** Fitur pencarian bersifat harfiah (_exact match keyword_) dan tidak memiliki penanganan salah ketik (_typo tolerance_). Kategori produk sangat luas sehingga pembeli membutuhkan waktu lama untuk menemukan artikel rilisan terbaru.
- **Kurasi Rekomendasi:** Rekomendasi produk di bagian bawah halaman produk tidak terpersonalisasi, sering menampilkan artikel lama yang tidak relevan dengan produk yang sedang dilihat.

### B. Inventaris & Pengelolaan Stok (Inventory)

- **Transparansi Stok:** Sangat minim. Pembeli tidak mengetahui apakah stok suatu ukuran tersisa 1 pcs atau masih banyak.
- **Penanganan Stok Habis:** Sering terjadi kasus pembeli dapat memasukkan ukuran ke keranjang, namun transaksi dibatalkan setelah checkout karena stok di gerai fisik ternyata telah terjual terlebih dahulu. Ketiadaan sinkronisasi inventaris atomik real-time menjadi kelemahan mendasar.

### C. Promosi & Bundling (Promotion)

- **Pola Promosi:** Pola retail konvensional (Beli 2 Gratis 1, Paket Bundling T-Shirt + Topi, Diskon Akhir Musim).
- **Friksi Transaksi Promosi:** Kupon promosi sering kali memerlukan input manual yang rumit dan tidak tervalidasi secara instan di sisi antarmuka, menimbulkan kebingungan bagi pembeli saat menghitung total tagihan.

---

## 5. Analisis Global Lintas Kompetitor (Global Cross-Analysis)

### A. Bahasa Visual & Estetika Antarmuka

- **Erigo:** Komersial cerah, ramai oleh lencana diskon merah dan stiker promo bertumpuk. Kesan yang muncul adalah obral massal (_bargain store_).
- **Thanksinsomnia:** Monokromatik artistik, brutalist, berakar pada grafiti dan fotografi jalanan. Kesan yang muncul adalah eksklusif dan keren (_cool underground_), namun minim petunjuk interaksi yang intuitif.
- **Screamous:** Retail kasual bersih konvensional, mengadopsi format blog toko daring berbasis template lawas. Kesan yang muncul adalah merek mapan namun tertinggal dalam evolusi teknologi web modern.

### B. Tipografi & Hirarki Huruf

- **Erigo:** Menggunakan font web umum sans-serif standar tanpa karakter kuat (_generic sans_).
- **Thanksinsomnia:** Menggunakan tipografi display alternatif bernuansa heavy condensed sans untuk judul dan serif minimalis untuk editorial. Sangat berkarakter, namun keterbacaan (_readability_) di ponsel berukuran kecil kurang terjaga.
- **Screamous:** Menggunakan font sistem standar dengan penataan teks yang padat dan minim _leading/line-height_ yang lega.

### C. Skema & Teori Warna Merek

- **Erigo:** Menggunakan warna dasar putih dipadukan dengan aksen merah diskon tajam `#E50914` dan kuning oranye. Teori warna berorientasi pada pemicu impuls diskon psikologis (_urgency pricing_).
- **Thanksinsomnia:** Didominasi warna monokrom pekat `#000000` dan `#FFFFFF` dengan aksen abu-abu gelap. Mencerminkan nuansa misterius, independen, dan maskulin.
- **Screamous:** Palet warna netral bersahaja (navy `#1B2A4A`, abu-abu `#6C757D`, dan putih `#FFFFFF`), mencerminkan kenyamanan kasual sehari-hari.

### D. Optimasi Mesin Pencari (SEO) & Performa Web

- **Erigo:** Memiliki otoritas domain (DA) tinggi karena banyaknya tautan liputan media nasional, namun skor Core Web Vitals mobile rendah (LCP > 3.8 detik) akibat skrip analitik dan tag marketing berlebih.
- **Thanksinsomnia:** Kerap kehilangan potensi SEO organik karena nama produk sangat artistik tanpa kata kunci generik (contoh: hanya mencantumkan judul karya seni tanpa kata kunci "Kaos Streetwear Pria"). Skor LCP terbebani oleh gambar editorial resolusi tinggi yang belum terkompresi WebP secara optimal.
- **Screamous:** Memiliki metadata SEO kategori produk yang baik, namun struktur URL masih memuat parameter panjang dan minim implementasi skema data terstruktur JSON-LD untuk produk e-commerce.

### E. Analisis Strategi Pemasaran & Tagline

- **Erigo (Push Marketing):** Mengandalkan belanja iklan digital berskala masif (Meta Ads, Google Shopping) dan kampanye influencer skala besar.
- **Thanksinsomnia (Pull Marketing / Subculture Loyalty):** Mengandalkan reputasi organik dari mulut ke mulut (_word-of-mouth_), antusiasme komunitas streetwear, dan kolaborasi terkurasi.
- **Screamous (Legacy Relationship Marketing):** Mengandalkan loyalitas pelanggan lama yang terbiasa berbelanja sejak era distro fisik Bandung.

---

## 6. Matriks Sintesis Komparasi Kompetitor

| Dimensi Evaluasi                | Erigo                                 | Thanksinsomnia                       | Screamous                               | Standar Sasaran VOID Supply                 |
| :------------------------------ | :------------------------------------ | :----------------------------------- | :-------------------------------------- | :------------------------------------------ |
| **Model Bisnis Utama**          | Mass Market Volume Fast-Fashion       | Subculture Drop-Based Streetwear     | Legacy Distro Daily Apparel             | Curated Streetwear Drops + Tech Platform    |
| **Pengalaman Navigasi**         | Rumit, padat banner, 3-4 klik         | Minimalis, minim fitur pencarian     | Konvensional, struktur retail kaku      | Ramping, 1-tap chip filter, mobile drawer   |
| **Kejelasan Fitting & Kain**    | Bagan ukuran statis JPEG buram        | Keterangan ukuran sangat minim       | Tabel statis biasa tanpa foto serat     | Interactive Size Guide + Zoom Tekstur Makro |
| **Alur & Kecepatan Checkout**   | Wajib akun, dialihkan ke marketplace  | Terbatas di web, lari ke marketplace | Manual chat WhatsApp / transfer bank    | One-Page Guest Checkout (< 60 detik)        |
| **Integrasi Pembayaran**        | Dialihkan ke marketplace pihak ke-3   | Pilihan pembayaran web terbatas      | Transfer rekening bank manual           | Otomatis Midtrans Snap QRIS & VA Bank       |
| **Kepastian Stok Inventaris**   | Sering terjadi pembatalan stok        | Status Sold Out artistik             | Stok sering bentrok dengan toko offline | Atomik real-time via PostgreSQL Drizzle ORM |
| **Performa Kecepatan Mobile**   | Lambat (LCP > 3.8s, banyak tag iklan) | Menengah (LCP > 3.2s, foto berat)    | Lambat (platform lama, LCP > 4.1s)      | Super Cepat (LCP < 1.5s, Next.js 16 WebP)   |
| **Estetika & Identitas Visual** | Ramai promo obral diskon              | Kuat, berkarakter subkultur grunge   | Kasual harian bersih konvensional       | Streetwear gelap modern, tipografi tegas    |
