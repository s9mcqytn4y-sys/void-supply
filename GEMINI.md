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

---

## 12. Final Release Hardening & Operasional Transaksi (Module 02.15 Complete)

1. **Scheduled Expiry & Recovery Reservasi Stok 15 Menit**:
   - Endpoint Route Handler `/api/cron/kadaluwarsa-pesanan` diproteksi `CRON_SECRET` untuk membatalkan pesanan yang belum dibayar dalam 15 menit dan memulihkan stok ke `varian_produk` via Compare-and-Set atomik.
   - Pemeriksaan pasif (*lazy check*) dieksekusi secara otomatis saat rute `/pesanan/[nomorPesanan]` dimuat pembeli.

2. **Checkout Idempotency Key**:
   - Kolom `idempotensi_key` (varchar 64 unik) ditambahkan pada tabel `pesanan`.
   - Client checkout membuat token UUID saat form dimuat, sehingga submit berulang atau retry jaringan mengembalikan pesanan eksis tanpa dekremen stok ganda.

3. **Halaman Kanonikal Status Pesanan (`/pesanan/[nomorPesanan]`)**:
   - Halaman Server Component dengan metadata SEO noindex.
   - Dilengkapi timer countdown 15 menit, ringkasan pesanan, tombol pembayaran Snap, dan polling status otomatis via Server Action dengan interval 5 detik hingga status final tercapai atau batas 2 menit.
   - Pengalihan permanen `/order/:path*` diarahkan ke `/pesanan/:path*` di `next.config.ts`.

4. **Isolasi Mock & Penolakan Fallback (Strict Fail-Closed)**:
   - Midtrans mock `SNAP-SIM-*` dibatasi ketat hanya aktif jika `ALLOW_PAYMENT_MOCK=true` DAN bukan di production.
   - Layanan Biteship menolak fallback estimasi di production bila kunci tidak terpasang.
   - `ongkir.action.ts` menolak permintaan jika artikel varian tidak ditemukan di basis data, sekaligus menghapus fallback 500 gram.

5. **Dekomposisi Bersih & Anti-Bloat Checkout**:
   - Berkas `src/app/checkout/page.tsx` didekomposisi dari 610 baris menjadi <90 baris sebagai orchestrator ramping.
   - Logika form dipisahkan ke `useCheckout.ts`, UI dipecah menjadi `FormulirPengiriman.tsx`, `PilihanKurir.tsx`, dan `RingkasanPesananCheckout.tsx`.

6. **Automated Concurrency & Webhook Matrix Tests**:
   - Vitest suite `concurrency.test.ts` memverifikasi perlindungan anti-overselling saat dua pembeli berebut 1 unit stok terakhir, idempotensi order, dan recovery stok.
   - Vitest suite `webhook.test.ts` memvalidasi matrix respons HTTP 400, 403, 404, dan 422.

---

## 13. Audit Remediation, IDOR Access Token & Workspace MCP (Module 02.15 Production Gate)

1. **SEC-01 (Strict Fail-Closed Cron Authentication)**:
   - Endpoint `/api/cron/kadaluwarsa-pesanan` mewajibkan kehadiran `CRON_SECRET` di lingkungan server, dan jika variabel tidak ada atau kosong maka request ditolak langsung dengan HTTP 500.
   - Header `Authorization: Bearer <token>` diverifikasi secara presisi, sehingga kegagalan autentikasi mengembalikan HTTP 401 Unauthorized tanpa membocorkan nomor pesanan ke pemanggil publik.

2. **SEC-02 (IDOR Protection via High-Entropy Access Token)**:
   - Kolom `token_akses` (UUID v4 berentropi 122-bit) ditambahkan ke tabel `pesanan`.
   - Token dikirimkan kembali ke klien checkout via URL parameter aman `?token=<uuid>` dan disimpan untuk verifikasi status.
   - Tanpa token yang valid, antarmuka `/pesanan/[nomorPesanan]` dan Server Action `ambilStatusPesanan` menyamarkan seluruh PII pelanggan (nama, email, nomor telepon) dan menonaktifkan trigger pembayaran Snap.

3. **PAY-01 & PAY-02 (Atomic Stock Compensation & Parallel Idempotency)**:
   - Jalur kegagalan Midtrans di `buat-pesanan.action.ts` menerapkan rollback stok bersyarat Compare-and-Set atomik untuk mencegah race condition.
   - Penanganan benturan kunci unik PostgreSQL (kode `23505`) pada `idempotensi_key` memastikan request paralel bersamaan mengembalikan pesanan yang berhasil dibuat tanpa melemparkan error 500 atau mengurangi stok ganda.

4. **OPS-01 & OPS-02 (Deployment Cron & Gateway Inquire Before Expiry)**:
   - Scheduler staging/produksi dikonfigurasi via GitHub Actions (`.github/workflows/staging-cron.yml`) setiap 15 menit + pembersihan pasif (*Lazy Expiry Check*) saat rute `/pesanan/[nomorPesanan]` dimuat, karena Vercel Hobby Plan membatasi cron bawaan maksimal 1x per hari.
   - Layanan pembatalan pesanan `reservasi.service.ts` memverifikasi status pembayaran langsung ke gateway Midtrans (`cekStatusTransaksiMidtrans`) sebelum membatalkan pesanan kedaluwarsa, mencegah pembatalan order yang telah berhasil dibayar di gateway.

