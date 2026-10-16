# VOID Supply: E-Commerce Readiness Implementation Plan

> Dokumen handoff untuk agent/developer. Basis audit: repository `s9mcqytn4y-sys/void-supply`, branch `main`, `GEMINI.md`, `PRD.md`, `PERSONA.md`, `CUSTOMER_JOURNEY_MAP.md`, `SITE-MAP.md`, `WIREFRAME.md`, `docs/research/*`, dan `docs/bootcamp/module-02/*`.

## 0. Tujuan

Membawa VOID Supply dari "storefront MVP yang sudah memiliki fondasi transaksi" menjadi **proper direct-to-consumer e-commerce** yang:

1. aman untuk transaksi nyata;
2. tahan terhadap retry, concurrency, webhook duplikat, dan kegagalan provider;
3. memiliki customer journey lengkap dari discovery sampai retention;
4. dapat diukur sebagai bisnis, bukan hanya sebagai website;
5. konsisten dengan identitas technical streetwear / brutalist utilitarian;
6. konsisten dengan aturan Bahasa Indonesia pada domain/business logic;
7. siap dikembangkan oleh beberapa agent tanpa menghasilkan arsitektur dan copy yang saling bertabrakan.

**Batas penting:** jangan membangun fitur hanya karena lazim di e-commerce. Prioritaskan fitur yang mengurangi keraguan ukuran, friksi checkout, risiko transaksi, beban support, dan meningkatkan repeat purchase.

---

# 1. Executive Verdict

## Status saat ini

**Verdict: fondasi transaksi sudah jauh lebih matang daripada storefront biasa, tetapi belum layak disebut production-grade commerce secara menyeluruh.**

Fondasi yang sudah terlihat:

- Next.js 16 App Router + React 19 + TypeScript strict.
- Feature-based architecture untuk katalog, keranjang, checkout.
- Repository + Service pattern.
- Zod runtime validation.
- PostgreSQL + Drizzle.
- Server-authoritative checkout.
- Atomic stock decrement.
- Idempotency key.
- Midtrans signature verification.
- Gross amount verification.
- Expiry recovery.
- Order access token.
- E2E + contract tests.
- Sentry dependency.
- i18n ID/EN.
- Design system dan anti-slop rules yang cukup tegas.

Namun terdapat beberapa **gap kritis dan ketidaksesuaian antara dokumentasi dengan implementasi remote**.

## P0: release blockers

1. **Token pesanan masih disimpan dan ditulis ke browser melalui JavaScript.**
   - `useCheckout.ts` menulis `void_order_token_*` melalui `document.cookie`.
   - Ini bukan HttpOnly.
   - `GEMINI.md` menyatakan SEC-05 sudah HttpOnly, tetapi implementasi checkout belum memenuhi klaim tersebut.
   - Target: token akses hanya melalui HttpOnly cookie, idealnya token disimpan dalam bentuk hash di database.

2. **Pemilihan credential gateway belum konsisten dengan environment production.**
   - `midtrans.service.ts` memilih `MIDTRANS_SERVER_KEY` lalu sandbox key, bukan secara eksplisit memilih `MIDTRANS_SERVER_KEY_PRODUCTION` ketika production aktif.
   - `biteship.service.ts` juga tidak memakai `BITESHIP_API_KEY_PRODUCTION` meskipun environment template mendefinisikannya.
   - Target: satu resolver environment terpusat dan fail-closed.

3. **Voucher quota tidak atomic.**
   - Checkout melakukan read quota lalu increment `totalDigunakan`.
   - Dua checkout paralel dapat sama-sama lolos pemeriksaan quota.
   - Target: reserve quota menggunakan conditional atomic update atau ledger penggunaan voucher.

4. **Webhook melakukan side effect eksternal di dalam database transaction.**
   - `kirimEmailNotifikasi()` dipanggil dari transaction webhook.
   - Service email sendiri membuka akses database untuk `log_email`.
   - Target: transaction hanya untuk state mutation. Email dikirim melalui outbox/job setelah commit.

5. **Tracking Biteship belum benar-benar tersedia di remote.**
   - Schema `pelacakan_pengiriman` sudah ada.
   - Dokumentasi menyebut webhook Biteship.
   - Remote repository hanya menunjukkan route webhook Midtrans, tidak menunjukkan route webhook Biteship.
   - Target: implement webhook + event normalization + timeline tracking, atau hapus klaim real-time dari UI sampai tersedia.

6. **Cart page yang dijanjikan dokumentasi belum ada.**
   - `SITE-MAP.md` dan `WIREFRAME.md` mendefinisikan `/cart`.
   - Remote `src/app` tidak memiliki route `/cart`.
   - Implementasi aktual masih menggunakan drawer `RingkasanKeranjang`.
   - Target: dedicated `/keranjang` atau canonical `/cart`, lalu tetapkan satu keputusan URL dan konsisten di seluruh dokumen.

