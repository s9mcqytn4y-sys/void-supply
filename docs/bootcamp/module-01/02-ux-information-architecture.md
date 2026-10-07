# 02 - UX, Information Architecture & Design Direction

## 1. Sitemap MVP

### North Star Alignment

> **"VOID Supply adalah platform commerce streetwear yang menghilangkan keraguan pembelian online melalui pengalaman visual yang kuat, informasi produk yang transparan, dan checkout langsung yang cepat."**

Seluruh struktur rute navigasi disusun secara disiplin berdasarkan **The Hesitation Test** dan pembagian prioritas rilis fitur ([opportunity-gap.md](file:///c:/Projects/VOID%20Supply/docs/research/opportunity-gap.md)):

```text
+-----------------------------------------------------------------------------------+
| RUTE MVP BERDASARKAN FEATURE PRIORITY MATRIX                                     |
+-----------------------------------------------------------------------------------+
| P0 : Core Commerce Experience (Wajib Rilis Awal MVP)                              |
| /                                 -> Homepage editorial drop & brand hero         |
| ├── /shop                         -> Katalog terkurasi 4 filter pilar             |
| │   ├── ?category=                -> (all | new-drop | best-seller | archive)     |
| │   ├── ?size=                    -> Filter ukuran instan (S | M | L | XL)        |
| │   ├── ?sort=                    -> Pengurutan (latest | price-asc | price-desc) |
| │   └── /products/[slug]          -> PDP Confidence Builder (Model & macro fotos) |
| ├── /cart                         -> Drawer / ringkasan keranjang instan          |
| ├── /checkout                     -> One-page guest checkout (Midtrans & Biteship)|
| ├── /order/[orderId]              -> Konfirmasi pembayaran & ringkasan invoice    |
| └── /track/[orderId]              -> Pelacakan status kurir publik mandiri        |
+-----------------------------------------------------------------------------------+
| P1 : Brand Differentiation (Setelah Fondasi Transaksi Stabil)                     |
| ├── /collection                   -> Narasi editorial drop & lookbook styling     |
| ├── /about                        -> Filosofi subkultur VOID Supply               |
| ├── /faq                          -> Panduan belanja, garansi bahan, kebijakan    |
| └── /contact                      -> Kanal kontak resmi & bantuan cepat           |
+-----------------------------------------------------------------------------------+
| P2 : User Retention & Backoffice (Fase Lanjutan)                                  |
| ├── /account                      -> Profil pelanggan (opsional login)            |
| ├── /account/orders               -> Riwayat transaksi akun terdaftar             |
| ├── /account/wishlist             -> Daftar keinginan item                        |
| ├── /account/address              -> Buku alamat tersimpan                        |
| └── /admin                        -> Panel manajemen produk, pesanan, dan stok    |
+-----------------------------------------------------------------------------------+
```

Jangan membuat route hanya karena bisa. Kategori katalog MVP dirampingkan menjadi 4 pilar (`all`, `new-drop`, `best-seller`, `archive`) untuk menghindari sindrom mega-menu Erigo pada brand yang sedang bertumbuh. Setiap route mewakili tujuan pengguna yang jelas selaras dengan [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md) dan [WIREFRAME.md](file:///c:/Projects/VOID%20Supply/WIREFRAME.md). Seluruh elemen interaktif pada rute di atas tunduk pada 5 Navigation Rules (2-tap to product, cart always accessible, distraction-free checkout, isolated admin, mobile thumb zone $\ge 44$px).

## 2. Primary user flow

```text
Landing
  -> Shop
  -> Filter / browse
  -> Product Detail (8-Step Confidence Builder)
  -> Select variant & size
  -> Add to cart
  -> Cart drawer / page
  -> Checkout (Contact & Address)
  -> Shipping rates (Biteship)
  -> Review total
  -> Create order
  -> Midtrans Snap payment
  -> Payment confirmation
  -> Order status & shipment tracking
```

## 3. Failure flow

Frontend senior tidak hanya mendesain happy path.

```text
Product
  -> variant sold out
  -> user memilih variant lain

Checkout
  -> shipping rate gagal
  -> retry / ubah alamat

Payment
  -> pending
  -> order tetap tercatat sebagai pending

Payment
  -> failed / expired
  -> tampilkan status dan opsi mencoba pembayaran baru jika aturan bisnis mengizinkan

Shipment
  -> courier update terlambat
  -> tampilkan last known state dan timestamp
```

## 4. UI state checklist

Setiap surface data minimal dipikirkan dalam kondisi:

- initial,
- loading,
- success,
- empty,
- error,
- partial,
- disabled,
- pending mutation.

Contoh product card:

- normal,
- sale,
- low stock jika bisnis memang ingin menampilkan,
- sold out,
- image gagal dimuat.

## 5. Visual direction

Brand direction awal:

- modern streetwear,
- editorial,
- clean,
- high contrast,
- product photography sebagai hero,
- typography tegas,
- motion halus, bukan gimmick.

### Hierarchy rule

Pada Product Detail Page (Mental Model: _Apa ini? -> Apakah saya suka? -> Apakah cocok? -> Bagaimana beli?_):

1. **Gallery:** Multi-foto rasio 4:5 dengan foto pencahayaan alami dan makro tekstur rajutan.
2. **Product Identity:** Nama produk, harga dalam monospace tabular, dan badge status rilis.
3. **Social Proof:** Kuota terjual (_Sold count_) dan ulasan komunitas terverifikasi.
4. **Variant Selection:** Pemilih varian warna dan tombol ukuran (S-XL) dengan kuota stok atomik.
5. **Size Confidence:** Modal panduan ukuran interaktif dilengkapi tinggi/berat model riil (_178cm/68kg_).
6. **Material Transparency:** Uraian spesifikasi katun combed 24s berbobot berat dan sablon plastisol.
7. **Shipping Estimate:** Kalkulator cepat ongkos kirim dan hari sampai kurir Biteship.
8. **Primary CTA:** Tombol "Tambah ke Keranjang" & "Beli Sekarang" melekat di sticky bottom bar.

Jangan membuat semua elemen sama kuat. Kelola hirarki visual dengan kontras dan bobot, bukan sekadar memperbesar ukuran font.

## 6. Design tokens awal

Token adalah keputusan sistem, bukan angka acak per component.

### Spacing

Gunakan skala konsisten, contoh:

```text
4, 8, 12, 16, 24, 32, 48, 64, 96
```

### Radius

```text
sm, md, lg, full
```

### Typography roles

```text
display
heading-1
heading-2
heading-3
body
body-small
caption
label
```

### Semantic colors

Jangan hanya menamai warna berdasarkan tampilannya.

Lebih baik:

```text
background
surface
foreground
muted-foreground
border
primary
danger
success
warning
```

daripada:

```text
black-1
gray-2
red-button
```

## 7. Accessibility baseline

Target proyek: WCAG 2.2 level AA untuk area yang relevan.

Aturan dasar:

- gunakan semantic HTML,
- semua interactive control dapat diakses keyboard,
- visible focus state,
- label form yang jelas,
- error message terkait langsung dengan field,
- jangan gunakan warna sebagai satu-satunya pembeda status,
- tap target mobile memadai,
- alt text menjelaskan fungsi/konten gambar bila relevan.

## 8. Responsive thinking

Jangan mendesain desktop lalu "mengecilkan".

Mobile:

- satu tangan,
- viewport sempit,
- keyboard virtual,
- koneksi dapat lebih buruk,
- CTA perlu mudah dijangkau,
- filter biasanya perlu pola disclosure/sheet yang tepat.

Desktop:

- ruang lebih luas bukan alasan membuat konten terlalu melebar,
- manfaatkan grid,
- pertahankan measure teks,
- gunakan whitespace sebagai hierarchy.

## 9. Design critique questions

Setiap kali membuat screen, tanyakan:

- Apa satu hal pertama yang harus dilihat user?
- Apa primary action?
- Informasi apa yang dibutuhkan sebelum action?
- Apa yang terjadi kalau data kosong?
- Apa yang terjadi kalau request gagal?
- Apa yang terjadi tanpa mouse?
- Apa yang berubah pada 360px?
- Adakah elemen yang hanya dekoratif tetapi mengambil perhatian besar?
