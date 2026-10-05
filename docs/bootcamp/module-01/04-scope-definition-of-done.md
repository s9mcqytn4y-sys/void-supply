# 04 - MVP Scope & Definition of Done

## 1. Feature matrix

| Feature | MVP | Later | Notes |
| --- | :---: | :---: | --- |
| Home | Yes |  | Editorial discovery |
| Shop/catalog | Yes |  | Filter minimum viable |
| Product detail | Yes |  | Variant + stock |
| Cart | Yes |  | Quantity + remove |
| Guest checkout | Candidate |  | Final decision after business rule |
| Account |  | Yes | Jangan menghambat MVP |
| Address input | Yes |  | Validation required |
| Biteship rates | Yes |  | Server-side |
| Midtrans Sandbox | Yes |  | Sebelum production |
| Payment webhook | Yes |  | Source of truth |
| Shipment tracking | Yes |  | Webhook/update |
| Coupon |  | Yes | Hindari scope creep |
| Wishlist |  | Yes | Tidak kritikal |
| Reviews |  | Yes | Tidak pakai review fiktif |
| Admin basic | Yes |  | Product/order/inventory minimum |
| Loyalty |  | Yes | Post-MVP |

## 2. Milestone

### M0 - Documentation

Selesai jika:

- problem statement jelas,
- target user ditulis sebagai hypothesis bila belum tervalidasi,
- sitemap dan primary flow ada,
- MVP/non-MVP dibedakan,
- current repository state terdokumentasi,
- stack punya alasan.

### M1 - Static storefront

- Next App Router minimal berjalan.
- Dummy product model typed.
- Product listing.
- Product detail.
- Responsive.
- Accessible baseline.

### M2 - Cart

- Add/remove/update quantity.
- Variant-aware cart.
- Price display derived dari trusted product data.
- Empty state.
- Persistence decision terdokumentasi.

### M3 - Database

- Product dan variant schema.
- Seed data.
- Server-side product read.
- Tidak ada business secret di client.

### M4 - Checkout

- Customer data.
- Address validation.
- Biteship rate.
- Review order.
- Revalidation stock dan total di server.

### M5 - Payment

- Order dibuat sebelum payment.
- Snap token dibuat server-side.
- Sandbox payment berjalan.
- Webhook memutakhirkan payment secara idempotent.
- Pending/paid/failed/expired diperlakukan eksplisit.

### M6 - Fulfillment

- Shipment dibuat sesuai business rule.
- Shipment state tersimpan.
- Biteship webhook/update diproses.
- Tracking page punya last known status.

### M7 - Production readiness

- E2E critical path.
- Error monitoring.
- Environment production terpisah.
- Security review.
- Accessibility review.
- Performance review.
- Deployment checklist.

## 3. Definition of Done per feature

Sebuah feature belum selesai hanya karena "kelihatan jalan".

Feature dianggap done jika:

- requirement terpenuhi,
- happy path bekerja,
- loading state tersedia,
- empty state tersedia bila relevan,
- error state tersedia,
- keyboard interaction bekerja,
- mobile layout tidak overflow,
- input divalidasi,
- server tidak mempercayai harga/status dari client,
- test kritikal tersedia,
- tidak ada secret pada client,
- naming dan folder sesuai tanggung jawab,
- documentation diperbarui bila keputusan berubah.

## 4. Pull request checklist

```text
[ ] Scope PR kecil dan jelas
[ ] Tidak ada unrelated refactor
[ ] TypeScript tidak menggunakan any tanpa alasan kuat
[ ] Loading/error/empty state dipikirkan
[ ] Mobile checked
[ ] Keyboard checked
[ ] Secret scan mental check
[ ] Test relevant lulus
[ ] Lint lulus
[ ] Docs diperbarui jika behaviour berubah
```

## 5. Mentor rule

Setiap fitur harus bisa dijelaskan dengan tiga kalimat:

1. Problem apa yang diselesaikan?
2. Mengapa implementasinya seperti ini?
3. Apa trade-off-nya?

Jika kamu hanya bisa menjelaskan syntax, kamu belum selesai belajar fiturnya.