7. **Customer portal belum ada sebagai feature nyata.**
   - Dokumentasi menjanjikan akun, riwayat order, address book, wishlist.
   - Remote app tree belum menunjukkan route customer untuk area tersebut.
   - Target: bangun passwordless customer identity setelah core transaction stabil.

8. **Legal/support surface belum proper.**
   - Footer mengarah "Kebijakan Privasi" ke `/tentang` dan "Syarat & Ketentuan" ke `/kontak`.
   - Ini harus menjadi halaman legal terpisah.
   - Permendag 19/2026 tentang PMSE berstatus berlaku dan perlu dijadikan baseline compliance review sebelum go-live.

9. **PII retention dan audit policy belum didefinisikan.**
   - `pesanan`, `pengiriman`, dan `log_email` menyimpan nama, email, telepon, alamat, serta metadata gateway.
   - Target: data inventory, purpose, retention period, access policy, deletion/anonymization workflow, dan incident response.

10. **JSON-LD perlu serializer aman.**
    - Product structured data berasal dari data database dan disisipkan melalui `dangerouslySetInnerHTML`.
    - Target: serialize JSON-LD dengan escaping `<` menjadi `\\u003c` dan gunakan helper tunggal.

---

# 2. Audit Repository vs Documentation

## 2.1 `composer.json`

**Tidak ditemukan.**

Repository adalah aplikasi Node/Next.js, bukan aplikasi PHP/Composer.

Keputusan:

- Jangan membuat `composer.json` hanya untuk memenuhi checklist.
- Jika PHP memang tidak dipakai oleh aplikasi production, dokumentasi agent sebaiknya tidak memperlakukan PHP/Composer sebagai bagian dari application stack.
- Jika PHP hanya tool lokal, pindahkan ke bagian "optional local tooling".

## 2.2 `package.json`

Stack aktual konsisten dengan `GEMINI.md`:

- Next.js 16
- React 19
- TypeScript 5.8
- Tailwind CSS 4
- Zod
- React Hook Form
- Zustand
- PostgreSQL + Drizzle
- Midtrans
- Biteship
- Vitest
- Playwright
- Sentry

Tidak perlu menambah framework backend baru.

## 2.3 `GEMINI.md`

Rules yang harus dipertahankan:

- domain/business logic Bahasa Indonesia;
- strict TypeScript;
- tidak menggunakan `any`;
- Server Component sebagai default;
- Server Action untuk mutation;
- Route Handler untuk webhook/integrasi eksternal;
- Repository Pattern;
- Service Pattern;
- Zod di boundary;
- mobile-first;
- WCAG AA;
- empty/loading/error state;
- anti-slop copy;
- no fake testimonials;
- no fabricated metrics;
- no em dash;
- minimal 44px tap target;
- dark technical streetwear visual discipline.

**Masalah utama bukan rules-nya, tetapi drift antara rules, dokumentasi, dan kode.**

Agent wajib memperlakukan implementation sebagai source of truth setelah audit, lalu memperbarui dokumentasi yang sudah tidak benar.

---

# 3. Arsitektur Target

Gunakan arsitektur berikut. Jangan mengganti framework atau menambahkan backend terpisah.

```
src/
├── app/
│   ├── (toko)/
│   ├── checkout/
│   ├── keranjang/
│   ├── pesanan/
│   ├── akun/
│   ├── api/
│   │   ├── midtrans/
│   │   ├── biteship/
│   │   ├── cron/
│   │   └── ...
│   └── ...
├── features/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── customer/
│   ├── order/
│   ├── review/
│   ├── wishlist/
│   ├── marketing/
│   └── support/
├── lib/
│   ├── db/
│   ├── env/
│   ├── services/
│   ├── security/
│   ├── observability/
│   └── utils/
└── components/
    ├── ui/
    └── layout/
```

## Boundary

### Component

Boleh:

- render;
- menerima props;
- mengelola interaksi UI;
- memanggil hook.

Tidak boleh:

- SQL;
- credential provider;
- business rule finansial;
- akses secret.

### Hook / Client state

Boleh:

- form state;
- optimistic UI;
- cart UI;
- transient interaction state.

Tidak boleh:

- menjadi source of truth harga;
- menjadi source of truth stok;
- menjadi source of truth ongkir;
- memvalidasi pembayaran final.

### Server Action

Boleh:

- command dari UI;
- Zod parse;
- auth/authorization;
- memanggil domain service.

### Service

Boleh:

- business rule;
- orchestration;
- payment/logistics adapter;
- DTO transformation.

Tidak boleh:

- JSX;
- query Drizzle mentah jika repository boundary sudah tersedia.

### Repository

Boleh:

- query database;
- transaction;
- conditional update;
- row-level locking bila diperlukan.

Tidak boleh:

- copywriting;
- UI state;
- keputusan marketing.

---

# 4. Naming Convention

## Domain

Gunakan Bahasa Indonesia:

- `produk`
- `varianProduk`
- `pesanan`
- `itemPesanan`
- `pelanggan`
- `pengiriman`
- `pembayaran`
- `ulasan`
- `daftarKeinginan`
- `alamatPelanggan`
- `tiketBantuan`

