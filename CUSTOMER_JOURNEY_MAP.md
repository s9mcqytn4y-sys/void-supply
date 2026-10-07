# Customer Journey Map : VOID Supply

Dokumen ini memetakan perjalanan pengalaman pelanggan (_Customer Journey Map_) untuk situs web VOID Supply berdasarkan persona utama Rian "The Trendsetter" Pratama. Pemetaan ini merinci tindakan, pikiran, emosi, kendala, peluang, serta kebutuhan fitur pada setiap fase interaksi.

Tautan persona lengkap: [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md)
Tautan riset kompetitor: [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md)

---

## Informasi Persona

- **Nama Persona:** Rian "The Trendsetter" Pratama
- **Usia:** 21 tahun
- **Peran:** Mahasiswa dan Content Creator Lepas
- **Karakteristik Kunci:** Mobile-first user, penggemar streetwear edisi terbatas, pengambil keputusan impulsif berdasarkan visual otentik dan reputasi komunitas.
- **Tujuan Utama:** Mendapatkan pakaian streetwear berkualitas dengan ukuran yang pas di badan pada rilis terbatas pertama tanpa hambatan transaksi.

---

## Stage 1: Awareness (Kesadaran)

Pada fase ini, calon pembeli pertama kali mengetahui keberadaan koleksi baru VOID Supply melalui media sosial saat waktu santai malam hari.

- **User Action:**
  - Menjelajahi beranda TikTok dan linimasa Instagram pada pukul 21.30 WIB di kamar tidur.
  - Melihat video OOTD (_Outfit of the Day_) dari kreator streetwear favorit yang mengenakan t-shirt grafis VOID Supply edisi terbaru.
  - Mengetuk tautan merek di bio profil atau tautan langsung pada deskripsi video untuk mengunjungi situs web.
- **User Thought:**
  - "Desain kaosnya unik dan potongannya terlihat pas (_boxy/oversized fit_). Apakah ini merek baru lokal? Kapan koleksi ini rilis?"
  - "Semoga harganya masih masuk akal untuk kualitas bahan seperti itu."
- **Emotion:**
  - Penasaran, antusias, dan ada sedikit rasa cemas tertinggal tren (_Fear of Missing Out / FOMO_).
- **Pain Point:**
  - Tautan di media sosial terkadang lambat dimuat atau mengarah ke beranda umum yang membingungkan alih-alih langsung ke halaman produk yang bersangkutan.
  - Sinyal seluler malam hari di kamar yang kadang fluktuatif menyebabkan halaman terasa lambat jika aset gambar terlalu berat.
- **Opportunity:**
  - Memanfaatkan _deep linking_ langsung ke halaman detail produk dari kampanye media sosial.
  - Mengoptimalkan kompresi gambar format WebP dan tata letak _mobile-first_ ringan agar situs terbuka dalam waktu di bawah 1.5 detik.
- **Feature Needed:**
  - Halaman produk responsif dengan performa muat cepat (_Optimized Next.js Image_).
  - Banner pengumuman rilis terbatas (_Limited Drop Banner_) yang menegaskan keaslian dan ketersediaan koleksi.

---

## Stage 2: Consideration (Pertimbangan)

Pada fase ini, Rian mendalami detail produk di situs web, mengevaluasi ukuran, bahan, dan kredibilitas sebelum membuat keputusan beli.

- **User Action:**
  - Mengamati foto produk resolusi tinggi dari berbagai sudut (tampak depan, belakang, detail jahitan kerah, dan tekstur sablon).
  - Membuka panduan ukuran (_Size Chart_) dan membandingkan dimensi panjang/lebar baju dengan kaos yang biasa dipakainya.
  - Memeriksa informasi tinggi badan model foto (misalnya: Model 175 cm, 65 kg mengenakan ukuran L) untuk mendapatkan gambaran visual proporsional.
  - Membaca komposisi bahan kain (katun combed 24s/16s berat gramasi tinggi) dan testimoni foto asli dari pembeli sebelumnya.
- **User Thought:**
  - "Apakah ukuran M ini cukup longgar di badan saya, atau saya harus mengambil ukuran L agar terlihat _oversized_?"
  - "Apakah warna hitamnya pekat dan sablonnya tidak mudah retak setelah dicuci?"
  - "Berapa biaya pengiriman ke alamat saya di Sleman, Yogyakarta?"
- **Emotion:**
  - Teliti, kritis, sedikit ragu akan kecocokan ukuran, namun tetap bersemangat untuk memiliki produk.
- **Pain Point:**
  - Bagan ukuran statis berbentuk tabel teks biasa yang sulit dibaca di layar smartphone kecil.
  - Foto produk studio yang terlalu terang atau menggunakan filter berlebih sehingga warna aslinya diragukan.
  - Tidak ada kejelasan stok apakah ukuran yang diinginkan masih tersedia sebelum tombol ditekan.
