# 01 - Product Brief & Research

## 1. Product brief

### Nama produk

VOID Supply

### Bentuk produk

Direct-to-consumer merchandise store untuk menjual apparel dan accessories seperti t-shirt, hoodie, tote bag, cap, dan sticker pack.

### Problem statement

Calon pembeli merchandise membutuhkan cara yang cepat dan jelas untuk:

- menemukan produk,
- memahami ukuran dan varian,
- mengetahui stok,
- menghitung ongkir,
- membayar dengan metode lokal,
- mengetahui status pembayaran,
- melacak pesanan setelah dikirim.

Masalah bisnisnya bukan "kita belum punya website". Website hanyalah solusi. Masalah aslinya adalah friction dari discovery sampai fulfillment.

### Primary user

Pembeli digital usia sekitar 18-30 tahun yang:

- nyaman belanja lewat mobile,
- sensitif terhadap visual brand,
- ingin checkout cepat,
- membutuhkan kepastian ukuran, stok, harga, ongkir, dan status pesanan.

Usia ini masih hipotesis awal. Jangan menganggapnya fakta sebelum ada data bisnis nyata.

### Secondary user

Admin dan staf operasional toko yang membutuhkan visibilitas menyeluruh terhadap pengelolaan katalog produk, matriks varian beserta inventaris fisik, alur pemrosesan pesanan, verifikasi status pembayaran gateway, serta pembaruan nomor resi logistik pengiriman.

## 2. Jobs to be Done

Format:

> Format penulisan: Ketika [kondisi pemicu tertentu], saya ingin [tindakan langsung yang diambil], sehingga [hasil bernilai yang diharapkan tercapai].
>
> Ketika menemukan t-shirt yang saya suka, saya ingin mengetahui ukuran yang tersedia serta rincian biaya total sebelum membayar agar dapat membeli tanpa kejutan di tahap checkout.
>
> Ketika pembayaran selesai, saya ingin melihat status order yang jelas agar yakin transaksi tercatat rapi di sistem.
>
> Ketika paket order dikirimkan oleh kurir, saya ingin melacak perjalanannya secara mandiri tanpa harus menghubungi pihak admin toko.

## 3. Goals dan non-goals

### Goals MVP

- Pengalaman penemuan artikel busana yang gesit melalui live search dan filter kategori drop.
- Informasi spesifikasi garmen yang mendalam mencakup GSM, serat kain, dan size chart presisi dalam sentimeter.
- Keranjang belanja lokal yang stabil serta tangguh terhadap refresh halaman maupun rekonsiliasi server.
- Alur checkout yang transparan, minim friksi, dan mudah dipahami oleh pembeli pertama.
- Perhitungan tarif ongkos kirim real-time langsung dari layanan logistik Biteship.
- Integrasi gateway pembayaran Midtrans Sandbox sebelum aktivasi lingkungan produksi.
- Basis data PostgreSQL sebagai satu-satunya penentu kebenaran (single source of truth) untuk seluruh pesanan.
- Desain antarmuka yang sepenuhnya responsif dan memenuhi standar aksesibilitas WCAG AA.
- Seluruh antarmuka data asinkron wajib memiliki state loading, data kosong, galat, dan sukses yang informatif.

### Non-goals MVP

Belum perlu:

- loyalty points,
- marketplace multi-vendor,
- chat real-time,
- recommendation engine berbasis ML,
- flash-sale engine kompleks,
- live commerce,
- multi-warehouse,
- mobile app native.

Batasan non-goals ini menjaga fokus tim agar ruang lingkup proyek tidak melebar menjadi demo raksasa yang tak kunjung tuntas.

## 4. Competitor research

Tujuan utama riset kompetitor bukanlah menyalin tata letak visual, melainkan membedah pola interaksi, titik friksi belanja, dan alasan di balik keputusan arsitektur mereka.

### Baseline 1: Erigo

Observasi publik 2026:

