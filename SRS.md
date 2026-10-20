# VOID Supply | Staging Admin & Commerce System Requirements Specification
Version: 2026-10-20. Scope: Development + Demo Staging only; production excluded.
Related: PRD.md, DESIGN.md, PERSONA.md, WIREFRAME.md, docs/audit-admin-architecture-2026-10-20.md.
Requirements are TARGETS unless explicitly marked CURRENT; not claims of deployed functionality.

## Actors and environment
Guest: browse, cart, checkout with guest token, tracking using authorized order access.
Customer: all guest functions plus authenticated account, addresses, order history and account security.
Operator: assigned fulfillment, warehouse count, support triage, limited PII and no pricing/security administration.
Administration: operator rights plus catalog/promo/config/user approvals/refunds within policy.
Provider/system: Midtrans sandbox webhook, Biteship test webhook, outbox worker and GitHub Actions cron.
DEV: local DB and provider sandbox/mock, test secrets; DEMO: isolated Neon DB and sandbox/test provider keys, privacy-safe emails. Production not operated or modified.

## Functional requirements
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-01 | Role-aware authentication and authorization | Every admin query/mutation checks session and capability server-side; guest/customer/operator denial tests; no default static secret. |
| FR-02 | Guest and authenticated checkout | Purchase works without login; current server totals validate price, stock, voucher, shipping; order access protected; multi-submit idempotency tested. |
| FR-03 | Inventory ledger | Every stock change, reservation/release and admin adjustment commits atomically with ledger and audit; concurrent updates never report phantom success or go below zero. |
| FR-04 | Cancellation/refund transitions | State machine forbids unsafe cancel after settled/shipped unless explicit reversal workflow; concurrent cancellation restores stock at most once; audit reason required. |
| FR-05 | Payment reconciliation | Midtrans valid signature+amount, idempotent/out-of-order handling, no terminal downgrade; manual reconcile fetches provider before DB change. |
| FR-06 | Shipping webhook | Only authorized Biteship event changes shipment; validated payload, dedupe and order-specific transitions; delivery event cannot complete unpaid order. |
| FR-07 | Reliable background jobs | Cron expiry and outbox independently execute, report HTTP status and backlog, recover leases, retry capped with backoff and dead letter; external side effects idempotent. |
| FR-08 | Product management | Create/edit/archive/publish products, variants color/model/size with unique SKU, image upload preview and publish approval, search and audit. |
| FR-09 | Drop types | Regular, preorder, limited allocations and bundles; BOM-based bundle reservation; preorder ship window notice; no negative stock. |
| FR-10 | Pricing | Versioned base price/promotions/vouchers, deterministically simulated server-side, margin floors and immutability of booked order pricing. |
| FR-11 | Admin operations | Dashboard includes unfulfilled, expired, low stock, failed gateways and jobs; order queue/filters, fulfillment actions and activity trail. |
| FR-12 | CMS/CRM/Marketing | Editorial and campaign drafts with scheduling, UTM, consent/unsubscribe, explicit source of audience segmentation and audit. |
| FR-13 | Support | Ticket queue, order linkage, response SLA, return/RMA, documented cancellation/refund handoff, permissions. |
| FR-14 | Documents/uploads | Signed/scoped access, MIME/content verification, max size, malware safety control, version/retention and audit; no public PII. |
| FR-15 | Analytics | Clear definitions for GMV vs paid net sales, AOV, refunds, funnel, outbox health; manual reconciliation and IDR/WIB displayed. |

## Nonfunctional requirements
| ID | Requirement | Verification |
|---|---|---|
| NFR-01 | Confidentiality | No production/live credentials or personal app passwords in repo, rendered browser payload or logs. Secret scan + env smoke validation. |
| NFR-02 | Performance | Track p75 LCP/INP/CLS via field metrics; no fabricated targets without baseline; measure desktop/mobile and compare before/after. |
| NFR-03 | Accessibility | WCAG 2.2 AA-oriented review: keyboard, focus, 44px touch targets, contrast, screenreader status. |
| NFR-04 | Resilience | Network errors return actionable retry/status; retries do not duplicate charges, Biteship order or stock mutations. |
| NFR-05 | Observability | Structured events with trace/order ID, request class, provider status, duration and redaction; no passwords, address or email body in logs. |
| NFR-06 | Reliability | Two consecutive scheduled staging maintenance runs green; any failed step independently rerunnable and outbox backlog visible. |
| NFR-07 | Database integrity | Migrations versioned, tested against disposable DB, constraints+indexes reviewed; no db:push into shared stage without approval. |
| NFR-08 | SEO | Staging explicitly noindex; public canonical unique, structured Product/Organization/Breadcrumb schema validated; sitemap only appropriate indexable pages. |
| NFR-09 | Visual UX | Test 360/390/768/1024/1440 and reduced motion, empty/loading/error/disabled/partial states per critical route. |
| NFR-10 | Scope guard | No production deployment, key switching or live payment/shipping dispatch from testing tasks. |

## Verification matrix
1. Lint + TS + unit tests + build + Playwright with isolated PostgreSQL; assertions checked at same commit.
2. Contract tests: Midtrans signed/unsigned/duplicate/out-of-order; Biteship unauthorized/missing secret/duplicate/late; cron 200/401/500/404 smoke.
3. Concurrency: simultaneous checkout same SKU, same-key retry, two simultaneous admin cancels, competing manual adjustments.
4. Sandbox manual: webhook callbacks, Snap redirect+notification, invoice/waybill, Biteship test credit impact; never assume gateway sandbox isolation without checking settings.
5. Visual/accessibility: guest, customer, operator and admin across mobile/tablet/desktop; keyboard interactions and all async states.
6. Data: migration rollback plan, backup/recovery dry run against non-production Neon branch; record tables/rows and invariants before/after.
7. Operational signoff: Cron and outbox green + health dashboard; failed job requeue observed; role-specific end-to-end fulfillment.

## Definition of done per agent PR
Problem reproduced; smallest diff; security/privacy review; permission matrix; tests listed with command and actual result; docs and ADR updated; no staging/production secrets disclosed; rollback considered; no provider side-effects performed without explicit approval.
