# VOID Supply 🚀

E-Commerce platform modern untuk penjualan merchandise eksklusif dengan target pasar usia 18–30 tahun.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & State**: [React 19.3](https://react.dev/), React Context, [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Native CSS
- **Komponen**: [shadcn/ui](https://ui.shadcn.com/) primitives (`cva`, `clsx`, `tailwind-merge`, `lucide-react`)
- **Validasi & Form**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Data Fetching / Server State**: [TanStack Query v5](https://tanstack.com/query)
- **Database & ORM**: PostgreSQL 18 + [Drizzle ORM](https://orm.drizzle.team/)
- **Payment Gateway**: Midtrans Snap API
- **Logistik & Pengiriman**: Biteship API
- **Pengujian**: [Vitest](https://vitest.dev/), React Testing Library, [Playwright](https://playwright.dev/)
- **Monitoring**: [Sentry](https://sentry.io/)
- **Hosting / Deploy**: Vercel

---

## 📁 Struktur Folder Proyek

```text
VOID Supply/
├── .vscode/                 # Konfigurasi editor & snippets kustom
│   ├── settings.json        # Layout UI fokus tinggi, Copilot nonaktif, Antigravity utama
│   ├── extensions.json      # Rekomendasi ekstensi gratis & efisien
│   └── nextjs.code-snippets # Snippet produktivitas stack Next.js, Zod, Drizzle
├── src/
│   ├── app/                 # Halaman App Router & Route Handlers
│   ├── components/          # UI primitives & komponen reusable
│   ├── features/            # Feature modules (keranjang, checkout, produk, dll.)
│   ├── lib/                 # Integrasi client (database, payment, shipping)
│   ├── types/               # Tipe TypeScript global & domain
│   └── data/
│       └── products.ts      # Data produk merchandise
├── drizzle.config.ts        # Konfigurasi Drizzle ORM
├── next.config.ts           # Konfigurasi Next.js 16
├── tsconfig.json            # Konfigurasi TypeScript Strict
├── GEMINI.md                # Aturan sistem, konvensi penamaan Bahasa Indonesia & constraints
└── PRD.md                   # Dokumen Product Requirements
```

---

## ⚡ Memulai Pengembangan

### 1. Prasyarat Sistem
- **Node.js**: `v22.x` atau lebih baru
- **PostgreSQL**: `18.x` (Port default: `5432`)
- **Git** & **GitHub CLI (`gh`)**

### 2. Aktivasi PostgreSQL Lokal (`pg_ctl`)
Jika menggunakan Scoop PostgreSQL pada Windows:
```powershell
# Jalankan PostgreSQL Server
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" -l "C:\Users\Acer\scoop\persist\postgresql\data\server.log" start

# Cek Status
pg_ctl -D "C:\Users\Acer\scoop\persist\postgresql\data" status
```

### 3. Salin Environment Variables
```bash
cp .env.example .env.local
```
Sesuaikan `DATABASE_URL`, kredensial `MIDTRANS_*`, dan `BITESHIP_API_KEY`.

### 4. Instalasi Dependensi & Database Push
```bash
npm install
npm run db:push
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian & Kualitas Kode

```bash
# Unit & Integration Test (Vitest)
npm run test

# End-to-End Test (Playwright)
npm run test:e2e

# Linting
npm run lint

# Format Kode
npm run format
```

---

## 📋 Konvensi & Aturan Proyek
Lihat panduan lengkap di [`GEMINI.md`](file:///c:/Projects/VOID%20Supply/GEMINI.md) untuk konvensi penamaan domain dalam Bahasa Indonesia serta arsitektur sistem.
