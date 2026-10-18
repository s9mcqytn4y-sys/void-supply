# Rencana Arsitektur & Blueprint Implementasi: Fase 2 Authentication & Customer Account

> **Proyek**: VOID Supply (Brutalist Streetwear E-Commerce)  
> **Target Rilis**: Fase 2 (Identity, Session Management, Account Center, & Authenticated Checkout)  
> **Mode Kepatuhan**: Anti-Slop Mode 1 (DURING) : Zero Em Dash (`—`), Mobile-First, Strict Type Safety, Fail-Closed Security  
> **Basis Database**: PostgreSQL 18 & Neon Serverless + Drizzle ORM  
> **Framework Utama**: Next.js 16 (App Router) + Better Auth (Drizzle Adapter) + Zod 3 + React Hook Form  

---

## 1. Ringkasan Eksekutif & Status Audit

Berdasarkan audit komparasi commit terbaru (`f52e8e0`) dan sesi wawancara arsitektur, Fase 1A, 1B, dan 1C telah lulus pengujian dan terintegrasi ke branch utama.
Pekerjaan Fase 2 memposisikan **Autentikasi & Akun Pelanggan** bukan sebagai perombakan ulang domain transaksi yang sudah matang, melainkan sebagai **lapisan identitas dan otorisasi server-authoritative** di atas domain katalog, pesanan, inventaris, dan pengiriman.

### Keputusan Kunci Hasil Wawancara Arsitektur (/grill-me)

1. **Checkout Wajib Login & Email Terverifikasi**:
   - Pengunjung bebas menjelajahi katalog, PDP, dan menambahkan item ke keranjang belanja (Zustand client store).
   - Saat menekan tombol checkout, sistem memeriksa sesi aktif. Jika belum login atau email belum diverifikasi, pengguna diarahkan ke alur pendaftaran/masuk tanpa kehilangan isi keranjang.
   - Pesanan baru di server wajib terikat pada `pengguna_id` dari sesi server, bukan dari email yang dikirim frontend.

2. **Penyimpanan Sesi & Rate Limiting Terdistribusi**:
   - Memanfaatkan database-backed session di Neon PostgreSQL melalui tabel `sesi_pengguna` dan `batas_permintaan_auth`.
   - Mengeliminasi dependensi Redis eksternal demi efisiensi resource pada Vercel Hobby tanpa mengorbankan konsistensi serverless.

3. **Skema Relasional Non-Destruktif & Data Protection**:
   - Menambahkan kolom `pengguna_id` yang unik dan nullable pada tabel `pelanggan`.
   - Mempertahankan pesanan historis melalui foreign key `pelanggan_id` yang sudah ada, serta menyediakan tabel `klaim_pesanan` untuk klaim pesanan lawas via verifikasi aman.

4. **Hybrid Fail-Safe Email Provider**:
   - Menggunakan Resend REST API bila `RESEND_API_KEY` aktif di lingkungan deployment.
   - Mengalihkan pengiriman ke In-App Dev Mailbox terproteksi kunci operator (`?key=...`) dan antrean Transactional Outbox saat pengujian di staging/demo.

---

## 2. Gate 0: Remediasi Keamanan Kritis Sebelum Autentikasi (Blocking Security Gate)

Sebelum memulai deployment fitur autentikasi publik, celah keamanan pada lingkungan demonstrasi wajib ditutup:

### A. Proteksi Halaman /demo/inbox (SEC-01)

- **Celah**: Halaman demo membaca data `log_email` dan `outbox_pekerjaan` tanpa otentikasi, sehingga mengekspos alamat email dan payload token.
- **Remediasi yang Diterapkan**:
  1. Halaman `/demo/inbox` mewajibkan otorisasi melalui query parameter `?key=<kunci>` yang diverifikasi terhadap `DEMO_INBOX_KEY` atau `CRON_SECRET`.
  2. Alamat email penerima disamarkan otomatis (contoh: `us***r@example.com`).
  3. Payload JSON disaring melalui fungsi `bersihkanPayloadAman` untuk menyembunyikan token, kata sandi, dan kunci rahasia.
  4. Anonymous user tanpa kunci langsung menerima status akses ditolak (HTTP 403 Forbidden).

### B. Proteksi Seeder Destruktif (seed.ts)

