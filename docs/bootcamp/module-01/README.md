# Module 01 - Research & Product Documentation

Module ini mengajarkan kebiasaan pertama seorang frontend engineer yang matang: jangan mulai dari komponen, mulai dari masalah, pengguna, batasan, dan bukti.

## Tujuan belajar

Setelah menyelesaikan module ini, kamu harus mampu:

1. Mengubah ide bisnis yang masih kabur menjadi problem statement dan product brief.
2. Melakukan competitor research tanpa sekadar meniru tampilan.
3. Menyusun sitemap, user flow, dan scope MVP.
4. Memilih stack berdasarkan constraint produk, bukan hype.
5. Membedakan current state repository dan target architecture.
6. Menentukan batas client, server, database, payment, dan shipping.
7. Menulis Definition of Done sebelum implementasi.
8. Menjelaskan alasan di balik setiap keputusan.

## Mental model

Gunakan urutan ini:

```text
Masalah
  -> Evidence
  -> Requirement
  -> User flow
  -> Scope
  -> Technical decision
  -> Design direction
  -> Implementation
  -> Validation
```

Kalau urutan dibalik menjadi "install library dulu, cari alasan belakangan", itu tanda keputusan teknis belum matang.

## Baseline repository saat audit

Audit tanggal 2026-10-06 terhadap branch `main` menemukan:

- Framework dan dependency sudah dideklarasikan di `package.json`.
- Sudah ada `README.md`, `PRD.md`, `.env.example`, Drizzle config, Playwright config, Next config, dan Vite/Vitest config.
- `src/` yang benar-benar ada saat audit baru berisi `src/data/products.ts`.
- Asset produk yang sudah ada: `public/products/core-shirt-1.webp` dan `core-shirt-2.webp`.
- Beberapa folder yang disebut README seperti `src/app`, `src/components`, dan `src/features` masih merupakan target architecture, belum current state.

Pelajaran: dokumentasi harus membedakan "sudah ada" dan "direncanakan".

## Deliverables Module 01

- [Product brief dan research](./01-product-research.md)
- [UX, IA, user flow, dan design direction](./02-ux-information-architecture.md)
- [Engineering decision record](./03-engineering-decisions.md)
- [MVP scope dan Definition of Done](./04-scope-definition-of-done.md)
- [Sumber resmi](./05-references.md)

## Gate kelulusan

Sebelum masuk Module 02, kamu harus dapat menjawab tanpa melihat catatan:

- Masalah apa yang VOID Supply selesaikan?
- Siapa primary user kita?
- Mengapa guest checkout masuk MVP atau tidak?
- Mengapa Next.js cocok untuk kasus ini?
- Data apa yang tidak boleh dipercaya dari browser?
- Mana yang termasuk secret environment variable?
- Apa beda product dan product variant?
- Apa saja state yang harus dimiliki product listing?
- Kapan fitur dianggap selesai?

Jika jawabannya masih "karena tutorial bilang begitu", ulangi module ini.
