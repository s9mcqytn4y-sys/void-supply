# VOID Supply | Audit Arsitektur & Operasional Staging
Tanggal: 20 Oktober 2026 (Asia/Jakarta)
Scope: development + demo/staging; production di luar cakupan.
Baseline: main @ 11a577e175bfde175a66be226fc01d75240130ae.
Evidence: GitHub tree (590 entries), source files terkait, GitHub Actions runs 39414950423 / 39378395860 (failure), CI run 39349829180 (success). Demo URL tidak dapat diaudit secara visual melalui browser pada sesi ini.

## Kontrak pembacaan
- VERIFIED: fakta berdasarkan sumber repo atau log workflow, belum tentu telah dibuktikan dengan live exploit.
- RISK: potensi dampak berdasarkan implementasi, memerlukan testcase/staging reproduction.
- PROPOSED: requirement/opsi desain, bukan fitur saat ini.
- Jangan menyatakan CI hijau sebagai validasi webhook live atau operasional cron.
- Jangan menyentuh env production, menjalankan charge nyata, mengurangi saldo Biteship sembarangan, mengirim email personal berulang, atau menghapus data tanpa izin.
- Urutan delivery: reproduce -> test yang gagal -> perbaikan minimal -> test lulus -> review diff -> PR -> manual QA di staging -> merge.
- Berkas ini menjadi sumber rujukan prioritas terbaru; dokumen lama tetap sumber sejarah dan tidak boleh dianggap implementation truth jika berbeda dengan kode.

## Executive assessment
Platform memakai Next.js 16.3.8 App Router dan React 19.3.0; Tailwind CSS 4 via PostCSS, Vite 6 di jalur Vitest; Drizzle + Neon/PostgreSQL, Better Auth, Zustand, integrasi Midtrans/Biteship, Nodemailer, GitHub Actions cron. Komponen checkout yang aktif memakai CheckoutProvider (src/app/checkout/page.tsx), tidak mewajibkan login; hook useCheckout lama masih ada dan memuat redirect login tetapi tidak digunakan pada halaman utama. Admin sudah memiliki dashboard, order, inventory, mutation ledger, activity log dan batch fulfillment. CMS, CRM, price-rule engine, asset/document management, dan marketing automation terpadu belum tampak sebagai modul operasional admin pada route tree.