- **Celah**: Skrip seeding default mengeksekusi penghapusan massal tabel pelanggan dan pesanan.
- **Remediasi yang Diterapkan**:
  1. Penghapusan data transaksi dan pelanggan hanya diizinkan bila environment variable `SEED_FORCE_RESET === "true"`.
  2. Eksekusi `npm run db:seed` standar beroperasi dalam mode aman (safe upsert), memperbarui metadata katalog tanpa menyentuh data akun pengguna atau pesanan riil.

---

## 3. Blueprint Skema Basis Data (Neon PostgreSQL + Drizzle ORM)

### A. Tabel Autentikasi Inti (src/lib/db/auth.schema.ts)

Tabel-tabel ini mengimplementasikan adapter Better Auth dengan konvensi penamaan Bahasa Indonesia:

1. **`pengguna` (User Identity)**:
   - `id`: `text` (Primary Key).
   - `nama`: `text` (Nama lengkap).
   - `email`: `text` (Unik, dinormalisasi ke huruf kecil).
   - `emailDiverifikasi`: `boolean` (Default: `false`).
   - `gambar`: `text` (Avatar URL opsional).
   - `peran`: `varchar(30)` (Default: `"pelanggan"`, dapat berisi `"admin"`, `"operator"`).
   - `dibuatPada`, `diperbaruiPada`: `timestamp with time zone`.

2. **`sesi_pengguna` (Session Tracking)**:
   - `id`: `text` (Primary Key).
   - `penggunaId`: `text` (FK ke `pengguna.id` on delete cascade).
   - `token`: `text` (Unik, token sesi berkriptografi tinggi).
   - `kedaluwarsaPada`: `timestamp with time zone`.
   - `ipAddress`, `userAgent`: `text`.

3. **`akun_autentikasi` (Credentials & OAuth)**:
   - `id`: `text` (Primary Key).
   - `penggunaId`: `text` (FK ke `pengguna.id` on delete cascade).
   - `accountId`: `text`.
   - `providerId`: `text` (`"credential"` atau provider OAuth).
   - `kataSandi`: `text` (Bcrypt/Argon2 password hash).

4. **`verifikasi_autentikasi` (Tokens & OTP)**:
   - `id`: `text` (Primary Key).
   - `identifier`: `text` (Alamat email tujuan verifikasi).
   - `value`: `text` (Hash token verifikasi sekali pakai).
   - `expiresAt`: `timestamp with time zone`.

5. **`batas_permintaan_auth` (Distributed Rate Limiting)**:
   - `id`: `text` (Primary Key).
   - `key`: `text` (Unik, kombinasi IP/aksi/email).
   - `count`: `integer`.
   - `lastRequest`: `timestamp with time zone`.

### B. Tabel Domain Customer Account & CRM

1. **`alamat_pelanggan` (Biteship-Ready Address Book)**:
   - `id`: `uuid` (Primary Key).
   - `penggunaId`: `text` (FK ke `pengguna.id` on delete cascade).
   - `label`: `varchar(40)` (Contoh: "Rumah", "Studio", "Kantor").
   - `namaPenerima`: `varchar(150)`.
   - `teleponPenerima`: `varchar(30)`.
   - `alamatLengkap`: `text`.
   - `provinsi`: `varchar(100)`.
   - `kota`: `varchar(100)`.
   - `kecamatan`: `varchar(100)`.
   - `kodePos`: `varchar(10)`.
   - `apakahUtama`: `boolean` (Default: `false`).
   - `catatanKurir`: `text` (Petunjuk penyerahan paket).

2. **`preferensi_pengguna` (Customer Settings)**:
   - `penggunaId`: `text` (Primary Key, FK ke `pengguna.id`).
   - `bahasa`: `varchar(10)` (Default: `"id"`).
   - `mataUang`: `varchar(10)` (Default: `"IDR"`).
   - `ukuranFavorit`: `varchar(20)` (Contoh: `"L"`, `"XL"`).
   - `modeTampilan`: `varchar(20)` (Default: `"dark"`).
   - `emailTransaksi`: `boolean` (Default: `true`).
   - `emailMarketing`: `boolean` (Default: `false`).

3. **`wishlist` (Koleksi Favorit)**:
   - `id`: `uuid` (Primary Key).
   - `penggunaId`: `text` (FK ke `pengguna.id` on delete cascade).
   - `produkId`: `uuid` (FK ke `produk.id` on delete cascade).
   - `varianIdPreferensi`: `uuid` (FK ke `varian_produk.id` on delete set null).
   - Unique Index: `(pengguna_id, produk_id)`.

4. **`keranjang_akun` & `item_keranjang_akun` (Multi-Device Cart Persistence)**:
   - Menghubungkan keranjang belanja akun aktif ke database, memungkinkan sinkronisasi keranjang antara desktop dan mobile browser setelah login.