5. **Visual Assets Drop 04 & UI Enhancement**:
   - Menambahkan aset visual orisinal streetwear beresolusi tinggi ke UI:
     - `drop-04-editorial-campaign.jpg`: Kampanye editorial lookbook estetika beton brutalis monokromatik di homepage.
     - `fabric-density-macro.jpg`: Makro tekstur rajut 420 GSM French Terry dan jahitan rantai ganda pada komponen transparansi material produk.
     - `void-drop04-seal.jpg`: Segel sertifikasi otentikasi Archive Edition Drop 04.

6. **Workspace MCP Integration (`.vscode/mcp.json`)**:
   - Dikonfigurasi server resmi untuk efisiensi agen dan developer:
     - `context7`: Dokumentasi termutakhir framework (Next.js 16, React 19, Drizzle ORM, Zustand).
     - `playwright`: Verifikasi headless browser aktual dan pengujian antarmuka real-time.
     - `chrome-devtools`: Profiling performa Core Web Vitals, waterfall jaringan, dan inspeksi layout via versi tersemat resmi `0.10.1`.

---

## 14. Pre-Production Security & Payment Reliability Gate (Module 02.16)

1. **SEC-02A (Strict Token Verification & Fail-Closed Legacy Protection)**:
   - Akses penuh ke detail pesanan mewajibkan kecocokan antara token klien dan token database (mendukung hash SHA-256 `hashTokenAkses` serta plain token).
   - Pesanan historis dengan token kosong atau tidak terisi ditangani secara fail-closed (tidak memberikan akses penuh tanpa kredensial).
   - Migrasi basis data mengisi token unik UUID ke seluruh pesanan warisan yang belum memiliki token.
   - Token disimpan dalam cookie browser `HttpOnly`, `SameSite=Strict`, `Secure` yang ditetapkan langsung oleh Server Action / Route Handler dengan path `/` untuk mencegah pembacaan melalui skrip client-side (XSS).

2. **SEC-03 (Minimal Public Status View)**:
   - Permintaan tanpa token otentikasi hanya mengembalikan status minimal: nomor pesanan, status pesanan, status pembayaran, waktu dibuat, dan waktu kedaluwarsa.
   - Seluruh data sensitif disamarkan: item pesanan dikosongkan, SKU disembunyikan, subtotal dan total ongkir di-nolkan, kurir disembunyikan, dan seluruh PII pelanggan dihapus.

3. **PAY-04 (Tri-State Reconciliation Gateway Inquire)**:
   - Status verifikasi gateway dipisahkan menjadi tiga kondisi tegas: `PAID`, `UNPAID_TERMINAL` (expire/cancel/deny), dan `UNKNOWN` (HTTP 5xx, timeout, atau jaringan terputus).
   - Kondisi `UNKNOWN` dilarang membatalkan pesanan atau melepas stok. Sistem mencatat percobaan rekonsiliasi hingga 12 kali (1 jam) sebelum menandai `perlu_tinjauan_manual = true` untuk investigasi tim operasional.

4. **PAY-05 (Atomic Payment & Order State Update)**:
   - Perubahan status pesanan dan pencatatan pembayaran disatukan dalam satu transaksi basis data atomik berdurasi sangat singkat (<10ms).

5. **PAY-06 (Idempotency Fingerprint Hash)**:
   - Menyimpan `hash_payload` (SHA-256) pada tabel `pesanan` untuk memvalidasi sidik jari muatan checkout.
   - Permintaan ulang dengan nomor idempotensi yang sama tetapi isi item, harga, atau data penerima yang berbeda ditolak secara tegas tanpa mengeksekusi mutasi stok.

6. **OPS-03 (Fail-Closed Cron Route Handler)**:
   - Endpoint `/api/cron/kadaluwarsa-pesanan` memverifikasi hasil pembersihan dan mengembalikan HTTP 500 apabila terjadi kegagalan sistematis dalam pemrosesan basis data.

7. **TEST-02 & CI Pipeline Isolation**:
   - Skrip pengujian sandbox gateway live dipisahkan ke dalam `.github/workflows/sandbox-e2e.yml` yang dijalankan secara manual (`workflow_dispatch`), menjaga pipeline CI utama tetap deterministik dan terisolasi dari kuota pihak ketiga.

8. **Pembersihan Klaim & Aksesibilitas Material**:
   - Menghapus klaim tanpa verifikasi pada antarmuka pengguna ("lolos uji QC batch mandiri" diganti dengan uraian konstruksi faktual, "450 GSM" disesuaikan dengan berat riil garmen 420 GSM, "MAKRO x10" diubah menjadi "INSPEKSI TEKSTUR MAKRO", dan klaim "anti-melar" dihapus).
   - Label status verifikasi pada komponen `TransparansiMaterial.tsx` terikat langsung secara dinamis ke skema basis data `spesifikasi.verifikasi.status`.
   - Menambahkan navigasi keyboard ARIA tabs (panah kiri dan kanan) pada tab spesifikasi garmen sesuai pedoman WCAG AA.

---

## 15. Production Readiness Gate, Brand Expansion & A11y (Module 02.17)

1. **ENV-01 & ENV-02 (Zod Runtime Environment Validation)**:
   - Modul `src/lib/env.ts` mengevaluasi integritas seluruh variabel lingkungan secara ketat saat runtime dan deployment.
   - Memvalidasi konsistensi flag produksi `MIDTRANS_IS_PRODUCTION` dengan keberadaan `MIDTRANS_SERVER_KEY_PRODUCTION` serta fail-closed secret authentication.