## Temuan, root cause, dan mitigasi
| ID | Level | Status | Temuan / evidence | Mekanisme penyebab / risiko | Corrective action dan exit test |
|---|---|---|---|---|---|
| OPS-01 | P0 | VERIFIED | Workflow staging-cron gagal berulang: step expiry GET mendapatkan HTTP 404 dari Vercel; outbox step skipped. Log run 39414950423, job 118601595772. | URL yang tersimpan di STAGING_APP_URL, Vercel deployment/alias/protection, atau route aktif tidak mengarah ke target yang sesuai; penyebab final 404 belum diverifikasi. | Tambahkan diagnostic tanpa membocorkan secret: HTTP status, hostname sanitized, response headers, route smoke test; periksa env URL, alias dan project deployment. Pisahkan kedua steps via if: always() bersyarat agar outbox tidak ikut terlewat. Tes manual success kedua endpoint. |
| SEC-01 | P0 | VERIFIED | src/lib/auth/auth.ts memiliki fallback Better Auth secret ke CRON_SECRET lalu string hardcoded. | Bila BETTER_AUTH_SECRET hilang, sesi dapat ditandatangani dengan secret yang dikenal / dipakai silang. | Fail-closed di semua deploy nonlocal, wajib secret unik >=32 byte, rotasi terencana dan regression config tests. Jangan mencetak secret. |
| SEC-02 | P0 | VERIFIED | src/app/api/biteship/webhook/route.ts melewati pemeriksaan header saat BITESHIP_WEBHOOK_SECRET kosong; empty/ping probes diterima sebelum auth. | Deployment yang lupa secret dapat menerima status bisnis tak terautentikasi. | Wajibkan autentikasi pada business events, validasi skema dan provenance sesuai mekanisme Biteship resmi, gunakan allowlisted probe tanpa mutasi, replay tests & wrong-secret tests. Tidak boleh mengasumsikan Biteship mengirim header custom sampai diverifikasi di dashboard/provider. |
| INV-01 | P0 | VERIFIED | batalkanPesananAdminAction melakukan update status, restore stok per item dan audit dalam operasi DB terpisah tanpa satu transaksi; update status tidak memeriksa affected row. | Kegagalan parsial dan cancel paralel dapat menyebabkan stok pulih ganda / status tidak selaras; menyalahi klaim atomic. | Pindah ke 1 transaksi DB dengan CAS returning; restorasi hanya jika transisi berhasil; ledger dan audit dalam transaksi yang sama; concurrent cancel x2 dan failure injection tests. Kebijakan pembatalan order paid/shipped perlu diputuskan. |
| INV-02 | P0 | VERIFIED | mutasiStokAdminAction memakai CAS stok tapi tidak memeriksa hasil update; ledger dan audit berada di luar transaksi yang sama. | Race bisa menghasilkan false-success ledger; kegagalan insert menyebabkan stok berubah tanpa jejak. | UPDATE RETURNING wajib berisi 1 row; ledger+audit dalam transaksi; jika CAS gagal response conflict/reload; test dua operator concurrently. |
| RBAC-01 | P0/P1 | VERIFIED | verifikasiStafAdmin() memperlakukan admin dan operator sama; admin mutations memakai hanya guard tersebut. | Tidak ada permission matrix server-side untuk tindakan berisiko, operator dapat mengakses tindakan admin yang seharusnya terbatas. | Policy capability-based di service/action, bukan hide menu saja; admin-only untuk pricing, publishing, users, cancel/refund, security settings; operator untuk fulfillment dan stok dengan approval/limit. Negative authorization tests. |
| OUT-01 | P1 | VERIFIED | outbox.service.ts menjalankan fungsi async tanpa waitUntil pada picuProsesOutboxNonBlocking(), reaper 5 menit memulihkan lease. | Kerja proses serverless bisa terputus; side effect eksternal Biteship sukses tetapi pencatatan ID belum commit lalu retry berpotensi order/cost ganda. | Jadikan cron/worker sumber delivery, transactional outbox, lock lease dengan token/attempt, backoff + jitter dan next_run_at, dead-letter queue; pasang idempotency merchant ref/API inquiry sebelum retry fulfillment. Jangan menagih ulang otomatis tanpa bukti provider. |
| OBS-01 | P1 | VERIFIED | Kirim Gmail SMTP personal sebagai sender primary, fallback Resend/mock; email fiktif diubah ke mailbox personal (email.service.ts). | Quota, deliverability, privasi test recipient, batas provider, silent mock fallback saat konfigurasi belum benar. | Untuk staging nonaktifkan live deliverability secara default atau allowlist penerima yang dikontrol, tampilkan status outbox/sent/failed, SPF/DKIM/DMARC bila pakai domain resmi; bersihkan hardcoded personal addresses dalam kode/template. Jangan kirim email credentials ke source control. |
| ARCH-01 | P1 | VERIFIED | Dua implementasi checkout state: CheckoutContext.tsx (~17 KB) dipakai; hooks/useCheckout.ts (~15 KB) masih diekspor dan berisi redirect login yang bertentangan dengan guest flow. | Divergensi logic dan peluang reuse hook usang yang memaksa login, state duplication. | Audit import graph, test guest flow, pilih single checkout orchestration, migrasi dependents lalu hapus deprecated hook setelah bukti tidak dipakai. |
| SEO-01 | P1 | VERIFIED | robots.ts tidak memiliki APP_ENV gating; sitemap.ts memuat halaman /lacak dan menyetel lastModified=new Date() setiap build/request; metadataBase memakai APP_URL. | Staging berpotensi terindeks bila terjangkau crawler, sinyal tanggal sitemap noise, canonical host salah bila ENV keliru. | Set noindex/nofollow + X-Robots-Tag di staging dan non-indexable routes; robots disallow staging; sitemap hanya published/SEO pages, lastModified aktual; canonical memakai canonical public domain sesuai lingkungan. |
| ARCH-02 | P1 | VERIFIED | package.json berisi TanStack Query, @tailwindcss/vite, axios, tiga driver DB terkait pg/postgres/neon dan @neon/config/env. Vite config digunakan untuk Vitest; Next adalah runtime build. | Risiko dependency bloat dan salah asumsi Vite sebagai production bundler. | Jalankan import graph, bundle analysis, npm ls, npm audit dan cek versi package-lock; jangan hapus dependensi tanpa bukti. Tetapkan RSC/Server Actions sebagai jalur server state standar, TanStack Query hanya bila kebutuhan cache client nyata. |
| DOC-01 | P2 | VERIFIED | README.md, PERSONA.md, PRD.md, WIREFRAME.md memakai file:///c:/Projects/... serta merujuk dokumen yang tak terlihat di tree saat audit. GEMINI.md sangat panjang dan beberapa heading berulang. | Tautan tidak portable di GitHub dan SOP agent ambigu; dokumentasi bisa lebih optimistis dari kode. | Ganti dengan relative repo paths secara bertahap, ringkas source-of-truth, catat ADR dan dated changelog; jangan hapus histori tanpa cek. |
| UI-01 | P2 | RISK | UI belum diuji secara visual pada demo URL karena akses browser gagal; source menunjukkan mobile drawer, brutalist primitives, page-level catalog loading/error. | Ketiadaan visual cross-device / accessibility evidence untuk Admin, pelanggan, tablet. | QA Playwright screenshot 360/390/768/1024/1440 px; keyboard, screen-reader labels, 200% zoom, contrast dan reduced-motion; uji funnel dan responsive admin tables. |

