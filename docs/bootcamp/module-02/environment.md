# VOID Supply Environment & Configuration Guide

Dokumen ini mendefinisikan konsep, tata kelola, dan standarisasi konfigurasi lingkungan (_Environment Configuration_) untuk platform e-commerce VOID Supply.

---

## 1. Apa itu Environment?

Environment adalah **kondisi dan konteks sistem tempat aplikasi dijalankan dengan konfigurasi, kredensial, dan layanan pihak ketiga yang berbeda**.

Dalam rekayasa perangkat lunak modern, kode sumber (_source code_) aplikasi harus identik di semua tingkatan, tetapi perilakunya dikendalikan secara dinamis melalui konfigurasi lingkungan (_The Twelve-Factor App : Config_).

Aplikasi VOID Supply beroperasi dalam 3 tingkatan lingkungan:

```text
               [ Development ]                     [ Staging ]                     [ Production ]
Tujuan:       Pembangunan Fitur Lokal             Pengujian Menyeluruh (QA)        Penggunaan Pelanggan Riil
Lokasi:       Laptop Pengembang (localhost)       staging.voidsupply.com           voidsupply.com
Database:     PostgreSQL 18 Lokal (Port 5432)     PostgreSQL Managed Staging       PostgreSQL High-Availability
Payment:      Midtrans Sandbox (Snap Simulator)   Midtrans Sandbox                 Midtrans Production (Dana Riil)
Kurir:        Biteship Test API                   Biteship Sandbox                 Biteship Live Courier
Log/Monitor:  Terminal Console                    Sentry Staging Environment       Sentry Production Alerting
```

---

---

## 2. Tingkatan Environment

### Development

- **Purpose:** Membangun fitur baru secara cepat pada mesin lokal pengembang dengan umpan balik instan dan isolasi data total.
- **Tools:** Node.js v22 LTS, Next.js 16 App Router, Turbopack, VS Code, Git Bash, Vitest, Playwright.
- **Database:** PostgreSQL 18.6 lokal (`localhost:5432/void_supply`) via Drizzle ORM.
- **External Services:** Midtrans Snap Sandbox (simulator transaksi tanpa uang sungguhan) dan Biteship Test API (tarif kurir simulasi).

### Staging

- **Purpose:** Tempat verifikasi integrasi sistem menyeluruh (QA dan UAT) pada lingkungan komputasi awan sebelum rilis produksi.
- **Difference:** Dijalankan pada domain pratinjau (`staging.voidsupply.com`), menggunakan cloud database terisolasi dari mesin lokal maupun produksi, menjalankan pengujian otomatis Playwright E2E pada pipeline CI/CD, namun tetap mempertahankan Midtrans Sandbox dan Biteship Testing agar tidak membebankan tagihan finansial riil atau memicu penjemputan paket fisik.

### Production

- **Purpose:** Menyajikan layanan e-commerce publik resmi (`voidsupply.com`) dengan performa tinggi, kestabilan 99.9% uptime, dan keandalan transaksi finansial nyata.
- **Security Rules:** Seluruh kredensial rahasia tersimpan terenkripsi di environment dashboard Vercel, mutasi pembayaran wajib memverifikasi SHA-512 signature key Midtrans, SSL/TLS 256-bit aktif wajib di semua rute, data database di-backup berkala dengan enkripsi saat istirahat, dan pelaporan galat dikirim terenkripsi ke Sentry tanpa membocorkan struktur tabel atau query SQL kepada pengguna.

---

## 3. Alur Pengelolaan Berkas Lingkungan (.env)

Kredensial rahasia tidak boleh tersimpan di dalam repositori Git. Kami menerapkan alur pengelolaan berkas standar industri:

```text
       .env.example
  (Templat Tanpa Nilai Rahasia)
  (Terdokumentasi & Terlacak di Git)
               │
               ▼ Developer melakukan salin berkas (copy)
        .env.local / .env
    (Kredensial Sandbox Lokal)
 (Dilindungi oleh aturan .gitignore)
               │
               ▼ Deployment ke Server Cloud
     Vercel Dashboard Settings
  (Environment Variables Terenkripsi)
```

### Mengapa Berkas .env Wajib Dilindungi dari Pelacakan Git?

Kebijakan pengabaian berkas rahasia ini melindungi repositori dari insiden keamanan fatal melalui dua pertimbangan:

- **Pencegahan Kebocoran Kredensial (_Secret Leakage_):** Repositori publik atau privat yang terekspos tanpa sengaja dapat membocorkan `DATABASE_URL` maupun `MIDTRANS_SERVER_KEY`, membuka celah eksploitasi transaksi dan pencurian data pribadi pelanggan.
- **Pemisahan Konfigurasi dan Kode Sumber:** Kode program yang bersih bersifat portabel sehingga dapat dijalankan langsung di mesin pengembang mana pun tanpa mengubah baris logika, cukup dengan menyuplai konfigurasi `.env` lokal yang sesuai.

---

## 4. Matriks Kontrak Variabel Lingkungan VOID Supply

Aplikasi mengadopsi arsitektur _Dual-Slot Credentials_ yang memisahkan slot Sandbox (pengujian) dan slot Production (transaksi riil) secara berdampingan di `.env` dan `.env.example`:

