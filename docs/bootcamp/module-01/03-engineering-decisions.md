# 03 - Engineering Decisions

Dokumen ini bukan daftar library. Ini alasan pemilihan dan batas penggunaannya.

## 1. Current state vs target architecture

### Current state saat audit

```text
src/
└── data/
    └── products.ts

public/
└── products/
    ├── core-shirt-1.webp
    └── core-shirt-2.webp
```

### Target architecture

```text
src/
├── app/
├── components/
│   ├── ui/
│   └── layout/
├── features/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── payment/
│   └── shipping/
├── lib/
│   ├── db/
│   ├── midtrans/
│   ├── biteship/
│   └── validation/
├── types/
└── data/
```

Folder target dibuat ketika ada kebutuhan implementasi. Jangan membuat puluhan empty folder hanya supaya architecture terlihat canggih.

## 2. Stack decision

### Next.js App Router

Dipilih karena storefront membutuhkan:

- route product dinamis,
- metadata/SEO,
- server-side data access,
- client interactivity pada area tertentu,
- route handlers/server functions untuk backend-for-frontend,
- deployment path yang sederhana untuk project bootcamp.

Prinsip:

- Server Component sebagai default untuk data/rendering yang tidak membutuhkan browser interaction.
- Client Component untuk state lokal interaktif, event handler, effect, dan browser API.
- Jangan menambahkan `"use client"` ke seluruh page hanya karena satu tombol membutuhkan state.

### TypeScript

Dipakai untuk memodelkan domain dan kontrak data.

Contoh domain:

```ts
type Product = {
  id: string;
  slug: string;
  name: string;
};

type ProductVariant = {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  price: number;
};
```

### PostgreSQL + Drizzle

Cocok untuk domain commerce karena hubungan product, variant, order, item, payment, dan shipment bersifat relasional.

Kita memilih relational modelling sebelum optimasi abstrak.

## 3. State decision matrix

| Jenis state            | Contoh                            | Tempat awal                                        |
| ---------------------- | --------------------------------- | -------------------------------------------------- |
| Local UI state         | modal terbuka, quantity sementara | React state                                        |
| URL state              | filter category, sort             | search params                                      |
| Shared client state    | cart drawer/cart lokal            | React Context atau Zustand bila kompleks           |
| Server state           | products, orders, shipping rates  | Server Component atau query layer sesuai kebutuhan |
| Durable business state | order, payment, stock             | Database                                           |

Aturan: jangan memindahkan state ke global store hanya karena dipakai dua component.

## 4. Trust boundary

Browser tidak dipercaya sebagai sumber kebenaran untuk:

- harga final,
- diskon final,
- stock final,
- shipping total,
- payment status,
- role admin.

Client boleh mengirim intent:

```json
{
  "variantId": "variant_123",
  "quantity": 2
}
```

Server menghitung ulang harga dan memvalidasi stock.

## 5. Payment boundary

Midtrans flow target:

```text
Browser
  -> VOID server
  -> Midtrans Snap transaction
  <- Snap token
  <- VOID server
  -> Snap UI

Midtrans webhook
  -> VOID server
  -> verify notification
  -> update payment/order
```

Callback frontend bukan source of truth untuk status pembayaran.

## 6. Shipping boundary

Biteship flow target:

```text
Browser
  -> VOID server
  -> Biteship Rates API
  <- rates
  <- VOID server

Biteship webhook
  -> VOID server
  -> verify event
  -> update shipment
```

API key Biteship hanya server-side.

## 7. Environment strategy

Environment berarti konteks tempat aplikasi berjalan.

```text
local
staging
production
```

Contoh pembagian:

### Server-only

```env
DATABASE_URL=
MIDTRANS_SERVER_KEY=
BITESHIP_API_KEY=
SENTRY_AUTH_TOKEN=
```

### Browser-exposed bila memang diperlukan

```env
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

Rule:

> Prefix `NEXT_PUBLIC_` berarti value dapat masuk ke client bundle. Jangan pernah memberi prefix ini ke secret.

`.env.example` hanya berisi nama variable dan contoh aman. Key asli berada di environment lokal/hosting dan tidak di-commit.

## 8. Library admission rule

Sebelum menambah dependency, jawab:

1. Masalah apa yang diselesaikan?
2. Bisakah platform/framework menyelesaikannya tanpa dependency baru?
3. Berapa besar surface area API-nya?
4. Apakah maintenance aktif?
5. Apakah dependency membawa client JavaScript besar?
6. Apakah ada risiko security/supply chain?
7. Apa migration path jika library ditinggalkan?

Kalau jawabannya hanya "karena populer", jangan install.

## 9. Decision log

Setiap keputusan besar nanti ditulis sebagai ADR singkat:

```text
Context
Decision
Alternatives
Consequences
Status
```

Contoh ADR berikutnya:

- cart persistence strategy,
- guest checkout vs account requirement,
- product image storage,
- order state machine,
- payment retry policy.
