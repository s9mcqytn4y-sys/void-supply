# 05 - Research References

Prioritas sumber untuk project:

1. Official documentation.
2. Web standards/specifications.
3. Maintainer documentation.
4. Engineering article yang dapat diverifikasi.
5. Tutorial/community.
6. AI output sebagai draft, bukan source of truth.

## Next.js

- App Router: https://nextjs.org/docs/app
- Server & Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- use client: https://nextjs.org/docs/app/api-reference/directives/use-client
- Environment Variables: https://nextjs.org/docs/pages/guides/environment-variables
- Project Structure: https://nextjs.org/docs/pages/getting-started/project-structure

Catatan: dokumentasi Next.js menjelaskan bahwa App Router menggunakan Server Components, Suspense, dan Server Functions. Variabel ber-prefix `NEXT_PUBLIC_` dapat dibundel ke browser.

## Payment: Midtrans

- Snap Integration Guide: https://docs.midtrans.com/docs/snap-snap-integration-guide
- Backend Integration: https://docs.midtrans.com/reference/backend-integration

Catatan: Snap transaction token dibuat dari backend menggunakan Server Key. Payment status update harus ditangani di backend.

## Shipping: Biteship

- Rates API: https://biteship.com/en/docs/api/rates/overview
- Webhook Overview: https://biteship.com/id/docs/api/webhook/overview
- Webhook guide: https://help.biteship.com/hc/en-us/articles/58382023618329-Complete-Guide-to-Understanding-Biteship-Webhooks

Catatan: gunakan server sebagai boundary API secret. Webhook mengurangi kebutuhan polling status shipment terus-menerus.

## Accessibility

- WCAG 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/

WCAG 2.2 berstatus W3C Recommendation dan menjadi baseline accessibility project.

## Competitor references

Research snapshot, bukan dependency teknis:

- Erigo: https://erigostore.co.id/
- Thanksinsomnia: https://shopthanksinsomnia.com/products
- Screamous: https://www.screamous.com/collections/all-products

Observasi kompetitor harus diberi tanggal karena katalog, layout, harga, dan fitur dapat berubah.
