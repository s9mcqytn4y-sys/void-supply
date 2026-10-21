# VOID Supply | Phase 0 Post-Commit Audit & Phase 1 Execution Plan
Tanggal audit: 2026-10-20 (WIB)
Scope: Development + Demo/Staging; Production EXCLUDED. Codebase branch `main`.
Compared: `11a577e175bfde175a66be226fc01d75240130ae` -> `df95f97887c96e50939aa88f0829e2c038606d2c` (one commit; 14 changed paths).
CI evidence: https://github.com/s9mcqytn4y-sys/void-supply/actions/runs/39448382872 (success, 20 Vitest files / 115 tests + 16 Playwright tests).
Historical ops evidence: https://github.com/s9mcqytn4y-sys/void-supply/actions/runs/39414950423 (expiry cron HTTP 404 / outbox skipped); no successful post-fix cron run observed.
Prior audit (draft PR, **not merged as of review**): https://github.com/s9mcqytn4y-sys/void-supply/pull/6

## Status semantics for agents
- FIXED-IN-CODE: change verifiable in source, but only covered by current tests; not proof of live staging.
- PARTIAL: meaningful mitigation landed but important bypass, business-policy, or regression test missing.
- OPEN: unchanged or fresh risk. Reproduce before implementation.
- PROPOSED: design decision or future requirement, not deployed behavior.

