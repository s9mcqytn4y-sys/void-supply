# GEMINI.md - Panduan Arsitektur, Aturan Sistem & Konvensi Proyek

> **Proyek**: VOID Supply (E-Commerce Merchandise)  
> **Agen Utama**: Antigravity (Google DeepMind) / Gemini CLI (`agy`)  
> **Status GitHub Copilot**: Dinonaktifkan Permanen (Disabled)  
> **Bahasa Konvensi Penamaan**: Bahasa Indonesia (Domain & Business Logic)  
> **Mode Anti-Slop**: Mode 1 (DURING) : Diterapkan secara ketat sejak awal penulisan kode

---

## 1. Peran & Instruksi Agen Utama (Antigravity / agy)

- **Agen Tunggal**: Antigravity dan Gemini CLI (`agy`) adalah autonomous AI pair programmer resmi untuk repositori VOID Supply.
- **Bebas Bloatware / Anti-Slop**: Terapkan prinsip _Fix Terkecil yang Aman_. Dilarang menyisipkan boilerplate atau komentar tak berbobot.
- **Prioritas Dokumentasi**: Selalu rujuk dokumentasi termutakhir melalui Context7 untuk setiap library pihak ketiga.

---

## 2. Status Lingkungan & Versi Tools Terinstal

Berdasarkan audit sistem lokal:

| Tool / Runtime              | Versi Terinstal    | Lokasi / Eksekusi                                            | Status Aktivasi                                        |
| :-------------------------- | :----------------- | :----------------------------------------------------------- | :----------------------------------------------------- |
| **Antigravity CLI (`agy`)** | `1.2.5`            | `C:\Users\Acer\AppData\Local\agy\bin\agy.exe`                | **Aktif & Terkonfigurasi di PATH**                     |
| **Node.js**                 | `v22.23.2`         | System PATH                                                  | Aktif                                                  |
| **npm**                     | `10.9.8`           | System PATH                                                  | Aktif                                                  |
| **PostgreSQL**              | `18.6`             | `C:\Users\Acer\scoop\apps\postgresql\current\bin\pg_ctl.exe` | **Cluster Aktif** (`localhost:5432`)                   |
| **Database `void_supply`**  | PostgreSQL 18      | `localhost:5432/void_supply`                                 | **Bersih / Dikosongkan dari 0**                        |
| **PHP CLI**                 | `8.5.10`           | `C:\Users\Acer\scoop\apps\php\current\php.exe`               | **Aktif** (`pdo_pgsql`, `curl`, `openssl`, `mbstring`) |
| **Git**                     | `2.55.0.windows.5` | System PATH                                                  | Aktif                                                  |
| **GitHub CLI (`gh`)**       | `2.101.0`          | System PATH                                                  | Terotentikasi (`s9mcqytn4y-sys`)                       |
| **Google Chrome**           | Current            | `C:\Program Files\Google\Chrome\Application\chrome.exe`      | Browser Utama (VS Code Debugging)                      |
| **Git Bash**                | Current            | `C:\Program Files\Git\bin\bash.exe`                          | Terminal Profile VS Code                               |

### Perintah Operasional PostgreSQL (`pg_ctl`)

```powershell
# Jalankan PostgreSQL Server
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" -l "C:\Users\Acer\scoop\persist\postgresql\data\server.log" start

# Cek Status Server
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" status

# Hentikan Server
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" stop
```

---

## 3. Tech Stack Resmi & Daftar Dependensi

