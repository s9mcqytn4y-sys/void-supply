# VOID Supply: E-Commerce Readiness & Production Hardening Plan

Dokumen ini adalah rencana kerja teknis resmi untuk mentransformasikan repositori **VOID Supply** dari fondasi MVP transaksi menjadi toko online busana siap produksi (*production-grade direct-to-consumer e-commerce*), disesuaikan dengan arsitektur **Vercel Hobby Plan**, **Sentry Free Tier**, **PostgreSQL 18**, dan aturan **Anti-Slop (Mode 1: DURING)**.

---

## 1. Hasil Audit Arsitektur & Temuan Kritis (Actual State vs Review)

| Komponen | Status Saat Ini | Dampak Risiko | Tindakan Remediasi Resmi |
| :--- | :--- | :--- | :--- |
| **Order Access Token** | Client-side `document.cookie` di `useCheckout.ts:233` | Token akses rentan disusupi script pihak ketiga (XSS). | Pindahkan pembuatan cookie ke Server Action dengan `HttpOnly`, `SameSite=Strict`, `Secure`. Simpan hash SHA-256 token di database. |
| **Environment Resolver** | Fallback cascade tidak terstandar di `midtrans.service.ts` & `biteship.service.ts` | Potensi salah pakai kredensial sandbox di production atau sebaliknya. | Buat modul `src/lib/environment/` yang memvalidasi `APP_ENV`, `MIDTRANS_ENV`, dan `BITESHIP_ENV` secara eksplisit dan deterministik. |
| **Voucher Quota Guard** | Pengecekan `totalDigunakan >= kuota` terpisah dari perintah `UPDATE` | Race condition pada checkout paralel drop terbatas (kuota bisa tembus batas). | Terapkan conditional atomic update: `UPDATE aturan_diskon SET total_digunakan = total_digunakan + 1 WHERE id = $id AND total_digunakan < kuota_penggunaan RETURNING id`. |
| **Webhook DB Transaction** | Panggilan `kirimEmailNotifikasi()` berada di dalam `db.transaction()` | Latensi eksternal Resend/network menahan *row lock* pesanan di PostgreSQL. | Pisahkan email dari transaksi DB: commit mutasi status pesanan seketika (<10ms), lalu jalankan pengiriman email dengan try/catch terisolasi. |
| **Fulfillment & Tracking** | Tabel `pelacakan_pengiriman` ada di skema, tapi belum ada route webhook Biteship | Informasi pergerakan kurir dan nomor resi terhenti tanpa pembaruan otomatis. | Bangun route handler `/api/biteship/webhook` dengan validasi signature + endpoint simulasi kurir sandbox untuk demo Vercel. |
| **Vercel Hobby Limits** | Dokumentasi menyebut Vercel Cron 5-menit, padahal `vercel.json` kosong | Vercel Hobby membatasi cron maksimal 1x/hari. Build gagal jika dipaksakan 5-menit. | Terapkan Lazy Expiry saat rute pesanan dibuka + GitHub Actions staging cron 15-menit. Hapus klaim cron 5-menit Vercel dari `GEMINI.md`. |
| **Concurrency Test Flakiness** | `src/features/checkout/__tests__/concurrency.test.ts` gagal di Vitest | Kontensi varian produk yang sama dengan `order-security.test.ts`. | Isolasi pengujian persaingan stok dengan varian SKU uji mandiri. |

---

## 2. Struktur Tiga Fase Pengerjaan (Phase-Gated Rollout)

