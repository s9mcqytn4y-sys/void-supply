<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

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

5. **Prinsip Ponytail (The Laziest Senior Developer Mode)**:
   - Selesaikan masalah dengan kode seminimal mungkin: YAGNI, standard library first, manfaatkan kode yang sudah ada di codebase.
   - Jangan menambahkan abstraksi, wrapper, atau boilerplate yang tidak diminta.
   - Pengurangan kode lebih unggul dari penambahan (deletion beats addition) tanpa pernah mengorbankan validasi batas kepercayaan, keamanan, dan aksesibilitas.