| Nama Variabel                                | Batas Akses      | Tingkat Kritis | Lingkungan / Peran | Deskripsi & Tujuan                                                                                                                 |
| :------------------------------------------- | :--------------- | :------------- | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`                       | Klien & Server   | Rendah         | Global             | Nama resmi aplikasi untuk metadata HTML (`VOID Supply`).                                                                           |
| `NEXT_PUBLIC_APP_URL`                        | Klien & Server   | Rendah         | Global             | URL dasar aplikasi untuk canonical URL (`http://localhost:3000`).                                                                  |
| `DATABASE_URL`                               | **Hanya Server** | **Kritis**     | Dev Lokal          | URL PostgreSQL 18 lokal.                                                                                                           |
| `DATABASE_URL_STAGING`                       | **Hanya Server** | **Kritis**     | Staging            | String koneksi basis data pengujian pra-produksi yang di-hosting pada instance cloud server staging terisolasi dengan data tiruan. |
| `DATABASE_URL_PRODUCTION`                    | **Hanya Server** | **Kritis**     | Production         | Endpoint kluster produksi utama dengan proteksi replikasi berkala serta enkripsi data saat istirahat.                              |
| `MIDTRANS_IS_PRODUCTION`                     | **Hanya Server** | Tinggi         | Kontrol            | Flag penentu lingkungan aktif Midtrans, bernilai false untuk sandbox dan true saat berpindah ke pembayaran nyata.                  |
| `MIDTRANS_SERVER_KEY_SANDBOX`                | **Hanya Server** | Kritis         | Sandbox            | Kunci server pengujian Midtrans Snap lokal.                                                                                        |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX`    | Klien & Server   | Sedang         | Sandbox            | Kunci publik untuk memunculkan pop-up Snap JS pada browser pengujian.                                                              |
| `MIDTRANS_MERCHANT_ID_SANDBOX`               | **Hanya Server** | Sedang         | Sandbox            | ID merchant pengujian sandbox.                                                                                                     |
| `MIDTRANS_SERVER_KEY_PRODUCTION`             | **Hanya Server** | **Kritis**     | Production         | Kredensial rahasia gateway Midtrans untuk transaksi riil pembeli.                                                                  |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION` | Klien & Server   | Sedang         | Production         | Kunci publik peramban untuk membuka pembayaran Snap di domain produksi secara aman tanpa mengekspos rahasia backend aplikasi.      |
| `MIDTRANS_MERCHANT_ID_PRODUCTION`            | **Hanya Server** | Sedang         | Production         | ID merchant produksi resmi.                                                                                                        |
| `BITESHIP_ORIGIN_POSTAL_CODE`                | **Hanya Server** | Sedang         | Global             | Kode pos titik penjemputan paket dari gudang Sleman.                                                                               |
| `BITESHIP_API_KEY_SANDBOX`                   | **Hanya Server** | Kritis         | Sandbox            | Kunci API pengujian simulasi kurir Biteship.                                                                                       |
| `BITESHIP_API_KEY_PRODUCTION`                | **Hanya Server** | **Kritis**     | Production         | Token otentikasi resmi untuk pemanggilan kurir logistik dan pembuatan nomor resi fisik.                                            |
| `NEXT_PUBLIC_SENTRY_DSN`                     | Klien & Server   | Rendah         | Global             | Alamat endpoint pemantauan crash aplikasi.                                                                                         |

---

## 5. Validasi Runtime Variabel Lingkungan dengan Zod & Resolusi Dinamis

Sistem menyelesaikan kredensial aktif secara dinamis di runtime berdasarkan nilai flag `MIDTRANS_IS_PRODUCTION`:

```typescript
// Konsep Resolusi Kredensial Dinamis (src/lib/env.ts)
import { z } from "zod";

export const envSkema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL harus berupa URL database yang valid"),

  // Kontrol Lingkungan
  MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).default("false"),

  // Midtrans Dual-Slot
  MIDTRANS_SERVER_KEY_SANDBOX: z.string().optional(),
  MIDTRANS_SERVER_KEY_PRODUCTION: z.string().optional(),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX: z.string().optional(),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION: z.string().optional(),

  // Biteship Dual-Slot
  BITESHIP_API_KEY_SANDBOX: z.string().optional(),
  BITESHIP_API_KEY_PRODUCTION: z.string().optional(),
  BITESHIP_ORIGIN_POSTAL_CODE: z.string().length(5, "Kode pos gudang asal harus 5 digit numerik"),
});

// Helper Resolusi Kunci Aktif
export function getMidtransServerKey(): string {
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const key = isProd
    ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
    : process.env.MIDTRANS_SERVER_KEY_SANDBOX || process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("Kunci Midtrans Server aktif tidak ditemukan");
  return key;
}

export function getBiteshipApiKey(): string {
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const key = isProd
    ? process.env.BITESHIP_API_KEY_PRODUCTION
    : process.env.BITESHIP_API_KEY_SANDBOX || process.env.BITESHIP_API_KEY;
  if (!key) throw new Error("Kunci Biteship API aktif tidak ditemukan");
  return key;
}
```

Jika aplikasi dijalankan dalam mode produksi (`MIDTRANS_IS_PRODUCTION=true`), sistem secara otomatis memvalidasi keberadaan `MIDTRANS_SERVER_KEY_PRODUCTION` dan `BITESHIP_API_KEY_PRODUCTION` saat proses startup, mencegah kegagalan fatal saat pembeli bertransaksi.
