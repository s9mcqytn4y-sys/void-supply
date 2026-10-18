# VOID Supply: Master Advance Roadmap & Technical Strategy 2026

Dokumen ini merupakan cetak biru rekayasa perangkat lunak, mitigasi risiko keamanan transaksi, audit arsitektur, dan tahapan peluncuran bertahap (*phase-gated roadmap*) untuk **VOID Supply** menuju standar enterprise dan demonstrasi Vercel Hobby yang bersih dan aman.

---

## 1. Eksekutif & Ringkasan Status Aktual Repositori

Berdasarkan audit komparatif mendalam pada commit `dd373ad` dan audit kode terkini:
- **Status Basis Data**: PostgreSQL 18 lokal aktif (`localhost:5432/void_supply`) terhubung mulus dengan Drizzle ORM (migrasi `0000` s.d. `0006`).
- **Integritas Pengujian**: 80 dari 80 pengujian unit Vitest (14 test suite) lulus 100% (*green*).
- **Security Hardening P0 (Selesai)**:
  1. **SEC-RES-01 (Label Resi Thermal)**: Halaman `src/app/pesanan/[nomorPesanan]/resi/page.tsx` kini mewajibkan verifikasi `tokenAkses` (IDOR Guard SEC-02) melalui cookie atau query search parameter. Akses unauthenticated ditolak langsung tanpa membocorkan PII penerima.
  2. **SEC-SIM-02 (Simulator Mass-Update Fix)**: Server Action `simulasiPergerakanKurirAction` telah diperbaiki dari kondisi `OR` global tanpa filter order menjadi `and(eq(pesanan.id, pesananDb.id), or(...))` dengan verifikasi `tokenAkses` dan guard lingkungan produksi fail-closed.
  3. **SEC-DEMO-03 (Demo Isolation)**: `demo-simulator.action.ts` kini memverifikasi `env.appEnv !== "production" || process.env.ALLOW_PAYMENT_MOCK === "true"` sebelum memicu mutasi gateway.
  4. **OPS-OUTBOX-04 (Lease Timeout Reaper & Ghost Bug Email)**: `outbox.service.ts` telah dilengkapi *Lease Reaper* otomatis untuk memulihkan tugas `diproses` yang tertahan lebih dari 5 menit akibat crash serverless, serta memeriksa `hasilEmail.sukses` agar kegagalan Resend/SMTP tercatat sebagai error untuk retry.
  5. **ROUTE-KANONIKAL-05 (Pelacakan Konsisten)**: Rute legacy `src/app/track` dihapus dan dialihkan sepenuhnya ke `/lacak`, sitemap dan footer diperbarui ke URL kanonikal.
  6. **UI-TOAST-06 (Sonner Close Button)**: Komponen `SonnerToaster.tsx` telah ditambahkan `closeButton={true}` untuk kenyamanan pengguna menutup notifikasi manual.
  7. **TAILWIND-V4-07 (Zero IDE Warnings)**: Class arbitrary `max-w-[420px]` dan `max-w-[280px]` telah diganti dengan utilitas kanonikal `max-w-105` dan `max-w-70`.

---

## 2. Root Cause Analysis & Evaluasi Sistem 14 Poin Permintaan

