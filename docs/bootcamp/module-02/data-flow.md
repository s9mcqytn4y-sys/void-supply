# VOID Supply Data Flow Architecture

Dokumen ini mendefinisikan arsitektur aliran data menyeluruh (_End-to-End Data Flow_) pada aplikasi e-commerce VOID Supply, memetakan bagaimana data bergerak secara aman antara peramban klien, Server Component Next.js 16, basis data PostgreSQL, dan layanan pembayaran pihak ketiga.

---

## 1. Tiga Model Komputasi Next.js 16

Aplikasi VOID Supply memanfaatkan 3 model pemrosesan data untuk menjaga performa optimal dan keamanan transaksi:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARSITEKTUR ALIRAN DATA VOID SUPPLY                    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
  [ SERVER COMPONENT ]        [ CLIENT COMPONENT ]       [ SERVER ACTION / API ]
• Baca Katalog Produk       • Keranjang Belanja (/cart) • Buat Pesanan (Checkout)
• Render HTML di Server     • Interaksi Kuantitas Item  • Pembuatan Token Midtrans
• Query Langsung Database   • Notifikasi Toast Aktif    • Webhook Notifikasi Bayar
• Nol Bundle JS ke Klien    • LocalStorage Persist      • Mutasi Data Terenkripsi
```

---

## 2. Alur Pembacaan Data Katalog Produk (/shop)

Halaman katalog produk memanfaatkan keunggulan Server Component secara penuh guna memaksimalkan optimasi mesin pencari (SEO) dan kecepatan respon awal:

```text
Pengguna Membuka URL /shop?category=new-drop
                  │
                  ▼
Next.js Server Component (src/app/(public)/shop/page.tsx)
                  │
                  ▼ Membaca properti searchParams secara langsung di server
Eksekusi Kueri Database via Drizzle ORM
(SELECT * FROM produk WHERE kategori = 'new-drop')
                  │
                  ▼ Mengambil data dari PostgreSQL 18
Kompilasi Menjadi Struktur HTML & CSS Statis Ringan
                  │
                  ▼ Mengirim aliran dokumen HTML ke peramban
Peramban Menampilkan Konten Katalog Lengkap Tanpa Menunggu Eksekusi JavaScript Klien
```

Keuntungan pendekatan ini terletak pada pengurangan drastis berkas JavaScript yang harus diunduh oleh perangkat seluler pembeli, sehingga nilai metrik LCP (_Largest Contentful Paint_) tetap berada di bawah 1.5 detik.

---

## 3. Alur Status Keranjang Belanja Klien (/cart)

Keranjang belanja dikelola sepenuhnya di sisi peramban menggunakan Zustand store dengan persistensi penyimpanan lokal peramban:

```text
Pengguna Memilih Ukuran & Menekan Tombol [+ KERANJANG]
                  │
                  ▼
Panggilan Aksi Zustand useCartStore.getState().tambahItem(item)
                  │
                  ▼
Mutasi Atomik State di Memori Klien (Atomic Selectors)
                  │
                  ▼
Penyimpanan Otomatis ke LocalStorage ("void_cart_storage")
                  │
                  ▼
Pembaruan Badge Kuantitas di Header & Notifikasi Toast Instan
```

Karena data belanjaan tamu tidak memerlukan penyimpanan di basis data sebelum checkout, server terbebas dari beban kueri yang tidak perlu pada setiap kali pengguna menambah atau mengurangi jumlah barang.

---

## 4. Alur Transaksi Checkout & Pembayaran (/checkout)

Tahap checkout melibatkan kolaborasi erat antara formulir klien, validasi runtime sisi server, mutasi basis data atomik, dan gateway pembayaran Midtrans:

```text
1. Pembeli Mengisi Formulir Kontak, Alamat, dan Opsi Kurir di Halaman /checkout
                  │
                  ▼
2. Formulir Menjalankan Server Action buatPesanan(formData)
                  │
                  ▼
3. Server Action Memvalidasi Data Masukan Menggunakan Zod checkoutSkema
                  │
   [Validasi Gagal?] ──Ya──► Kembalikan Galat Validasi Inline ke Formulir Klien
                  │ (Tidak)
                  ▼
4. Drizzle ORM Membuka Transaksi Atomik Database (db.transaction)
   - Mengunci dan memverifikasi sisa stok pada tabel inventaris
   - Membuat baris pesanan baru pada tabel pesanan (status: "menunggu_pembayaran")
   - Menyimpan rincian produk yang dibeli pada tabel item_pesanan
                  │
                  ▼
5. Server Menghubungi Midtrans Core API Menggunakan Kunci Server Rahasia
   - Mengirim rincian total tagihan dan parameter transaksi
   - Menerima respons Snap Token resmi dari Midtrans
                  │
                  ▼
6. Server Menyimpan Snap Token dan Mengirimkannya Kembali ke Peramban Klien
                  │
                  ▼
7. Klien Membuka Jendela Pop-up Pembayaran Midtrans Snap JS
                  │
                  ▼
8. Pembeli Menyelesaikan Pembayaran Melalui QRIS atau Transfer Virtual Account
```

---

## 5. Alur Notifikasi Webhook Pembayaran (/api/webhooks/midtrans)

Setelah pembeli menyelesaikan pembayaran, Midtrans mengirimkan notifikasi asinkron ke server untuk memperbarui status pesanan:

```text
Midtrans Mengirim HTTP POST ke Endpoint /api/webhooks/midtrans
                  │
                  ▼
Route Handler Membaca Payload Notifikasi & Signature Key Header
                  │
                  ▼
Kalkulasi Hash SHA-512 (order_id + status_code + gross_amount + ServerKey)
                  │
  [Signature Cocok?] ──Tidak──► Tolak Akses dengan HTTP 403 Forbidden
                  │ (Ya)
                  ▼
Drizzle ORM Memperbarui Status Pesanan Menjadi "dibayar"
                  │
                  ▼
Pemicuan Panggilan API Biteship untuk Pembuatan Resi Pengiriman Otomatis
                  │
                  ▼
Server Mengembalikan Respon HTTP 200 OK ke Midtrans
```

Pemisahan logika ini menjamin bahwa status transaksi tidak dapat dimanipulasi oleh klien peramban, karena konfirmasi pelunasan hanya diterima melalui saluran terenkripsi server-to-server.