2. **SEC-05 (HttpOnly Token Order Session Cookie)**:
   - Route handler `src/app/pesanan/[nomorPesanan]/access/route.ts` menerima query token yang sah dan menuliskannya ke dalam HttpOnly Session Cookie (`void_order_token_<nomor>`) dengan `SameSite=Strict`, `Secure=true`, dan `Max-Age=900` (15 menit).
   - Melakukan redirect otomatis `303 See Other` ke `/pesanan/[nomorPesanan]` tanpa query string token, membersihkan jejak kredensial dari riwayat browser, log referer, dan screenshot pengguna.

3. **UI-01 & UI-02 (Conversion Layer & Visual Performance)**:
   - Penambahan Sticky Mobile Bar pada `PemilihVarian.tsx` dengan tap target minimal 44px (`min-h-11`), kontras WCAG AA, dan pemilih ukuran cepat.
   - Optimasi homepage LCP dengan prioritas gambar hero dan lazy loading pada section visual pendukung.

4. **SEO & Brand Expansion (Zero AI-Slop & Schema.org JSON-LD)**:
   - Halaman identitas merek orisinal:
     - `/tentang`: Sejarah studio, filosofi brutalist utilitarian, transparansi workshop Johar Baru 10560.
     - `/material`: Eksplorasi serat 500 GSM French Terry, 24s Combed Cotton, dan standar durabilitas konstruksi.
     - `/journal`: Arsip editorial Drop 04 dan catatan riset garmen teknikal.
     - `/kontak`: Layanan pelanggan terarah, jam operasional studio, verifikasi garansi, dan email resmi.
   - Skema terstruktur `Organization` dan `Product` JSON-LD terintegrasi di homepage dan katalog.
   - Pembersihan teks anti-slop: zero em dash, klaim faktual tanpa hiperbola, dan tanpa testimoni buatan.

5. **I18n & Payment/Logistics Badges**:
   - Sistem multibahasa ringan berbasis cookie (`void_locale=id|en`) via kamus lokal murni tanpa dependensi eksternal berat, menjaga performa Server Component.
   - Komponen `PaymentCourierBadges.tsx` menyediakan lencana monokromatik brutalis (BCA, Mandiri, BNI, BRI, QRIS, GoPay, JNE, SiCepat, J&T) yang selaras dengan estetika technical streetwear.

6. **Testing Modularization & Contract Tests**:
   - Modulasi suite Playwright ke dalam `tests/e2e/flows/`, `tests/e2e/security/`, dan `tests/e2e/fixtures/`.
   - Vitest Contract Suite `tests/contracts/midtrans-webhook.contract.test.ts` memvalidasi simulasi penuh siklus webhook Midtrans (settlement, pending, expire, cancel, duplicate idempotency).

7. **Vercel Webhook Resilience**:
   - Konfigurasi `vercel.json` diperbarui dengan `maxDuration: 10` pada fungsi `/api/midtrans/webhook` untuk mencegah timeout saat lonjakan traffic.

---

## 16. Fase 3: Storefront UX, Size Confidence & Playwright E2E Master Journey

1. **Rute Kanonikal Halaman Keranjang Belanja (`/keranjang`) & Integrasi Quick Drawer**:
   - Rute mandiri `src/app/(toko)/keranjang/page.tsx` dengan komponen `HalamanKeranjang.tsx`.
   - Menyajikan tabel artikel belanja responsif, kontrol kuantitas unit berpelindung kuota (1-10 unit per SKU), thumbnail WebP, dan aksi penghapusan artikel.
   - Dilengkapi **Kalkulator Berat Logistik**: menghitung berat paket fisik total dalam satuan gram dan kilogram untuk transparansi ongkos kirim resmi Biteship.
   - Input voucher diskon terintegrasi langsung dengan Server Action `validasiVoucherAction`.
   - Drawer `RingkasanKeranjang.tsx` menyediakan tombol navigasi cepat "LIHAT KERANJANG LENGKAP" (`min-h-11`) menuju rute `/keranjang`.

2. **Katalog Explorer dengan Live Search, Kategori & URL Sync (`/katalog`)**:
   - Komponen `KatalogExplorer.tsx` menyediakan sistem pencarian teks dengan debounce 300ms, filter tabs kategori busana (*Semua*, *T-Shirt*, *Outerwear*, *Pants*, *Accessories*), sakelar ketersediaan ready stock, dan dropdown pengurutan (*Terbaru*, *Harga Terendah*, *Harga Tertinggi*).
   - Sinkronisasi instan dua arah dengan parameter URL (`kategori`, `q`, `sort`, `ready`) menggunakan Next.js `useRouter` dan `useSearchParams` tanpa reload halaman.
   - State kosong terkelola rapi dengan aksi satu klik "RESET SEMUA FILTER".

3. **Size Confidence Modal & Kalkulator Postur Cerdas (AI Fit)**:
   - Komponen `PanduanUkuran.tsx` ditingkatkan dengan sistem navigasi dual-tab: "TABEL DIMENSI (CM)" dan "KALKULATOR POSTUR (AI FIT)".
   - Kalkulator postur menerima parameter tinggi badan (cm), berat badan (kg), dan preferensi siluet (*Regular*, *Boxy*, *Oversized*), kemudian menghasilkan rekomendasi ukuran busana akurat berdasarkan proporsi drape garmen VOID Supply.
   - Dilengkapi tombol "TERAPKAN UKURAN [X]" yang langsung memutasikan seleksi ukuran aktif pada `PemilihVarian.tsx`.

