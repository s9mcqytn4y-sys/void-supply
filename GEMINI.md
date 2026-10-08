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

- Dilarang membuat banner separator dekoratif (`// =======================`).
- Dilarang menarasikan kode yang sudah jelas (`// Initialize state`).
- Dilarang menggunakan emoji dekoratif pada komentar (`// 🚀 Performance`).
- Pertahankan komentar yang menjelaskan keputusan bisnis, pertimbangan keamanan, dan integrasi webhook.

### C. Liveliness & Visual Dials (`/antislop-ui`)

- **ENERGY**: Dial 2 (Balanced) : modern streetwear aesthetic.
- **RHYTHM**: Dial 2 (Consistent with deliberate accents) : komposisi produk teratur dengan ritme visual menarik.
- **MOTION**: Dial 1–2 (Subtle micro-animations) : transisi hover halus dan responsif.
- Batasi palet aktif: maksimal 2–3 warna utama + 1 warna aksen terarah.

---

## 5. Implementasi Aturan TypeScript Expert (`/typescript-expert`)

1. **Strict Type Safety**: Dilarang keras menggunakan tipe `any`. Gunakan `unknown` bila tipe belum pasti dan parse dengan Zod.
2. **Inference Over Annotation**: Manfaatkan `z.infer<typeof schema>` untuk menghindari duplikasi interface.
3. **Discriminated Unions**: Gunakan pola discriminated unions pada state transaksi dan status pengiriman.
4. **Const Assertions**: Terapkan `as const` pada nilai konfigurasi statis.

---

## 6. Konvensi Penamaan (Bahasa Indonesia)

Seluruh entitas domain bisnis dan database wajib mengikuti konvensi Bahasa Indonesia:

- **Tabel Drizzle**: `produk`, `pesanan`, `item_pesanan`, `pelanggan`, `inventaris`, `pembayaran`, `pengiriman`.
- **Kolom Timestamp**: `dibuat_pada`, `diperbarui_pada`.
- **Type/Interface TypeScript**: `Produk`, `Pesanan`, `Pelanggan`, `StatusPembayaran`, `OpsiPengiriman`.
- **Zod Schema**: `produkSkema`, `pesananSkema`, `checkoutSkema`.
- **Server Actions**: `buatPesanan()`, `ambilDaftarProduk()`, `prosesWebhookMidtrans()`, `cekOngkirBiteship()`.

---

## 7. Batasan Struktur Kode & Keamanan

- **Folder `src/`**: Modul katalog aktif menggunakan PostgreSQL 18 via Drizzle ORM (`src/features/catalog/`), terbagi rapi ke dalam repositories, services, components, schemas, dan types. Seluruh data dummy statis telah dihapus demi integritas relasional.
- **Kredensial**: Dilarang melakukan commit terhadap secret atau API key asli ke Git. Selalu gunakan file template `.env.example`.

---

## 8. Status Repositori (Actual Local vs. GitHub Remote) & Evaluasi Berkas Root

### A. Komparasi Repositori

1. **Repositori Aktual (Lokal di `c:\Projects\VOID Supply`)**:
   - Memiliki berkas `.env` aktif yang berisi kredensial sandbox lokal (Midtrans, Biteship, RajaOngkir).
   - Memiliki direktori konfigurasi `.agents/rules/` (`antislop.md`, `typescript-expert.md`) untuk panduan agen AI lokal (Antigravity dan Gemini CLI `agy`). Direktori ini sengaja dikecualikan di `.gitignore` agar tidak masuk repositori publik.
   - Menggunakan database PostgreSQL lokal aktif pada port 5432 (`void_supply`).
   - Menyimpan cache build seperti `tsconfig.tsbuildinfo` yang diabaikan oleh `.gitignore`.
   - Memuat dokumen persona pengguna `PERSONA.md` di root proyek.

2. **Repositori GitHub (`origin/main` : `s9mcqytn4y-sys/void-supply`)**:
   - Berkas rahasia `.env` tidak ada (dilindungi oleh `.gitignore`), hanya menyertakan `.env.example`.
   - Menyimpan dokumen riset produk dan arsitektur resmi di `docs/bootcamp/module-01/` dan `docs/bootcamp/module-02/` serta dokumen riset kompetitor, opportunity gap, dan prinsip UX di `docs/research/`.
   - Direktori `.agents/` tidak dipublikasikan ke remote.

### B. Evaluasi Berkas Root Proyek

- `.editorconfig`: Standarisasi indentasi (2 spasi), charset UTF-8, dan newline LF/CRLF.
- `.env`: Berkas rahasia lokal, terverifikasi aman dan tidak terlacak ke Git.
- `.env.example`: Templat publik variabel lingkungan untuk dokumentasi setup tim.
- `.gitignore`: Mengabaikan dependencies, build artifacts, `.env`, `.agents/`, dan test reports.
- `.prettierrc`: Konfigurasi formatting kode (single quote, trailing comma, semi).
- `drizzle.config.ts`: Konfigurasi Drizzle ORM PostgreSQL 18.
- `eslint.config.mjs`: Konfigurasi ESLint flat config dengan aturan Next.js dan TypeScript.
- `next.config.ts`: Konfigurasi Next.js 16 App Router.
- `package.json`: Definisi dependensi Next.js 16, React 19, Tailwind v4, Drizzle, Vitest.
- `playwright.config.ts`: Pengujian end-to-end browser Playwright.
- `postcss.config.mjs`: Integrasi Tailwind CSS PostCSS plugin.
- `tsconfig.json`: TypeScript strict mode dan path aliases (`@/*`).
- `vercel.json`: Konfigurasi deployment hosting serverless Vercel.
- `vite.config.ts`: Runner pengujian unit Vitest terintegrasi Tailwind v4.
- `GEMINI.md`: Aturan arsitektur, panduan sistem, konvensi penamaan, dan batasan implementasi.
- `PRD.md`: Spesifikasi kebutuhan produk dan modul fitur e-commerce.
- `README.md`: Panduan utama proyek, instalasi, dan struktur folder.
- `PERSONA.md`: Profil persona pembeli merchandise dan persona admin toko.
- `CUSTOMER_JOURNEY_MAP.md`: Peta perjalanan pengguna Rian The Trendsetter (5 stage: Awareness, Consideration, Decision, Purchase, Retention).
- `SITE-MAP.md`: Arsitektur informasi dan peta situs 7 halaman utama antarmuka toko.
- `WIREFRAME.md`: Perencanaan wireframe, hierarki konten, komponen antarmuka, interaksi, dan spesifikasi Adobe XD.