## Function

Gunakan kata kerja Bahasa Indonesia:

- `buatPesanan()`
- `ambilDetailProduk()`
- `validasiVoucher()`
- `hitungOngkir()`
- `batalkanPesanan()`
- `terbitkanFaktur()`
- `kirimNotifikasi()`
- `buatPermintaanRetur()`

## External provider adapter

Nama provider boleh tetap:

- `Midtrans`
- `Biteship`
- `Resend`

Tetapi adapter/domain interface tetap berbahasa Indonesia.

Contoh:

```
gatewayPembayaran/
  buatTransaksi()
  cekStatusTransaksi()
  verifikasiNotifikasi()

logistik/
  hitungOngkir()
  buatPengiriman()
  cekPelacakan()
```

## Database timestamp

Pertahankan:

- `dibuatPada`
- `diperbaruiPada`
- `dibayarPada`
- `kedaluwarsaPada`

## Hindari

- `data`
- `result`
- `item`
- `payload`
- `temp`
- `helper2`
- `doStuff`
- `handleEverything`

Gunakan nama domain yang spesifik.

---

# 5. Environment Strategy

Saat ini environment terlalu banyak memiliki alias/fallback:

- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_SERVER_KEY_SANDBOX`
- `MIDTRANS_SERVER_KEY_PRODUCTION`
- `BITESHIP_API_KEY`
- `BITESHIP_API_KEY_SANDBOX`
- `BITESHIP_API_KEY_PRODUCTION`

Ini membuka ruang salah konfigurasi.

## Target

Buat satu resolver:

```
environment/
  schema.ts
  resolver.ts
```

Resolver harus menentukan:

```
APP_ENV
DATABASE_URL
MIDTRANS_ENV
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
BITESHIP_ENV
BITESHIP_API_KEY
```

Aturan:

- production -> hanya production credential;
- staging -> sandbox/test credential;
- development -> sandbox/mock;
- mock -> hanya jika flag eksplisit;
- placeholder -> reject;
- secret missing -> fail closed;
- tidak ada fallback production -> sandbox;
- tidak ada fallback sandbox -> production.

Tambahkan test matrix:

- development + mock;
- development + real sandbox;
- staging + sandbox;
- production + production;
- production + sandbox key;
- production + placeholder;
- missing production key;
- contradictory flags.

---

# 6. Payment Integrity

## 6.1 State machine

Tetapkan state machine eksplisit.

### Pembayaran

```
menunggu_pembayaran
  ├── berhasil
  ├── gagal
  ├── kadaluarsa
  └── dikembalikan
```

### Pesanan

```
menunggu_pembayaran
  ├── diproses
  └── dibatalkan

diproses
  └── dikirim

dikirim
  └── selesai

selesai
  └── terminal
```

Tambahkan invariant:

- tidak boleh `selesai` tanpa `berhasil`;
- tidak boleh `dikirim` tanpa fulfillment;
- tidak boleh refund tanpa payment berhasil;
- stok hanya release sekali;
- webhook duplicate harus no-op;
- status mundur harus ditolak kecuali ada explicit reconciliation command.

## 6.2 Webhook event ledger

Jangan hanya mengandalkan current state.

Tambahkan tabel/event ledger:

```
notifikasi_pembayaran
- id
- provider
- eventId / fingerprint
- orderId
- status
- payloadRingkasan
- diterimaPada
- diprosesPada
- statusProses
```

Tujuan:

- audit;
- replay;
- debugging;
- dedupe;
- reconciliation.

---

# 7. Token Order Access

## Target security

Jangan simpan raw token sebagai credential utama.

Flow:

```
checkout
  -> generate random secret
  -> simpan hash(token)
  -> set HttpOnly cookie
  -> return order id only
```

Jika email membutuhkan link:

```
/pesanan/{nomor}/akses?token=...
  -> compare hash
  -> set HttpOnly cookie
  -> redirect clean URL
```

Tambahkan:

- expiry;
- one-time exchange bila memungkinkan;
- rate limiting;
- constant-time comparison;
- invalid token response yang tidak membedakan "order ada" vs "token salah";
- audit event untuk excessive failed access.

**Jangan kirim token ke React state jika tidak diperlukan.**

---

# 8. Voucher Engine

Current implementation sudah melakukan validasi server, tetapi quota usage belum aman terhadap concurrency.

## Target

Gunakan salah satu:

### Opsi A, atomic quota

```
UPDATE aturan_diskon
SET total_digunakan = total_digunakan + 1
WHERE id = ?
  AND apakah_aktif = true
  AND total_digunakan < kuota_penggunaan