## Phase 0 scorecard after the newest push
| ID | Severity | State | Evidence / root cause | Next action / passing proof |
|---|---|---|---|---|
| ARCH-01 duplicate checkout hook | P1 | FIXED-IN-CODE | src/features/checkout/hooks/useCheckout.ts deleted (432 lines), export removed from index.ts; active /checkout uses CheckoutProvider for guest and logged-in | Guest and customer E2E plus hydration/mobile manual smoke after deployment |
| INV-02 inventory CAS + ledger atomicity | P0 | FIXED-IN-CODE, validation pending | stok-admin.action.ts now db.transaction with UPDATE RETURNING, ledger and audit within transaction, admin-only guard | Add real DB concurrent CAS conflict, transaction failure-injection tests; reject decimal/NaN/infinite quantity and require adjustment reason |
| INV-01 cancellation transaction | P0 | PARTIAL | pesanan-admin.action.ts now transactional, CAS RETURNING and ledger/audit atomic; however cancels ANY status except `dibatalkan` | Restrict state transitions: pending only (or admin-approved explicit paid refund reversal), forbid shipped/delivered; reconcile payment/shipper side effects; test 2 concurrent cancels and late settlement |
| RBAC-01 sensitive action control | P0 | PARTIAL | verifikasiHakAksesAdmin() introduced; cancel + stock adjustments restricted admin-only; staff guard remains shared in inquire, batch fulfillment, read operations | Introduce explicit permission/action matrix, 4-role negative tests, read/write/PII-level scopes, protect every mutating action; operator fulfillment policy |
| SEC-01 Better Auth secret | P0 | PARTIAL | hardcoded production-ready fallback and CRON_SECRET coupling removed; NODE_ENV=production outside CI now fail-closed on missing secret | Require high-entropy unique BETTER_AUTH_SECRET on all deployed stages; verify APP_ENV=staging and VERCEL detection; test empty/short/known secret, secret rotations and session invalidation; local development fallback should be opt-in |
| SEC-02 Biteship webhook | P0 | OPEN for public staging; PARTIAL for production branch | Biteship webhook fails closed only when APP_ENV=production and CI!=true; staging missing secret remains accepted; unauthenticated probe/ping recognized separately | Fail-closed for ALL deployed environments, verify exact configured Biteship headers against provider event log, protect business payloads; empty probe safe/no mutation; missing, wrong, duplicate, replay tests |
| OPS-01 cron HTTP 404 | P0 | OPEN | staging-cron.yml and cron routes unchanged; last failed scheduled run returned Vercel NOT_FOUND 404; outbox step skipped after failed expiry | Validate STAGING_APP_URL alias, project/deployment/protection and route mapping; add sanitized HTTP diagnostics + GET/401 smoke; independent expiry/outbox jobs (or always with guard); 2 consecutive successful scheduled runs |
| OUT-01 durable outbox | P1 but blocks ops | OPEN | non-awaited background trigger in outbox.service; lease reaper; retry jobs lacking next-attempt backoff; Biteship external call may complete before local ID persisted | Durable queue leases, next_attempt_at + exponential backoff, DLQ + observability; idempotent provider reference/inquiry; simulate crash after provider success; do not duplicate Biteship charges |
| PAY-01 manual Midtrans reconciliation and cancellation | P0 | OPEN | inquireMidtransStatusAction updates payment separately from guarded order transition, accepts `capture` regardless fraud status; cancel admin does not coordinate paid/refunded state | Make reconciliation transactional and gated by canonical payment state machine; validate capture acceptance/settlement, no cancelled-order resurrection, no payment/order disagreement; signed/out-of-order test |
| FUL-01 fulfillment double dispatch | P0/P1 | OPEN | batchRequestPickupBiteshipAction checks existing resi/order before call, but concurrent requests can both pass; outbound side effect precedes local persistence | Reserve unique fulfillment operation with DB CAS/idempotency marker, outbox-first dispatch, provider inquiry/recovery; no concurrent double booking / balance spend |
| SEC-03 seeded administrator credential | P0 potential exposure | OPEN | src/lib/db/seed.ts contains fixed demo admin username and reusable password; CI log emits credentials; seed can target remote DB using opt-in guard | Remove hardcoded credential + logging; use random/secret-provisioned one-time admin invitation; verify if staging was seeded with default and immediately rotate/disable where applicable; do not print/share passwords; safe migrator policy |
| DATA-01 seed scope safety | P1 | OPEN | Safe Seeding code still deletes existing catalog/variants before reseeding; shared staged DB can contain historical order references; optional remote override enables seeding | Use idempotent UPSERT via stable SKU and diff preview, no destructive rerun, backups/migration discipline, check foreign keys and rollback |
| OPS-02 email sandbox and PII | P1 | OPEN | personal Gmail SMTP primary, hardcoded fallback recipient for synthetic addresses, no staged recipient allowlist by default | Gate staging email dispatch by allowlist/capture; redact PII and use safe templates; configure delivery log and privacy retention |
| SEO-01 staging indexing | P1 | OPEN | robots.ts and sitemap.ts lack stage-specific indexing guard; lastModified generated as now | noindex/no-follow on staging, public canonical only, genuine lastModified and route exclusions; test headers |
| REPO-01 branch policy & doc drift | P1 | OPEN | main reported unprotected by branch API metadata; branch protection endpoint 403 from GitHub App; docs PR #6 open, not merged | Verify rulesets and required review/checks in GitHub UI; reconcile audit docs after P0; do not overwrite unmerged PR #6 |

## IMPORTANT verification limits
- New commit's GitHub CI succeeded: 115 Vitest / 16 Playwright, TypeScript, ESLint, migration/seed, Next build. This is REAL GitHub evidence.
- New admin tests primarily validate role denial via mocked session; no added actual DB-level parallel cancel/mutation tests in this commit.
- Latest successful CI uses isolated local PostgreSQL and mock providers. Does NOT mean staging webhook/cron/e-mail/Biteship checkout were live-tested.
- No runtime code changes or live provider actions were executed as part of THIS review.

## Go/No-Go decision
**NO-GO for Phase 1 feature expansion** while public staging webhook might accept unsigned business events, order cancellation can void paid/shipped orders, seeded admin credential could be active, or 15-minute maintenance cron remains broken.
**GO for Phase 1 planning and zero-behavior-change refactoring** on short-lived branches with tests, once P0 repair PRs are prioritized. Avoid conflating refactor and payment correctness changes.

