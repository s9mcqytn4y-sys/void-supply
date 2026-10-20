# VOID Supply: Baseline Arsitektur & Inventaris Dependensi (Fase 1A)

Dokumen ini memetakan kondisi aktual basis kode VOID Supply pada commit pasca-Fase 0, mencatat bukti empiris inventaris dependensi, batas domain antarmodul, berkas hotspot berisiko tinggi, serta rencana aksi pembersihan berurutan (Fase 1B hingga 1G).

---

## 1. Status Resolusi Masalah Kritis (Residual P0 Resolution)

Berdasarkan hasil audit post-commit dan verifikasi uji, seluruh residual P0 telah dimitigasi secara penuh:

| Kode Masalah | Deskripsi Masalah Awal | Status Resolusi | Bukti Implementasi & Pengujian |
|---|---|---|---|
| **P0-A** | Pembatalan admin mengizinkan status 'dikirim' / 'selesai' | **RESOLVED** | Invarian state machine diterapkan pada `batalkanPesananAdminAction`: hanya status `menunggu_pembayaran` dan `diproses` yang dapat dibatalkan. Pesanan dalam pengiriman atau selesai ditolak. |
| **P0-B** | Webhook Biteship tidak memverifikasi secret pada staging | **RESOLVED** | Fail-closed guard diperluas ke seluruh public deployment (`production`, `staging`, `VERCEL`). Tanpa secret, permintaan ditolak HTTP 500. |
| **P0-C** | Log password admin demo tercetak polos di CI | **RESOLVED** | Logging kredensial pada `src/lib/db/seed.ts` disanitasi penuh (`[Kredensial diamankan]`), mendukung variabel lingkungan `SEED_ADMIN_PASSWORD`. |
| **P0-D** | Validasi Better Auth secret lemah di staging | **RESOLVED** | Entropi minimal 32 karakter divalidasi ketat pada `src/lib/auth/auth.ts` untuk staging dan produksi. |
| **P0-E** | HTTP 404 pada cron staging GitHub Actions | **RESOLVED** | Secret `STAGING_APP_URL` diselaraskan ke `https://void-supply-lemon.vercel.app`, langkah outbox didecouple dengan `continue-on-error` pada expiry. Workflow run `#39451795139` sukses 100%. |

---

## 2. Inventaris Dependensi & Analisis Beban Paket

### A. Dependensi Runtime (`dependencies`)

| Paket | Versi | Status Penggunaan | Rekomendasi Aksi Fase 1B |
|---|---|---|---|
| `next` | `^16.3.8` | **Aktif** (Core Framework, App Router, Turbopack) | Pertahankan |
| `react` / `react-dom` | `^19.3.0` | **Aktif** (UI Library & RSC Runtime) | Pertahankan |
| `drizzle-orm` | `^0.45.3` | **Aktif** (PostgreSQL ORM & Schema) | Pertahankan |
| `postgres` | `^3.4.5` | **Aktif** (Driver PostgreSQL lokal & direct connection) | Pertahankan |
| `@neondatabase/serverless` | `^1.2.0` | **Aktif** (Pooled connection & WebSocket Vercel) | Pertahankan |
| `better-auth` | `^1.7.10` | **Aktif** (Sistem autentikasi & sesi PostgreSQL) | Pertahankan |
| `zod` | `^3.24.2` | **Aktif** (Validasi skema runtime & tipe) | Pertahankan |
| `zustand` | `^5.0.3` | **Aktif** (State keranjang belanja & hidrasi klien) | Pertahankan |
| `react-hook-form` | `^7.54.2` | **Aktif** (Formulir pengiriman & checkout) | Pertahankan |
| `@hookform/resolvers` | `^3.10.0` | **Aktif** (Penghubung Zod ke React Hook Form) | Pertahankan |
| `midtrans-client` | `^1.4.3` | **Aktif** (Snap Gateway API) | Pertahankan |
| `nodemailer` | `^10.1.2` | **Aktif** (Pengiriman email transaksional via Gmail/SMTP) | Pertahankan |
| `@sentry/nextjs` | `^11.7.0` | **Aktif** (Observabilitas error monitoring) | Pertahankan |
| `@vercel/functions` | `^3.10.1` | **Aktif** (Latar belakang serverless tak-terblokir via `waitUntil`) | Pertahankan |
| `lucide-react` | `^0.479.0` | **Aktif** (Ikon UI antarmuka) | Pertahankan |
| `clsx` / `tailwind-merge` | `^2.1.1` / `^3.0.2` | **Aktif** (Utilitas peracik kelas Tailwind) | Pertahankan |
| `class-variance-authority` | `^0.7.1` | **Aktif** (Varian komponen tombol & badge) | Pertahankan |
| `sonner` | `^2.0.8` | **Aktif** (Komponen toast notifikasi) | Pertahankan |
| `ws` | `^8.22.0` | **Aktif** (WebSocket driver untuk Neon serverless) | Pertahankan |
| `axios` | `^1.7.9` | **Dihapus** (Dimigrasikan ke native `fetch` dengan `AbortSignal.timeout`) | Selesai pada Fase 1B |
| `@tanstack/react-query` | `^5.67.1` | **Dihapus** (0 baris impor pada seluruh `src/`) | Selesai pada Fase 1B |
| `@neon/config` / `@neon/env` | `^1.9.2` / `^1.6.3` | **Dihapus** (Berkas `neon.ts` dieliminasi) | Selesai pada Fase 1B |
| `pg` | `^8.13.3` | **Redundan** (Koneksi aktif menggunakan `postgres` & `@neondatabase/serverless`) | Evaluasi dan hapus jika tidak dibutuhkan adapter Better Auth |