```

Jika affected rows = 0, voucher tidak dapat digunakan.

### Opsi B, usage ledger

Tambahkan:

```
penggunaan_voucher
- id
- voucherId
- pesananId
- pelangganId
- digunakanPada
```

Dengan unique constraint sesuai aturan bisnis.

**Pilih satu source of truth. Jangan mempertahankan counter dan ledger tanpa alasan yang jelas.**

Tambahkan aturan:

- percentage 0..100;
- fixed discount tidak negatif;
- maximum discount valid;
- start/end valid;
- stacking policy;
- per-customer usage limit;
- per-order usage;
- cancelled order rollback;
- refund policy;
- voucher abuse protection.

---

# 9. Logistics & Fulfillment

## Wajib

1. Biteship API adapter.
2. Quote normalization.
3. Create shipment.
4. AWB/resi.
5. Tracking webhook.
6. Tracking timeline.
7. Delivery status mapping.
8. Failed delivery state.
9. Shipment exception.
10. Retry/reconciliation.
11. Courier SLA metadata.
12. Shipping insurance policy.

## Important

Jangan gunakan:

- tarif hardcoded sebagai fallback production;
- courier fallback diam-diam;
- generic `value: 500000` untuk seluruh order jika provider menggunakan nilai barang untuk kalkulasi/insurance.

Nilai barang harus berasal dari order server.

---

# 10. Customer Features

Urutan pengembangan:

## P1

### 10.1 Guest order access

- order number;
- email/WhatsApp verification;
- magic link atau OTP;
- recent order lookup;
- resend access link.

### 10.2 Account passwordless

- email OTP / magic link;
- no password by default;
- session rotation;
- device/session revocation.

### 10.3 Order history

- semua order;
- status;
- payment;
- tracking;
- invoice;
- reorder.

### 10.4 Address book

- multiple addresses;
- default address;
- server validation;
- safe update.

## P2

### 10.5 Wishlist

- guest wishlist local;
- merge saat login;
- availability state;
- price change notification.

### 10.6 Restock waitlist

- per product variant;
- opt-in;
- rate-limited notification;
- one notification per restock event.

### 10.7 Review & UGC

Review hanya boleh dari pembeli yang memenuhi eligibility.

Tambahkan:

- verified purchase;
- rating;
- review text;
- fit/size feedback;
- height/weight optional;
- photo upload;
- moderation state;
- report abuse.

---

# 11. Gen Z / Kalcer / Skena Strategy

**Jangan memaksa slang.**

Gen Z credibility bukan berarti semua copy harus berbunyi "bro", "gas", "spill", atau slang TikTok.

Untuk VOID, positioning yang lebih kuat adalah:

> **specific, self-aware, technical, sedikit dingin, tidak desperate.**

## Voice

### Harus terasa

- confident;
- observant;
- technical;
- understated;
- local;
- community-aware;
- tidak salesy;
- tidak corporate;
- tidak fake underground.

### Hindari

- "BEST QUALITY!!!"
- "WAJIB PUNYA!!!"
- "AUTO KEREN!!!"
- "CUMA HARI INI!!!" tanpa dasar;
- FOMO palsu;
- fake sold count;
- fake reviews;
- "premium" tanpa bukti;
- jargon teknis yang tidak membantu keputusan beli.

### Formula copy

```
claim -> evidence -> implication
```

Contoh:

> 420 GSM French Terry  
> Loopback knit dengan struktur padat.  
> Dipilih untuk hand-feel yang lebih berat dan siluet yang tetap terbentuk.

Bukan:

> MATERIAL SUPER PREMIUM YANG PASTI BIKIN KAMU KELIHATAN MAHAL.

## Brand content pillars

1. **Material**
2. **Construction**
3. **Fit**
4. **Drop culture**
5. **Local origin**
6. **Community**
7. **Process**
8. **Archive**

---

# 12. Product Confidence Layer

Ini adalah peluang bisnis terbesar berdasarkan persona dan opportunity-gap docs.

## Product Detail wajib

1. multi-angle gallery;
2. front/back/detail;
3. fit type;
4. model profile;
5. body measurement;
6. garment measurement;
7. size recommendation;
8. material;
9. GSM;
10. construction;
11. care;
12. actual stock per variant;
13. estimated shipping;
14. return/exchange summary;
15. verified reviews;
16. UGC;
17. sticky mobile CTA.

## Size recommendation

MVP:

```
tinggi
berat
preferensi fit
  -> rekomendasi ukuran