| ID | Aspek / Poin Permintaan | Root Cause & Pain Point Saat Ini | Solusi Rekayasa & Best Practice |
| :--- | :--- | :--- | :--- |
| **01** | **Product Variants (Colors & Sizes)** | Drop 04 hanya memiliki varian ukuran (S, M, L, XL) tanpa colorway sekunder (misal Washed Black, Phantom Charcoal, Raw Olive), galeri gambar identik. | Pemetaan skema relasional varian multi-dimensi (warna + ukuran), pembuatan aset WebP transparan resolusi tinggi, dan selector swatch interaktif. |
| **02** | **PRD & PERSONA Synchronisation** | Dokumen PRD dan Persona masih mencatat fitur awal tahap perancangan dan belum merefleksikan 6 migrasi database, outbox, faktur A4, dan flow live. | Pembaruan menyeluruh `PRD.md` dan `PERSONA.md` dengan status arsitektur nyata, customer journey aktual, dan matriks validasi. |
| **03** | **Agentic Docs & Agentiq MCP Context** | Ketiadaan context MCP tool definition untuk database inspect, filesystem scanner, dan guardrail agentic AI yang tersinkronisasi di `GEMINI.md`, `AGENTS.md`, `CLAUDE.md`. | Pendaftaran konfigurasi MCP server yang relevan, instruksi anti-slop kanonikal, dan sinkronisasi batas operasional. |
| **04** | **SDK Biteship, Midtrans & Email Queue** | Biteship menggunakan Axios mentah, Midtrans menggunakan SDK client, outbox sebelumnya menelan silent failure email. | Standardisasi typed REST adapter untuk Biteship, SDK Midtrans Snap resmi, pemisahan antrean email, dan tracking log terverifikasi. |
| **05** | **Pembersihan Variabel `.env` & Constants** | Terdapat variabel usang dari eksperimen lama yang berpotensi membocorkan konfigurasi atau membuat kebingungan deployment. | Audit strict schema resolver di `src/lib/environment/resolver.ts`, penghapusan variabel mati, dan validasi fail-closed. |
| **06** | **Isolasi Demo Mode vs Production** | Risiko simulator Midtrans atau Biteship dipicu di lingkungan production oleh publik tanpa token atau peran admin. | Penerapan `DEMO_MODE=true` environment flag guardrail, token-gated simulator, dan pemisahan state transaksi nyata vs mock. |
| **07** | **Invoicing, Promo, Discount & Vouchers** | Sistem voucher baru mendukung kode statis potongan nominal, belum ada validasi batas kuota penggunaan, masa berlaku, dan aturan diskon bertingkat. | Implementasi ledger voucher, rules engine diskon persentase/nominal dengan guardrail transaksi atomik, dan perapihan layout faktur komersial. |
| **08** | **Legal & Copywriting Anti-Slop** | Dokumen Terms & Conditions, Privacy Policy, About Us, dan Contact Us belum tersedia di direktori rute atau masih berupa teks generik AI slop. | Penyusunan halaman legal dan editorial brutalist utilitarian berbahasa Indonesia formal tanpa em dash (`—`) sesuai pedoman `/antislop-copywriting`. |
| **09** | **Toast Notifications UX** | Toast Sonner tidak memiliki tombol penutup manual (`closeButton`), mengganggu pengguna pada layar mobile sempit. | Pengaktifan `closeButton: true` dan penyesuaian styling utilitarian dark minimalis (Selesai). |
| **10** | **Navigasi & Mobile UX** | Header belum memiliki akses akun/login pelanggan, footer masih memiliki link legacy, mobile drawer butuh optimasi tap target minimal 44px. | Dekomposisi navigasi mobile responsif, drawer interaktif, sticky bottom action bar untuk PDP di mobile, dan perbaikan link kanonikal. |
| **11** | **Asset Logo Resmi WebP Transparan** | Logo BCA, Mandiri, BNI, BRI, QRIS, GoPay, JNE, SiCepat, J&T di `public/assets/` sebelumnya berukuran byte identik (placeholder/slop). | Unduh dan generate logo vektor WebP transparan resmi dengan rasio aspek presisi untuk baris footer dan formulir checkout. |
| **12** | **Pre-Order & Bundling Rules** | Belum ada kolom atau aturan bisnis untuk item pre-order (dengan estimasi tanggal kirim) dan paket bundling (diskon kombinasi SKU). | Penambahan flag `apakah_preorder` dan `estimasi_kirim` pada tabel produk/varian serta helper kalkulasi komposit bundling. |
| **13** | **Skema DB, Seed, Transaksi & Normalisasi** | Seed data membutuhkan variasi warna dan varian baru; normalisasi tabel keanggotaan dan voucher untuk audit trail. | Migrasi Drizzle terstruktur, seed script atomik, dan proteksi foreign key constraint. |
| **14** | **Technical Due Diligence & 2026 Roadmap** | Rencana pemisahan arsitektur 3 pilar: Storefront Publik, Customer Account, dan Admin Control Center. | Implementasi phase-gated roadmap bertahap tanpa utang teknis (technical debt). |

---

## 3. Desain Arsitektur 3 Pilar Terpusat

```
                                  ┌───────────────────────────┐
                                  │   VOID Supply Domain      │
                                  │   (Shared Services Core)  │
                                  └─────────────┬─────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
┌──────────────────┐                  ┌──────────────────┐                  ┌──────────────────┐
│ Public Storefront│                  │ Customer Account │                  │ Admin Control    │
│ (Tanpa Login)    │                  │ (Auth Required)  │                  │ (RBAC Required)  │
├──────────────────┤                  ├──────────────────┤                  ├──────────────────┤
│ • Katalog Drop 04│                  │ • Profil & Alamat│                  │ • Order Center   │
│ • Detail & Varian│                  │ • Riwayat Pesanan│                  │ • Inventory Mgt  │
│ • Keranjang Klien│                  │ • Pelacakan Live │                  │ • Gateway Audit  │
│ • Editorial/Info │                  │ • Voucher & Poin │                  │ • Outbox Monitor │
│ • Lacak Terbatas │                  │ • Faktur & Retur │                  │ • CMS Publisher  │
└──────────────────┘                  └──────────────────┘                  └──────────────────┘
```

---

## 4. Master Phase-Gated Roadmap (Fase 0 s.d. Fase 5)