### P0 residual implementation tickets (dependency order)
- P0-A: Stage webhook fail-closed (test absent/wrong header with provider's test webhook, ensure probe contract) and seed credential rotation hardening.
- P0-B: Admin cancellation domain state guard + payment reconcile state consistency + optimistic event handling. Negative tests paid/shipped/delivered, concurrent cancel x2 and late settlement.
- P0-C: Cron hostname/route and independent processing; outbox reports non-200 on fatal failure, dashboard backlog visible, two scheduled runs green.
- P0-D: Admin inventory input runtime Zod validation, SQL failure injection tests; fulfillment race guard and provider outbox idempotency.
- P0-E: Verify all deployed secrets unique, environment-specific and never logged; hygiene of existing public logs and screenshots.

## Phase 1: Architecture & Maintainability (target: modular monolith)
### Scope guard
This Phase 1 does NOT implement CRM, CMS, marketing campaign engine, price engine or extensive storefront redesign. They need stable domain contracts first. Do not introduce Redis, microservices, or new global state library without a measured bottleneck. Keep Next.js App Router as runtime; Vite/Vitest is unit-test tooling, Tailwind v4 via PostCSS. Keep all payment/shipping in sandbox/testing.

### 1A. Evidence-first architecture inventory
Inputs: package.json + package-lock, source tree import graph, Next bundle, actual route tree, .github, Drizzle schema & migrations.
Tasks:
1. Generate dependency/import graph (module-level and circular dependencies) across src/features, src/lib, app routes.
2. Classify dependencies used/unused/duplicate/transitive (TanStack Query, axios, @tailwindcss/vite, pg/postgres/neon and @neon/config/env). Do NOT remove without CI-backed usage proof; check scripts and dynamic imports too.
3. Measure large files/functions by LOC, responsibilities, cyclomatic complexity, TS any casts; identify dual source of truth and modules bypassing services.
4. Document `docs/architecture/phase-1-current-state.md` with owner, data boundaries, citations, risks. Measure build/lint/test duration and bundle before changes.
AC: inventory baseline complete, top 15 hotspots ranked by change risk and frequency, no source changes mixed into inventory PR.

### 1B. Canonical domain/use-case boundaries
Target: thin route/page, authenticated Server Action, domain service/use-case, repository/transaction, integration adapter. Introduce minimal types/interfaces; no new DI framework.
- Order & Payment: canonical state machine and DTOs; service responsible for transitions, not duplicated across cron/webhook/admin.
- Inventory: reserve, release, adjust, ledger as one transaction command. Formal invariants `stock >= 0`, exactly-once adjustment ID, no false success.
- Fulfillment: provider adapter + outbox, shipment state transitions, safe retry; do not call provider from UI components.
- Catalog/Pricing: read-only repository boundary and SKU/variant immutable booked snapshot, prepare for future CMS without implementing CRUD now.
AC: no direct external API in domain transactions, no read/write permissions inside UI only, regression tests for existing product/order flows.

### 1C. React/Next state-management contracts
- Canonical server state: RSC and Server Actions for catalog/order/account; use revalidatePath/revalidateTag deliberately; do not mirror authoritative prices/payments in client store.
- Zustand: cart persisted, drawer/UI state; `CartHydrationProvider` remains single hydration entry point. Regression: refresh, multi-tab, stale reconciliation, cart age, hydration mismatch.
- React Hook Form + Zod: one checkout draft; ensure form validation and server validation match without duplicating business rule definitions.
- TanStack Query: only retain/add QueryClientProvider if actually used for real client polling/live admin queues. If unused, remove in dedicated dependency PR.
AC: no duplicate checkout implementation, 0 hydration errors across guest/login and 360/768/1440 viewport tests, cart/checkout E2E green.

### 1D. Async/error/retry and observability standards
Define typed command/result boundary (`success | conflict | unauthorized | invalid_input | retryable | terminal`) for new or touched actions, centralized user-copy guidelines, provider errors redact secrets.
- Each route: loading, no-data, partial, failed, optimistic update, disabled submit, safe retry and user-friendly recovery.
- Every integration: explicit timeout, retry budget, request ID/correlation ID, idempotency key, activity trail, replayability without double side effects.
- Outbox: SQL lease/cancellation policy, backoff with next_run_at, DLQ/admin replay with approval, provider reconciliation, health metrics.
AC: injected 401/403/404/409/429/500/timeouts produce stable UI and no duplicate charge/shipment.

### 1E. Database architecture
- Validate Neon branch separation Development vs Staging; DB pool/connectors; inspect SQL schema indexes/unique/check constraints and migrations; use EXPLAIN on representative admin list queries.
- Define `migration -> reversible/apply checklist -> CI disposable DB -> staging backup -> smoke verification`.
- Normalize future analytics with read models only when needed; avoid premature event sourcing. Stock movement ledger remains append-only.
- Delete or isolate unsafe seed behavior, preserving existing order/variant references.
AC: concurrent operations do not drift stock, staged migration rollback rehearsal, zero data loss across dry-run.

### 1F. UI primitives, responsive admin and SEO
- Audit existing primitives (`src/components/ui`, `src/features/admin/components/primitives`) before consolidating button/modal/input/table/status.
- Brutalist visual character retained; WCAG keyboard focus, 44px touch, accessible contrast, 200% zoom, mobile/tablet tables, responsive filters, empty/loading/error states.
- Optimize images/font/media/per-route client JS and ensure staging noindex without affecting public landing.
AC: visual snapshots 360/390/768/1024/1440, keyboard and reduced-motion, no overflow, measured bundle/performance comparison.

## Suggested PR slices (small, sequential)
| Order | PR scope | Est effort (relative) | Merge gate |
|---|---|---|---|
| P0.1–0.4 | Residual security/ops/transaction repairs | high, prerequisite | concurrency + webhook+cron stage proof |
| 1A | Architecture + dependency inventory, ADR, baseline | S | docs-only review |
| 1B | Dead-code/dependency cleanup (confirmed unused only) | S | no regressions, lockfile stable |
| 1C | Inventory/Order/Payment extracted use-cases | M | state transition tests, no behavior regression |
| 1D | Fulfillment/outbox adapter standardization | M | retry/failure tests, no provider double dispatch |
| 1E | Checkout/Cart client state cleanup | S/M | guest/user/multi-tab E2E, hydration screenshots |
| 1F | DB migrations/indexes/seeds and data policy | M | reversible smoke and known dataset |
| 1G | Admin primitives + UX state system + staging SEO | M | a11y and breakpoint snapshots |

## Solo developer agent task contract
Every task and PR description must include:
- Baseline SHA and affected use cases, evidence file:line and a minimal reproducer.
- Precise behavior invariants; roles authorized (Guest / Customer / Operator / Admin).
- Classification `BUGFIX` / `NO-BEHAVIOR-REFACTOR` / `NEW-FEATURE`, no combining without rationale.
- Smallest planned diff, dependencies, migration impact and rollback.
- Tests: actual commands/results vs future tests; include DB concurrency for mutable business data, contract event tests, guest/role-denial Playwright.
- Measured before/after: LOC/complexity/build/bundle/DB query plan relevant to change.
- Secrets/PII policy: no real credentials, no real payment, no unapproved Biteship credit consumption, no live email blasts.
- Final review checklist: lint, typecheck, unit, E2E, stage smoke, no production changes, changelog/ADR updated.

## Documentation handoff
- `README.md`: actual commands and environment, note Phase 0 status once PR merged.
- `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`: link this plan and use task contract; avoid duplicate 50-page instructions.
- `PRD.md` / `SRS.md`: requirements acceptance, no claims of implementation without proof.
- `DESIGN.md` / `WIREFRAME.md`: component/state and breakpoint UX specs.
- `docs/architecture/*`: current state architecture, ADR decisions and PR-specific diff.
Do not modify existing docs PR #6 blindly; it is unmerged and based on earlier commit. Rebase/merge documents deliberately after validating new Phase 0 facts.