4. **Cryptographic High-Entropy Order Number (`buat-pesanan.action.ts`)**:
   - Format nomor pesanan ditingkatkan dari 5-digit pseudo-random menjadi 32-bit hex kriptografis: `VOID-YYYYMMDD-XXXXXXXX` (`crypto.randomBytes(4).toString("hex").toUpperCase()`).
   - Menghilangkan probabilitas benturan nomor pesanan saat pengujian paralel Vitest/Playwright dan lonjakan traffic tinggi di produksi.

5. **Playwright E2E Master Journey Test (`shopper-journey.spec.ts`)**:
   - File pengujian `tests/e2e/flows/shopper-journey.spec.ts` memvalidasi rantai perjalanan pembeli secara menyeluruh:
     - Filter & Live Search di `/katalog`
     - Navigasi ke PDP `/katalog/[slug]`
     - Interaksi Size Confidence Modal & Kalkulator Postur
     - Penambahan artikel ke keranjang
     - Navigasi ke halaman keranjang `/keranjang`
     - Evaluasi rincian biaya & berat logistik
     - Transisi ke halaman `/checkout` dan verifikasi mobile viewport tanpa horizontal overflow.

6. **Kepatuhan Kanonikal Tailwind CSS v4 & Zero Warning IDE**:
   - Memperbaiki peringatan IDE pada `TimelinePengiriman.tsx` (`-left-[5px]` -> `-left-1.25`).
   - Mempertahankan standar ketat: 0 kesalahan ESLint, 0 galat TypeScript (`tsc --noEmit`), 0 em dash (`—`), dan 100% lulus pada 62 pengujian Vitest.

---

## 14. Audit Integrasi, Hardening Logistik & Release Consolidation (Penyelesaian 13 Poin Audit)

1. **Akar Masalah Biteship Tidak Tercatat & Solusi Hibrida (Fase 1)**:
   - Ditemukan dua akar masalah utama:
     a. Ketidakcocokan kode layanan kurir: Biteship API menolak request jika `courier_type` dikirim sebagai teks display lokal (misal: "Besok Sampai Tujuan" bukannya kode resmi "best"). Telah dibuat fungsi kanonikal `petakanKodeLayananBiteship()` yang menormalisasi kode layanan resmi seluruh ekspedisi.
     b. Pembekuan promise di Vercel Serverless: Eksekusi background unawaited promise dibekukan saat HTTP response terkirim. Diselesaikan dengan arsitektur hibrida: timeout sinkron 3.5 detik + `@vercel/functions` `waitUntil()` + fallback terjadwal GitHub Actions cron outbox.
   - Guard penghematan saldo kuota Biteship: Pengecekan idempotensi `dataPengiriman.biteshipOrderId` mencegah request pemotongan saldo berulang.

2. **UX Pemilihan Kurir Terkategorisasi & Cache Ongkir (Fase 2)**:
   - Komponen `PilihanKurir.tsx` mendistribusikan opsi kurir ke dalam 4 kategori terstruktur:
     - Reguler (2-3 hari)
     - Next Day / Kilat (1 hari)
     - Instant / Same Day (3-8 jam)
     - Kargo / Hemat (3-7 hari)
   - Badge harga, badge estimasi kecepatan, dan indikator rekomendasi ("HEMAT", "TERCEPAT").
   - `cacheOngkirRef` di `useCheckout.ts` mencegah pemanggilan API berulang saat pengguna mengedit data kontak, menghemat panggilan Biteship rates API.

3. **Halaman Universal Order Tracking (`/lacak`) (Fase 3)**:
   - Halaman mandiri `/lacak` yang menerima Nomor Pesanan (`VOID-...`) atau Nomor Resi ekspedisi (`WYB-...`, dsb.) via query parameter atau input formulir interaktif.
   - PII pembeli disamarkan otomatis untuk melindungi privasi.
   - Timeline kurir vertikal dengan status waktu nyata (Order Dibuat -> Kurir Dijadwalkan -> Dalam Pengantaran -> Terkirim).

4. **Sleek Brutalist E-Receipt / Faktur A4 Print-Ready (Fase 4)**:
   - Mengatasi masalah cetak 2 lembar pada halaman faktur (`/pesanan/[nomorPesanan]/faktur`).
   - CSS Print Terisolasi: `@page { size: A4 portrait; margin: 8mm 10mm; }`, menyembunyikan navigasi global (`nav, header, footer`), padding mikro-skala, SVG barcode verifikasi digital, dan penjaminan 1 lembar kertas A4 tanpa overflow.

5. **Colorway Swatches & Varian Produk Lengkap (Fase 5)**:
   - Pemilih warna interaktif (swatches) pada PDP (`PemilihVarian.tsx`) yang menyinkronkan ketersediaan ukuran dan stok secara real-time.
   - Data seed `seed.ts` diperkaya dengan pilihan warna autentik: Jet Black, Bone White, Charcoal, Vintage Wash Moss, Cyber Silver, Concrete Grey, Olive Drab, Shadow Black, Black Onyx, dan Desaturated Khaki.

6. **Interactive Sandbox Demo Controller & Node E2E REPL (Fase 6)**:
   - Panel controller demo di `/pesanan/[nomorPesanan]` dengan tombol salin order ID, tautan ke Midtrans Simulator resmi (`https://simulator.sandbox.midtrans.com/`), tombol 1-klik webhook trigger pelunasan settlement, dan tombol simulasi delivery Biteship.
   - Script runner `scripts/test-e2e-repl.ts` (`npm run test:repl`) yang mengeksekusi pengujian seluruh siklus transaksi end-to-end tanpa browser dan menghasilkan tabel ringkasan ANSI terverifikasi 100% PASSED.