| Layer                    | Teknologi & Versi                              | Peran dalam Proyek                                                                        |
| :----------------------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **Framework**            | **Next.js 16** (`16.3.8`)                      | Core App Router, Turbopack, Server Actions, API routes                                    |
| **UI Runtime**           | **React 19.3** (`19.3.0`)                      | Server & Client Components                                                                |
| **Bahasa**               | **TypeScript 5.8** (`5.8.2`)                   | Strict mode, static typing tingkat lanjut                                                 |
| **Build & Testing Tool** | **Vite 6** (`6.2.0`) & **Vitest** (`3.0.7`)    | Testing unit/integrasi super cepat dengan Tailwind v4 plugin                              |
| **Styling**              | **Tailwind CSS v4** (`4.0.0`) & Native CSS     | Desain utilitas performa tinggi (`@tailwindcss/postcss`, `@tailwindcss/vite`)             |
| **Komponen UI**          | **shadcn/ui primitives**                       | `clsx` (`2.1.1`), `tailwind-merge` (`3.0.2`), `cva` (`0.7.1`), `lucide-react` (`0.479.0`) |
| **Validasi Skema**       | **Zod** (`3.24.2`)                             | Validasi skema runtime & TypeScript inference otomatis                                    |
| **Formulir**             | **React Hook Form** (`7.54.2`)                 | Manajemen form efisien dengan `@hookform/resolvers` (`3.10.0`)                            |
| **State Klien**          | **React State, Context, Zustand** (`5.0.3`)    | Global cart & client interactions                                                         |
| **State Server**         | **TanStack Query v5** (`5.67.1`)               | Caching & fetching data sisi klien                                                        |
| **Database & ORM**       | **PostgreSQL 18** + **Drizzle ORM** (`0.45.3`) | Database relasional dengan `drizzle-kit` (`0.30.5`)                                       |
| **Payment Gateway**      | **Midtrans Snap** (`1.4.3`)                    | Integrasi pembayaran transaksi online lokal                                               |
| **Pengiriman**           | **Biteship API** (`axios 1.7.9`)               | Kalkulasi ongkos kirim real-time & resi pengiriman                                        |
| **E2E Testing**          | **Playwright** (`1.51.0`)                      | End-to-end browser testing                                                                |
| **Observabilitas**       | **Sentry** (`11.4.0`)                          | Error monitoring & crash reporting                                                        |
| **Deployment**           | **Vercel** (`vercel.json`)                     | Hosting production serverless/edge otomatis via GitHub integration                        |

---

## 4. Implementasi Aturan Anti-Slop (Mode 1: DURING)

Sesuai aturan `/antislop`, `/antislop-code`, `/antislop-copywriting`, `/antislop-human`, `/antislop-layoutmobile`, `/antislop-ui`:

### A. Aturan Hard Gate

1. **DILARANG menggunakan karakter em dash (`—`)** dalam teks copywriting atau UI. Gunakan tanda koma (`,`), titik (`.`), titik dua (`:`), atau tanda kurung `()`.
2. **Desain Mobile-First (R-03)**: Tidak ada horizontal overflow, tidak ada teks terpotong, dan ukuran tombol minimal 44px tap target.
3. **Data & Klaim Jujur (R-17, R-18, R-36)**: Dilarang menggunakan testimoni palsu, avatar AI acak, atau metrik rekaan.
4. **Kontras Aksesibilitas WCAG AA (R-25)**: Rasio kontras teks minimal 4.5:1 untuk teks normal dan 3:1 untuk teks besar.
5. **Aksesibilitas Keyboard (R-32)**: Semua elemen interaktif wajib dapat dinavigasi via Tab, Enter, dan Escape dengan indikator fokus terlihat jelas.
6. **Kelengkapan State UI (R-27)**: Semua antarmuka data harus memiliki _Empty State_, _Loading State_, dan _Error State_.
7. **No Script Patching (R-33)**: Seluruh style dikelola langsung di komponen, dilarang mengubah CSS melalui skrip string replacement eksternal.

### B. Code Comment Hygiene (`/antislop-code`)

- Hindari pembuatan banner separator dekoratif seperti baris garis komentar panjang (`// =======================`).
- Jangan menarasikan ulang alur kode yang maknanya sudah gamblang terlihat (`// Initialize state`).
- Dilarang menyisipkan emoji dekoratif pada baris komentar (`// 🚀 Performance`).
- Pertahankan komentar teknis yang menguraikan alasan keputusan bisnis, pertimbangan keamanan, atau integrasi webhook pihak ketiga.

### C. Liveliness & Visual Dials (`/antislop-ui`)

- **ENERGY**: Dial 2 (Balanced) : modern streetwear aesthetic.
- **RHYTHM**: Dial 2 (Consistent with deliberate accents) : komposisi produk teratur dengan ritme visual menarik.
- **MOTION**: Dial 1–2 (Subtle micro-animations) : transisi hover halus dan responsif.
- Batasi palet aktif: maksimal 2–3 warna utama + 1 warna aksen terarah.

---

### D. Aturan Kanonikal Tailwind CSS v4 (Zero IDE Warnings)

1. **DILARANG menggunakan arbitrary value jika utility bawaan tersedia**:
   - Gunakan `aspect-video` (bukan `aspect-[16/9]`).
   - Gunakan `md:aspect-21/9` (bukan `md:aspect-[21/9]`).
   - Gunakan `min-h-11` untuk tinggi tap target 44px (bukan `min-h-[44px]`).
   - Gunakan `min-h-9` untuk tinggi 36px dan `min-h-12` untuk tinggi 48px.