5. **`aktivitas_akun` (Security Audit Trail)**:
   - Mencatat peristiwa keamanan: login berhasil, login gagal, perubahan kata sandi, verifikasi email, dan pencabutan sesi perangkat.

6. **`klaim_pesanan` (Historical Order Linking)**:
   - Menjembatani pesanan guest lama dengan akun pelanggan baru berdasarkan token akses faktur berentropi tinggi.

---

## 4. Alur Autentikasi & UX Transaksi End-to-End

```text
[ Pengunjung ]
      │
      ▼
Katalog Publik & Keranjang Belanja (Guest State di Zustand)
      │
      ▼
Klik Tombol "Checkout"
      │
      ├─► Sesi Aktif Ditemukan & Email Terverifikasi?
      │         │
      │         ├─► YA: Lanjut ke Halaman Checkout (/checkout)
      │         │       - Otomatis mengisi alamat utama
      │         │       - Sesi server mengikat pengguna_id ke pesanan
      │         │
      │         └─► TIDAK: Redirect ke /masuk?next=/checkout
      │                   - Keranjang belanja tetap utuh di localStorage
      │                   - Tampilkan opsi Masuk atau Daftar Akun
      │
      ▼
Alur Pendaftaran (/daftar)
      │
      ├─► Input Nama, Email, Kata Sandi (min. 12 karakter), & Persetujuan
      ├─► Validasi Zod & Penyimpanan Akun Baru (status belum terverifikasi)
      ├─► Kirim Email Verifikasi via Outbox / Resend
      └─► Halaman Menunggu Verifikasi dengan Cooldown Kirim Ulang (60 detik)
      │
      ▼
Aktivasi Tautan Email (/verifikasi-email?token=...)
      │
      ├─► Token diverifikasi sekali pakai (Single-Use Guard)
      ├─► Email ditandai verified di database
      ├─► Sesi login diterbitkan otomatis
      └─► Redirect mulus kembali ke /checkout
```

---

## 5. Standar Validasi Zod & Kontrak DTO (src/features/auth/schemas/)

Seluruh input antarmuka divalidasi ketat pada layer server menggunakan Zod:

```typescript
import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const skemaEmail = z
  .string()
  .trim()
  .email("Format alamat email tidak valid.")
  .max(254, "Alamat email terlalu panjang.");

export const skemaKataSandi = z
  .string()
  .min(12, "Kata sandi wajib minimal 12 karakter untuk keamanan akun.")
  .max(128, "Kata sandi maksimal 128 karakter.");

export const skemaNomorTelepon = z
  .string()
  .trim()
  .refine((nilai) => {
    const nomor = parsePhoneNumberFromString(nilai, "ID");
    return Boolean(nomor?.isValid());
  }, "Nomor WhatsApp atau telepon Indonesia tidak valid (contoh: 081234567890).");

export const skemaDaftarAkun = z.object({
  namaLengkap: z.string().trim().min(2, "Nama minimal 2 karakter.").max(150),
  email: skemaEmail,
  kataSandi: skemaKataSandi,
  setujuKetentuan: z.literal(true, {
    errorMap: () => ({ message: "Anda wajib menyetujui syarat & ketentuan layanan." }),
  }),
  setujuMarketing: z.boolean().default(false),
}).strict();

export const skemaMasukAkun = z.object({
  email: skemaEmail,
  kataSandi: z.string().min(1, "Kata sandi wajib diisi."),
  ingatSaya: z.boolean().default(false),
  next: z.string().max(256).optional(),
}).strict();
```

---

## 6. Struktur Folder Fitur (src/features/auth/ & src/features/account/)