7. **Sentry Integration Free Tier & Clean Architecture (Fase 7)**:
   - Konfigurasi `sentry.client.config.ts` dan `sentry.server.config.ts` dengan budget-safe sampling (10% sampling traces di produksi) guna mencegah pemborosan kuota gratis.
   - Semantic HTTP codes diterapkan ketat pada seluruh endpoint: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden Signature), 404 (Not Found), 409 (Conflict Idempotency), 422 (Unprocessable Entity Mismatch), 500 (Internal Server Error).

---

## 15. Security Hardening P0, Lease Reaper & Aset Transparan Resmi (Module 02.19)

1. **SEC-RES-01 (Label Resi Thermal IDOR Authorization)**:
   - Halaman `src/app/pesanan/[nomorPesanan]/resi/page.tsx` kini mewajibkan verifikasi `tokenAkses` (IDOR Guard SEC-02) melalui cookie atau query parameter.
   - Akses tanpa token valid menampilkan halaman penolakan resmi tanpa mengekspos PII nama, nomor telepon, dan alamat pembeli.

2. **SEC-SIM-02 (Isolasi Terbatas Simulasi Kurir)**:
   - Perbaikan bug kritis mass-update pada `simulasi-resi.action.ts`: klausul update kini menyertakan `and(eq(pesanan.id, pesananDb.id), or(statusTerkait))` untuk menjamin hanya pesanan terkait yang terpengaruh.
   - Ditambahkan proteksi `tokenAkses` dan guardrail produksi fail-closed (`ALLOW_PAYMENT_MOCK !== "true"`).

3. **SEC-DEMO-03 (Isolasi Lingkungan Demo vs Produksi)**:
   - `demo-simulator.action.ts` menerapkan guard fail-closed di lingkungan produksi untuk simulator pembayaran dan simulasi mutasi status logistik.

4. **OPS-OUTBOX-04 (Transactional Outbox Lease Reaper & Email Check)**:
   - `outbox.service.ts` dilengkapi mekanisme _Lease Reaper_ otomatis yang memulihkan tugas berstatus 'diproses' yang tertahan lebih dari 5 menit akibat crash worker atau timeout serverless.
   - Pengecekan hasil bisnis `hasilEmail.sukses` dipastikan agar kegagalan SMTP/Resend tercatat sebagai error untuk retry outbox.

5. **ROUTE-KANONIKAL-05 (Konsolidasi Rute Pelacakan)**:
   - Menghapus folder rute legacy `src/app/track/` yang menduplikasi fungsionalitas, menyelaraskan link footer dan `sitemap.ts` ke rute kanonikal `/lacak`.

6. **ASSET-OFFICIAL-06 (Logo Resmi Metode Pembayaran & Kurir Transparan)**:
   - Mengganti seluruh aset placeholder identik di `public/assets/payment/` dan `public/assets/shipping/` dengan logo resmi WebP transparan berkualitas tinggi (BCA, Mandiri, BNI, BRI, QRIS, GoPay, JNE, SiCepat, J&T).
   - `PaymentCourierBadges.tsx` merender logo dengan filter grayscale brutalist 70% di default dan transisi full-color saat di-hover.

7. **LEGAL-PAGE-07 (Dokumen Legal & Brand Anti-Slop)**:
   - Rute resmi `/kebijakan-privasi`, `/syarat-ketentuan`, dan `/pengembalian` dibangun dengan tata bahasa Indonesia formal utilitarian tanpa em dash (`—`) sesuai panduan `/antislop-copywriting`.

8. **TAILWIND-V4-08 (Zero IDE Warnings)**:
   - Seluruh arbitrary values kelas CSS diselaraskan dengan standar utilitas Tailwind v4 (`max-w-105` dan `max-w-70`).

---

## 16. Blueprint Arsitektur Fase 2: Autentikasi & Akun Pelanggan (Module 02.20)

1. **Gate 0 Remediasi Keamanan Lingkungan Demo**:
   - Rute `/demo/inbox` dikunci menggunakan otorisasi query key `?key=<kunci>` yang diverifikasi terhadap `DEMO_INBOX_KEY` atau `CRON_SECRET`. PII email disamarkan (`samarkanEmail`) dan kunci/token pada payload dibersihkan (`bersihkanPayloadAman`). Anonymous user tanpa kunci ditolak dengan HTTP 403.
   - Skrip seeder `src/lib/db/seed.ts` dikonfigurasi non-destruktif secara default: penghapusan tabel transaksi dan pelanggan hanya dieksekusi jika `SEED_FORCE_RESET === "true"`. Pembaruan katalog rutin beroperasi dalam mode aman (safe upsert).

2. **Skema Relasional Non-Destruktif & Adapter Better Auth (`auth.schema.ts`)**:
   - Menambahkan kolom `penggunaId` (nullable, unik) pada tabel `pelanggan` untuk memetakan akun login ke profil transaksi secara 1:1 tanpa merusak integritas pesanan historis.
   - Tabel inti Better Auth: `pengguna`, `sesiPengguna`, `akunAutentikasi`, `verifikasiAutentikasi`, dan `batasPermintaanAuth` (distributed rate limit di Neon PostgreSQL tanpa dependensi Redis eksternal).
   - Tabel Customer Account & CRM: `alamatPelanggan` (buku alamat terstruktur Biteship), `preferensiPengguna` (preferensi ukuran, consent marketing/transaksional terpisah), `wishlist` (unik per pengguna + produk), `keranjangAkun` & `itemKeranjangAkun` (persistensi keranjang lintas perangkat), `aktivitasAkun` (audit trail login/keamanan), dan `klaimPesanan` (penautan order guest lama).

