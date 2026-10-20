# CLAUDE.md : VOID Supply Engineering Guidelines & CLI Playbook

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

1. **Anti-Slop Mode 1 (DURING)**: Dilarang menggunakan karakter em dash dalam teks copywriting maupun antarmuka. Gunakan koma, titik dua, atau kurung.
2. **Server-Authoritative Logistics**: Kalkulasi tarif ongkir dan penentuan berat fisik dilakukan di server dari basis data PostgreSQL. Biteship request dilindungi outbox idempotent untuk efisiensi saldo kuota.
3. **Outbox Hybrid Execution & Lease Reaper**: Eksekusi webhook Midtrans menggunakan `waitUntil()` dari `@vercel/functions` dengan fallback cron 5 menit serta automatic lease timeout reaper (5 menit) untuk memulihkan tugas yang terhenti.
4. **IDOR & PII Protection**: Seluruh rute `/pesanan/[nomorPesanan]`, faktur A4 (`/faktur`), dan label thermal (`/resi`) dilindungi token akses berentropi tinggi (UUID v4 SEC-02).
5. **Universal Order Tracking**: Halaman kanonikal tunggal `/lacak` menerima nomor pesanan (`VOID-...`) maupun nomor resi kurir (`WYB-...`, dsb.) dengan sensor privasi.
6. **Print-Ready Faktur A4 & Label Thermal 100x150mm**: Layout faktur resmi 1 lembar A4 portrait dan label stiker thermal Biteship 100x150mm.
7. **Fail-Closed Demo Sandbox**: Panel verifikasi terintegrasi untuk simulator Midtrans (`https://simulator.sandbox.midtrans.com/`) dengan isolasi ketat `ALLOW_PAYMENT_MOCK=true`.

---

## 3. Protokol Context7 & MCP Agentiq

- Gunakan `rtk gain` untuk metrik penghematan token CLI bila terpasang.
- Gunakan `npx ctx7@latest docs <lib>` untuk referensi dokumentasi terkini framework pihak ketiga (Next.js 16, React 19, Drizzle, Tailwind v4).
- Gunakan tool MCP `playwright` untuk pengujian browser visual E2E dan verifikasi mobile viewport.

---

## Staging audit execution contract | 2026-10-20
Canonical findings: [docs/audit-admin-architecture-2026-10-20.md](docs/audit-admin-architecture-2026-10-20.md), [SRS.md](SRS.md), [DESIGN.md](DESIGN.md).

Before coding: state current expected behavior + exact file/line evidence + risk severity; choose smallest safe patch; isolate staging DB and sandbox gateway. Begin with failed tests for P0 (cron 404, Better Auth missing secret, unsigned Biteship business events, double cancel/stock ledger race, operator privileged mutations). Stop rather than performing live provider/production actions.

During coding: keep App Router entry thin; server action checks role/capability; domain service handles state machine; repository performs atomic DB writes; external effects through idempotent outbox. Avoid duplicate checkout state logic, unawaited async work without durable recovery, and speculative package removal.

After coding: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e with actual results logged. Document failure/retry/rollback and verification of Admin, Operator, Guest, Customer. Do not claim browser QA was completed unless screenshots/tests exist.