Mengikuti konvensi arsitektur modular yang sudah ada:

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── masuk/page.tsx
│   │   ├── daftar/page.tsx
│   │   ├── lupa-password/page.tsx
│   │   ├── atur-ulang-password/page.tsx
│   │   └── verifikasi-email/page.tsx
│   ├── (account)/
│   │   └── akun/
│   │       ├── layout.tsx
│   │       ├── page.tsx (Dashboard Ringkasan Akun)
│   │       ├── profil/page.tsx
│   │       ├── alamat/page.tsx
│   │       ├── pesanan/page.tsx
│   │       ├── wishlist/page.tsx
│   │       ├── voucher/page.tsx
│   │       └── keamanan/page.tsx
│   └── api/
│       └── auth/
│           └── [...all]/route.ts (Better Auth handler)
├── features/
│   ├── auth/
│   │   ├── components/ (FormMasuk, FormDaftar, FormLupaPassword)
│   │   ├── schemas/ (auth.schema.ts)
│   │   ├── services/ (auth.service.ts)
│   │   └── types/
│   └── account/
│       ├── actions/ (alamat.action.ts, profil.action.ts, wishlist.action.ts)
│       ├── components/ (BukuAlamat, KartuProfil, RiwayatPesananAkun)
│       ├── services/ (account.service.ts)
│       └── types/
└── lib/
    ├── auth/
    │   ├── auth.ts (Better Auth Server Instance)
    │   ├── auth-client.ts (Better Auth React Client)
    │   └── session.ts (Server-side Session Helper)
    └── db/
        ├── schema.ts
        └── auth.schema.ts
```

---

## 7. Tahapan Implementasi (Phased Roadmap & Acceptance Gates)

### Phase 2A: Identity & Database Foundation

- [x] Gate 0 Security Fix: Otorisasi operator key dan sanitasi data pada `/demo/inbox`.
- [x] Gate 0 Seeder Guard: Pemisahan mode destruktif `SEED_FORCE_RESET` dari safe catalog update.
- [x] Normalisasi Skema Database: Implementasi `auth.schema.ts` dan pembaruan relasi pada `schema.ts`.
- [ ] Instalasi dependensi Better Auth dan konfigurasi server handler di `/api/auth/[...all]/route.ts`.
- [ ] Registrasi serta Login Email dengan database session storage.

### Phase 2B: Account Recovery & Customer Profile

- [ ] Alur verifikasi email dan lupa kata sandi dengan token sekali pakai (single-use token).
- [ ] Integrasi Transactional Outbox untuk email aktivasi dan notifikasi keamanan akun pengguna.
- [ ] Halaman pengaturan profil pelanggan, preferensi ukuran, serta nomor telepon WhatsApp.
- [ ] Address Book CRUD dengan batasan alamat utama tunggal per akun pelanggan.

### Phase 2C: Authenticated Checkout Integration

- [ ] Integrasi alur login wajib saat checkout tanpa kehilangan item keranjang belanja.
- [ ] Server Action checkout membaca identitas pemesan langsung dari sesi server (`pengguna_id`).
- [ ] Seleksi alamat tersimpan untuk penghitungan ongkos kirim instan pada Biteship API.

### Phase 2D: Customer Account Center UI

- [ ] Dasbor akun `/akun` dengan navigasi brutalist high-contrast yang terstruktur.
- [ ] Riwayat pesanan pelanggan dengan filter status pembayaran dan pengiriman paket.
- [ ] Fitur Wishlist dengan preferensi ukuran tersimpan yang responsif.
- [ ] Manajemen sesi aktif perangkat dan tombol pencabutan sesi menyeluruh.

### Phase 2E: Quality & Release Gate

- [ ] Pengujian concurrency dan idempotensi pendaftaran akun dan klaim pesanan.
- [ ] Pengujian E2E browser Playwright untuk alur: Daftar -> Verifikasi -> Masuk -> Checkout.
- [ ] Verifikasi kepatuhan Anti-Slop (Zero em dash, tap target >= 44px, kontras WCAG AA).
- [ ] Audit CI GitHub Actions berstatus hijau tanpa peringatan linter.

---

## 8. Matrix Kepatuhan Aturan Anti-Slop Mode 1 (DURING)

| Aturan Anti-Slop | Penerapan pada Fase 2 |
| :--- | :--- |
| **Bebas Em Dash (`—`)** | Seluruh copy formulir login, registrasi, email aktivasi, dan dokumen arsitektur menggunakan tanda titik dua (:), koma (,), atau tanda kurung (). |
| **Mobile-First & Touch Target** | Seluruh input formulir, tombol aksi (CTA), dan tab navigasi memiliki tinggi minimal 44px (`min-h-11`). |
| **Aksesibilitas Keyboard & Label** | Semua elemen formulir memiliki elemen `<label>` yang eksplisit, indikator fokus terlihat jelas, dan error validation terhubung via `aria-describedby`. |
| **Jujur & Transparan** | Pesan kesalahan login bersifat netral untuk mencegah enumerasi akun, tanpa klaim palsu atau angka rekaan. |
| **Indonesian Naming Convention** | Penamaan berkas, entitas basis data, Server Actions, dan Zod schemas menggunakan Bahasa Indonesia baku yang selaras dengan domain bisnis VOID Supply. |
