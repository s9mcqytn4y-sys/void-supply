# Customer Journey Map : VOID Supply

Dokumen ini memetakan perjalanan pengalaman pelanggan (_Customer Journey Map_) untuk situs web VOID Supply berdasarkan riset mendalam kompetitor (_Erigo_, _Thanksinsomnia_, dan _Screamous_) serta persona utama Rian "The Trendsetter" Pratama.

Perjalanan ini dibagi ke dalam 5 fase strategis: **Awareness $\rightarrow$ Consideration $\rightarrow$ Decision $\rightarrow$ Purchase $\rightarrow$ Retention**.

Dokumen terkait:

- Profil Persona: [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md)
- Riset Kompetitor & Opportunity Gap: [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md)
- Arsitektur Informasi: [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md)

---

## 1. Matriks Utama Customer Journey Map (5 Stages)

| Stage                              | User Action                                                                                                                                                    | Feeling                                                            | Problem                                                                                                | Solution                                                                                                                                                           |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Awareness** (Kesadaran)          | Menjelajahi reels TikTok / linimasa Instagram pada malam hari (20.00-23.00), melihat kreator streetwear memakai kaos VOID Supply, lalu mengetuk tautan profil. | Penasaran, antusias, FOMO (_takut kehabisan rilis terbatas_).      | Tautan bio lambat dimuat di koneksi seluler; beranda umum membingungkan pembeli rilis baru.            | _Deep linking_ langsung ke koleksi rilis terbatas (_limited drop_), halaman awal ringan WebP dengan waktu muat < 1.5 detik.                                        |
| **Consideration** (Pertimbangan)   | Menelusuri katalog produk, mengamati galeri foto dari berbagai sudut, dan mencari informasi bahan katun serta kerapian sablon.                                 | Kritis, teliti, sedikit skeptis terhadap klaim foto promosi.       | Standar ukuran _oversized_ tiap merek tidak seragam; foto studio sering menyamarkan tekstur asli kain. | Panduan ukuran interaktif (_Interactive Size Guide_) dengan indikator tinggi/berat badan model foto dan fitur _zoom_ tekstur kain asli tanpa filter.               |
| **Decision** (Keputusan)           | Memilih varian ukuran dan warna, memeriksa ketersediaan kuota stok, serta menghitung estimasi ongkos kirim ke alamat rumah.                                    | Yakin, terburu-buru mengamankan barang sebelum stok habis.         | Stok varian tidak jelas (harus klik satu per satu); ongkos kirim tidak diketahui sebelum checkout.     | _Real-Time Stock Badge_ per varian ukuran dan kalkulator estimasi ongkir cepat berdasarkan kota tujuan langsung di halaman produk.                                 |
| **Purchase** (Pembelian)           | Memasukkan item ke keranjang, membuka halaman checkout tanpa login akun, memilih kurir, dan memindai QRIS via mobile banking.                                  | Fokus, tergesa-gesa, lega saat notifikasi pembayaran lunas muncul. | Formulir checkout panjang dengan registrasi akun wajib; verifikasi transfer manual lambat.             | _One-Page Guest Checkout_ dengan formulir ringkas, kalkulasi ongkos kirim instan Biteship API, dan pembayaran otomatis Midtrans Snap QRIS.                         |
| **Retention** (Retensi & Advokasi) | Menerima resi via WhatsApp, melacak posisi kurir di web, unboxing kemasan khusus, dan membagikan foto OOTD ke media sosial.                                    | Puas, bangga, terhubung dengan identitas merek, loyal.             | Resi kurir lambat diperbarui; prosedur penukaran barang membingungkan jika terjadi cacat produksi.     | Halaman pelacakan pesanan mandiri (_Self-Service Order Tracking_), webhook pembaruan status kurir, serta sisipan kartu terima kasih ber-QR untuk rilis berikutnya. |

---

## 2. Analisis Rinci per Fase Interaksi

### Stage 1: Awareness (Kesadaran)

Calon pembeli pertama kali terpapar keberadaan produk VOID Supply melalui media sosial saat waktu santai malam hari.

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

### Stage 2: Consideration (Pertimbangan)

Rian meneliti keaslian visual produk, kualitas bahan, dan kesesuaian potongan baju dengan preferensi gaya pribadinya.

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

### Stage 3: Decision (Keputusan)

Rian menentukan varian produk yang ingin dibeli dan memastikan tidak ada biaya tak terduga sebelum melangkah ke proses checkout.

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

### Stage 4: Purchase (Pembelian & Pembayaran)

Rian menyelesaikan transaksi pembayaran dengan cepat, aman, dan tanpa hambatan registrasi yang merepotkan.

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

### Stage 5: Retention (Retensi & Advokasi Komunitas)

Pengalaman pasca-pembelian yang mengubah pembeli satu kali menjadi pendukung setia merek (_brand advocate_) dan pelanggan berulang.

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