## Lingkup keamanan tambahan (verification queue)
1. Auth: RBAC pada tiap Server Action, session invalidation, secure cookies, CSRF dan Better Auth trusted origins; negative tests sebagai guest/customer/operator/admin.
2. Webhooks: Midtrans memiliki pemeriksaan signature SHA-512 dan gross amount serta CAS status; uji replay, out-of-order settlement/cancel, duplicate, invalid signature, unknown order, late settlement setelah stock release. Jangan asumsikan aman hanya karena unit test lulus.
3. Order/faktur/resi: regression IDOR untuk guest access token dan logged-in ownership; hindari kebocoran PII dalam logs.
4. Pengunggahan: belum ada CMS/file upload Admin; pakai signed upload storage, whitelist MIME+magic bytes, ukuran, antivirus/scan bila perlu, scoped permission, audit, retention.
5. ENV: isolasi DB Development vs Staging melalui Neon branch terpisah; DEMO_MODE=true memaksa sandbox/test; semua server secrets server-only; pemeriksaan fallback config harus fail-closed untuk staging.
6. GitHub repository main saat audit tidak protected; periksa branch ruleset/policy dan batasi merge via PR mandatory checks.
7. Supply chain: Dependabot/Renovate jika tersedia, lockfile review, npm audit tanpa auto-upgrade masif, CodeQL/secret scanning, minimal GitHub Actions permissions.

## Peta modul saat audit
| Domain | Evidence code | Status |
|---|---|---|
| Storefront + PDP | src/features/landing; catalog; journal, material | implemented, visual QA pending |
| Cart + hydration | cart/stores + CartHydrationProvider; reconciliation | implemented, multi-tab races perlu regression |
| Guest/auth checkout | CheckoutProvider + buat-pesanan.action | implemented, real sandbox live test belum disaksikan |
| Payment | midtrans webhook/service + payment states | implemented, replay/out-of-order tests diperlukan |
| Shipping | Biteship webhook/service, label/resi, fulfillment | implemented, webhook auth P0 |
| Admin overview | /admin, /admin/pesanan, /admin/inventaris, /admin/aktivitas | implemented limited operations |
| Catalog authoring | product repository read actions | CMS CRUD admin not observed |
| CRM/Campaign/CS/Price engine | no operational admin routes in tree | proposed |
| Database | Drizzle schema + 0012 migrations, Neon/local | implemented, migration safety policy pending |
| Email/jobs | Gmail/Resend, outbox, cron | partially operational; observed cron failure |