### **Fase 0: P0 Security & Operational Hardening (SELESAI)**
- **Tujuan**: Menutup seluruh celah keamanan kritis (unauthenticated resi, mass-update bug, lease reaper outbox, IDE warnings) dan memastikan integritas pengujian 100%.
- **Output**:
  - `src/app/pesanan/[nomorPesanan]/resi/page.tsx` terproteksi SEC-02 dan Tailwind v4 kanonikal (`max-w-105`, `max-w-70`).
  - `simulasi-resi.action.ts` terisolasi per ID pesanan dan diproteksi `tokenAkses`.
  - `demo-simulator.action.ts` fail-closed di production.
  - `outbox.service.ts` memiliki lease reaper otomatis 5 menit dan verifikasi status kirim email.
  - `.github/workflows/staging-cron.yml` menggunakan sintaks secret standar GitHub Actions.
  - `src/app/track/` dibersihkan, kanonikal diarahkan ke `/lacak`.
  - `SonnerToaster.tsx` dilengkapi `closeButton={true}`.
- **Status Actual**: Selesai & diverifikasi dengan 80/80 unit test lulus 100%.

### **Fase 1: Assets, Brand & Copywriting Consolidation**
- **Tujuan**: Mengganti seluruh aset placeholder/slop dengan logo WebP transparan resmi untuk metode pembayaran dan mitra logistik, merapikan footer, dan membuat halaman legal lengkap tanpa em dash (`—`).
- **Input**: Direktori `public/assets/payment/`, `public/assets/shipping/`, komponen `PaymentCourierBadges.tsx`, halaman `/tentang`, `/kontak`, serta halaman baru `/kebijakan-privasi` dan `/syarat-ketentuan`.
- **Output**:
  - Logo WebP transparan beresolusi tajam untuk: BCA, Mandiri, BNI, BRI, QRIS, GoPay, JNE, SiCepat, J&T.
  - Halaman Kebijakan Privasi, Syarat & Ketentuan, Pengembalian & Garansi, About Us, dan Kontak dengan copywriting brutalist utilitarian jujur.
  - Footer toko terintegrasi badges logo dinamis dan navigasi kanonikal.

### **Fase 2: Product Multi-Colorways & Commercial Engine (Pre-Order, Bundling, Vouchers)**
- **Tujuan**: Melengkapi varian produk Drop 04 dengan variasi warna dan foto unik, kalkulasi diskon voucher yang aman dari race condition, serta penanganan pre-order dan bundling.
- **Input**: Skema database katalog (`produk`, `varian_produk`, `voucher`), seed data, logika checkout.
- **Output**:
  - Skema varian mendukung multi-atribut (Warna & Ukuran) dengan UI swatch selektor interaktif.
  - Dukungan metadata pre-order (tanggal estimasi rilis) dan penyesuaian SLA pengiriman pada checkout.
  - Voucher rules engine yang memvalidasi tanggal kedaluwarsa, kuota penggunaan, dan minimum belanja secara atomik.

### **Fase 3: Clean Architecture & Customer Account Foundation**
- **Tujuan**: Memisahkan antarmuka tamu dan akun pelanggan, menerapkan autentikasi sesi, riwayat pesanan pelanggan, buku alamat tersimpan, dan wishlist.
- **Input**: Rute `/masuk`, `/daftar`, `/akun`, modul otentikasi Drizzle/PostgreSQL.
- **Output**:
  - Alur checkout dengan opsi autentikasi: tamu dapat menyusun keranjang, login diperlukan sebelum finalisasi checkout.
  - Halaman `/akun/pesanan` yang menampilkan daftar transaksi terverifikasi dengan token akses atau session guard.

### **Fase 4: Admin Control Center, CMS & Integration Health**
- **Tujuan**: Panel administrasi toko untuk operasional harian tanpa manipulasi database langsung.
- **Input**: Rute `/admin/*`, RBAC middleware, log webhook, tabel outbox.
- **Output**:
  - Dashboard statistik penjualan sandbox, pemantauan transaksi tertunda, status webhook Midtrans & Biteship.
  - Panel outbox dengan tombol manual retry untuk tugas yang gagal atau mati di tengah jalan.
  - CMS internal sederhana untuk mengatur banner hero homepage, pengumuman drop, dan artikel editorial.

### **Fase 5: PWA, Observabilitas & CI/CD Production Gate**
- **Tujuan**: Pengalaman web mobile native dengan manifest PWA, optimasi caching aset publik, dan pelaporan error Sentry real-time.
- **Input**: `manifest.ts`, service worker, Sentry tunnel route, pipeline GitHub Actions.
- **Output**:
  - Aplikasi dapat diinstal ke layar beranda (PWA installable) di Android & iOS Safari.
  - Laporan audit CI menyeluruh dengan Playwright E2E browser test.
