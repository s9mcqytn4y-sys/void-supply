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

## 5. Implementasi Aturan TypeScript Expert (`/typescript-expert`)

1. **Strict Type Safety**: Dilarang keras menggunakan tipe `any`. Gunakan `unknown` bila tipe belum pasti dan parse dengan Zod.
2. **Inference Over Annotation**: Manfaatkan `z.infer<typeof schema>` untuk menghindari duplikasi interface.
3. **Discriminated Unions**: Gunakan pola discriminated unions pada state transaksi dan status pengiriman.
4. **Const Assertions**: Terapkan `as const` pada nilai konfigurasi statis.

---

## 6. Konvensi Penamaan (Bahasa Indonesia)

Seluruh entitas domain bisnis dan database wajib mengikuti konvensi Bahasa Indonesia:

- **Tabel Drizzle**: Menggunakan nama entitas tunggal yang mencakup produk, pesanan, item_pesanan, pelanggan, inventaris, pembayaran, dan pengiriman.
- **Kolom Timestamp**: Ditetapkan secara konsisten dengan penamaan dibuat_pada serta diperbarui_pada.
- **Type atau Interface TypeScript**: Merepresentasikan entitas bisnis seperti Produk, Pesanan, Pelanggan, StatusPembayaran, dan OpsiPengiriman.
- **Zod Schema**: Skema validasi runtime seperti produkSkema, pesananSkema, dan checkoutSkema.
- **Server Actions**: Fungsi operasional server seperti buatPesanan(), ambilDaftarProduk(), prosesWebhookMidtrans(), serta cekOngkirBiteship().

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
- `next.config.ts`: Konfigurasi Next.js 16 App Router beserta optimasi gambar.
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