```mermaid
graph TD
  A["Mulai Evaluasi & Aligment"] --> B["Fase 1: P0 Financial, Security & Concurrency"]
  B --> B1["Env Resolver & Security Headers"]
  B --> B2["Server-side HttpOnly Token + Hash DB"]
  B --> B3["Atomic Voucher & Non-Blocking Email"]
  B --> B4["Vitest All Green (Unit & Concurrency)"]
  B4 --> C["Fase 2: Fulfillment & Biteship Tracking"]
  C --> C1["Route Handler /api/biteship/webhook"]
  C --> C2["Timeline Pelacakan di /pesanan/[id]"]
  C --> C3["Sandbox Courier Simulator Action"]
  C --> C4["Vitest & Kontrak Webhook Biteship Green"]
  C4 --> D["Fase 3: Storefront UX, Dedicated Cart & Playwright E2E"]
  D --> D1["Halaman Kanonikal /keranjang"]
  D --> D2["Search & Filter Katalog PostgreSQL"]
  D --> D3["Size Confidence (Rekomendasi Ukuran)"]
  D --> D4["Copywriting & UI Anti-Slop (No Em Dash)"]
  D --> D5["Playwright E2E Matrix Verification"]
  D5 --> E["Production Merge ke Main"]
```

---

## 3. Rincian Pekerjaan Tiap Fase

### Fase 1: P0 Financial Integrity & Security Hardening
1. **Perbaikan Concurrency Test (`concurrency.test.ts`)**:
   - Modifikasi setup test agar membuat varian uji sementara dengan SKU unik atau kunci terisolasi, sehingga tidak berbenturan dengan pengujian paralel lainnya di Vitest.
2. **Environment Resolver Terpusat (`src/lib/environment/`)**:
   - Buat `schema.ts` (Zod) dan `resolver.ts` untuk memetakan kredensial Midtrans, Biteship, Resend, dan Database berdasarkan `APP_ENV` (`development`, `staging`, `production`).
   - Hapus pembacaan `process.env` ad-hoc di `midtrans.service.ts` dan `biteship.service.ts`.
3. **Server-Side HttpOnly Order Session Token**:
   - Perbarui Server Action `buatPesanan` untuk menetapkan HttpOnly cookie `void_order_session` via `next/headers` `cookies().set()`.
   - Simpan hash SHA-256 dari token di kolom `hash_token_akses` pada tabel `pesanan`.
   - Hapus penetapan token lewat `document.cookie` di `useCheckout.ts`.
4. **Atomic Voucher Guard**:
   - Ubah mutasi diskon pada `buat-pesanan.action.ts` menjadi kueri bersyarat atomik `WHERE total_digunakan < kuota_penggunaan`.
   - Batalkan transaksi jika tidak ada baris yang terpengaruh (kuota terlampaui saat checkout paralel).
5. **Pemisahan Panggilan Email dari Transaksi Database**:
   - Di `src/app/api/midtrans/webhook/route.ts`, pindahkan `kirimEmailNotifikasi` ke luar blok `db.transaction(...)`.
   - Rekam entri notifikasi ke tabel log/outbox di dalam transaksi, lalu eksekusi pengiriman jaringan secara non-blocking di luar transaksi dengan proteksi try/catch.