- katalog besar,
- filter size, price, dan sub-category,
- sale pricing,
- cart dan checkout,
- order tracking,
- informasi bantuan, pembayaran, return/exchange.

Pertanyaan yang harus kita jawab:

- Bagaimana merancang filter multi-dimensi agar tetap nyaman dioperasikan satu tangan pada layar ponsel?
- Kapan penonjolan label diskon benar-benar menguntungkan pembeli, dan kapan hal itu justru menjadi kebisingan visual?
- Informasi esensial apa saja yang wajib diketahui calon pembeli bahkan sebelum mereka membuka halaman detail produk?

### Baseline 2: Thanksinsomnia

Observasi publik 2026:

- product grid dominan visual,
- apparel dan accessories,
- harga dan diskon terlihat langsung,
- brand presentation lebih editorial.

Pertanyaan:

- Seberapa dominan rasio foto editorial harus mengisi kartu katalog tanpa mengorbankan keterbacaan data produk?
- Apakah label kategori pakaian perlu dimunculkan langsung pada kartu produk?
- Bagaimana menjaga karakter visual streetwear yang gelap tanpa merusak kemudahan memindai daftar belanja?

### Baseline 3: Screamous

Observasi publik 2026:

- katalog sangat besar,
- sort,
- discount-heavy catalog,
- sold-out state terlihat pada produk tertentu.

Pertanyaan:

- Bagaimana pendekatan terbaik dalam memperlakukan artikel produk yang stoknya telah habis terjual?
- Apakah produk sold-out tetap perlu ditampilkan sebagai bahan penemuan koleksi dan arsip rilis?
- Bagaimana merancang badge potongan harga agar tidak merusak ketegasan hierarki tipografi monospaced?

## 5. Competitor research template

Untuk setiap kompetitor, isi tabel berikut saat research manual:

| Area          | Temuan | Bagus karena | Friction | Pelajaran untuk VOID |
| ------------- | ------ | ------------ | -------- | -------------------- |
| Homepage      |        |              |          |                      |
| Navigation    |        |              |          |                      |
| PLP           |        |              |          |                      |
| PDP           |        |              |          |                      |
| Cart          |        |              |          |                      |
| Checkout      |        |              |          |                      |
| Mobile        |        |              |          |                      |
| Accessibility |        |              |          |                      |

Jangan menulis "bagus" tanpa alasan. Kaitkan dengan discoverability, clarity, trust, speed, accessibility, atau conversion.

## 6. Research questions sebelum desain

- Apakah alur checkout mewajibkan akun atau mendukung mode tamu (guest checkout)?
- Bagaimana struktur relasi varian warna dan ukuran pada tingkat inventaris database?
- Apakah harga dasar tiap varian fisik dapat berbeda dalam satu artikel produk?
- Apakah satu pesanan hanya dapat dilayani oleh satu layanan kurir tunggal?
- Apakah sistem voucher diskon termasuk cakupan rilis awal MVP?
- Bagaimana penanganan kebijakan retur pakaian, apakah alur sistemik atau halaman kebijakan?
- Apakah checkout membutuhkan alamat surel, nomor kontak WhatsApp, atau kombinasi keduanya?
- Berapa lama batas waktu persistensi keranjang sebelum sistem melakukan pelepasan stok reservasi?
- Apa mekanisme kompensasi ketika kuota stok berubah saat pembeli berada di tahap akhir pembayaran?

Setiap pertanyaan yang belum terjawab dicatat sebagai asumsi eksplisit, bukan disamarkan sebagai fakta matang.

## 7. Hipotesis produk awal

Hipotesis:

> Jika informasi produk, ketersediaan varian, kalkulasi ongkos kirim, dan status pembayaran disajikan secara gamblang sejak awal, maka pembeli dapat menyelesaikan transaksi dengan tingkat keyakinan yang jauh lebih kokoh.

Pernyataan ini merupakan hipotesis awal yang akan terus divalidasi berkala melalui metrik analitik, pengujian kegunaan, interaksi tiket bantuan, dan tingkat konversi corong belanja.