## Target arsitektur (modular monolith, bukan microservices)
- src/app: route entry + metadata/loading/error only; no business orchestration.
- src/features/<domain>/{components,actions,schemas,services,repositories,types}: interface -> authenticated action/controller -> domain service -> repository/DB. Domain services tidak bergantung UI.
- src/lib/{auth,db,environment,integrations,observability}: adapter/infrastructure, tidak menyerap semua business rules.
- Domain core: Product (Product/Variant/SKU/Collection/Release), Pricing (price book/rule/voucher), Inventory (stock + reservations + append-only ledger), Order, Payment, Fulfillment, Customer, Campaign, Content, Support.
- State: Server Components/Server Actions untuk canonical server state; Zustand terbatas cart/drawer/UI persisted client; React Hook Form untuk draft form; TanStack Query opsional untuk long-lived client polling dengan query keys dan invalidasi jelas. Hindari prop drilling ekstrim dan dual sources of truth.
- Explicit command boundaries: event/payment transition state machine, transaction DB pendek dan deterministic, outbound API via outbox; no external network request while holding DB transaction.
- Events and IDs: order_id/merchant_reference unique, webhook inbox dedupe by provider event fingerprint, immutable audit ledger, per-attempt/trace IDs; safe retry selalu outcome-known.

## RBAC matrix target
| Capability | Administration | Operator |
|---|---|---|
| View dashboard, orders, inventory, tracking | yes | yes (operational fields only) |
| Fulfillment, printing labels, recording shipment | yes | yes |
| Physical stock count/damage | yes | request/limited adjustment; approval over threshold |
| Cancel paid order, refunds, override payment | yes with reason + dual confirmation | no |
| Price/cost, vouchers, campaign budget, publish CMS | yes | no or draft-only |
| Change staff roles, integration keys, policy | yes | no |
| CRM/support tickets | yes | assigned operational tickets, PII minimized |
| Audit logs, export PII, DB maintenance | yes restricted | read-limited/no |
Server-authoritative check wajib dieksekusi per action. Test semua denial; menu hiding bukan security boundary.

## Operasional admin: proposed information architecture
1. Overview: orders awaiting payment, paid/unfulfilled, SLA overdue, low stock, webhook/outbox queue, retry errors; each KPI leads to queue.
2. Orders: search/filter/status/age/payment/shipping; order detail with payment timeline, fulfillment events, customer contact, internal note, safe retry and manual reconcile.
3. Inventory: variant-level ledger, available/reserved/sold/damaged, stocktake import/export, reorder threshold and adjustment approval; avoid negative and ghost stock.
4. Catalog/CMS: drafts, structured size-color-model variants, SKU uniqueness, bundles BOM, preorder quota+ETA, limited-drop release window, media uploads, schedule publication, rollback.
5. Price engine: base price, cost, margin floor, dated promotions, coupon eligibility, stack precedence, versioned rules, preview simulation and audit history. Server-side totals authoritative.
6. Campaign/CRM: consent & unsubscribe, segmentation by event and preference, welcome/cart follow-up (only opt-in), drop schedule, per-campaign UTM, attribution with privacy policy.
7. Support/returns: inbound contact queue, SLA, macros, order-linked tickets, proof upload, warranty window, RMA and reversal process.
8. Finance/analytics: gross/net revenue, confirmed-paid vs pending, returns, stock turnover, AOV, funnel, cohorts, cancellation reasons, provider costs, outbox backlog; timezone IDR/WIB, explicit source definitions.
9. Settings/roles: staff invitation/deactivation, provider health tests, limited secrets metadata (never display values), warehouse origin, shipping policies, access & audit.
10. Document center: invoice/packing slip/waybill, signed access, version & retention metadata, immutable ledger references.