---

## 3. Peta Batas Modul & Hotspot Kode (Top 10 Files by LOC)

Hasil pemindaian kompleksitas dan volume baris pada direktori `src/`:

```
1. src/lib/db/seed.ts                               (1081 baris) -> Skrip seed skenario pengujian & katalog
2. src/features/admin/actions/pesanan-admin.action.ts (751 baris)  -> Orkestrasi pesanan, resi, fulfillment, dan pembatalan
3. src/features/checkout/actions/buat-pesanan.action.ts (589 baris)-> Reservasi dua fase, validasi stok, dan Snap checkout
4. src/lib/services/biteship.service.ts             (546 baris)  -> Klien logistik eksternal Biteship API
5. src/lib/db/schema.ts                             (530 baris)  -> Definisi skema relasional tabel inti
6. src/features/checkout/context/CheckoutContext.tsx (494 baris) -> Context dan state machine checkout pelanggan
7. src/features/account/components/BukuAlamatAkun.tsx (463 baris) -> Komponen manajemen buku alamat pelanggan
8. src/features/checkout/components/InAppPaymentViewer.tsx (404 baris) -> Modal pembayaran Snap dan simulator sandbox
9. src/features/admin/components/TabelPesananAdminClient.tsx (404 baris) -> Tabel data pesanan admin dan filter batch
10. src/lib/services/email.service.ts                (397 baris)  -> Template HTML dan transmisi email pesanan
```

### Analisis Arsitektur & Batas Tanggung Jawab:

1. **Pemisahan Domain Order & Fulfillment**:
   `pesanan-admin.action.ts` (751 baris) menangani terlalu banyak tanggung jawab sekaligus (query daftar, detail, ubah kurir, request pickup Biteship, pembatalan pesanan, dan pencatatan catatan operasional). Pada Fase 1C, modul ini perlu dipecah menjadi:
   - `pesanan-query.action.ts` (Read-only daftar & detail)
   - `pesanan-lifecycle.action.ts` (State machine: pembatalan, pelunasan)
   - `pesanan-fulfillment.action.ts` (Integrasi pengiriman & resi)

2. **Konsolidasi HTTP Client**:
   `biteship.service.ts` masih mengandalkan library `axios`. Mengingat runtime Next.js 16 berjalan di Node 22+ dengan native fetch terintegrasi cache dan timeout (`AbortSignal.timeout()`), penghapusan Axios akan mengurangi ukuran dependency bundle node_modules secara signifikan.

3. **Integritas Hidrasi State Klien**:
   `CheckoutContext.tsx` (494 baris) telah berhasil menggantikan `useCheckout.ts` lama yang redundan. Sinkronisasi keranjang belanja melalui `CartHydrationProvider.tsx` terbukti stabil pada pengujian browser Playwright lintas refresh dan reload sesi.

---

## 4. Rencana Kerja Eksekusi Fase 1 (Slices of Pull Requests)

Sesuai panduan Ponytail dan strategi PR kecil terisolasi:

```
[Fase 1A: Baseline Arsitektur] -> Dokumen Baseline (Selesai)
       │
       ▼
[Fase 1B: Pembersihan Dead Code & Dependensi] -> Selesai
       │ -> Dihapus: @tanstack/react-query, @neon/config, @neon/env, axios, neon.ts
       │ -> Refactor: axios digantikan native fetch di biteship.service.ts
       │ -> Verifikasi: 115 tes Vitest lulus, 16 tes Playwright lulus, 0 tsc error
       │
       ▼
[Fase 1C: Pemisahan Domain Use-Cases] -> Selesai
       │ -> Dekomposisi pesanan-admin.action.ts menjadi Query, Lifecycle, & Fulfillment
       │ -> Mempertahankan facade re-export non-destruktif (Zero breaking changes)
       │ -> LOC file utama berkurang dari 829 baris menjadi 11 baris
       │ -> Verifikasi: 115 tes Vitest lulus, 0 tsc error
       │
       ▼
[Fase 1D: Keandalan Outbox & Asinkron] -> Selesai
       │ -> Penguatan lease timeout reaper dan proteksi dead-letter queue untuk kuota percobaan habis
       │ -> Penambahan skenario failure injection, dead-letter DLQ, dan recovery di outbox.test.ts
       │ -> Verifikasi: 119 tes Vitest lulus (20 file uji), 0 tsc error
       │
       ▼
[Fase 1E: Neon PostgreSQL & Migrations Hardening]
       │ -> Audit indeks kueri admin pesanan (EXPLAIN ANALYZE)
       │ -> Pemisahan branch database staging vs development
       │
       ▼
[Fase 1F: UI Primitives & Admin Accessibility]
       │ -> Standarisasi komponen tabel, modal, dan drawer admin
       │ -> Verifikasi aksesibilitas keyboard dan mobile tap target 44px
```

---

## 5. Ringkasan Kualitas & Release Gate Baseline

- **Unit & Contract Testing**: 119 pengujian lulus (20 file uji) via Vitest.
- **End-to-End Testing**: 16 pengujian browser lulus via Playwright Chromium.
- **Static Typing**: 0 kesalahan kompilasi TypeScript (`npx tsc --noEmit`).
- **Linter & Format**: 0 peringatan format Tailwind CSS kanonikal.
- **Anti-Slop Compliance**: 0 kemunculan karakter em dash pada seluruh berkas kode dan dokumentasi.
- **Deployment Safety**: Tidak ada deploy manual ke production; seluruh pengujian divalidasi lokal dan GitHub CI.