```

P2:

- compare garment measurement;
- "fit like" reference;
- saved body profile.

---

# 13. Cart & Checkout

## Cart

Dedicated page wajib.

Drawer boleh tetap menjadi quick preview, tetapi canonical cart harus halaman penuh.

Cart page:

- item;
- variant;
- quantity;
- remove;
- stock freshness;
- price freshness;
- voucher;
- subtotal;
- shipping note;
- checkout CTA.

## Checkout

Target:

- guest-first;
- one page;
- server authoritative;
- shipping quote;
- payment;
- order creation;
- recovery.

Tambahkan:

- idempotency;
- payment retry;
- expired order recovery;
- order resume;
- clear failure state;
- network retry;
- disabled submit state;
- no duplicate click;
- final price verification.

---

# 14. Post-Purchase

Ini masih kurang dibanding ambisi brand.

## P1

- payment confirmation;
- order confirmation;
- shipment notification;
- tracking;
- invoice;
- support CTA;
- cancellation policy;
- return/exchange request.

## P2

- delivered state;
- review request;
- UGC request;
- referral;
- next-drop early access;
- loyalty;
- reorder;
- community membership.

---

# 15. Return / Refund / Complaint

**Ini bukan fitur "nanti".**

Minimal domain:

```
permintaanRetur
- id
- pesananId
- pelangganId
- alasan
- status
- bukti
- dibuatPada
- diperbaruiPada
```

State:

```
diajukan
-> ditinjau
-> disetujui / ditolak
-> barang_diterima
-> diproses
-> selesai
```

Refund:

```
menunggu
-> diproses
-> berhasil
-> gagal
```

Tambahkan policy:

- batas waktu;
- kondisi barang;
- size exchange;
- defect;
- wrong item;
- refund shipping;
- refund payment;
- evidence;
- SLA support.

Permendag 19/2026 berlaku sejak 8 Juni 2026 dan perlu dijadikan baseline review compliance PMSE bersama penasihat hukum. Pastikan laman regulasi, kontak pengaduan, mekanisme pengaduan, dan alur pengembalian dana sesuai kategori usaha dan kewajiban yang berlaku.

---

# 16. Legal & Trust Pages

Buat route terpisah:

```
/kebijakan-privasi
/syarat-ketentuan
/kebijakan-retur
/kebijakan-pengiriman
/kebijakan-pembayaran
/pusat-bantuan
```

Footer harus mengarah ke halaman sebenarnya.

Jangan memakai `/tentang` sebagai privacy policy.

## Trust information

Tampilkan secara faktual:

- identitas usaha;
- kanal kontak;
- alamat bisnis jika memang boleh dipublikasikan;
- jam layanan;
- kebijakan;
- payment methods;
- shipping;
- return;
- privacy;
- complaint path.

---

# 17. Support System

Jangan membuat customer service hanya berupa tombol WhatsApp.

Minimum:

- email support;
- WhatsApp;
- ticket ID;
- SLA;
- category;
- order linkage;
- status;
- resolution;
- internal note;
- audit trail.

Customer harus dapat berkata:

> "Pesanan VOID-xxxx saya bermasalah"

dan support dapat menemukan seluruh konteks tanpa meminta customer mengulang semuanya.

---

# 18. Analytics & Business Instrumentation

Sentry saja tidak cukup.

Tambahkan event taxonomy.

## Funnel

```
view_home
view_catalog
search_product
view_product
select_variant
view_size_guide
add_to_cart
view_cart
start_checkout
calculate_shipping
apply_voucher
submit_checkout
order_created
payment_opened
payment_success
payment_failed
order_cancelled
shipment_created
shipment_delivered
review_submitted
```

## Business metrics

### Acquisition

- qualified traffic;
- source;
- campaign;
- creator;
- landing page.

### Conversion

- PDP -> cart;
- cart -> checkout;
- checkout -> order;
- order -> payment;
- payment success rate.

### Commerce

- AOV;
- units/order;
- gross revenue;
- discount rate;
- contribution margin;
- refund rate;
- return rate;
- failed payment rate.

### Inventory

- sell-through per drop;
- sell-through per SKU;
- stockout rate;
- days of inventory;
- inventory aging.

### Retention

- repeat purchase rate;
- time to second order;
- CLV;
- voucher dependency;
- early-access conversion.

### Support

- tickets/order;
- shipment inquiry rate;
- return reason distribution;
- first response time;
- resolution time.

---

# 19. Business Owner Layer

Admin dashboard bukan satu-satunya kebutuhan owner.

Buat domain analytics yang menjawab:

### "Drop ini sukses atau tidak?"

Per drop:

- revenue;
- units sold;
- sell-through;
- margin;
- top SKU;
- slow SKU;
- size curve;
- refund;
- return;
- payment failure;
- acquisition source;
- repeat buyer contribution.

### "Apa yang harus diproduksi lagi?"

Gunakan:

```
demand
+ sell-through
+ size curve
+ margin
+ return rate
+ waitlist
```

bukan hanya total unit terjual.

---

# 20. SEO

Current structured data sudah ada, tetapi target berikut wajib:

- safe JSON-LD serializer;
- canonical URL;
- Product;
- Offer;
- BreadcrumbList;
- Organization;
- WebSite;
- SearchAction jika search sudah tersedia;
- robots;
- sitemap;
- OG image;
- product image alt;
- semantic headings;
- indexable category/collection pages;
- noindex checkout/order/private pages.

## Product SEO

Nama produk sebaiknya:

```
brand identity + product descriptor + key differentiator
```

bukan keyword stuffing.

---

# 21. Search & Discovery

Search belum terlihat sebagai feature production.

P1:

- product search;
- typo tolerance;
- variant-aware availability;
- collection filter;
- size filter;
- price range;
- availability;
- sort.

P2:

- semantic search;
- related products;
- "complete the fit";
- recently viewed.

Jangan membangun search engine eksternal sebelum kebutuhan katalog membutuhkannya.

Untuk katalog 5-10 item per drop, PostgreSQL search masih cukup.

---

# 22. Performance

Current homepage menggunakan `force-dynamic`.

Review apakah semua homepage content memang membutuhkan dynamic render.

Target:

- static/ISR untuk content yang tidak berubah cepat;
- dynamic hanya untuk inventory-sensitive sections;
- cache katalog;
- cache product detail;
- revalidate setelah mutation;
- image optimization;
- no unnecessary client components;
- avoid polling agresif.

Current order page melakukan polling 5 detik sampai 2 menit.

Target:

- webhook-driven state;
- polling sebagai fallback;
- backoff;
- visibility-aware polling;
- stop when tab hidden;
- no polling after terminal state.

---

# 23. Database & Scale

Current catalog repository mengambil semua produk aktif beserta semua varian.

Untuk MVP ini masih dapat diterima karena dokumen produk menyebut katalog terkurasi 5-10 item per drop.

Tetapi sebelum katalog membesar:

- pagination;
- cursor pagination;
- indexes;
- search index;
- select minimal columns;
- aggregate stock query;
- avoid returning full variant payload for listing.

## Index minimum

Review dan tambahkan index untuk:

- `produk.slug`;
- `produk.status`;
- `varian_produk.produk_id`;
- `pesanan.nomor_pesanan`;
- `pesanan.idempotensi_key`;
- `pesanan.status_pesanan`;
- `pesanan.kedaluwarsa_pada`;
- `pembayaran.gateway_order_id`;
- `pengiriman.nomor_resi`;
- `pelacakan_pengiriman.nomor_resi`;
- timestamp operational queries.

Unique constraint tetap dipakai jika memang semantiknya unik.

---

# 24. Observability

Tambahkan structured logging.

Jangan:

```
console.error("Gagal...")
```

saja.

Gunakan event context:

```
{
  event: "payment.webhook.failed",
  orderId,
  provider,
  transactionId,
  reason,
  environment,
  requestId
}
```

Jangan log:

- raw access token;
- API key;
- full address jika tidak diperlukan;
- full email jika tidak diperlukan;
- payment credential;
- unnecessary gateway payload.

Tambahkan correlation ID:

```
requestId
orderId
paymentId
shipmentId
```

---

# 25. Email / Notification Architecture

Current `email.service.ts` menggabungkan:

- template;
- provider;
- mock;
- DB logging.

Pisahkan:

```
notifikasi/
  templates/
  provider/
  outbox/
  service/