## Harga, bundling, preorder, limited drops
- Current DB enum tipe_produk = standar/pre_order/bundle, status_produk draft/aktif/habis/arsip. Limited edition bukan tipe terpisah: representasikan melalui release/campaign + fixed allocation, jangan menciptakan enum tanpa ADR.
- Bundles: BOM per component SKU + quantity, atomic reservation for all components, no oversell, validate partial fulfill/refund policy.
- Preorder: promised ship window, preorder allocation independent from on-hand inventory, conversion to fulfillment, customer notice on delay, refund policy.
- Price precedence deterministic: SKU base -> configured campaign -> coupon -> shipping -> final, integer IDR only, immutability order line snapshot on purchase.
- Admin CRUD harus punya draft/publish/archive, optimistic concurrency revision, staged media, preview, confirm destructive actions dan audit.

## Design / Branding (proposed)
Brutalist streetwear dengan disiplin editorial, bukan sengaja membingungkan. Arknights dipakai sebagai inspirasi ritme HUD/technical labels, bukan menyalin aset, logo, karakter, typography proprietary atau trade dress. Screen utama menonjolkan fotografi, CTA tajam, hierarchy, transparansi sizing dan harga. Admin lebih padat daripada storefront namun aksesibel: monospace hanya untuk ID/status/label, data tabular mudah dipindai, warning/error tidak sekadar warna. Mobile 360px dan tablet 768px sebagai baseline. Lihat DESIGN.md dan WIREFRAME.md.

## Roadmap solo developer (urutan dependensi, bukan janji tanggal)
### Gate 0: P0 safety, 1–2 focused sprints
- Fix cron HTTP 404; independent steps, observable outbox, proof green scheduled run.
- Fail-closed auth secret and Biteship webhook verification.
- Atomic cancel and stock mutation + concurrency tests.
- RBAC server-side negative tests; exclude prod/sandbox money; clone DB only from scrubbed staging fixture.
EXIT: 0 blocker P0, 2 successive scheduled maintenance runs succeed, 0 failed sensitive role test, no stock drift on injected errors.

### Gate 1: Contract & cleanup
- Audit import graph for unused useCheckout, package deps, aliases; remove only through small PRs.
- Domain service/repository boundaries for Order, Inventory, Payment, Catalog; route-level loading/error/action progress/retry.
- Introduce migration PR checklist and DB uniqueness/index analysis with EXPLAIN.
EXIT: no multi-sources-of-truth checkout, lint/typecheck/unit/E2E green, critical path covered, architecture decision recorded.

### Gate 2: Admin fulfillment backbone
- Queue-first dashboard, operational order table/search, webhook/outbox monitoring + replay with guards, inventory stocktake approval, export docs.
EXIT: admin/operator role-specific journey can fulfill 10 sandbox orders without hidden manual DB editing.

### Gate 3: Catalog/CMS/price
- Product + variant CRUD, SKU uniqueness, upload pipeline, release scheduling, campaign price preview, bundle BOM, preorder allocation.
EXIT: create draft -> preview -> approve -> publish -> order -> archive via UI; rollback safe.

### Gate 4: CRM/support/analytics/marketing
- Support inbox/RMA, consent, CRM segmentation, marketing UTM, performance dashboard, privacy retention and DSAR workflow.
EXIT: measurable funnel and audit logs, no unsolicited email, no orphaned PII.
Production launch is not in this roadmap scope.

## Agent task contract (gunakan di setiap task)
- Problem & evidence: file, line, run URL, exact repro step.
- Severity: P0/P1/P2 and user/business impact.
- Expected behavior: acceptance criteria, state transitions and permission rules.
- Constraints: development/staging only, sandbox providers, preserve current transactional invariants.
- Implementation plan: smallest modular change, no duplication, verify external API docs, no mass rewrite.
- Tests: unit + integration DB + contract fake webhook + Playwright desktop/mobile + role denial + concurrency.
- Observability: structured logs with correlation ID, redact secrets/PII, alert threshold + recovery.
- Rollback: migration backward plan, feature flag/controlled rollout, requeue/reconcile without double spending.
- Evidence: list tests actually run and output; distinguish unexecuted suggestions.
- Do not auto-update production, change provider callbacks without explicit approval, or print environment credentials.
