# 02 - UX, Information Architecture & Design Direction

## 1. Sitemap MVP

```text
/
├── /shop
│   ├── ?category= (all | new-drop | best-seller | archive)
│   ├── ?size=
│   ├── ?sort=
│   └── /products/[slug]
├── /collection
├── /about
├── /faq
├── /contact
├── /cart
├── /checkout
├── /order/[orderId]
└── /track/[orderId]

├── /account
├── /account/orders
├── /account/wishlist
├── /account/address
└── /admin (Dashboard, Products, Inventory, Orders, Customers, Promotions)
```

Jangan membuat route hanya karena bisa. Kategori katalog MVP dirampingkan menjadi 4 pilar (`all`, `new-drop`, `best-seller`, `archive`) untuk menghindari sindrom mega-menu Erigo pada brand yang sedang bertumbuh. Setiap route mewakili tujuan pengguna yang jelas selaras dengan [SITE-MAP.md](file:///c:/Projects/VOID%20Supply/SITE-MAP.md).

## 2. Primary user flow

```text
Landing
  -> Shop
  -> Filter / browse
  -> Product Detail
  -> Select variant
  -> Add to cart
  -> Cart
  -> Checkout data
  -> Shipping rates
  -> Review total
  -> Create order
  -> Midtrans payment
  -> Payment confirmation
  -> Order status
  -> Shipment tracking
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

Pada Product Detail Page:

1. Nama produk.
2. Harga.
3. Variant/size availability.
4. Primary CTA.
5. Supporting information.
6. Detail tambahan.

Jangan membuat semua elemen sama kuat.

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
