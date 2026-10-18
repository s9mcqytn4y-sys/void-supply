# Rencana Implementasi: Fase 1C (Release Candidate Verification) & Ekspansi Merchandise

> **Proyek**: VOID Supply  
> **Target Rilis**: Fase 1C (Release Candidate) menuju Fase 2 (Auth & Customer Account)  
> **Aturan Utama**: Anti-Slop Mode 1 (DURING) : Zero Em Dash (`—`), Mobile-First, Tap Target >= 44px, Fail-Closed Security  

---

## 1. Analisis Kebutuhan & Hasil Audit Lanjutan

Berdasarkan audit komparasi GitHub terbaru dan sesi alignment `/grill-me`, berikut adalah area kerja resmi yang disepakati:

### A. Sistem Email Transaksional & Dev Mailbox Previewer (Vercel Hobby & Production)
- **Kondisi Aktual**: Belum memiliki domain email resmi / SMTP live credentials.
- **Arsitektur Solusi (Hybrid Transactional Outbox)**:
  1. **Event Triggers**:
     - `pesanan.dibuat`: Konfirmasi pesanan dengan nomor pesanan, ringkasan item, total tagihan, dan instruksi bayar.
     - `pembayaran.berhasil`: Bukti bayar lunas dengan tautan e-faktur dan estimasi proses gudang.
     - `pengiriman.dikirim`: Resi kurir, tautan live tracking `/lacak`, dan estimasi tiba.
     - `kontak.diterima`: Bukti pesan kontak diterima untuk pelanggan dan notifikasi inbox operasional.
  2. **Worker Queue**: Tabel `antrean_outbox` memproses pesan secara asinkron dengan idempotensi payload SHA-256 dan retry backoff (1m, 5m, 15m).
  3. **Dev Mailbox Previewer**:
     - Antarmuka visual di panel DevTools Sandbox Drawer yang menampilkan render HTML email secara realistis, headers penerima, subjek, dan status outbox.
     - Saat variabel `RESEND_API_KEY` dipasang di production, outbox worker otomatis mengalirkan email ke inbox asli pelanggan tanpa perubahan kode domain.

---

### B. Ekspansi Katalog Produk & Manajemen Media Storage
- Menambahkan 4 artikel pakaian dan aksesoris streetwear brutalist baru (Drop 04 & 05 Expansion):
  1. **VOID Tactical Cargo Pants (Dark Grey)**: Heavyweight ripstop cotton, 6 utility pockets, adjustable ankle cinch.
  2. **Cyberpunk Boxy Graphic Hoodie (Washed Black)**: 450 GSM French Terry, oversized silhouette, screen-printed nocturnal motif.
  3. **Technical Modular Sling Bag (Matte Black)**: Cordura 500D water-repellent, fidlock magnetic buckle, waterproof zipper.
  4. **Distressed Embroidery Utility Cap (Vintage Black)**: Washed twill, low-profile unconstructed crown, tactical side webbing.
- Setiap artikel dilengkapi:
  - Varian ukuran lengkap (S, M, L, XL / All Size).
  - Bobot fisik riil gram (misal Hoodie 850g, Cargo 650g, Bag 400g, Cap 180g) untuk kalkulasi ongkos kirim presisi di Biteship.
  - Varian SKU terstruktur (misal `VOID-D04-HOD-BLK-L`).
  - Rekomendasi ukuran badan postur tubuh.
  - Aset media gambar WebP beresolusi tinggi di `/public/images/products/` dan seeder PostgreSQL.

---

### C. Hardening Transaksi & P0 Security (Fase 1C)
1. **Simulator Sandbox Security**:
   - Mewajibkan token akses pesanan secara ketat.
   - Mengunci transisi pengiriman di `simulasi-resi.action.ts`: hanya boleh bertransisi dari status `diproses`. Transisi dari `menunggu_pembayaran` langsung ditolak.
   - Membatasi simulasi pembayaran hanya untuk pesanan uji dengan flag otorisasi operator (`ALLOW_PAYMENT_MOCK === "true"` atau staging operator session).
2. **Penanganan Midtrans 404**:
   - Jika order berumur < 15 menit dan Midtrans mengembalikan 404, status tetap `UNKNOWN` (reservasi stok dipertahankan).
   - Setelah 15 menit, verifikasi apakah pesanan benar-benar kadaluwarsa melalui inquiry formal atau catat ke outbox reconciliation sebelum melepaskan kuota stok.
3. **Inkonsistensi Pajak Faktur**:
   - Memastikan label pajak faktur menampilkan `PPN 0% (Non-PKP)` jika `MERCHANT_TAX_PERCENT` bernilai 0, menghapus seluruh residu teks `PPN 11% (TERMASUK)` yang bertentangan dengan perhitungan.

---

### D. Barcode Thermal Code 128 & Kerapian Dokumen Cetak
1. **Proporsi Barcode Code 128 Scanner-Ready**:
   - Menyesuaikan `lebarBar: 1.4` (maks ~330 CSS pixel) sehingga muat sempurna pada label stiker thermal 100mm x 150mm (~378 CSS pixel) dengan quiet zone 10 modul yang utuh di kedua sisi.
   - Menambahkan aturan CSS cetak thermal `@page { size: 100mm 150mm; margin: 0; }`.
   - Mengaktifkan wrapping SKU panjang (`break-all`).
   - Membersihkan teks hardcoded `NON-COD (LUNAS)` dan `ASURANSI LOGISTIK TERCOVER` menjadi dinamis sesuai data transaksi nyata.

---

### E. Form Kontak & Rate Limiting
1. Menyelaraskan domain email bantuan: `support@voidsupply.com`.
2. Menambahkan in-memory rate limiting pada Server Action `kirimPesanKontakAction` (maksimal 3 pengiriman per IP per 10 menit).
3. Menyediakan inbox query untuk membaca pesan kontak di database PostgreSQL.

---

### F. Sonner Toast & Mobile Safe Area
1. Mengonfigurasi safe area margin di mobile pada `SonnerToaster.tsx` agar toast tidak menumpuk di atas sticky bottom CTA checkout (`bottom-24` di mobile viewport).
