# TypeScript Expert Rules & Best Practices

1. **Strict Type Safety**:
   - Dilarang keras menggunakan tipe `any`. Gunakan `unknown` bila tipe belum pasti, lalu persempit dengan type guards atau Zod schemas.
   - Aktifkan strict flags compiler (`strict: true`, `noImplicitAny: true`, `forceConsistentCasingInFileNames: true`).
2. **Inference Over Annotation**:
   - Manfaatkan kemampuan type inference TypeScript dan Zod (`z.infer<typeof schema>`) untuk mencegah duplikasi deklarasi interface/type.
3. **Discriminated Unions**:
   - Gunakan Discriminated Unions untuk state management (misal: state pembayaran `PENDING | SUCCESS | FAILED`, respon API, status pesanan) agar pengecekan exhaustive type safety terjamin.
4. **Const Assertions & Readonly**:
   - Gunakan `as const` pada array opsi atau objek konfigurasi konstan untuk menghasilkan literal types yang presisi.
5. **Generics dengan Constraints**:
   - Saat membuat utility reusable, selalu berikan batasan generik (`<T extends Record<string, unknown>>`) untuk menghindari kebocoran tipe.