3. **Alur Checkout Wajib Login & Email Terverifikasi**:
   - Pengunjung bebas menjelajahi katalog dan mengisi keranjang melalui Zustand client store yang tersimpan di browser.
   - Ketika pembeli memutuskan untuk menyelesaikan transaksi pada checkout, aplikasi mewajibkan proses masuk dan verifikasi alamat email.
   - Server Action checkout membaca identitas pemesan langsung dari sesi server (`pengguna_id`), sehingga memitigasi potensi manipulasi data atau celah IDOR.

4. **Hybrid Fail-Safe Provider**:
   - Pengiriman email aktivasi akun dan reset kata sandi menggunakan Resend API ketika kredensial resmi aktif, dengan pengalihan otomatis ke Transactional Outbox dan In-App Dev Mailbox terproteksi saat mode demo dijalankan.

---

## 17. Migrasi Mesin Email Nodemailer, Outbox Delivery & Phase 2D Customer Account Center

1. **Mesin Email Nodemailer & Kredensial Gmail SMTP**:
   - Berkas `src/lib/services/email.service.ts` dimigrasikan untuk menggunakan transport SMTP `nodemailer` berotentikasi Google App Password (`GMAIL_USER` dan `GMAIL_APP_PASSWORD`), dengan pembersihan spasi otomatis pada App Password dan fallback aman ke transactional outbox.
   - Peta email transaksional diperluas: `verifikasi_email`, `atur_ulang_password` (reset kata sandi), `notifikasi_keamanan` (perubahan kata sandi / pencabutan sesi), dan notifikasi pesanan (`konfirmasi_pesanan`, `pembayaran_berhasil`, `pesanan_dikirim`, `pesanan_dibatalkan`).
   - Desain email HTML mengadopsi standar **Brutalist Dark Utilitarian** (`#09090b` canvas, `#141417` card, `#ffffff` high-contrast CTA button, monospace technical details, zero em dash).

2. **Immediate Non-Blocking Outbox Delivery (`waitUntil`)**:
   - Fungsi `tambahTugasOutboxLangsung` di `outbox.service.ts` memicu `waitUntil(prosesAntreanOutbox())` saat serverless request berakhir, memastikan pengiriman email instan ke SMTP Gmail tanpa menahan response HTTP pengguna ataupun memblokir thread.

3. **Phase 2D: Customer Account Center (`/akun`)**:
   - Layout & Proteksi Sesi: `src/app/(account)/akun/layout.tsx` mengamankan seluruh rute akun via `ambilSesiPengguna()`, mengalihkan tamu tak terotentikasi ke `/masuk?next=/akun`.
   - Navigasi Akun (`NavigasiAkun.tsx`): Menampilkan sidebar desktop responsif dan horizontal scrollable tabs pada mobile dengan tap target `>= 44px` (`min-h-11`).
   - Dasbor Ringkasan (`/akun`): Ringkasan metrik pesanan (menunggu pembayaran, diproses, dikirim, selesai), status verifikasi email, buku alamat utama, dan tautan langsung ke katalog.
   - Riwayat Pesanan (`/akun/pesanan` & `DaftarPesananAkun.tsx`): Menampilkan seluruh pesanan terikat akun, status pengiriman, nomor resi kurir, dan pelacak status pembayaran.
   - Klaim Pesanan Manual (`ModalKlaimPesanan.tsx` & `pesanan-akun.action.ts`): Memungkinkan pengguna mengklaim pesanan guest checkout lawas dengan memasukkan Nomor Pesanan dan Token Akses Faktur 122-bit.
   - Buku Alamat Pengiriman (`/akun/alamat` & `BukuAlamatAkun.tsx`): CRUD alamat pengiriman dengan penanda status alamat utama, validasi Zod (`skemaAlamatPelanggan`), serta sinkronisasi Biteship.
   - Pengaturan Profil (`/akun/profil` & `FormProfilAkun.tsx`): Manajemen nama akun dan preferensi ukuran favorit busana (S, M, L, XL, XXL).
   - Pusat Keamanan Akun (`/akun/keamanan` & `PusatKeamananAkun.tsx`): Pembaruan kata sandi akun via Better Auth, inspeksi sesi perangkat aktif dengan indikator sesi saat ini, pencabutan sesi individual atau seluruh sesi perangkat lain, dan log audit keamanan.

4. **Address Quick Switcher di Checkout (`FormulirPengiriman.tsx`)**:
   - Bagi pengguna yang telah masuk dan memiliki buku alamat tersimpan, formulir checkout menyediakan quick switcher kartu alamat brutalist dengan lencana `[UTAMA]`. Mengklik kartu alamat secara otomatis mengisi nama, nomor telepon, alamat lengkap, kota, provinsi, dan kode pos ke dalam formulir pengiriman, menghemat waktu checkout secara signifikan.

---

## 18. Modularisasi Landing Page (`/`) & Standar Antarmuka Brutalist

