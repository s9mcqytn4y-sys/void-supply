# Customer Journey Map : VOID Supply

Dokumen ini memetakan perjalanan pengalaman pelanggan (_Customer Journey Map_) untuk situs web VOID Supply berdasarkan riset mendalam kompetitor (_Erigo_, _Thanksinsomnia_, dan _Screamous_) serta persona utama Rian "The Trendsetter" Pratama.

Perjalanan ini dibagi ke dalam 5 fase strategis: **Awareness $\rightarrow$ Consideration $\rightarrow$ Decision $\rightarrow$ Purchase $\rightarrow$ Retention**.

Dokumen terkait:

- Profil Persona: [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md)
- Riset Kompetitor Mendalam: [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md)
- Analisis Celah Peluang Desain: [opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md)
- Prinsip Desain Pengalaman Pengguna: [ux-principles.md](file:///c:/Projects/VOID%20Supply/docs/research/ux-principles.md)
- Arsitektur Informasi: [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md)
- Perencanaan Wireframe Antarmuka: [WIREFRAME.md](file:///c:/Projects/VOID%20Supply/WIREFRAME.md)

---

## 1. Matriks Utama Customer Journey Map (5 Stages)

| Stage                              | Business Goal                                                                                                       | User Action                                                                                                                                                    | Feeling                                                            | Problem                                                                                                | Solution                                                                                                                                                           |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Awareness** (Kesadaran)          | Meningkatkan kunjungan berkualitas (_Increase qualified traffic_) dan _brand recall_ rilis terbatas.                | Menjelajahi reels TikTok / linimasa Instagram pada malam hari (20.00-23.00), melihat kreator streetwear memakai kaos VOID Supply, lalu mengetuk tautan profil. | Penasaran, antusias, FOMO (_takut kehabisan rilis terbatas_).      | Tautan bio lambat dimuat di koneksi seluler; beranda umum membingungkan pembeli rilis baru.            | _Deep linking_ langsung ke koleksi rilis terbatas (_limited drop_), halaman awal ringan WebP dengan waktu muat < 1.5 detik.                                        |
| **Consideration** (Pertimbangan)   | Memaksimalkan keterikatan produk (_Product engagement_) dan meniadakan keraguan potongan ukuran (_Fit confidence_). | Menelusuri katalog produk, mengamati galeri foto dari berbagai sudut, dan mencari informasi bahan katun serta kerapian sablon.                                 | Kritis, teliti, sedikit skeptis terhadap klaim foto promosi.       | Standar ukuran _oversized_ tiap merek tidak seragam; foto studio sering menyamarkan tekstur asli kain. | Panduan ukuran interaktif (_Interactive Size Guide_) dengan indikator tinggi/berat badan model foto dan fitur _zoom_ tekstur kain asli tanpa filter.               |
| **Decision** (Keputusan)           | Meniadakan keraguan ongkos kirim dan meminimalkan tingkat keranjang terbengkalai (_Reduce cart abandonment_).       | Memilih varian ukuran dan warna, memeriksa ketersediaan kuota stok, serta menghitung estimasi ongkos kirim ke alamat rumah.                                    | Yakin, terburu-buru mengamankan barang sebelum stok habis.         | Stok varian tidak jelas (harus klik satu per satu); ongkos kirim tidak diketahui sebelum checkout.     | _Real-Time Stock Badge_ per varian ukuran dan kalkulator estimasi ongkir cepat berdasarkan kota tujuan langsung di halaman produk.                                 |
| **Purchase** (Pembelian)           | Memaksimalkan penyelesaian pembayaran (_Checkout completion & instant payment settlement_).                         | Memasukkan item ke keranjang, membuka halaman checkout tanpa login akun, memilih kurir, dan memindai QRIS via mobile banking.                                  | Fokus, tergesa-gesa, lega saat notifikasi pembayaran lunas muncul. | Formulir checkout panjang dengan registrasi akun wajib; verifikasi transfer manual lambat.             | _One-Page Guest Checkout_ dengan formulir ringkas, kalkulasi ongkos kirim instan Biteship API, dan pembayaran otomatis Midtrans Snap QRIS.                         |
| **Retention** (Retensi & Advokasi) | Mendorong pembelian berulang (_Repeat purchase_) dan eksposur komunitas organik (_Organic advocacy_).               | Menerima resi via WhatsApp, melacak posisi kurir di web, unboxing kemasan khusus, dan membagikan foto OOTD ke media sosial.                                    | Puas, bangga, terhubung dengan identitas merek, loyal.             | Resi kurir lambat diperbarui; prosedur penukaran barang membingungkan jika terjadi cacat produksi.     | Halaman pelacakan pesanan mandiri (_Self-Service Order Tracking_), webhook pembaruan status kurir, serta sisipan kartu terima kasih ber-QR untuk rilis berikutnya. |

---

## 2. Analisis Rinci per Fase Interaksi

### Stage 1: Awareness (Kesadaran)

Calon pembeli pertama kali terpapar keberadaan produk VOID Supply melalui media sosial saat waktu santai malam hari.

- **Business Goal:**
  - _Increase Qualified Traffic_: Menarik audiens komunitas streetwear yang memiliki minat beli tinggi langsung ke halaman koleksi rilis terbatas.
  - _Maximize First Impression_: Mengurangi rasio pentalan (_bounce rate_) pengunjung pertama agar siap menjelajahi katalog produk.
- **User Action:**
  - Menjelajahi beranda TikTok dan linimasa Instagram pada pukul 21.00 WIB melalui smartphone.
  - Melihat video OOTD dari kreator streetwear favorit yang mengenakan t-shirt grafis VOID Supply edisi terbaru.
  - Mengetuk tautan di bio profil media sosial untuk masuk ke situs web resmi.
- **User Thought:**
  - "Desain grafis kaosnya berkarakter dan potongan kerahnya rapi. Apakah ini merek lokal baru? Kapan rilisnya?"
  - "Semoga situs webnya tidak lemot dan harganya sebanding dengan kualitas visualnya."
- **Feeling:**
  - Penasaran, bersemangat, ada dorongan FOMO (_Fear of Missing Out_) terhadap koleksi rilis terbatas.
- **Problem:**
  - Banyak situs web merek lokal memerlukan waktu muat lebih dari 3 detik pada sinyal seluler malam hari, memicu _bounce rate_ tinggi.
  - Tautan media sosial sering mengarah ke beranda umum yang memaksa pengguna mencari ulang produk yang dilihat di video.
- **Solution:**
  - Optimasi Core Web Vitals dengan Next.js 16 Image Component (format WebP) agar halaman terbuka dalam waktu kurang dari 1.5 detik.
  - Tautan kampanye langsung mengarah (_deep link_) ke halaman detail produk atau kurasi koleksi rilisan terkait.
- **Key Metrics:**
  - _Landing Page CTR_: Rasio klik tautan profil media sosial ke web $\ge$ 4.5%.
  - _Bounce Rate_: Persentase pentalan kunjungan pertama $\le$ 35%.
  - _Largest Contentful Paint (LCP)_: Waktu muat elemen visual terbesar $\le$ 1.5 detik (Kategori Hijau Core Web Vitals).
- **Technical Impact:**
  - Implementasi Next.js 16 Server Components (RSC) dengan streaming HTML instan tanpa overhead bundle Javascript besar di awal muat.
  - Aset visual banner dikonversi otomatis ke WebP terkompresi dengan prioritas muat `priority` pada area hero.
  - Konfigurasi Edge Caching Vercel CDN untuk penyajian halaman depan statis berkecapatan tinggi.

### Stage 2: Consideration (Pertimbangan)

Rian meneliti keaslian visual produk, kualitas bahan, dan kesesuaian potongan baju dengan preferensi gaya pribadinya.

- **Business Goal:**
  - _Maximize Product Engagement_: Memperpanjang durasi penjelajahan katalog dan memastikan pengunjung memahami nilai material premium VOID Supply.
  - _Eliminate Fit Hesitation_: Menghapus keraguan pembeli terkait potongan pakaian _oversized_ untuk mendorong aksi tambah ke keranjang.
- **User Action:**
  - Mengamati foto produk resolusi tinggi dari sudut depan, belakang, dan jarak dekat (_close-up_ sablon dan rib leher).
  - Meninjau spesifikasi material (katun combed gramasi berat 16s/24s) dan jenis sablon (_discharge / plastisol high-density_).
  - Membuka panduan ukuran (_size chart_) dan membandingkan lebar dada serta panjang baju.
- **User Thought:**
  - "Apakah kaos ukuran M ini cukup boxy atau saya harus naik ke ukuran L agar terlihat proporsional?"
  - "Apakah warna hitamnya benar-benar pekat dan sablonnya tahan cuci?"
- **Feeling:**
  - Teliti, analitis, sedikit cemas salah memilih ukuran karena kebijakan penukaran barang online sering merepotkan.
- **Problem:**
  - Riset kompetitor menunjukkan bagan ukuran di Erigo dan Screamous hanya tabel statis angka sentimeter yang membingungkan saat dibaca di layar ponsel kecil.
  - Foto produk studio Thanksinsomnia sangat artistik tetapi minim menampilkan detail tekstur serat kain nyata.
- **Solution:**
  - **Interactive Size Guide**: Menampilkan visual proporsi dengan referensi model nyata (misalnya: _Tinggi 174 cm, Berat 64 kg mengenakan ukuran L_).
  - **High-Resolution Fabric Viewer**: Galeri foto mikro-tekstur bahan kain asli tanpa filter saturasi berlebih.
- **Key Metrics:**
  - _Average Product View Duration_: Rata-rata durasi membaca detail produk $\ge$ 90 detik.
  - _Size Guide Interaction Rate_: Persentase pembeli yang membuka modal panduan ukuran $\ge$ 30%.
  - _Add-to-Cart (ATC) Rate_: Rasio penambahan item ke keranjang dari total tayangan halaman produk $\ge$ 8.5%.
- **Technical Impact:**
  - Dynamic Routes Next.js 16 (`/products/[slug]`) dengan Server-Side Rendering (SSR) untuk data stok dan varian terakurat.
  - Komponen galeri media client-side ringan menggunakan native touch events tanpa dependensi pustaka geser yang berat.
  - Drizzle ORM query teroptimasi pada tabel `produk` dan relasi varian dengan latensi baca database < 50 ms.

### Stage 3: Decision (Keputusan)

Rian menentukan varian produk yang ingin dibeli dan memastikan tidak ada biaya tak terduga sebelum melangkah ke proses checkout.

- **Business Goal:**
  - _Reduce Purchase Friction_: Mempersingkat jeda pertimbangan antara memilih varian dan memulai transaksi.
  - _Minimize Cart Abandonment_: Meniadakan keterkejutan biaya ongkos kirim di akhir sesi belanja.
- **User Action:**
  - Memilih varian ukuran (L) dan warna utama (Washed Black).
  - Memeriksa sisa stok yang tersedia pada varian terpilih.
  - Mengetik kota atau kode pos tujuan untuk melihat perkiraan biaya ongkos kirim tercepat dan termurah.
  - Menekan tombol "Tambah ke Keranjang" atau "Beli Sekarang".
- **User Thought:**
  - "Ukuran L tinggal tersisa sedikit, saya harus segera mengamankan pesanan sebelum kehabisan."
  - "Bagus, ongkos kirim ke Sleman masuk akal dan tersedia kurir reguler terpercaya."
- **Feeling:**
  - Mantap, fokus, waspada akan kecepatan perebutan stok (_high purchase intent_).
- **Problem:**
  - Ketiadaan indikator stok real-time membuat pembeli kecewa jika baru mengetahui produk habis saat berada di halaman checkout.
  - Ketidakpastian ongkos kirim sering menjadi alasan utama keranjang belanja terbengkalai (_abandoned cart_).
- **Solution:**
  - **Real-Time Stock Badge**: Status kuota stok langsung terbarui via Drizzle ORM (misal: _Tersisa 4 pcs_).
  - **Quick Shipping Calculator**: Pengecekan ongkir cepat di level halaman produk berbasis kota tujuan via Biteship API.
- **Key Metrics:**
  - _Cart-to-Checkout Transition Rate_: Rasio pengguna yang melanjutkan dari keranjang ke checkout $\ge$ 65%.
  - _Shipping Estimator Usage Rate_: Persentase pengecekan ongkos kirim mandiri di halaman produk $\ge$ 45%.
  - _Cart Abandonment Rate_: Persentase keranjang terbengkalai $\le$ 48%.
- **Technical Impact:**
  - Server Action `cekOngkirBiteship()` untuk menghitung tarif logistik secara aman tanpa mengekspos API key Biteship ke browser klien.
  - Zustand Client Store dengan sinkronisasi `localStorage` untuk menjaga persistensi keranjang belanja saat pengguna memuat ulang halaman.
  - Validasi Zod skema `keranjangItemSkema` untuk menjamin konsistensi data harga, id varian, dan kuantitas.

### Stage 4: Purchase (Pembelian & Pembayaran)

Rian menyelesaikan transaksi pembayaran dengan cepat, aman, dan tanpa hambatan registrasi yang merepotkan.

- **Business Goal:**
  - _Maximize Checkout Completion_: Memaksimalkan tingkat penyelesaian transaksi melalui alur belanja satu halaman tanpa hambatan registrasi.
  - _Instant Payment Settlement_: Menjamin penyelesaian pembayaran otomatis dengan tingkat keberhasilan tinggi dan verifikasi instan.
- **User Action:**
  - Membuka formulir checkout satu halaman (_One-Page Checkout_).
  - Mengisi data pengiriman (Nama, No. WhatsApp, Alamat Jalan, dan Kode Pos).
  - Memilih layanan kurir pengiriman (JNE Regular atau SiCepat) dengan tarif yang tertera transparan.
  - Memilih metode pembayaran QRIS Midtrans Snap, membuka aplikasi e-wallet / mobile banking di ponsel yang sama, lalu memindai dan menyelesaikan transaksi.
- **User Thought:**
  - "Sangat praktis tanpa harus membuat akun atau mengingat kata sandi baru."
  - "Apakah pembayaran QRIS saya langsung terkonfirmasi otomatis tanpa perlu kirim bukti transfer ke WhatsApp admin?"
- **Feeling:**
  - Lega, puas, percaya diri bahwa pesanan berhasil tercatat dengan aman.
- **Problem:**
  - Pada Screamous, sebagian alur checkout masih mengarahkan konfirmasi ke WhatsApp staf toko yang lambat di luar jam kerja.
  - Pada Erigo, alur checkout mewajibkan akun atau banyak langkah navigasi yang memperlambat proses transaksi di perangkat mobile.
- **Solution:**
  - **One-Page Guest Checkout**: Menghilangkan seluruh langkah berlebih; satu halaman mencakup alamat, pilihan kurir, dan pembayaran.
  - **Automated Gateway (Midtrans Snap)**: Verifikasi instan QRIS, Virtual Account, dan E-Wallet dengan pengalihan otomatis ke halaman status pesanan sukses.
- **Key Metrics:**
  - _Checkout Completion Rate_: Persentase penyelesaian formulir checkout hingga memicu pembayaran $\ge$ 75%.
  - _Payment Success Rate_: Tingkat keberhasilan pembayaran terverifikasi otomatis via Midtrans Snap $\ge$ 92%.
  - _Average Time-to-Checkout_: Waktu rata-rata pengisian data hingga transaksi selesai $\le$ 60 detik.
- **Technical Impact:**
  - Server Action `buatPesanan()` dengan transaksi atomik basis data (`db.transaction` di Drizzle ORM) untuk memotong stok inventaris dan mencatat pesanan secara bersamaan.
  - Validasi ketat via `checkoutSkema` (Zod) untuk memastikan keabsahan nomor WhatsApp Indonesia dan kode pos pengiriman.
  - Integrasi Midtrans Snap SDK untuk pembuatan snap token pembayaran aman di sisi server.
  - Route Handler Webhook Midtrans (`/api/webhooks/midtrans`) dengan verifikasi `signature_key` SHA-512 untuk pembaruan status pembayaran otomatis dan pencegahan duplikasi data.

### Stage 5: Retention (Retensi & Advokasi Komunitas)

Pengalaman pasca-pembelian yang mengubah pembeli satu kali menjadi pendukung setia merek (_brand advocate_) dan pelanggan berulang.

- **Business Goal:**
  - _Drive Repeat Purchases_: Meningkatkan nilai seumur hidup pelanggan (_Customer Lifetime Value / CLV_) melalui program rilis drop berikutnya.
  - _Amplify Organic Referral_: Memanfaatkan kepuasan pelanggan untuk menghasilkan advokasi konten OOTD gratis di media sosial.
  - _Zero Service Overhead_: Mengurangi beban pertanyaan status pengiriman ke tim dukungan pelanggan.
- **User Action:**
  - Menerima notifikasi otomatis pembaruan resi kurir melalui WhatsApp / Email.
  - Memeriksa halaman pelacakan mandiri (_Order Tracking_) untuk melihat lokasi paket terkini.
  - Menerima paket produk dalam kemasan eksklusif (_custom polymailer_, stiker holografis, dan kartu ucapan ber-QR).
  - Mencoba pakaian di depan cermin, mengambil foto OOTD (_Outfit of the Day_), dan membagikannya ke Instagram Story sambil menandai akun resmi VOID Supply.
- **User Thought:**
  - "Paket tiba tepat waktu, kemasannya rapi, dan bahan kaosnya benar-benar berkualitas tinggi."
  - "Merek ini layak direkomendasikan ke teman-teman di komunitas."
- **Feeling:**
  - Bangga, puas, merasa dihargai sebagai bagian dari komunitas eksklusif VOID Supply.
- **Problem:**
  - Resi pengiriman yang tidak dapat dilacak secara mandiri menimbulkan rasa cemas dan membebani tim layanan pelanggan dengan pertanyaan berulang.
  - Hilangnya interaksi pasca-pembelian menyebabkan tingkat pembelian berulang (_repeat order_) rendah.
- **Solution:**
  - **Self-Service Order Tracking**: Halaman pelacakan paket terintegrasi webhook Biteship yang menampilkan riwayat pergerakan kurir secara transparan.
  - **Community Advocacy Program**: Kartu sisipan kemasan ber-QR yang memberikan akses awal (_early drop access_) pada rilisan koleksi terbatas berikutnya.
- **Key Metrics:**
  - _Repeat Purchase Rate_: Persentase pembeli yang melakukan transaksi kembali dalam periode 60 hari $\ge$ 25%.
  - _Self-Service Tracking Usage Rate_: Persentase pembeli yang memantau kurir secara mandiri $\ge$ 80%.
  - _Customer Support Inquiry Rate_: Rasio pertanyaan manual terkait resi paket ke admin $\le$ 3%.
  - _Organic Social Tag Rate_: Persentase pembeli yang membagikan foto produk di media sosial $\ge$ 15%.
- **Technical Impact:**
  - Route Handler Webhook Biteship (`/api/webhooks/biteship`) untuk sinkronisasi pembaruan posisi kurir logistik secara real-time ke basis data PostgreSQL.
  - Halaman pelacakan mandiri Server Component (`/track/[orderId]`) dengan render stempel waktu pergerakan paket.
  - Mekanisme autentikasi progresif berbasis nomor pesanan dan WhatsApp token tanpa keharusan mengingat kata sandi.