```

Target flow:

```
domain mutation
  -> create outbox event
  -> commit
  -> worker/job
  -> provider
  -> delivery log
```

Tambahkan:

- retry;
- exponential backoff;
- dedupe;
- provider response ID;
- failure reason;
- status;
- retention.

Jangan default ke `pelanggan@voidsupply.com` jika recipient tidak ada. Missing recipient harus dianggap configuration/domain error.

---

# 26. Security Baseline

P1 security hardening:

- HttpOnly order/session cookies;
- secure cookies;
- SameSite;
- session rotation;
- rate limiting;
- bot protection untuk abuse-prone actions;
- security headers;
- CSP;
- HSTS production;
- referrer policy;
- frame policy;
- content type protection;
- request size limits;
- webhook validation;
- constant-time secret comparisons;
- no secrets in logs;
- audit trail for sensitive operations.

## Rate limit targets

Minimum untuk:

- order access;
- OTP;
- login;
- checkout creation;
- voucher validation;
- shipping quote;
- contact form;
- review submission.

---

# 27. Accessibility

Pertahankan WCAG AA.

Test:

- keyboard;
- focus visible;
- screen reader labels;
- dialog semantics;
- tabs;
- radio groups;
- error association;
- live regions;
- reduced motion;
- contrast;
- mobile touch target.

Tambahkan automated axe scan untuk halaman utama.

---

# 28. Testing Strategy

## Unit

- pricing;
- voucher;
- state transition;
- stock;
- size recommendation;
- token hashing;
- environment resolver.

## Integration

- checkout transaction;
- voucher concurrency;
- payment reconciliation;
- webhook state machine;
- shipment webhook;
- notification outbox.

## Contract

- Midtrans;
- Biteship;
- email provider.

## E2E

### Critical happy path

```
catalog
-> product
-> select size
-> cart
-> checkout
-> shipping
-> order
-> payment
-> confirmation
-> tracking
```

### Failure paths

- stock race;
- duplicate submit;
- expired payment;
- gateway timeout;
- gateway 5xx;
- invalid webhook;
- duplicate webhook;
- wrong gross amount;
- invalid voucher;
- quota exhausted;
- courier unavailable;
- tracking unavailable;
- order token invalid.

## Non-functional

- mobile viewport;
- slow 3G;
- offline/reconnect;
- back button;
- refresh during payment;
- duplicate click;
- tab duplication.

---

# 29. CI/CD

Current CI memakai PostgreSQL 16, sementara dokumentasi menyebut PostgreSQL 18.

Keputusan:

- pilih satu baseline supported;
- idealnya CI version sama dengan production;
- jika production PostgreSQL 18, gunakan PostgreSQL 18 image di CI;
- pin package manager behavior;
- gunakan `npm ci` untuk reproducibility;
- cache npm;
- build;
- unit;
- integration;
- E2E;
- security checks.

## Release gates

Tidak boleh production deploy jika:

- TypeScript gagal;
- lint gagal;
- unit gagal;
- integration gagal;
- critical E2E gagal;
- environment production invalid;
- migration belum tervalidasi;
- payment webhook contract gagal.

---

# 30. Data Privacy

Karena aplikasi menyimpan:

- nama;
- email;
- nomor telepon;
- alamat;
- order history;
- payment metadata;
- tracking data;

buat data map:

| Data | Tujuan | Retensi | Akses |
|---|---|---|---|
| Nama | fulfillment | sesuai kebijakan bisnis/legal | support/ops |
| Email | order notification | sesuai kebijakan | support/ops |
| Telepon | fulfillment | sesuai kebijakan | support/ops |
| Alamat | fulfillment | sesuai kebijakan | fulfillment |
| Payment metadata | reconciliation | sesuai kewajiban | finance/ops |
| Email log | audit | sesuai kebijakan | ops |
| Tracking | delivery | sesuai kebutuhan | customer/ops |

Tambahkan:

- privacy notice;
- consent jika diperlukan;
- data access workflow;
- correction workflow;
- deletion/anonymization policy;
- breach response;
- vendor processor inventory.

UU PDP No. 27 Tahun 2022 menekankan pemrosesan yang terbatas, spesifik, sah, transparan, aman, dan memiliki pengelolaan retensi/penghapusan yang sesuai.

---

# 31. Roadmap

## Phase 0, Hardening

**Target: sebelum transaksi uang nyata**

- [ ] Fix production credential resolver.
- [ ] Remove client-readable order token.
- [ ] Hash order access token.
- [ ] Atomic voucher quota.
- [ ] Webhook event ledger.
- [ ] Move email out of DB transaction.
- [ ] Safe JSON-LD serializer.
- [ ] Add rate limiting.
- [ ] Add security headers.
- [ ] Add PII logging policy.
- [ ] Align CI PostgreSQL version.
- [ ] Reconcile GEMINI.md claims vs actual implementation.

## Phase 1, Commerce Core

**Target: proper DTC store**

- [ ] Dedicated cart page.
- [ ] Search.
- [ ] Filter/sort.
- [ ] Product size confidence.
- [ ] Shipping estimator on PDP.
- [ ] Payment retry/resume.
- [ ] Biteship shipment creation.
- [ ] Biteship tracking webhook.
- [ ] Tracking timeline.
- [ ] Real return/refund workflow.
- [ ] Legal pages.
- [ ] Support system.
- [ ] Analytics funnel.
- [ ] Customer guest access.

## Phase 2, Retention

- [ ] Passwordless account.
- [ ] Order history.
- [ ] Address book.
- [ ] Wishlist.
- [ ] Restock waitlist.
- [ ] Verified reviews.
- [ ] UGC.
- [ ] Delivered/review lifecycle.
- [ ] Drop alerts.
- [ ] Referral.
- [ ] Loyalty.

## Phase 3, Brand Commerce Intelligence

- [ ] Drop analytics.
- [ ] Size curve analytics.
- [ ] Inventory demand signal.
- [ ] Contribution margin reporting.
- [ ] Creator attribution.
- [ ] Cohort retention.
- [ ] Personalization.
- [ ] Reorder recommendations.

---

# 32. Agent Workstream Breakdown

## Agent A, Security & Environment

Scope:

- `src/lib/env.ts`
- gateway resolvers
- token security
- rate limit
- headers
- security tests

Acceptance:

- production cannot use sandbox;
- no raw token in client storage;
- no secret in logs;
- all security tests green.

## Agent B, Payment Reliability

Scope:

- Midtrans webhook;
- event ledger;
- state machine;
- reconciliation;
- refund foundation.

Acceptance:

- duplicate webhook no-op;
- out-of-order webhook safe;
- gateway timeout safe;
- payment state cannot regress;
- refund has audit trail.

## Agent C, Voucher & Pricing

Scope:

- voucher atomicity;
- pricing domain;
- usage ledger/counter;
- concurrency tests.

Acceptance:

- quota cannot overshoot;
- discount cannot exceed configured policy;
- client cannot manipulate final price.

## Agent D, Logistics

Scope:

- Biteship shipment creation;
- tracking webhook;
- tracking timeline;
- shipment exception.

Acceptance:

- quote server authoritative;
- shipment creation idempotent;
- tracking events deduped;
- customer sees accurate timeline.

## Agent E, Customer Experience

Scope:

- cart page;
- search;
- size recommendation;
- guest order access;
- account foundation.

Acceptance:

- mobile-first;
- no horizontal overflow;
- all required states;
- checkout remains under target flow complexity.

## Agent F, Trust & Support

Scope:

- legal pages;
- return/refund;
- complaint;
- support ticket;
- privacy flows.

Acceptance:

- footer links to real policy pages;
- customer can submit complaint;
- order-linked support exists;
- return/refund status is traceable.

## Agent G, Community & Retention

Scope:

- wishlist;
- waitlist;
- reviews;
- UGC;
- drop alerts;
- referral.

Acceptance:

- no fake social proof;
- only eligible customers can post verified review;
- notification dedupe;
- opt-in is explicit.

## Agent H, Analytics & Business

Scope:

- event taxonomy;
- funnel;
- drop dashboard data model;
- attribution;
- inventory metrics.

Acceptance:

- every critical commerce event has an event definition;
- event names use one canonical taxonomy;
- owner can answer drop performance questions from data.

## Agent I, QA / Release

Scope:

- unit;
- integration;
- contract;
- E2E;
- accessibility;
- performance;
- CI.

Acceptance:

- release gate reproducible;
- critical paths covered;
- failure paths covered;
- mobile tested.

---

# 33. Agent Rules

Setiap agent wajib:

1. baca `GEMINI.md` sebelum menyentuh kode;
2. baca dokumen feature terkait;
3. tidak mengubah stack tanpa keputusan arsitektur;
4. tidak membuat duplicate service;
5. tidak membuat duplicate schema;
6. tidak menggunakan `any`;
7. gunakan Bahasa Indonesia untuk domain/business logic;
8. jangan mengarang data bisnis;
9. jangan membuat fake testimonial/review/sold count;
10. jangan menambah slang Gen Z secara paksa;
11. tidak menambah dependency jika native capability cukup;
12. tambahkan test untuk setiap business-critical mutation;
13. update documentation jika implementation berubah;
14. tidak memperbaiki satu file dengan melanggar kontrak file lain;
15. jalankan lint/typecheck/test yang relevan sebelum handoff.

---

# 34. Definition of Done

Sebuah feature commerce dianggap selesai hanya jika:

- [ ] schema tersedia;
- [ ] domain rule tersedia;
- [ ] server validation tersedia;
- [ ] authorization tersedia;
- [ ] error state tersedia;
- [ ] loading state tersedia;
- [ ] empty state tersedia jika relevan;
- [ ] mobile state tersedia;
- [ ] accessibility diuji;
- [ ] analytics event ditentukan;
- [ ] audit trail ditentukan jika finansial/security sensitive;
- [ ] retry/idempotency ditentukan jika external side effect;
- [ ] tests tersedia;
- [ ] docs diperbarui;
- [ ] copy sesuai voice;
- [ ] tidak ada claim tanpa evidence.

---

# 35. Final Priority Matrix

| Prioritas | Area | Kenapa |
|---|---|---|
| P0 | Payment + environment | Risiko kehilangan uang |
| P0 | Token/session security | Risiko account/order exposure |
| P0 | Voucher concurrency | Risiko financial leakage |
| P0 | Webhook transaction design | Risiko state corruption |
| P0 | Privacy/PII | Risiko compliance + trust |
| P1 | Logistics webhook | Customer experience inti |
| P1 | Cart page | Checkout usability |
| P1 | Search/discovery | Conversion |
| P1 | Size confidence | Core brand differentiation |
| P1 | Return/refund | Trust + operational safety |
| P1 | Legal/support | Trust + compliance |
| P1 | Analytics | Business visibility |
| P2 | Account | Retention |
| P2 | Wishlist | Retention |
| P2 | Review/UGC | Community proof |
| P2 | Waitlist | Drop economics |
| P2 | Referral | Organic growth |
| P3 | Personalization | Scale optimization |

---

# 36. Non-Goals

Untuk sekarang **jangan**:

- mengganti Next.js;
- membuat Express/Nest backend terpisah;
- membuat microservices;
- memasang Elasticsearch;
- memasang Redis hanya karena "e-commerce harus Redis";
- membuat mobile app;
- membuat marketplace;
- membuat mega-menu;
- membuat AI stylist sebelum product confidence dasar selesai;
- membuat loyalty kompleks sebelum repeat purchase baseline terukur.

**Prinsip: fix smallest safe change, tetapi jangan kompromi pada financial integrity dan customer trust.**

---

# 37. Handoff Summary

Jika agent hanya memiliki waktu untuk 10 pekerjaan, kerjakan urutan ini:

1. Production environment resolver.
2. HttpOnly + hashed order access token.
3. Atomic voucher quota.
4. Payment webhook event ledger + state machine.
5. Outbox untuk email/notification.
6. Biteship shipment + tracking webhook.
7. Dedicated cart page.
8. Return/refund + legal/support surface.
9. Analytics event taxonomy.
10. Size confidence + verified review/UGC foundation.

**North Star:**
> VOID Supply harus terasa seperti brand streetwear yang punya taste, tetapi checkout, payment, inventory, fulfillment, support, dan data security-nya bekerja seperti commerce platform yang serius.