2. **Sintaks Gradien Tailwind v4**: Wajib menggunakan `bg-linear-to-*` (bukan sintaks v3 `bg-gradient-to-*`).
3. **Pemisahan Kelas Kondisional `cn()`**: Hindari menyisipkan kelas warna latar dan teks yang bersaing di dalam percabangan ternary langsung pada `cn()`. Gunakan variabel penampung string terpisah atau template literal untuk mencegah konflik evaluasi linter.

---

## 5. Implementasi Aturan TypeScript Expert (`/typescript-expert`)

1. **Strict Type Safety**: Dilarang keras menggunakan tipe `any`. Gunakan `unknown` bila tipe belum pasti dan parse dengan Zod.
2. **Inference Over Annotation**: Manfaatkan `z.infer<typeof schema>` untuk menghindari duplikasi interface.
3. **Discriminated Unions**: Gunakan pola discriminated unions pada state transaksi dan status pengiriman.
4. **Const Assertions**: Terapkan `as const` pada nilai konfigurasi statis.

---

## 6. Konvensi Penamaan (Bahasa Indonesia)

Seluruh entitas domain bisnis, antarmuka toko, dan database wajib mengikuti konvensi Bahasa Indonesia:

- **Rute Etalase Toko**: Menggunakan struktur `src/app/(toko)/katalog/` dengan redirect otomatis dari `/shop` di `next.config.ts`.
- **Komponen UI Fitur**: Penamaan komponen antarmuka menggunakan Bahasa Indonesia seperti `KartuProduk.tsx`, `GridProduk.tsx`, dan `GambarProduk.tsx` dengan alias ekspor kompatibilitas di `src/features/catalog/index.ts`.
- **Tabel Drizzle**: Menggunakan nama entitas tunggal yang mencakup produk, pesanan, item_pesanan, pelanggan, inventaris, pembayaran, dan pengiriman.
- **Kolom Timestamp**: Ditetapkan secara konsisten dengan penamaan dibuat_pada serta diperbarui_pada.
- **Type atau Interface TypeScript**: Merepresentasikan entitas bisnis seperti Produk, Pesanan, Pelanggan, StatusPembayaran, dan OpsiPengiriman.
- **Zod Schema**: Skema validasi runtime seperti produkSkema, pesananSkema, dan checkoutSkema.
- **Server Actions & Layanan**: Fungsi operasional server seperti buatPesanan(), ambilDaftarKatalog(), ambilDetailProduk(), prosesWebhookMidtrans(), serta cekOngkirBiteship().

---

## 7. Batasan Struktur Kode & Keamanan

- **Folder `src/`**: Modul katalog aktif menggunakan PostgreSQL 18 via Drizzle ORM (`src/features/catalog/`), terbagi rapi ke dalam repositories, services, components, schemas, dan types. Seluruh data dummy statis telah dihapus demi integritas relasional.
- **Kredensial**: Dilarang melakukan commit terhadap secret atau API key asli ke Git. Selalu gunakan file template `.env.example`.

---

## 8. Status Repositori (Actual Local vs. GitHub Remote) & Evaluasi Berkas Root

### A. Komparasi Repositori

1. **Repositori Aktual (Lokal di `c:\Projects\VOID Supply`)**:
   - Memuat berkas konfigurasi lokal `.env` yang menyimpan kredensial sandbox aktif untuk integrasi Midtrans, Biteship, dan RajaOngkir.
   - Menyediakan direktori panduan agen lokal `.agents/rules/` yang dilindungi oleh aturan `.gitignore` agar tidak terunggah ke repositori publik.
   - Menghubungkan aplikasi langsung ke kluster basis data PostgreSQL 18 aktif pada port 5432 (`void_supply`).
   - Menyimpan berkas sementara kompilasi seperti `tsconfig.tsbuildinfo` yang diabaikan Git.
   - Memuat dokumen persona pembeli `PERSONA.md` pada direktori root proyek.
   - Memuat pipeline CI otomatis di `.github/workflows/ci.yml`.

2. **Repositori GitHub (`origin/main` : `s9mcqytn4y-sys/void-supply`)**:
   - Berkas rahasia `.env` tidak ada (dilindungi oleh `.gitignore`), hanya menyertakan `.env.example`.
   - Menyimpan dokumen riset produk dan arsitektur resmi di `docs/bootcamp/module-01/` dan `docs/bootcamp/module-02/` serta dokumen riset kompetitor, opportunity gap, dan prinsip UX di `docs/research/`.
   - Direktori `.agents/` tidak dipublikasikan ke remote.

