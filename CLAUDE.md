# CLAUDE.md — VOID Supply Engineering Guidelines & CLI Playbook

Dokumen ini berisi panduan operasional teknis untuk agen Claude Code dan Antigravity pada repositori **VOID Supply**.

---

## 1. Perintah Standar & Pengujian

```bash
# Menjalankan Dev Server (Next.js 16 Turbopack)
npm run dev

# Kompilasi & Build Validasi
npm run build

# Typecheck Strict TypeScript
npx tsc --noEmit

# Unit & Integration Tests (Vitest)
npm test

# End-to-End Browser Testing (Playwright)
npm run test:e2e

# End-to-End Transaction REPL Runner (Node tsx)
npm run test:repl

# Database Seeding (Drop 04 & Persona Rian)
npm run db:seed
```

---

## 2. Arsitektur & Prinsip Desain

1. **Anti-Slop Mode 1 (DURING)**: Dilarang menggunakan karakter em dash (`—`) dalam teks copywriting maupun antarmuka. Gunakan koma, titik dua, atau kurung.
2. **Server-Authoritative Logistics**: Kalkulasi tarif ongkir dan penentuan berat fisik dilakukan di server dari basis data PostgreSQL. Biteship request dilindungi outbox idempotent untuk efisiensi saldo kuota.
3. **Outbox Hybrid Execution**: Eksekusi webhook Midtrans menggunakan `waitUntil()` dari `@vercel/functions` dengan fallback cron 5 menit.
4. **IDOR & PII Protection**: Seluruh rute `/pesanan/[nomorPesanan]` dan Server Action dilindungi token akses berentropi tinggi (UUID v4). Tanpa token yang valid, data pelanggan disamarkan otomatis.
5. **Universal Order Tracking**: Halaman `/lacak` menerima nomor pesanan (`VOID-...`) maupun nomor resi kurir (`WYB-...`, dsb.) dengan sensor privasi.
6. **Print-Ready Faktur A4**: Layout faktur resmi berukuran pas 1 lembar A4 portrait (`@page { size: A4 portrait; margin: 8mm 10mm; }`) dengan menyembunyikan navigasi global dan footer.
7. **Demo Sandbox Controller**: Panel verifikasi terintegrasi untuk simulator Midtrans (`https://simulator.sandbox.midtrans.com/`) dan mutasi logistik Biteship.

---

## 3. Protokol Context7 & RTK

- Gunakan `rtk gain` untuk metrik penghematan token CLI.
- Gunakan `npx ctx7@latest docs <lib>` untuk referensi dokumentasi terkini framework pihak ketiga.
