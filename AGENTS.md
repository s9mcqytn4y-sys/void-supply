<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Panduan Agent Otomatis VOID Supply

1. **Next.js 16 App Router & Vercel Functions**:
   - Gunakan `import { waitUntil } from "@vercel/functions"` untuk latar belakang serverless tak-terblokir.
   - Hindari promises yang tidak di-await tanpa pembungkus `waitUntil()` pada route handler.

2. **Aturan Anti-Slop (Mode 1: DURING)**:
   - Dilarang keras memakai karakter em dash pada seluruh copywriting antarmuka pengguna maupun catatan komentar teknis di dalam kode, gantikan selalu dengan tanda titik dua (:), koma (,), atau tanda kurung ().
   - Desain tata letak wajib mengedepankan pendekatan mobile-first dengan tap target berukuran setidaknya 44px (`min-h-11`).
   - Terapkan utilitas standar kanonikal bawaan Tailwind CSS v4 tanpa arbitrary value yang redundan, seperti `max-w-105`, `max-w-70`, dan `bg-linear-to-*`.

3. **Integritas Transaksi & Keamanan P0**:
   - Seluruh mutasi status wajib menggunakan Compare-and-Set atomik di basis data PostgreSQL.
   - Lindungi privasi dan IDOR dengan token akses UUID v4 berentropi tinggi pada faktur (`/faktur`) dan label thermal (`/resi`).
   - Efisiensi saldo kuota Biteship: gunakan Transactional Outbox dengan Lease Reaper 5 menit dan pencegah duplikasi order eksternal.
   - Gunakan rute pelacakan kanonikal tunggal `/lacak` untuk seluruh navigasi publik.

4. **Autentikasi & Akun Pelanggan (Fase 2)**:
   - Sesi server-authoritative wajib mengikat transaksi checkout ke `pengguna_id`, bukan dari payload frontend.
   - Gunakan database-backed rate limiting dan session storage di Neon PostgreSQL tanpa dependensi Redis.
   - Proteksi `/demo/inbox` dengan kunci operator (`?key=...`) dan sanitasi seluruh data sensitif/token.
   - Pertahankan integritas pesanan historis melalui relasi `pengguna_id` yang non-destruktif pada `pelanggan`.

---

## Operating policy update (2026-10-20, higher-priority audit work)
Read [docs/audit-admin-architecture-2026-10-20.md](docs/audit-admin-architecture-2026-10-20.md), [SRS.md](SRS.md), [DESIGN.md](DESIGN.md) before implementation. Do not erase the Next.js auto-generated instruction block above.

1. Work on branches with small reviewed PRs. Scope Development and Demo Staging only; production changes and live gateway charges are prohibited in this initiative.
2. P0 sequence: reproduce cron 404, enforce fail-closed auth/webhooks, atomic cancellation and stock ledger, separate Administration/Operator capabilities, then refactor.
3. Treat every state transition as a guarded command with transaction, idempotency key, failure handling, permission check and tests. Never rely on menu hiding.
4. Active checkout is CheckoutProvider on src/app/checkout/page.tsx and permits guest ordering; legacy hooks/useCheckout is not canonical. Remove legacy only with import graph and tests.
5. No blind dependency removal or broad architectural rewrite. Next.js runs the app; Vite config is used for Vitest. TanStack Query should have a documented server-state consumer before expanding usage.
6. Provide evidence: changed paths, reproducer, test commands + actual results, security impact, rollback plan; if live staging cannot be reached say so.
7. Biteship testing credit and private Gmail are finite resources. Mock outgoing effects by default; never leak recipient PII and credentials.
8. Previous instruction suggesting protection of /demo/inbox with query key is obsolete: actual route redirects to /. Avoid reactivating test inbox without design and privacy review.