### B. Evaluasi Berkas Root Proyek

- `.editorconfig`: Konfigurasi indentasi dua spasi, encoding UTF-8, dan konsistensi baris akhir.
- `.env`: Berkas rahasia lokal yang diproteksi penuh dari pelacakan Git.
- `.env.example`: Berkas templat variabel lingkungan untuk dokumentasi setup rekan tim.
- `.gitignore`: Daftar aturan pengecualian dependensi, build cache, dan berkas rahasia.
- `.prettierrc`: Standarisasi format penulisan kode dengan single quote dan konsistensi koma.
- `drizzle.config.ts`: Berkas konfigurasi Drizzle ORM terhubung ke PostgreSQL 18.
- `eslint.config.mjs`: Konfigurasi flat ESLint terintegrasi aturan Next.js dan TypeScript.
- `next.config.ts`: Konfigurasi Next.js 16 App Router beserta optimasi gambar dan URL redirect.
- `package.json`: Manifest dependensi proyek Next.js 16, React 19, Tailwind v4, Drizzle, dan Vitest.
- `playwright.config.ts`: Konfigurasi rangkaian pengujian browser menyeluruh end-to-end.
- `postcss.config.mjs`: Integrasi plugin PostCSS untuk pemrosesan Tailwind CSS v4.
- `tsconfig.json`: Pengaturan ketat kompilasi TypeScript dan path alias.
- `vercel.json`: Konfigurasi deployment hosting serverless ke platform Vercel.
- `vite.config.ts`: Runner pengujian unit Vitest terintegrasi plugin Tailwind v4.
- `GEMINI.md`: Dokumen pedoman arsitektur, aturan sistem, konvensi penamaan, dan batasan implementasi.
- `PRD.md`: Spesifikasi kebutuhan produk dan cakupan fitur utama e-commerce.
- `README.md`: Panduan utama proyek mencakup instalasi, dependensi, dan navigasi folder.
- `PERSONA.md`: Profil persona target pembeli busana dan administrator pengelola toko.
- `CUSTOMER_JOURNEY_MAP.md`: Peta perjalanan pengguna Rian The Trendsetter dari kesadaran merek hingga loyalitas.
- `SITE-MAP.md`: Struktur arsitektur informasi dan peta tujuh halaman antarmuka toko.
- `WIREFRAME.md`: Perencanaan wireframe, tata letak, komponen antarmuka, dan interaksi.

<!-- antislop:start -->
## 9. Kebijakan Anti-Slop Mandiri (Self-Contained Anti-Slop Specification)

Seluruh pedoman Anti-Slop proyek VOID Supply (UI, copywriting, aksesibilitas manusia, layout mobile, dan code hygiene) telah terintegrasi secara kanonikal di dalam **Bagian 4** dokumen `GEMINI.md` ini. Dengan demikian, pengujian kualitas, linter, dan evaluasi CI/CD dapat memvalidasi kepatuhan kode dan aset secara mandiri tanpa memerlukan dependensi berkas markdown eksternal yang tidak terlacak dalam repositori publik.
<!-- antislop:end -->

---

## 10. Arsitektur Integritas Transaksi & Keamanan Checkout (Module 02.14)

1. **Two-Phase Reservation Pattern**:
   - Fase 1: Validasi server-authoritative dan transaksi basis data atomik berdurasi sangat singkat (<10ms). Pengurangan stok dilakukan secara bersyarat atomik (`stok = sql`${varianProduk.stok} - ${jumlah}`` dengan guard `stok >= jumlah`). Transaksi database langsung di-commit untuk melepas kunci baris (row lock).
   - Fase 2: Pemanggilan gateway pembayaran Midtrans Snap dilakukan di luar transaksi basis data. Jika gateway gagal atau menolak, sistem mengeksekusi transaksi kompensasi untuk mengembalikan stok dan membatalkan pesanan.

2. **Server-Authoritative Shipping Logistics**:
   - Seluruh pemanggilan Biteship Logistics API dipindahkan dari Client Component ke Server Action (`hitungOngkirServerAction`).
   - Browser dilarang mendikte tarif ongkir (`tarifOngkirIdr` dihapus dari formulir client). Server menghitung berat fisik riil dari database dan memverifikasi opsi tarif resmi.

3. **Deduplikasi SKU & Payload Normalization**:
   - Payload checkout yang memuat varian ID ganda digabungkan secara otomatis pada tingkat server sebelum evaluasi ketersediaan stok.

