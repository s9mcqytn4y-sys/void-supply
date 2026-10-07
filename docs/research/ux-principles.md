# Prinsip Desain Pengalaman Pengguna (UX Principles) : VOID Supply

Dokumen ini mendefinisikan prinsip-prinsip desain pengalaman pengguna (_User Experience Principles_) yang menjadi panduan fundamental bagi seluruh perancangan antarmuka, keputusan teknis rekayasa, dan evaluasi fitur VOID Supply.

Prinsip-prinsip ini dirumuskan berdasarkan sintesis riset kompetitor pada [competitor-analysis.md](file:///c:/Projects/VOID%20Supply/docs/research/competitor-analysis.md), analisis celah peluang pada [opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md), profil persona pembeli pada [PERSONA.md](file:///c:/Projects/VOID%20Supply/PERSONA.md), serta peta perjalanan pada [CUSTOMER_JOURNEY_MAP.md](file:///c:/Projects/VOID%20Supply/CUSTOMER_JOURNEY_MAP.md).

---

## 1. Filosofi Inti: "Subculture Credibility Meets Frictionless Tech"

Setiap keputusan desain di VOID Supply harus menyeimbangkan dua pilar utama:

1. **Daya Tarik Estetika Subkultur Streetwear Otentik:** Mempertahankan prestise, identitas grafis independen, dan eksklusivitas komunitas anak muda perkotaan.
2. **Keunggulan Rekayasa Tanpa Friksi:** Memberikan kecepatan responsif, kemudahan transaksi instan, dan transparansi data kelas satu di perangkat smartphone.

---

## 2. Enam Prinsip Desain Pengalaman Pengguna (The 6 UX Principles)

### Prinsip 1 : Zero-Hesitation Sizing (Kepastian Ukuran Tanpa Ragu)

> _"Pembeli tidak boleh dipaksa menebak apakah potongan baju akan pas di tubuhnya."_

- **Latar Belakang:** Keraguan ukuran pakaian streetwear (_oversized / boxy fit_) adalah penyebab utama keranjang terbengkalai dan keluhan retur barang di industri fashion lokal.
- **Aturan Implementasi Desain:**
  - **Profil Model Nyata:** Setiap halaman produk wajib menampilkan data tinggi dan berat badan model foto asli (contoh: _Model Pria: 178 cm / 68 kg mengenakan ukuran L_).
  - **Panduan Ukuran Interaktif:** Tombol "Panduan Ukuran" harus membuka modal bersih yang menampilkan tabel dimensi fisik sentimeter (lebar dada, panjang badan, panjang lengan) tanpa mengaburkan konteks halaman.
  - **Tampilan Tekstur Kain Makro:** Galeri foto produk wajib menyertakan foto makro resolusi tinggi yang memperlihatkan serat kain asli dan kerapian jahitan tanpa filter saturasi warna berlebih.

### Prinsip 2 : Under-60-Seconds Checkout (Pembayaran Tuntas di Bawah 60 Detik)

> _"Hilangkan semua langkah yang menunda pembeli dari menuntaskan transaksi."_

- **Latar Belakang:** Alur checkout konvensional kompetitor yang memaksa registrasi akun atau mengalihkan konfirmasi ke chat manual WhatsApp menyebabkan tingkat kebocoran konversi (_drop-off_) di atas 60%.
- **Aturan Implementasi Desain:**
  - **One-Page Guest Checkout:** Seluruh proses pengisian alamat pengiriman, pemilihan kurir, dan pembayaran diselesaikan dalam satu halaman linear tanpa kewajiban membuat akun atau mengingat kata sandi.
  - **Kalkulasi Ongkos Kirim Instan:** Begitu kode pos atau kota tujuan diisi, tarif kurir logistik lokal (JNE, SiCepat, J&T) langsung tertera secara transparan via Biteship API.
  - **Pembayaran QRIS Terpadu:** Menghadirkan modal pembayaran otomatis Midtrans Snap yang mendukung pemindaian instan kode QRIS langsung dari aplikasi mobile banking di smartphone pembeli tanpa perlu konfirmasi manual ke admin toko.

### Prinsip 3 : Radical Inventory Transparency (Kejujuran Stok Tanpa Manipulasi)

> _"Tampilkan data ketersediaan barang apa adanya, tanpa ilusi kelangkaan palsu."_

- **Latar Belakang:** Praktik manipulative (_dark patterns_) seperti hitung mundur palsu atau stok palsu merusak kredibilitas jangka panjang merek di kalangan komunitas streetwear. Sebaliknya, stok yang tidak sinkron berisiko memicu _overselling_.
- **Aturan Implementasi Desain:**
  - **Real-Time Stock Badge:** Setiap varian ukuran menampilkan status kuota inventaris asli dari basis data PostgreSQL Drizzle ORM (contoh: _Tersisa 3 Pcs di Gudang_).
  - **Penandaan Varian Habis yang Jelas:** Ukuran yang habis diberi tanda coret tegas dan tidak dapat diklik.
  - **Sistem Antrean Restock Beradab:** Jika suatu artikel habis terjual, sediakan formulir 1-tap pendaftaran WhatsApp untuk notifikasi restock atau rilis edisi berikutnya.

### Prinsip 4 : Thumb-Zone Centric Ergonomics (Ergonomi Ramah Jempol Ponsel)

> _"95% pembeli mengakses situs web lewat smartphone menggunakan satu tangan. Desain harus menyesuaikan jangkauan jempol alami."_

- **Latar Belakang:** Berdasarkan analisis persona Rian, pengguna sering berselancar di malam hari atau saat dalam perjalanan menggunakan satu tangan. Menempatkan aksi penting di bagian atas layar menciptakan hambatan fisik (_physical strain_).
- **Aturan Implementasi Desain:**
  - **Zona Jempol Bawah (Bottom Zone):** Seluruh aksi utama diletakkan di sepertiga bawah layar:
    - _Sticky Mobile Bottom Navigation Bar_ (Beranda, Katalog, Keranjang, Lacak, Akun).
    - _Sticky Bottom Action Bar_ di halaman produk (Informasi harga, varian terpilih, dan tombol "Tambah ke Keranjang").
  - **Target Sentuh Minimal 44px:** Seluruh elemen interaktif, tombol, dan chip filter wajib memiliki area sentuh minimal $44 \times 44\text{ px}$ dengan jarak renggang antar-tombol minimal 8px untuk mencegah salah ketuk.
  - **Filter Drawer dari Bawah:** Menu filter dan sorting diakses melalui _Bottom Sheet / Slide-over Drawer_ yang mudah digeser dengan satu sapuan jempol.

### Prinsip 5 : Dark Streetwear Visual Discipline (Disiplin Visual Gelap Berkarakter)

> _"Desain harus terasa seperti butik streetwear eksklusif, bukan toko obral diskon massal."_

- **Latar Belakang:** Tampilan visual kompetitor massal yang ramai oleh puluhan stiker promo merah dan popup kupon merusak nilai prestise merek dan mengganggu kenyamanan membaca pengguna di malam hari.
- **Aturan Implementasi Desain:**
  - **Palet Gelap Kontras Tinggi:** Latar belakang primer gelap `#0B0B0B` (VOID Dark Black) dan permukaan kartu `#161616`, dipadukan dengan teks putih bersih `#FFFFFF` (rasio kontras 16.5:1, standar WCAG AA).
  - **Aksen Terarah:** Penggunaan warna aksen neon keselamatan `#E2F952` (Volt Safety Neon) hanya dikhususkan untuk elemen aksi penting (tombol utama, status rilis terbatas) dan dilarang digunakan berlebihan.
  - **Tipografi Bersih Berenergi:** Menggunakan font geometris tegas (`Outfit` / `Inter`) dengan hierarki bobot huruf yang jelas dan jarak antar-baris (_line height_) yang lega.
  - **Kecepatan Muat Ekstrem:** Seluruh aset visual dioptimalkan dalam format WebP dengan batas waktu muat Largest Contentful Paint (LCP) di bawah 1.5 detik pada koneksi data 4G seluler.

### Prinsip 6 : Post-Purchase Assurance & Advocacy (Jaminan & Advokasi Pasca-Pembelian)

> _"Pengalaman pelanggan belum selesai saat tombol bayar ditekan, melainkan berlanjut hingga paket tiba dan dipakai dengan bangga."_

- **Latar Belakang:** Ketidakpastian pengiriman memicu kecemasan pembeli dan membebani tim layanan pelanggan dengan pertanyaan resi manual.
- **Aturan Implementasi Desain:**
  - **Pelacakan Mandiri Terintegrasi (`/track/[orderId]`):** Menghadirkan garis waktu pelacakan kurir real-time berbasis webhook Biteship yang dapat diakses langsung oleh pembeli.
  - **Salin Nomor Resi 1-Tap:** Tombol salin resi cepat yang memberikan umpan balik visual instan.
  - **Mendorong Konten Komunitas (UGC):** Saat paket berstatus terkirim (_Delivered_), antarmuka menampilkan ajakan membagikan foto OOTD ke Instagram Story sambil menandai akun resmi VOID Supply untuk mendapatkan akses awal ke rilis berikutnya.

---

## 3. Matriks Implementasi Prinsip pada Arsitektur Teknologi

| Prinsip UX                  | Implementasi Sisi Klien (Frontend)                                            | Implementasi Sisi Server (Backend & DB)                                                |
| :-------------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **Zero-Hesitation Sizing**  | Modal Panduan Ukuran interaktif, galeri foto makro WebP dengan zoom sentuh    | Penyimpanan metadata dimensi fisik (panjang, lebar, profil model) di tabel `produk`    |
| **Under-60s Checkout**      | Formulir linear teroptimasi, SDK Midtrans Snap QRIS pop-up                    | Server Action `buatPesanan()`, Zod validation schema, Biteship API rate calculator     |
| **Radical Transparency**    | Real-Time Stock Badge, tombol restock waitlist otomatis                       | Drizzle ORM atomic transaction pada tabel `inventaris`, pencegahan _race conditions_   |
| **Thumb-Zone Ergonomics**   | Sticky Bottom Bar, Bottom Sheet Filter Drawer, tap target $\ge$ 44px Tailwind | Pengiriman parameter filter terkompresi via URL query parameters tanpa re-render penuh |
| **Dark Visual Discipline**  | Tema gelap konsisten Tailwind v4, Outfit/Inter font pairing, WCAG AA 4.5:1+   | Next.js 16 Image Component dengan kompresi WebP otomatis dan Edge CDN Caching          |
| **Post-Purchase Assurance** | Garis waktu kurir vertikal, tombol salin resi 1-tap, status status delivered  | Webhook handler Biteship (`/api/webhooks/biteship`), update otomatis status pengiriman |
