# User Persona : VOID Supply

Dokumen ini memuat analisis persona pengguna untuk platform e-commerce VOID Supply berdasarkan riset kompetitor utama (*Erigo*, *Thanksinsomnia*, dan *Screamous*). Dokumen ini mencakup pemetaan *Context of Use*, *Emotional Driver*, *Buying Journey*, *User Need Layer*, dan *Priority Matrix* yang diselaraskan dengan arsitektur 3 pilar (*Storefront*, *Customer Account*, dan *Admin Control Center*).

Dokumen turunan perjalanan pengguna dapat dilihat pada [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md).
Dokumen riset kompetitor terkait dapat dilihat pada [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md).
Dokumen cetak biru pengembangan dapat dilihat pada [advance_roadmap_void_supply.md](file:///c:/Projects/VOID%20Supply/docs/advance_roadmap_void_supply.md).

---

## 1. Primary Buyer (Pembeli Merchandise)

### Profil Dasar Pembeli

- **Persona Name:** Rian "The Trendsetter" Pratama
- **Age:** 21 tahun
- **Occupation:** Mahasiswa dan Content Creator Lepas
- **Digital Behavior:**
  - Sangat aktif di Instagram, TikTok, dan Discord setiap hari.
  - Mengakses situs web 95% melalui smartphone (mobile-first user).
  - Terbiasa bertransaksi menggunakan pembayaran digital seperti QRIS, GoPay, dan Virtual Account bank.
  - Sering melihat konten OOTD (*Outfit of the Day*) dan ulasan streetwear di media sosial sebelum memutuskan membeli.
- **Shopping Behavior:**
  - Sering membeli produk apparel secara impulsif saat peluncuran koleksi terbatas (*limited drop* Drop 04).
  - Memperhatikan detail visual produk, gramasi kain riil (500 GSM French Terry, 24s Cotton Combed), dan reputasi merek di kalangan komunitas streetwear.
  - Menyukai kemudahan eksplorasi keranjang tanpa login di awal, serta penyimpanan riwayat transaksi terikat akun saat pesanan dibuat.

### Context of Use Pembeli (Kapan dan Di Mana Masalah Terjadi)

- **Waktu Penggunaan:** Malam hari antara pukul 20.00 hingga 23.00 WIB (waktu bersantai setelah aktivitas harian) atau saat perjalanan pulang kuliah (pukul 16.30 hingga 18.00 WIB).
- **Lokasi Penggunaan:** Dalam transportasi umum (KRL, bus komuter), kamar tidur, atau kafe tempat berkumpul bersama teman sebaya.
- **Perangkat & Konektivitas:** Smartphone layar 6 hingga 6.7 inci dengan koneksi data seluler 4G/5G yang kecepatannya dapat berfluktuasi sewaktu berada di perjalanan.
- **Implikasi Desain UX:**
  - Wajib ringan dan cepat dimuat (Core Web Vitals optimal) agar tidak gagal saat jaringan seluler lemah.
  - Area sentuh (*tap target*) tombol aksi minimal 44px (`min-h-11`) agar nyaman dioperasikan dengan satu tangan.
  - Kontras visual jelas (WCAG AA) dan mendukung kenyamanan mata dalam pencahayaan redup dengan estetika Brutalist Dark Utilitarian.

### Emotional Goals & Drivers Pembeli

- **Kebutuhan Emosional:** Identitas (*Identity*), rasa memiliki (*Belonging*), ekspresi diri (*Expression*), status komunitas (*Status*), dan pengakuan (*Community*).
- **Pernyataan Emosional Utama:**
  > "Saya ingin mengenakan pakaian dari merek yang membuat saya merasa bangga menjadi bagian dari komunitas streetwear modern dan percaya diri menunjukkan karakter otentik saya di hadapan lingkaran pertemanan."
- **Motivasi Tersembunyi:** Ketakutan tertinggal tren (*Fear of Missing Out / FOMO*) terhadap produk edisi terbatas (*limited drop*) yang memiliki nilai prestise di mata komunitas.

### Buying Journey Pembeli

1. **Trigger (Pemicu):** Melihat unggahan reels TikTok atau Instagram dari kreator konten streetwear yang mengenakan koleksi Drop 04 VOID Supply.
2. **Research (Riset Awal):** Mengeklik tautan di bio media sosial, masuk ke halaman katalog produk (`/katalog`), lalu menelusuri galeri foto dan detail gramasi bahan kain.
3. **Compare (Perbandingan):** Membuka panduan ukuran (*size chart*), memilih colorway favorit (Washed Black, Phantom Charcoal, Raw Olive), serta mengecek ketersediaan stok varian.
4. **Cart & Quote (Keranjang):** Memasukkan artikel ke keranjang lokal tanpa hambatan login awal, memasukkan kode voucher diskon, dan mendapatkan quote ongkir resmi Biteship.
5. **Purchase (Pembelian):** Menyelesaikan checkout aman, diverifikasi token akses IDOR, memilih metode bayar QRIS atau Virtual Account Midtrans Snap, lalu menyelesaikan pembayaran dalam jendela waktu reservasi 15 menit.
6. **Tracking & Loyalty (Pasca-Beli):** Menerima notifikasi email faktur resmi, melacak pergerakan kurir secara transparan di `/lacak`, serta mengunggah video unboxing merchandise.

### User Need Layer Pembeli (Problem ke Feature)

| Problem | User Need | UX Principle | Feature Needed |
| :--- | :--- | :--- | :--- |
| Pembeli ragu apakah ukuran baju pas di badan karena standar tiap merek berbeda. | Mengetahui kecocokan ukuran secara akurat sebelum membayar agar terhindar dari salah beli. | *Provide Clarity & Reduce Uncertainty* | Panduan ukuran interaktif dilengkapi tinggi/berat badan model foto dan rekomendasi ukuran. |
| Foto produk sering tidak menunjukkan tekstur asli kain dan detail sablon. | Melihat tekstur bahan, kerapian jahitan, dan warna asli produk secara detail. | *Visual Authenticity & Transparency* | Galeri produk resolusi tinggi dengan foto detail kain macro dan rear view Drop 04 asli. |
| Kekhawatiran kehilangan stok saat proses pembayaran berlangsung. | Kepastian bahwa barang yang dipilih tidak dibeli orang lain saat membuka aplikasi bank. | *Guaranteed Transaction Integrity* | Two-Phase Stock Reservation dengan countdown timer 15 menit di `/pesanan/[nomorPesanan]`. |
| Pelacakan paket sering lambat dan tidak jelas posisi kurir. | Memantau perjalanan pengiriman paket secara mandiri dan akurat. | *Operational Transparency* | Halaman publik kanonikal `/lacak` terintegrasi langsung dengan Biteship tracking API. |

---

## 2. Secondary User (Admin & Brand Operations VOID Supply)

### Profil Dasar Admin

- **Persona Name:** Dimas "Operations" Setyawan
- **Age:** 29 tahun
- **Occupation:** Brand Owner & Operations Manager VOID Supply
- **Digital Behavior:**
  - Menggunakan laptop di kantor dan smartphone saat mobilitas luar untuk memantau operasional toko online.
  - Mengandalkan dasbor analitik harian untuk melihat tingkat konversi, penjualan produk, dan antrean pengiriman.
  - Mengelola pemenuhan pesanan (*fulfillment*), ketersediaan stok, dan hubungan dengan kurir logistik.
- **Management Behavior:**
  - Mengutamakan sistem yang terhubung langsung dengan gerbang pembayaran Midtrans dan agregator logistik Biteship tanpa campur tangan manipulasi database manual.
  - Membutuhkan sistem outbox otomatis yang andal dengan kemampuan pemulihan tugas (*lease reaper*) jika terjadi kegagalan jaringan atau serverless restart.

### Context of Use Admin

- **Waktu Penggunaan:** Pukul 09.00 hingga 17.00 WIB (jam kerja operasional pemrosesan pesanan dan kurir *pick-up*) serta pukul 21.00 hingga 23.00 WIB (evaluasi penjualan harian dan pembaruan stok saat peluncuran *drop* baru).
- **Lokasi Penggunaan:** Kantor studio VOID Supply Johar Baru, gudang penyimpanan stok pakaian, atau saat bepergian via smartphone.
- **Perangkat & Konektivitas:** Laptop kerja (layar 14 hingga 15 inci) dengan koneksi Wi-Fi kantor, serta smartphone Android/iOS saat pemantauan jarak jauh.

### User Need Layer Admin (Problem ke Feature)

| Problem | User Need | UX Principle | Feature Needed |
| :--- | :--- | :--- | :--- |
| Pembaruan stok manual rawan selisih data dan menyebabkan penjualan melebihi kapasitas (*overselling*). | Inventaris berkurang otomatis secara atomik dan pulih jika transaksi batal. | *Single Source of Truth & Real-Time Sync* | Sistem inventaris terintegrasi basis data PostgreSQL dengan Compare-and-Set atomik. |
| Tugas pengiriman email atau booking kurir sering terhenti jika serverless function crash. | Pekerjaan asinkron harus memiliki retry otomatis dan tidak hilang selamanya. | *Fault-Tolerant Async Processing* | Transactional Outbox Engine dengan Lease Reaper timeout 5 menit. |
| Pembuatan label thermal dan resi memakan waktu staf pergudangan. | Cetak label stiker pengiriman standar ekspedisi langsung dari sistem. | *Automate Repetitive Work* | Template label resi thermal 100 x 150 mm (`/pesanan/[nomorPesanan]/resi`) terlindungi token SEC-02. |
| Kebocoran simulator pembayaran demo ke lingkungan transaksi nyata. | Memastikan simulasi sandbox tidak dapat dipicu di lingkungan produksi. | *Fail-Closed Environment Isolation* | Guardrail `DEMO_MODE=true` dan validasi signature token ketat pada Server Actions. |

### Persona Priority Matrix (Secondary User / Admin)

| Kebutuhan Pengguna (*User Need*) | Dampak Bisnis & Operasional (*Impact*) | Tingkat Prioritas (*Priority*) |
| :--- | :--- | :--- |
| Manajemen inventaris & stok otomatis (*Stock management*) | Critical | **P0** (Aktif & Terverifikasi) |
| Pemrosesan pesanan & resi kurir (*Order processing & fulfillment*) | Critical | **P0** (Aktif & Terverifikasi) |
| Proteksi dokumen & otorisasi resi (*IDOR & Access control*) | Critical | **P0** (Aktif & Terverifikasi) |
| Dashboard Admin Control Center & CMS (*Admin operations*) | High | **P1** (Fokus Roadmap Fase 3 & 4) |
| Analitik penjualan & rasio konversi (*Analytics & reporting*) | Medium | **P2** (Fokus Roadmap Fase 5) |

---

## Persona extension: two internal operational roles + guest buyer (2026-10-20)
Source: [SRS](SRS.md), [Design](DESIGN.md), [staging audit](docs/audit-admin-architecture-2026-10-20.md). These are target personas, not a claim that all modules are implemented.

**Guest drop buyer:** browses drops without account, adds color/size variants, checks Biteship shipping quote, pays sandbox and tracks through a scoped order-access token. Friction: forced signup, obscure preorder ETA, unclear stock, untrusted redirects. Need quick order status, size guide and clear all-in price.

**Administration / founder:** accountable for price margin, launch schedule, customer trust, gateway health, stock accuracy, catalog/CMS publishing, sensitive settings, refunds, staff approvals and campaign ROI. Needs anomaly-first dashboard and audited powerful controls. Cannot monitor everything in multiple external tabs.

**Operator / fulfillment:** handles order queues, packing, label printing, physical count, logistics exception and ticket triage on mobile/tablet. Must not silently alter price, create privileged staff, change secrets, approve refunds or export all PII. Needs one clear next action per order, safe retry and minimized data.

**Support contact:** investigates shipment/status problems from order-linked ticket and evidence without receiving unrestricted DB/admin privileges. Consent and response SLA are explicit.

Validate these personas through task observation before building speculative CRM/campaign breadth. Separate navigation information architecture from authorization policy: server-side RBAC decides capabilities.