- **Opportunity:**
  - Menyajikan panduan ukuran interaktif dengan rekomendasi visual berdasarkan berat dan tinggi badan model foto.
  - Menyediakan kalkulator estimasi ongkos kirim cepat berdasarkan kode pos atau kota tujuan tanpa harus masuk ke formulir checkout.
- **Feature Needed:**
  - Panduan ukuran interaktif (_Interactive Size Guide & Model Fit Indicator_).
  - Indikator ketersediaan stok varian ukuran secara real-time (_Real-Time Stock Badge_).
  - Galeri foto detail material kain (_High-Resolution Material Zoom_).

---

## Stage 3: Purchase (Pembelian & Pembayaran)

Pada fase ini, Rian telah mantap memilih produk dan ingin segera menyelesaikan pembayaran sebelum stok diambil pembeli lain.

- **User Action:**
  - Memilih ukuran baju yang sesuai (ukuran L) lalu menekan tombol "Beli Sekarang" atau "Tambah ke Keranjang".
  - Mengisi data pengiriman (nama penerima, nomor WhatsApp, alamat lengkap, dan kode pos).
  - Memilih kurir pengiriman yang paling terjangkau atau paling cepat (JNE Regular atau SiCepat).
  - Memilih metode pembayaran instan (QRIS) melalui antarmuka Midtrans Snap, membuka aplikasi mobile banking atau e-wallet di ponsel, lalu memindai kode QR.
- **User Thought:**
  - "Saya tidak ingin repot mendaftar akun atau mengingat password baru; saya ingin langsung bayar."
  - "Apakah pembayaran saya langsung terverifikasi otomatis tanpa perlu kirim bukti transfer manual ke admin?"
- **Emotion:**
  - Terburu-buru, fokus, lega saat pembayaran sukses terverifikasi.
- **Pain Point:**
  - Formulir checkout yang terlalu panjang dengan banyak kolom yang tidak perlu.
  - Harus keluar dari aplikasi untuk melakukan konfirmasi transfer manual.
  - Proses kalkulasi ongkos kirim yang macet atau pilihan kurir yang tidak lengkap.
- **Opportunity:**
  - Menerapkan alur pembelian satu halaman (_One-Page Guest Checkout_) yang ringkas dan bebas friksi.
  - Integrasi otomatis gateway pembayaran lokal Midtrans Snap (QRIS, GoPay, OVO, Virtual Account) dan resi kurir Biteship API.
- **Feature Needed:**
  - _One-Page Guest Checkout_ dengan validasi formulir instan (React Hook Form dan Zod).
  - Integrasi pembayaran QRIS dan Virtual Account otomatis via Midtrans Snap.
  - Perhitungan ongkos kirim real-time terintegrasi kurir lokal via Biteship API.
  - Halaman konfirmasi pembayaran otomatis (_Instant Payment Callback & Order Confirmation_).

---

## Stage 4: Post Purchase (Pasca Pembelian & Retensi)

Pada fase ini, Rian menunggu barang tiba, menerima paket, dan mengevaluasi kepuasan belanja untuk kemungkinan berbagi di media sosial atau membeli kembali.

- **User Action:**
  - Menerima notifikasi konfirmasi pesanan dan nomor resi pengiriman melalui WhatsApp / Email.
  - Membuka halaman pelacakan pesanan (_Order Tracking_) di situs web untuk memantau perjalanan kurir.
  - Menerima paket produk yang dikemas rapi dengan kemasan khusus (_polymailer/box branded_), stiker eksklusif, dan kartu ucapan terima kasih.
  - Mencoba pakaian di depan cermin, mengambil foto OOTD, dan membagikannya ke Instagram Story sambil menandai akun resmi VOID Supply.
- **User Thought:**
  - "Barangnya sampai lebih cepat dari perkiraan. Bahan kaosnya tebal, potongannya sesuai ekspektasi, dan stikernya keren!"
  - "Pengalaman belanja tanpa hambatan, saya pasti akan membeli lagi saat koleksi berikutnya rilis."
- **Emotion:**
  - Puas, percaya diri, bangga, dan merasa terhubung dengan identitas merek (_Brand Loyalty_).
- **Pain Point:**
  - Resi pengiriman lambat diperbarui sehingga pembeli cemas apakah barangnya sudah dikirim atau belum.
  - Prosedur penukaran barang yang rumit jika ternyata ada cacat produksi atau ukuran tidak pas.
- **Opportunity:**
  - Pelacakan resi pengiriman real-time langsung di situs web tanpa harus membuka situs kurir pihak ketiga.
  - Menyertakan kartu terima kasih dengan kode QR untuk program rujukan (_referral_) atau diskon rilis berikutnya.
- **Feature Needed:**
  - Halaman pelacakan paket mandiri (_Self-Service Order Tracking_).
  - Notifikasi status pengiriman otomatis via webhook Biteship.
  - Integrasi galeri Lookbook komunitas (_UGC Showcase_) untuk menampilkan unggahan pembeli.
