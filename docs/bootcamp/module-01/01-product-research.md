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

Admin/operasional yang membutuhkan:

- katalog produk,
- variant dan inventory,
- order management,
- payment status,
- shipment status.

## 2. Jobs to be Done

Format:

> Ketika ..., saya ingin ..., agar ...

Contoh:

> Ketika menemukan t-shirt yang saya suka, saya ingin mengetahui ukuran yang tersedia dan biaya total sebelum membayar, agar saya dapat membeli tanpa kejutan di tahap checkout.

> Ketika pembayaran selesai, saya ingin melihat status order yang jelas, agar saya yakin uang saya tercatat.

> Ketika order dikirim, saya ingin melacak paket tanpa menghubungi admin.

## 3. Goals dan non-goals

### Goals MVP

- Product discovery yang cepat.
- Product detail yang informatif.
- Cart yang stabil.
- Checkout yang jujur dan mudah dipahami.
- Perhitungan ongkir dari Biteship.
- Pembayaran Midtrans Sandbox sebelum production.
- Source of truth order berada di server/database.
- Responsive dan accessible.
- Semua asynchronous UI mempunyai loading, empty, error, dan success state yang relevan.

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

Non-goal mencegah project berubah menjadi demo yang terlalu besar untuk benar-benar selesai.

## 4. Competitor research

Tujuan competitor research bukan menyalin layout. Cari pola, friction, dan keputusan.

### Baseline 1: Erigo

Observasi publik 2026:

- katalog besar,
- filter size, price, dan sub-category,
- sale pricing,
- cart dan checkout,
- order tracking,
- informasi bantuan, pembayaran, return/exchange.

Pertanyaan yang harus kita jawab:

- bagaimana filter tetap usable di mobile?
- kapan diskon membantu, kapan justru menciptakan visual noise?
- informasi apa yang harus muncul sebelum pengguna membuka PDP?

### Baseline 2: Thanksinsomnia

Observasi publik 2026:

- product grid dominan visual,
- apparel dan accessories,
- harga dan diskon terlihat langsung,
- brand presentation lebih editorial.

Pertanyaan:

- seberapa besar image harus mendominasi card?
- apakah kategori perlu ditampilkan di card?
- bagaimana menjaga visual brand tanpa mengorbankan scannability?

### Baseline 3: Screamous

Observasi publik 2026:

- katalog sangat besar,
- sort,
- discount-heavy catalog,
- sold-out state terlihat pada produk tertentu.

Pertanyaan:

- bagaimana kita memperlakukan sold-out product?
- apakah sold-out masih ditampilkan untuk discovery?
- bagaimana membuat sale badge tidak mendominasi semua hierarchy?

## 5. Competitor research template

Untuk setiap kompetitor, isi tabel berikut saat research manual:

| Area | Temuan | Bagus karena | Friction | Pelajaran untuk VOID |
| --- | --- | --- | --- | --- |
| Homepage |  |  |  |  |
| Navigation |  |  |  |  |
| PLP |  |  |  |  |
| PDP |  |  |  |  |
| Cart |  |  |  |  |
| Checkout |  |  |  |  |
| Mobile |  |  |  |  |
| Accessibility |  |  |  |  |

Jangan menulis "bagus" tanpa alasan. Kaitkan dengan discoverability, clarity, trust, speed, accessibility, atau conversion.

## 6. Research questions sebelum desain

- Apakah checkout memerlukan login?
- Apakah user boleh guest checkout?
- Produk memiliki warna, size, atau keduanya?
- Stock berada di product atau variant?
- Apakah harga variant dapat berbeda?
- Apakah satu order dapat memakai satu courier service saja?
- Apakah coupon termasuk MVP?
- Apakah retur/exchange termasuk flow MVP atau hanya policy page?
- Apakah checkout harus meminta email, nomor WhatsApp, atau keduanya?
- Berapa lama cart harus persist?
- Apa yang terjadi kalau stock berubah ketika user berada di checkout?

Setiap pertanyaan yang belum terjawab dicatat sebagai assumption, bukan disembunyikan sebagai fakta.

## 7. Hipotesis produk awal

Hipotesis:

> Jika product information, variant availability, shipping cost, dan payment state dibuat jelas sebelum dan sesudah checkout, maka pengguna lebih mudah menyelesaikan pembelian dengan keyakinan lebih tinggi.

Ini belum kesimpulan. Nanti perlu divalidasi melalui analytics, usability testing, support tickets, dan conversion funnel.
