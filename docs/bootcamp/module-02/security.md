# VOID Supply Security Architecture & Boundary

Dokumen ini mendefinisikan prinsip, batasan keamanan (_Security Boundary_), dan mekanisme pertahanan berlapis yang diterapkan pada seluruh ekosistem aplikasi VOID Supply.

---

## 1. Batas Keamanan Sistem (Security Boundary)

Arsitektur aplikasi membagi sistem menjadi dua zona keamanan yang terpisah secara tegas:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ZONA TIDAK TEPERCAYA (UNTRUSTED)                  │
│                     Peramban Klien, Perangkat Seluler, Input Pengguna       │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                         [ GERBANG VALIDASI RUNTIME ZOD ]
                         [ PROTEKSI ORIGIN & CSRF NEXT.JS ]
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ZONA TEPERCAYA (TRUSTED)                        │
│                 Server Next.js 16, Server Actions, Drizzle ORM              │
│                PostgreSQL 18 Lokal / Cloud, Midtrans Server API             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Prinsip fundamental kami menetapkan bahwa seluruh data masukan yang berasal dari peramban klien dianggap berpotensi berbahaya hingga data tersebut divalidasi dan dibersihkan di sisi server tepercaya.

---

## 2. Tata Kelola Kredensial & Isolasi Variabel Rahasia

1. **Aturan Prefix `NEXT_PUBLIC_`:** Hanya variabel dengan awalan `NEXT_PUBLIC_` yang dapat dibaca oleh kode JavaScript di peramban pengguna. Semua kunci privat, seperti `DATABASE_URL`, `MIDTRANS_SERVER_KEY`, dan `BITESHIP_API_KEY`, dipastikan beroperasi secara eksklusif di dalam lingkungan Node.js server.
2. **Pencegahan Kebocoran Git:** Berkas `.env` lokal masuk ke dalam aturan pengecualian `.gitignore`. Pengembang hanya membagikan berkas percontohan `.env.example` tanpa menyertakan kredensial asli.
3. **Penyimpanan Cloud Terenkripsi:** Pada lingkungan produksi dan staging, variabel rahasia dikelola melalui panel Vercel Project Settings dengan enkripsi di tingkat infrastruktur awan.

---

## 3. Pencegahan Injeksi SQL & Skrip Lintas Situs (XSS)

- **Proteksi Injeksi SQL:** Seluruh interaksi basis data dijalankan menggunakan Drizzle ORM. Drizzle memanfaatkan mekanisme parameterisasi bawaan (_Prepared Statements_) pada driver PostgreSQL, sehingga input dari pembeli tidak pernah disambung langsung ke dalam perintah SQL mentah.
- **Proteksi Injeksi XSS:** Komponen antarmuka dibangun di atas pustaka React 19 yang secara otomatis mengubah karakter berbahaya (_HTML escaping_) sebelum dirender ke DOM. Penggunaan properti berisiko seperti `dangerouslySetInnerHTML` dilarang keras di seluruh repositori.

---

## 4. Validasi Runtime Masukan Pengguna dengan Zod

TypeScript hanya menjamin keamanan tipe data pada saat proses kompilasi kode (_Compile-Time_), namun tidak dapat memvalidasi data masukan langsung dari pengguna saat aplikasi berjalan (_Runtime_).

Seluruh Server Action dan API Route wajib memvalidasi muatan data masukan menggunakan skema Zod sebelum memproses logika bisnis:

```typescript
// Contoh Skema Validasi Pesanan (src/features/checkout/schemas/index.ts)
import { z } from "zod";

export const checkoutSkema = z.object({
  namaPenerima: z
    .string()
    .min(3, "Nama penerima minimal 3 karakter")
    .max(80, "Nama penerima maksimal 80 karakter")
    .trim(),
  nomorTelepon: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format nomor telepon tidak valid"),
  alamatJalan: z
    .string()
    .min(10, "Alamat jalan terlalu singkat")
    .max(255, "Alamat jalan maksimal 255 karakter")
    .trim(),
  kodePos: z
    .string()
    .length(5, "Kode pos harus terdiri dari 5 digit angka")
    .regex(/^[0-9]+$/, "Kode pos hanya boleh memuat angka numerik"),
  kurirId: z.string().min(1, "Kurir pengiriman wajib dipilih"),
  metodePembayaran: z.enum(["qris", "bank_transfer"]),
});
```

Jika data yang dikirimkan tidak memenuhi kriteria di atas, sistem segera menolak eksekusi dan mengembalikan pesan kesalahan terstruktur tanpa menyentuh lapisan database.

---

## 5. Keamanan Transaksi Finansial Midtrans

Gateway pembayaran adalah komponen paling sensitif dalam platform e-commerce VOID Supply. Tiga lapisan pengamanan diterapkan untuk menjamin integritas uang pembeli:

1. **Pembuatan Token Snap Sisi Server:** Klien peramban dilarang membuat token transaksi Midtrans secara mandiri. Hanya Server Action yang memiliki hak memanggil API Midtrans menggunakan `MIDTRANS_SERVER_KEY` rahasia setelah menghitung ulang total harga barang dari basis data resmi.
2. **Kalkulasi Ulang Harga di Server:** Total nilai pesanan selalu dihitung ulang di server berdasarkan harga tabel `produk` di PostgreSQL, bukan berdasarkan nominal harga yang dikirim dari keranjang klien, sehingga pembeli tidak dapat memanipulasi angka harga barang.
3. **Verifikasi Hash Signature SHA-512 pada Webhook:** Setiap notifikasi status transaksi yang masuk dari Midtrans wajib diverifikasi keasliannya dengan mencocokkan rumus kriptografi SHA-512:

```text
Signature Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
```

Jika hash yang dihitung oleh server VOID Supply berbeda dengan nilai signature di header notifikasi, permintaan tersebut langsung ditolak dengan status HTTP 403 Forbidden.

---

## 6. Perlindungan Privasi Data Pelanggan

Mengingat alur transaksi VOID Supply mengusung konsep ramah privasi _Hybrid Guest-First_:

- **Penyamaran Data Publik:** Halaman pelacakan resi kurir publik (`/track/[orderId]`) menyamarkan nama dan alamat penerima (contoh: `Rian P***, Sleman, D.I. Yogyakarta`) untuk mencegah pelacakan identitas oleh pihak ketiga yang memiliki nomor pesanan secara acak.
- **Log Keamanan Tersaring:** Pustaka pemantauan galat Sentry dikonfigurasi untuk memotong parameter sensitif (_Data Scrubbing_) seperti nomor kontak, alamat lengkap, atau kunci rahasia sebelum laporan dikirim ke peladen.
