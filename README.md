# VOID Supply

Platform e-commerce modern untuk penjualan merchandise eksklusif dengan target pasar usia 18 hingga 30 tahun.

---

## Tech Stack Resmi & Versi Terintegrasi

- **Framework**: [Next.js 16](https://nextjs.org/) (`16.3.8`) dengan App Router dan Turbopack
- **UI & State**: [React 19.3](https://react.dev/) (`19.3.0`), React Context, [Zustand](https://github.com/pmndrs/zustand) (`5.0.3`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`4.0.0`) & Native CSS
- **Build & Unit Testing**: [Vite 6](https://vite.dev/) (`6.2.0`) & [Vitest](https://vitest.dev/) (`3.0.7`) dengan `@tailwindcss/vite`
- **Komponen UI**: [shadcn/ui](https://ui.shadcn.com/) primitives (`cva`, `clsx`, `tailwind-merge`, `lucide-react`)
- **Validasi & Form**: [Zod](https://zod.dev/) (`3.24.2`) & [React Hook Form](https://react-hook-form.com/) (`7.54.2`) dengan `@hookform/resolvers` (`3.10.0`)
- **Data Fetching / Server State**: [TanStack Query v5](https://tanstack.com/query) (`5.67.1`)
- **Database & ORM**: PostgreSQL 18 (`18.6`) + [Drizzle ORM](https://orm.drizzle.team/) (`0.45.3`) dengan `drizzle-kit` (`0.30.5`)
- **Payment Gateway**: Midtrans Snap API (`midtrans-client 1.4.3`)
- **Logistik & Kurir**: Biteship API (`axios 1.7.9`)
- **E2E Testing**: [Playwright](https://playwright.dev/) (`1.51.0`)
- **Monitoring**: [Sentry](https://sentry.io/) (`11.4.0`)
- **Deployment**: [Vercel](https://vercel.com/) (`vercel.json` zero-config deployment)

---

## Struktur Folder Proyek

```text
VOID Supply/
├── .agents/                 # Workspace rules untuk Antigravity / Gemini CLI (lokal)
│   └── rules/
│       ├── antislop.md      # Aturan Anti-Slop Mode 1 (DURING)
│       └── typescript-expert.md # Aturan strict typing & inference
├── .vscode/                 # Konfigurasi editor VS Code
│   ├── settings.json        # Layout fokus, Copilot nonaktif, Antigravity utama, Material Icons
│   ├── extensions.json      # Rekomendasi ekstensi gratis & efisien
│   ├── launch.json          # Debugging Google Chrome, Next.js Server & Vitest
│   ├── tasks.json           # Task otomatisasi npm dev, build, test, drizzle studio
│   └── nextjs.code-snippets # Kumpulan snippet Next.js 16, Zod, Drizzle, Vitest
├── docs/                    # Dokumentasi kurikulum bootcamp & riset VOID Supply
│   ├── bootcamp/
│   │   └── module-01/       # Modul 01: Riset Produk, Keputusan Rekayasa & Arsitektur
│   └── research/
│       └── competitor-analysis.md # Analisis kompetitor (Erigo, Thanksinsomnia, Screamous)
├── src/
│   ├── app/                 # Halaman App Router & Route Handlers
│   ├── components/          # UI primitives & komponen reusable
│   ├── features/            # Feature-sliced modules (keranjang, checkout, produk)
│   ├── lib/                 # Integrasi pihak ketiga (db/drizzle, payment, shipping)
│   ├── types/               # Tipe TypeScript global & domain
│   └── data/
│       └── products.ts      # Data produk merchandise awal (0 byte placeholder)
├── .editorconfig            # Standarisasi indentasi & format berkas
├── .env.example             # Template variabel lingkungan
├── .env                     # File env lokal development (diabaikan Git)
├── .gitignore               # Aturan pengabaian file Git
├── drizzle.config.ts        # Konfigurasi Drizzle ORM PostgreSQL
├── next.config.ts           # Konfigurasi Next.js 16
├── package.json             # Konfigurasi dependensi & scripts
├── CUSTOMER_JOURNEY_MAP.md  # Pemetaan perjalanan pelanggan Rian The Trendsetter (5 Stages)
├── PERSONA.md               # Analisis persona pembeli merchandise & admin toko
├── SITE-MAP.md              # Arsitektur informasi & peta situs 7 halaman utama
├── WIREFRAME.md             # Perencanaan wireframe, hierarki konten, komponen & interaksi Adobe XD
├── playwright.config.ts     # Konfigurasi E2E testing Playwright
├── postcss.config.mjs       # Konfigurasi PostCSS Tailwind CSS v4
├── tsconfig.json            # Konfigurasi TypeScript Strict
├── vercel.json              # Konfigurasi deployment Vercel
├── vite.config.ts           # Konfigurasi Vite 6, Tailwind v4 Vite plugin & Vitest
├── GEMINI.md                # Aturan sistem, konvensi penamaan Bahasa Indonesia & constraints
└── PRD.md                   # Spesifikasi kebutuhan produk VOID Supply
```

---

## Komparasi Repositori: Actual Local vs. GitHub Remote

| Komponen / Berkas                                  | Repositori Aktual (Lokal)                               | Repositori GitHub (`origin/main`)  | Keterangan & Proteksi                                    |
| :------------------------------------------------- | :------------------------------------------------------ | :--------------------------------- | :------------------------------------------------------- |
| **Berkas Lingkungan (.env)**                       | Ada (`.env` lokal dengan kredensial sandbox)            | Tidak ada (diabaikan `.gitignore`) | Menjaga keamanan API key dan password basis data         |
| **Aturan Agen (.agents/)**                         | Ada (`rules/antislop.md`, `rules/typescript-expert.md`) | Tidak ada (diabaikan `.gitignore`) | Konfigurasi internal agen AI lokal                       |
| **Dokumentasi Bootcamp (docs/)**                   | Ada (`docs/bootcamp/module-01/*`)                       | Ada (`docs/bootcamp/module-01/*`)  | Sinkron hasil merge PR #1 di GitHub                      |
| **Riset Kompetitor (docs/research/)**              | Ada (`docs/research/competitor-analysis.md`)            | Ada                                | Analisis gap kompetitor Erigo, Thanksinsomnia, Screamous |
| **Persona Pengguna (PERSONA.md)**                  | Ada                                                     | Ada                                | Sinkron di kedua repositori                              |
| **Customer Journey Map (CUSTOMER_JOURNEY_MAP.md)** | Ada                                                     | Ada                                | Sinkron di kedua repositori                              |
| **Peta Situs (SITE-MAP.md)**                       | Ada                                                     | Ada                                | Arsitektur informasi 7 halaman utama situs web           |
| **Basis Data PostgreSQL**                          | Berjalan di port 5432 via `pg_ctl`                      | Tidak ada server fisik             | Dikelola melalui migrasi skema Drizzle ORM               |
| **Cache Build (\*.tsbuildinfo)**                   | Ada (`tsconfig.tsbuildinfo`)                            | Tidak ada (diabaikan `.gitignore`) | Cache kompilasi TypeScript lokal                         |

---

## Memulai Pengembangan

### 1. Prasyarat Sistem

- **Node.js**: `v22.23.2` atau lebih baru
- **npm**: `10.9.8`
- **PostgreSQL**: `18.6` (Cluster lokal port `5432`)
- **Antigravity CLI / Gemini CLI**: `agy 1.2.5`
- **Browser Utama**: Google Chrome

### 2. Aktivasi PostgreSQL Lokal (`pg_ctl`)

Jika PostgreSQL belum berjalan di Windows:

```powershell
# Menjalankan PostgreSQL Server
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" -l "C:\Users\Acer\scoop\persist\postgresql\data\server.log" start

# Memeriksa status server
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" status
```

### 3. Database & Migrasi

Database lokal `void_supply` telah disiapkan dalam kondisi bersih (dari 0). Untuk menerapkan skema Drizzle:

```bash
npm run db:push
npm run db:studio
```

### 4. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada Google Chrome.

---

## Skrip & Pengujian

```bash
# Jalankan unit / integration test (Vitest)
npm run test

# Jalankan pengujian interaktif (Vitest watch)
npm run test:watch

# Jalankan end-to-end test (Playwright)
npm run test:e2e

# Pemeriksaan linter ESLint
npm run lint

# Format berkas kode
npm run format
```

---

## Konvensi & Pedoman Kode

Lihat panduan lengkap di [`GEMINI.md`](file:///c:/Projects/VOID%20Supply/GEMINI.md) untuk konvensi penamaan Bahasa Indonesia serta aturan Anti-Slop (Mode 1: DURING).
