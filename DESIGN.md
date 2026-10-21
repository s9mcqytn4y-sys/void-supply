# VOID Supply | Design System & Admin UX Decisions
Version: 2026-10-20, staging-only proposal. Baca docs/audit-admin-architecture-2026-10-20.md untuk temuan berdasarkan kode.
Source of truth: implementasi Next App Router di src/app dan src/features; WIREFRAME.md menyimpan desain historis.

## Intent
Brutalist utility x underground streetwear: editorial high contrast, modular information panels, restrained operational HUD, authentic material/product photography. Arknights-inspired visual rhythm, never copied IP or exact layouts. Kompetitor rujukan: Erigo, Thanksinsomnia, Screamous; identitas VOID harus berbeda.

## Tokens
- Backdrop: #0B0B0B, surface #161616, primary text #F5F5F5, secondary #A3A3A3; highlight hanya saat semantik penting, bukan dekorasi dominan.
- Grid 4/8 px, rectangular corners, hairline 1px dividers, 44px minimum interactive tap targets, typography Archivo for editorial headings and JetBrains Mono only for SKU, meta labels, timestamps, statuses.
- Adaptive layout: 360–430 phone, 768–1023 tablet, >=1024 desktop; overflow tables replaced with mobile cards or horizontal scoped scroll with sticky labels. Avoid page-wide horizontal scroll.
- WCAG AA contrast, visible focus ring, real labels, semantic tables, full keyboard, reduce motion support, consistent error copy, 200% zoom.
- Animation informative only; checkout responsiveness and status feedback more important than scroll effects.

## Component specification
- Primitive: Button (primary/secondary/ghost/destructive with idle/loading/disabled), Input, Select, Checkbox, Radio, Dialog (focus trap/escape), Drawer, Badge, Skeleton, Toast, InlineAlert, EmptyState, Progress, Table, Pagination.
- All asynchronous surfaces expose idle/loading/partial/success/empty/error/retry; distinguish recoverable network errors vs irreversible payment/stock transitions.
- Data entry: field errors inline; unsaved-change guard; destructive actions require reason and confirmation; never swallow error after toast.
- Mobile CTA: safe-area padding and thumb reachability; separate public storefront vs dense admin navigational modes.
- Admin tables: filters in URL for shareable views, sticky table headings, actionable empty state, sorting, pagination, persisted filters only when deliberate.
- Loading UX: skeleton matches final geometry, no indefinite spinner; safe retry idempotent commands only.
- Form accessibility: aria-live on update, descriptive errors, touch targets, focus-to-error on submit.

## Screens and proposed layouts
1. /admin: today + next actions, revenue confirmed paid, awaiting fulfillment, stuck orders, low stock, webhook/outbox failures; operational health first. Widgets link to filtered queues. Always show data freshness timestamp.
2. /admin/pesanan: filter tabs, quick search, bulk selection with permission restrictions, order detail timeline, manual reconciliation (no blind paid state mutations).
3. /admin/inventaris: SKU variant table, available vs reserved stock, ledger, physical adjustment form, critical stock alerts.
4. /admin/katalog (proposed): draft, status, release scheduling, media & variant matrix, preview, publish workflow.
5. /admin/kampanye (proposed): promo rules, code campaigns, planned drops, approval before launch; price simulator.
6. /admin/pelanggan & /admin/dukungan (proposed): customer profile with consent, ticket inbox, return/rma status, least-privilege PII access.
7. /admin/dokumen (proposed): signed storage and documents access with audit logs, invoice, waybill, warranty file.
8. Shopper homepage/catalog/PDP/cart/checkout/account/guest tracking: never put avant-garde aesthetic above hierarchy, order costs, variant selection or order trust.

## Agent ready review checklist
- Annotate actual screenshot/video or Playwright snapshot with breakpoint/route, issue, expected behavior, severity; screenshots are pending since live demo couldn't be accessed in this audit session.
- Test 360, 390, 768, 1024, 1440 viewport; touch, keyboard, screenreader, landscape, modal focus, network offline/retry, payment return navigation.
- Reject fabricated product scarcity, unsupported fabrication claims or fake availability timers.
- Admin/Operator cannot see controls they lack but backend denial is mandatory regardless.
- All layout/branding changes need before/after visual checks, a11y, regression of order/checkout.