1. **Dekomposisi Slices Arsitektur (`src/features/landing/components/`)**:
   - Halaman `src/app/page.tsx` didekomposisi dari berkas monolitik menjadi orchestrator ramping (<60 baris) dengan komponen modular:
     - `HeroEditorial.tsx`: Split editorial streetwear, live status badge Drop 04, tipografi brutalist kontras tinggi, dan dual CTA button (`min-h-11`).
     - `MarqueeTicker.tsx`: Pengumuman berjalan kontinu spesifikasi teknis garmen dengan pausing saat hover dan dukungan aksesibilitas `prefers-reduced-motion`.
     - `SorotanKoleksiDrop.tsx`: Grid 4 artikel unggulan etalase dengan integrasi `KartuProduk` dan link dinamis ke katalog.
     - `FiturUtamaMaterial.tsx`: Kampanye visual beton brutalis, kartu segel otentikasi VOID Archive Edition, dan inspeksi makro kerapatan kain 420 GSM loopback.
     - `ManifestoBrand.tsx`: 3 pilar filosofi operasional (01 // GSM Nyata, 02 // Edisi Terbatas, 03 // Transparansi Ukuran Presisi).
     - `NewsletterVIP.tsx`: Formulir langganan akses awal Drop 05 dengan validasi ramah pengguna, umpan balik sonner toast, dan nol teks em dash.

2. **Kepatuhan Aksesibilitas WCAG AA & Anti-Slop Mode 1 (DURING)**:
   - Seluruh elemen interaktif memiliki tap target minimal 44px (`min-h-11`).
   - Kontras warna teks memenuhi rasio 4.5:1 untuk teks normal dan 3:1 untuk teks besar.
   - Zero em dash (`—`) pada seluruh copywriting antarmuka, komentar kode, dan skema validasi.

---

## 19. Fase 3A: Admin & Operations Portal (Internal Control Center & Inventory Ledger)

1. **Klarifikasi & Pemisahan Lingkungan (Environment Separation)**:
   - **Local Development**: PostgreSQL 18 kluster lokal via `pg_ctl` (`localhost:5432/void_supply`), email mode outbox/console log, server lokal `localhost:3000`.
   - **Staging Demo (Fokus Aktif)**: Database Neon Serverless PostgreSQL (`neon.tech`), email transaksional via Nodemailer & Google App Password Gmail SMTP (`abdulmusic543@gmail.com`), deployment di Vercel Free Plan + Sentry Free Plan observabilitas.
   - **Production (Di Luar Scope Saat Ini)**: Standar web hosting Hostinger MySQL, email kustom domain, CI/CD pipeline langsung.

2. **Server-Authoritative RBAC Guard (`auth-guard.ts`)**:
   - Fungsi pengaman `verifikasiStafAdmin()` memvalidasi sesi terotentikasi server-side dan memeriksa kolom `peran` pada tabel `pengguna`.
   - Hanya peran `"admin"` dan `"operator"` yang diizinkan mengakses rute `/admin/*` dan mengeksekusi Server Action administratif. Akun biasa (`peran: "pelanggan"`) ditolak secara fail-closed dengan respons `403 // AKSES DITOLAK`.

3. **Buku Besar Inventaris Imutabel & Skema Audit (`admin.schema.ts`)**:
   - `riwayat_mutasi_stok`: Buku besar mutasi stok imutabel (`restock`, `koreksi_fisik`, `retur`, `rusak`, `pesanan`). Mencatat kuantitas sebelum, perubahan kuantitas, kuantitas sesudah, nomor referensi PO/Order, dan identitas staf operator.
   - `catatan_operasional_pesanan`: Catatan internal tim gudang/operasional per pesanan dengan klasifikasi urgensi (`normal`, `penting`, `kritis`).
   - `audit_aktivitas_admin`: Log jejak audit kepatuhan setiap tindakan staf admin (mutasi manual, inquire gateway, pembatalan pesanan) beserta payload aman dan timestamp server.

4. **Kompak 5 Primitif UI Brutalist (`src/features/admin/components/primitives/`)**:
   - `BadgeStatusOperasional`: Lencana status kontras tinggi (emerald, amber, sky, violet, rose) dengan pulsating dot.
   - `KartuMetrikBrutalis`: Kartu ringkasan metrik bernuansa monospace, tipografi tebal, dan label teknis.
   - `FilterStatusTabs`: Komponen tab filter horizontal mobile-first dengan badge jumlah rekaman.
   - `TabelDataAdmin`: Komponen tabel data monospace terstruktur dengan penanganan loading state dan empty state.
   - `ModalAksiAdmin`: Modal dialog brutalist untuk konfirmasi tindakan berisiko (penyesuaian stok, pembatalan pesanan).

5. **Fitur & Rute Operasional Admin**:
   - `/admin`: Dasbor ringkasan metrik omzet, total pesanan, pesanan butuh aksi, dan deteksi SKU stok menipis.
   - `/admin/pesanan`: Manajemen daftar pesanan dengan filter status, pencarian nomor pesanan, dan ringkasan pemenuhan.
   - `/admin/pesanan/[nomorPesanan]`: Panel detail pesanan lengkap, sinkronisasi gateway Midtrans via Server Action `inquireMidtransStatusAction()`, pembatalan pesanan dengan pengembalian stok atomik Compare-and-Set, dan formulir penambahan catatan internal operasional.
   - `/admin/inventaris`: Monitoring stok seluruh varian SKU, indikator peringatan stok kritis (`stok <= 5`), dan modal penyesuaian stok manual dengan penguncian atomik CAS.
   - `/admin/inventaris/mutasi`: Rekam jejak audit buku besar mutasi stok imutabel.
   - `/admin/aktivitas`: Jejak audit aktivitas staf dan gateway logging.

6. **Kualitas & Verifikasi Rilis**:
   - 104 pengujian unit Vitest lulus 100% (termasuk suite `admin-flow.test.ts`).
   - 0 kesalahan linter ESLint (`npm run lint`).
   - 0 galat tipe TypeScript (`npm run typecheck`).
   - Kompilasi dan optimasi bundle produksi Next.js Turbopack (`npm run build`) berhasil sukses dengan seluruh rute admin bertipe dynamic on-demand (`ƒ`).

---

## 20. Fase 3B: Batch Fulfillment & Bulk Thermal Airwaybill (Resi & Invoice Modularization)

1. **Modularisasi UI Primitif Pelanggan (`src/components/ui/`)**:
   - `TombolBrutalis`: Tombol aksi berspesifikasi streetwear brutalis dengan 5 varian (`primer`, `sekunder`, `outline`, `bahaya`, `ghost`), status loading terintegrasi, dan tap target aman `min-h-11` (44px).
   - `InputTeksBrutalis`: Formulir masukan teks dengan penanganan pesan galat Zod dan label kontras tinggi.
   - `BadgeStatusStorefront`: Lencana semantik status transaksi pelanggan (`lunas`, `menunggu`, `diproses`, `dikirim`, `batal`).
   - `ModalDialogBrutalis`: Dialog modal aksesibel dengan pendengar tombol ESC, backdrop blur, dan keyboard trap.

2. **Modularisasi Dokumen Cetak Resi & Faktur**:
   - `LabelThermalPengiriman` (`src/features/shipping/`): Label thermal standar logistik 100mm x 150mm dengan barcode Code128 SVG native, tipografi monospace kontras tinggi, dan aturan CSS `print:break-after-page` tanpa margin berlebih.
   - `FakturTransaksi` (`src/features/checkout/`): Faktur elektronik resmi format A4 potret dengan stempel verifikasi elektronik, rincian biaya, dan integritas hash transaksi.
   - Rute pelanggan `/pesanan/[nomorPesanan]/resi` dan `/pesanan/[nomorPesanan]/faktur` direfaktor menjadi komponen pembungkus ramping yang memanfaatkan komponen modular tersebut.

3. **Mekanisme Batch Fulfillment & Penghematan Biaya Biteship**:
   - Server Action `batchRequestPickupBiteshipAction`: Menerima daftar nomor pesanan dan mengeksekusi request pickup kurir secara sekuensial mandiri (*isolated per-order loop*).
   - **Cost Guardrail (P0)**: Pesanan yang telah mengantongi `nomorResi` atau `biteshipOrderId` di database dilewati dari pemanggilan API Biteship ulang guna menghemat kuota biaya saldo API, namun tetap disertakan ke daftar sukses cetak resi.
   - Pembaruan status pesanan atomik Compare-and-Set (`diproses` -> `dikirim`), pencatatan audit log `auditAktivitasAdmin`, pencatatan catatan operasional internal, serta penjadwalan email notifikasi resi otomatis ke `tugasOutbox`.

4. **Client Island Tabel Pesanan Interaktif (`TabelPesananAdminClient.tsx`)**:
   - Seleksi baris fleksibel berbasis `Set<string>` dengan kotak centang (checkbox) individual dan header "Pilih Semua".
   - Bilah kendali mengambang brutalis (*Floating Bottom Action Bar*) yang aktif saat minimal 1 pesanan dipilih:
     - Indikator jumlah pesanan terpilih.
     - Tombol "REQUEST PICKUP BITESHIP (X)" (hanya aktif untuk pesanan berstatus `diproses`).
     - Tombol "CETAK BULK RESI (Y)" (hanya aktif untuk pesanan yang telah memiliki nomor resi).
     - Tombol batalkan seleksi.
   - Modal Rekapitulasi Hasil Batch: Menampilkan metrik total sukses vs gagal, rincian resi baru yang terbit, rincian pesan kesalahan pesanan gagal, dan tombol langsung "CETAK RESI SUKSES" yang membuka tab cetak bulk resi.

5. **Rute Cetak Bulk Resi Thermal Kontinu (`/admin/pesanan/batch-resi`)**:
   - Rute Server Component dinamis yang memverifikasi autentikasi staf via `verifikasiStafAdmin()`.
   - Mengambil data seluruh pesanan terkait dalam satu batch query relasional.
   - Menampilkan bilah kendali atas (`BilahKendaliCetakBulk`) dengan tombol "CETAK SEMUA" (`window.print()`) yang otomatis disembunyikan saat dialog cetak peramban aktif via `@media print`.
   - Menghasilkan rangkaian stiker label thermal 100x150mm kontinu menggunakan komponen `LabelThermalPengiriman` dengan jeda halaman fisik otomatis (`print:break-after-page`).

6. **Kualitas & Verifikasi Rilis**:
   - 107 pengujian unit Vitest lulus 100% (termasuk 3 pengujian baru pada `batch-fulfillment.test.ts`).
   - 0 kesalahan linter ESLint (`npm run lint`).
   - 0 galat tipe TypeScript (`npm run typecheck`).
   - Next.js Turbopack production build (`npm run build`) berhasil sukses dengan 28 halaman statis dan rute dinamis baru `/admin/pesanan/batch-resi`.



