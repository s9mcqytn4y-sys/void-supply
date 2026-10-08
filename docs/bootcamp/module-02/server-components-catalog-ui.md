# Module 02.8: Server Components & Catalog UI Implementation

> **Dokumen Rekayasa**: Arsitektur Server Component, Komposisi UI Katalog, dan Rekayasa Antarmuka Anti-Slop  
> **Modul**: Bootcamp Modul 02.8  
> **Target Rute**: `/shop`  
> **Basis Data**: PostgreSQL 18 via Drizzle ORM  
> **Prinsip Desain**: Anti-Slop Mode 1 (DURING), Mobile-First, Touch-First (44px target), WCAG AA (4.5:1 kontras)

---

## 1. Arsitektur React Server Components (RSC)

Pada katalog toko online modern, halaman katalog `/shop` dibangun menggunakan **React Server Components (RSC)** murni:

```typescript
// src/app/(store)/shop/page.tsx
export default async function ShopPage() {
  const products = await catalogService.ambilDaftarKatalog();
  return <ProductGrid products={products} />;
}
```

### Mengapa `async function Page()` Diizinkan dan Menjadi Standar?

1. **Zero Client-Side JavaScript Overhead**:
   Logika Drizzle ORM, driver basis data `postgres`, dan transformasi data dieksekusi secara privat pada server Node.js. Browser pembeli hanya menerima HTML yang telah di-render beserta payload streaming kecil tanpa bundle ORM.
2. **Eliminasi Client Fetching Waterfall**:
   Pada pola lama berbasis perpaduan `useEffect` dan `fetch`, pemuatan halaman katalog kerap tertunda akibat keharusan mengunduh bundle JavaScript halaman terlebih dahulu, menunggu eksekusi React mounting di peramban, serta meluncurkan permintaan HTTP sekunder ke REST API eksternal. Sebaliknya, pada Next.js 16 App Router seluruh pengambilan data berlangsung berdampingan dengan siklus rendering server dalam mekanisme single-hop data fetching.
3. **Integritas dan Keamanan Finansial**:
   Nilai harga dasar, kalkulasi stok, dan SKU ditarik langsung dari basis data tanpa celah manipulasi parameter di sisi klien.

---

## 2. Komposisi Komponen Katalog (Component Composition)

Arsitektur antarmuka dibagi secara modular mengikuti prinsip pemisahan tanggung jawab yang terisolasi:

```text
ShopPage (Server Component)
    ├── Header Editorial & Lookbook Hero
    └── ProductGrid (Server / Pure Presentation)
            ├── Empty State (Kondisi saat katalog kosong)
            └── ProductCard (Komposisi Kartu Busana)
                    ├── ProductImage (Kontainer Rasio Aspek 4:5 via Next.js Image)
                    │     ├── Badge Drop Edisi Terbatas (DROP 04)
                    │     ├── Badge Status Stok (HABIS TERJUAL / HAMPIR HABIS)
                    │     └── Quick Size Selector Overlay (Pills Ukuran)
                    └── Card Body
                          ├── Kategori Busana (T-Shirt, Outerwear, Pants, Accessories)
                          ├── Judul Artikel Produk (Link navigasi ke /shop/[slug])
                          └── Footer Finansial (Harga IDR & Indikator Kuantitas Stok)
```

---

## 3. Rekayasa Desain & Standar Anti-Slop (/antislop-ui & /antislop-human)

### A. Palet Warna & Token Desain Tailwind CSS v4

Tidak ada warna generik default kecerdasan buatan seperti gradien biru-ke-ungu atau efek neon acak, melainkan palet brutalist streetwear konsisten yang terdefinisi di `src/app/globals.css`:

- `--color-void-black`: `#0a0a0a` yang berfungsi sebagai latar belakang utama kanvas aplikasi.
- `--color-void-card`: `#121212` yang menjadi permukaan kartu produk dan panel interaktif.
- `--color-void-border`: `#262626` untuk garis batas pemisah struktural antar elemen.
- `--color-void-muted`: `#737373` sebagai warna teks sekunder dan label spesifikasi pembantu.
- `--color-void-light`: `#ededed` yang memberikan tingkat kontras tinggi untuk teks primer.
- `--font-mono`: Tipografi monospace khusus untuk penulisan SKU, format harga, dan label teknis busana.

### B. Standar Rasio Aspek Gambar Katalog

- Semua foto busana menerapkan rasio portrait vertikal 4:5 beresolusi 800x1000px sesuai standar editorial mode kontemporer.
- Banner lookbook utama mengadopsi rasio lanskap lebar 16:9 atau 21:9 dengan dimensi master 1920x1080px.
- Format berkas WebP efisiensi tinggi terkompresi optimal guna memastikan rendering cepat tanpa kompromi ketajaman tekstur kain.

### C. Responsivitas Layar Ponsel (/antislop-layoutmobile)

- Grid kartu produk beradaptasi mulus:
  - Layar Ponsel (< 640px): 2 kolom (`grid-cols-2`, gap 16px).
  - Layar Tablet (640px - 1024px): 3 kolom (`md:grid-cols-3`, gap 24px).
  - Layar Desktop (> 1024px): 4 kolom (`lg:grid-cols-4`).
- Tidak ada _horizontal overflow_ pada lebar layar 320px hingga 430px.
- Tap target interaktif memenuhi standar minimum 44x44px.

---

## 4. Kelengkapan Status Antarmuka (UI State Completeness)

Setiap antarmuka data diwajibkan memiliki tiga status penanganan:

### 1. Status Pemuatan (Loading State)

Diimplementasikan pada `src/app/(store)/shop/loading.tsx` menggunakan skeleton animasi pulsa netral. Meniru tata letak 8 kartu berasio 4:5 sehingga transisi visual tidak mengalami lonjakan layout (_Cumulative Layout Shift / CLS 0_).

### 2. Status Galat (Error State)

Diimplementasikan pada `src/app/(store)/shop/error.tsx` dengan penangkap error boundary lokal ("use client"). Dilengkapi tombol interaktif "Coba Muat Ulang" yang memenuhi tap target 44px dan navigasi keyboard.

### 3. Status Kosong (Empty State)

Diimplementasikan pada `ProductGrid.tsx` ketika basis data tidak mengembalikan baris produk aktif, menampilkan pesan informatif berbahasa Indonesia yang ramah.

---

## 5. Aksesibilitas Manusia (WCAG AA & Keyboard Navigation)

- **Rasio Kontras**:
  - Teks putih `#ffffff` dan `#ededed` di atas latar `#0a0a0a` menghasilkan rasio kontras 18:1 (melampaui syarat WCAG AA 4.5:1).
  - Teks sekunder `#a3a3a3` menghasilkan rasio kontras 8.2:1.
- **Navigasi Keyboard**:
  - Seluruh elemen interaktif dan tautan kartu memiliki indikator fokus terlihat jelas (`focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none`).
  - Atribut ARIA `aria-label` terpasang pada gambar dan penanda navigasi.
- **Bahasa Domain**:
  - Salinan teks antarmuka menggunakan Bahasa Indonesia baku yang lugas tanpa hiperbola promosi palsu.
