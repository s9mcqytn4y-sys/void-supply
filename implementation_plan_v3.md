# Implementation Plan: Stabilization Sprint & Architecture Hardening VOID Supply

> **Baseline Audit**: Commit `418a7d5`  
> **Target Branches**: `main` (Development/Demo Staging)  
> **Konvensi**: Bahasa Indonesia (Domain & Business Logic), Zero Em Dash (Anti-Slop Mode 1), Ponytail Principle (Fix Terkecil yang Aman).

---

## 1. Ringkasan & Ruang Lingkup

Sprint stabilisasi ini berfokus pada resolusi menyeluruh terhadap temuan audit lintas tim (CTO, Backend, Payment, DevOps/SRE, Security, DBA, QA, UX, dan CFO):
1. **G1: Unified Payment Lifecycle Service (`transisi-pembayaran.service.ts`)**:
   - Memusatkan transisi status pembayaran & pesanan (Webhook Midtrans, Admin Inquiry, Pembatalan Pesanan, dan Late Settlement) ke dalam satu modul terpadu.
   - Mengatasi race condition CAS: mutasi status `pembayaran` hanya dieksekusi setelah CAS `pesanan` diverifikasi mengembalikan baris yang terpengaruh.
   - Sinkronisasi penanganan late settlement: jika notifikasi settlement tiba saat pesanan sudah berstatus `dibatalkan` (baik lewat webhook maupun inquiry), status pembayaran dialihkan ke `menunggu_refund`, pesanan diset `perluTinjauanManual = true`, serta dicatat anomali audit & log operasional.
2. **G2: Unified Fulfillment & Single Dispatch Guard (`biteship.service.ts` & `outbox.service.ts`)**:
   - Menghubungkan manual pickup dan outbox worker agar mematuhi guard single-dispatch terpadu.
   - Outbox worker memverifikasi status kelayakan pesanan (menolak pesanan yang berstatus `dibatalkan` sebelum memanggil Biteship).
   - Menangani crash/timeout dengan pemulihan status menggunakan tracking ID resmi Biteship.
3. **G3: Asynchronous Reliability & Expiry Gate**:
   - Memperbaiki `staging-cron.yml` dengan menghapus `continue-on-error: true` pada langkah expiry agar kegagalan reservasi stok terdeteksi dalam GitHub Actions.
   - Outbox service dilengkapi jitter dan batas jeda retry agar lonjakan retry bersamaan dapat dicegah.
4. **G4: Financial Accuracy (CFO & Entrepreneur Perspective)**:
   - Merefaktor `dasbor-admin.action.ts` dan antarmuka `admin/page.tsx` agar memisahkan antara **Omzet Lunas (Gross Paid Sales)**, **Nilai Order Menunggu Pembayaran**, **Kewajiban Refund Pending**, dan **Omzet Bersih (Net Sales)**.
5. **G5: UI/UX & A11y Operasional**:
   - Menambahkan tombol aksi dan modal konfirmasi refund (`konfirmasiRefundAdminAction`) pada `PanelOperasionalPesanan.tsx` untuk pesanan dengan status `menunggu_refund`.
   - Mengoptimalkan positioning Sonner Toaster (`bottom-right` untuk desktop dan `bottom-center` dengan padding aman untuk mobile di atas bottom-bar 44px).
   - Memastikan struktur email HTML Nodemailer responsif di seluruh perangkat dengan kontras warna WCAG AA dan penanganan khusus client email modern.

---

## 2. Rencana Implementasi Bertahap

### Fase A: Unified Payment Lifecycle Service (G1)
- Buat file `src/lib/services/transisi-pembayaran.service.ts` yang mengekspos:
  - `prosesNotifikasiSettlementMidtrans(tx, data)`: menangani settlement dari webhook dan inquiry secara konsisten.
  - `prosesKegagalanMidtrans(tx, data)`: menangani expire/cancel/deny dari webhook dan inquiry.
  - `prosesPembatalanPesanan(tx, data)`: pembatalan pesanan berbayar maupun belum bayar.
- Refactor `src/app/api/midtrans/webhook/route.ts` untuk memanggil modul domain ini.
- Refactor `src/features/admin/actions/pesanan-admin.lifecycle.ts` (`inquireMidtransStatusAction` dan `batalkanPesananAdminAction`) agar mendelegasikan ke modul domain ini.

### Fase B: Single-Dispatch & Anti-Balapan Fulfillment (G2 & G3)
- Update `outbox.service.ts` untuk memeriksa apakah pesanan sudah dibatalkan sebelum mengeksekusi `buat_order_biteship`.
- Sinkronkan pengecekan `biteshipOrderId` di `outbox.service.ts` dan `pesanan-admin.fulfillment.ts`.
- Tambahkan random jitter pada exponential backoff outbox (`jitter = Math.floor(Math.random() * 30)`).
- Hapus `continue-on-error: true` pada `.github/workflows/staging-cron.yml`.

### Fase C: Akurasi Finansial Dasbor Admin (G4)
- Update `ambilStatistikDasborAction` di `dasbor-admin.action.ts`:
  - `omzetLunas`: Sum total dari pesanan `diproses`, `dikirim`, dan `selesai`.
  - `nilaiMenungguBayar`: Sum total dari pesanan `menunggu_pembayaran`.
  - `totalRefundPending`: Sum total pembayaran `menunggu_refund`.
  - `omzetBersih`: `omzetLunas` dikurangi pesanan yang berstatus `dikembalikan`.
- Perbarui `KartuMetrikBrutalis` pada `src/app/(admin)/admin/page.tsx` untuk menampilkan metrik finansial yang transparan.

### Fase D: UI Operasional Refund & Komponen Sonner/A11y (G5)
- Tambahkan tombol aksi **KONFIRMASI PENGEMBALIAN DANA** dan modal input nomor referensi transfer pada `PanelOperasionalPesanan.tsx` saat pesanan berstatus `menunggu_refund` atau `perluTinjauanManual = true`.
- Evaluasi & selaraskan `SonnerToaster.tsx` dengan positioning adaptif desktop/mobile.
- Pastikan template email di `src/lib/services/email.service.ts` menggunakan style table nested dengan inline CSS ramah Outlook/Apple Mail/Gmail Mobile.

### Fase E: Pengujian & CI Verification
- Tambahkan pengujian konkurensi dan kontrak baru di Vitest (`tests/contracts/payment-lifecycle.contract.test.ts` & update `webhook.test.ts`).
- Jalankan pemeriksaan lint, tipe, Vitest suite, Playwright e2e, dan build Next.js lokal.
- Commit, push ke GitHub `main`, dan verifikasi GitHub Actions CI.