6. **Security Headers & Safe JSON-LD**:
   - Pasang header keamanan di `next.config.ts`: CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`.
   - Sanitasi keluaran JSON-LD pada komponen katalog/produk agar meng-escape karakter `<` menjadi `\u003c`.
7. **Penyelarasan Scheduler Vercel Hobby & Lazy Expiry**:
   - Implementasikan pengecekan pasif (*lazy expiry check*) di Server Action `ambilStatusPesanan` dan rute `/pesanan/[nomorPesanan]`.
   - Perbaiki dokumen `GEMINI.md` dan `.github/workflows/staging-cron.yml` untuk menjelaskan bahwa scheduler 15-menitan dioperasikan oleh GitHub Actions, bukan Vercel Cron.

---

### Fase 2: Fulfillment, Biteship Tracking Webhook & Resi Timeline
1. **Route Handler Webhook Biteship (`src/app/api/biteship/webhook/route.ts`)**:
   - Validasi header autentikasi / signature Biteship.
   - Parsing event status (`order.status_updated`, waybill event).
   - Simpan riwayat titik peristiwa kurir ke tabel `pelacakan_pengiriman` secara atomik.
   - Mutasikan status pesanan secara otomatis:
     - Event `dropping_off` / `picking_up` -> status `dikirim`.
     - Event `delivered` -> status `selesai`.
2. **Komponen Timeline Pelacakan Resi (`src/features/order/components/TimelinePengiriman.tsx`)**:
   - Desain brutalist utilitarian: badge status kurir, nomor resi dengan tombol salin, dan timeline titik checkpoint kurir (waktu, lokasi, keterangan).
   - Terapkan status *loading*, *empty*, dan *error state* sesuai aturan Anti-Slop (R-27).
3. **Simulasi Resi Sandbox untuk Vercel Demo**:
   - Buat Server Action `simulasiPergerakanKurirAction` khusus mode sandbox/development untuk menguji transisi resi (Diproses -> Diserahkan ke Kurir -> Dalam Perjalanan -> Terkirim).

---

### Fase 3: Dedicated Cart, Search/Filter, Size Confidence & Playwright E2E
1. **Halaman Kanonikal Keranjang Belanja (`src/app/(toko)/keranjang/page.tsx`)**:
   - Halaman khusus `/keranjang` lengkap dengan tabel artikel, thumbnail WebP, pemilih jumlah, berat kalkulasi, input voucher promo, dan tombol "Lanjut ke Pembayaran".
   - Sinkronisasi instan dengan Zustand store `useKeranjangStore` dan pencegahan hidrasi desinkronisasi.
2. **Search & Filter Katalog Berbasis PostgreSQL**:
   - Tambahkan input pencarian teks langsung (judul artikel, deskripsi) di `/katalog`.
   - Filter dropdown/tombol: Kategori garmen, ketersediaan stok, rentang harga, dan sorting (harga terendah/tertinggi, drop rilis terbaru).
3. **Fitur Size Confidence (Rekomendasi Ukuran Berbasis Postur)**:
   - Tambahkan modal/drawer interaktif pada halaman produk: input tinggi badan (cm) dan berat badan (kg) serta preferensi fitting (Regular / Boxy / Oversized).
   - Algoritma deterministik mencocokkan dimensi garmen di database (`panduanUkuran`) dan memberikan saran ukuran rekomendasi yang percaya diri.
4. **Pembersihan Copywriting & UI Anti-Slop**:
   - Hapus semua karakter em dash (`—`). Ganti dengan tanda titik, koma, titik dua, atau kurung.
   - Hapus jargon engineering internal seperti "mutasi inventaris", "transaksi terverifikasi", "kanonikal". Ganti dengan copy commerce yang jernih, actionable, dan jujur.
   - Terapkan kontras warna WCAG AA, tap target minimal 44px (`min-h-11`), dan zero IDE warnings Tailwind v4.
5. **Verifikasi E2E Playwright dengan Browser MCP**:
   - Tulis dan jalankan skenario Playwright menyeluruh:
     - Browsing katalog -> Filter artikel.
     - Membuka halaman detail -> Cek rekomendasi ukuran.
     - Tambah artikel ke keranjang -> Periksa `/keranjang`.
     - Checkout dengan data pembeli -> Dapatkan pesanan dan token sesi HttpOnly.
     - Simulasi webhook pembayaran Midtrans -> Periksa faktur dan timeline pengiriman.

---

## 4. Standar Mutu, Penamaan & Kebijakan Anti-Slop

- **Konvensi Bahasa Indonesia**: Seluruh fungsi domain, Server Actions, dan tabel basis data tetap menggunakan Bahasa Indonesia murni (`buatPesanan`, `ambilStatusPesanan`, `hitungOngkir`, `pelanggan`, `pesanan`, `pembayaran`, `pengiriman`, `varianProduk`).
- **Strict Anti-Slop**:
  - Dilarang membuat fake review, fake sold counter, atau fake testimonials.
  - Dilarang menambahkan komentar dekoratif pada kode (`// ======`, emoji).
  - Terapkan prinsip *Fix Terkecil yang Aman*.
- **Vercel Hobby & Sentry Free Tier Optimization**:
  - Payload fungsi serverless dijaga tetap ramping.
  - Sentry diatur dengan `tracesSampleRate: 0.1` pada production demo agar tidak menghabiskan kuota transaksi bulanan gratis.