4. **Idempotent Midtrans Webhook & Auto-Release Stok**:
   - Route handler `/api/midtrans/webhook` memverifikasi keaslian notifikasi menggunakan formula kriptografis SHA-512 `SHA512(order_id + status_code + gross_amount + serverKey)`.
   - Idempotency guard memastikan webhook berulang untuk pesanan yang sudah berstatus final tidak diproses ulang.
   - Status kegagalan, pembatalan, atau kedaluwarsa (`expire`, `cancel`, `deny`) secara otomatis memicu pemulihan kuota stok varian ke basis data PostgreSQL secara atomik.

5. **Isolasi Lingkungan Gateway & Flag Guard**:
   - Token simulasi (`SNAP-SIM-*`) dilarang keras di lingkungan produksi. Di lingkungan pengujian lokal, simulasi hanya aktif apabila diizinkan via konfigurasi eksplisit `ALLOW_PAYMENT_MOCK=true`.

6. **Hydration Lifecycle & Race Condition Guard**:
   - Provider keranjang belanja (`CartHydrationProvider.tsx`) menunggu penyelesaian `useKeranjangStore.persist.rehydrate()` sebelum mengaktifkan status hidrasi.
   - Menggunakan timestamp perbandingan `terakhirDiubah` untuk mencegah hasil rekonsiliasi jaringan yang lambat menimpa modifikasi keranjang terbaru dari pengguna.

---

## 11. Payment Lifecycle State Machine & Release Hardening (Module 02.15)

1. **Payment State Machine & Compare-and-Set Atomic Transition**:
   - Alur status resmi: `menunggu_pembayaran` -> `dibayar` / `kadaluwarsa` / `dibatalkan`.
   - Webhook menerapkan Compare-and-Set bersyarat di level database:
     `UPDATE pesanan SET status_pesanan = $status WHERE id = $id AND status_pesanan = 'menunggu_pembayaran'`.
   - Pemulihan stok atomik hanya dieksekusi jika kueri di atas mengembalikan baris yang terpengaruh (`rowCount > 0`). Hal ini mencegah race condition dan pemulihan stok ganda saat webhook paralel atau berulang tiba.

2. **Verifikasi Nominal Pembayaran (`gross_amount`)**:
   - Route handler webhook `/api/midtrans/webhook` memverifikasi bahwa `Math.round(Number(gross_amount))` cocok persis dengan `pesanan.totalAkhir`. Ketidakcocokan nominal ditolak dengan HTTP 422 Unprocessable Entity sebelum ada perubahan status.

3. **Penegakan Batasan Kuota SKU (Max 10)**:
   - Helper domain murni `gabungkanNiatItem` di `src/features/cart/utils/cart.helper.ts` menggabungkan item dengan varian sama dan memvalidasi bahwa total akumulasi kuantitas tidak melebihi 10 unit per SKU. Pelanggaran batas membatalkan pembuatan pesanan dengan pesan error domain yang jelas.

4. **Strict Origin Logistics & Anti-Fallback Diam-diam**:
   - Origin fulfillment resmi ditetapkan di Johar Baru, Jakarta Pusat (Kode Pos `10560`).
   - Server Action checkout menolak pesanan jika kurir atau layanan yang diminta pembeli tidak ditemukan dalam daftar penawaran resmi Biteship, tanpa melakukan pergantian kurir secara diam-diam.

5. **Pembersihan Copy Slop & UX Integrity**:
   - Formulir checkout dikosongkan secara default untuk pembeli baru (tidak lagi meng-hardcode data persona contoh).
   - Seluruh teks teknis/misleading seperti "Transaksi Terverifikasi" diganti dengan label jujur: "Checkout Aman", "Menunggu Pembayaran", dan "Lanjut ke Pembayaran".
   - Tombol bayar di-disable secara ketat saat proses kalkulasi ongkir (`sedangHitungOngkir`) masih berlangsung atau kurir belum dipilih.

6. **Playwright E2E & CI Release Gate**:
   - Pengujian browser Playwright Chromium ditambahkan ke GitHub Actions CI (`.github/workflows/ci.yml`).
   - Seluruh assertion bersyarat (`if (await isVisible())`) dihilangkan dari skenario pengujian kritis, memastikan pengujian gagal secara eksplisit bila komponen wajib tidak ditemukan di DOM.

7. **Asset Slop Remediation**:
   - Enam pasangan foto produk yang sebelumnya memiliki Git SHA/ukuran byte identik telah diganti dengan aset foto WebP beresolusi tinggi yang unik (rear view dan macro detail) untuk seluruh katalog Drop 04.


