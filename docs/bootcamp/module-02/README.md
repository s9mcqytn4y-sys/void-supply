# Module 02 - Frontend Engineering Foundation

Module ini fokus pada penerjemahan keputusan produk dan spesifikasi wireframe menjadi pondasi rekayasa frontend (_Frontend Engineering Foundation_) yang terukur, modular, dan siap produksi.

---

## Roadmap Submodule 02

- **Submodule 02.0: Repository Audit & Engineering Foundation** (Selesai pada modul ini)
- **Submodule 02.1: Environment & Tooling**
- **Submodule 02.2: Next.js Architecture & Rendering Strategy**
- **Submodule 02.3: TypeScript Domain Modeling**
- **Submodule 02.4: Feature Based Architecture**
- **Submodule 02.5: Data Layer & API Strategy**
- **Submodule 02.6: State Management (Server vs Client)**
- **Submodule 02.7: Testing Strategy (Vitest & Playwright)**
- **Submodule 02.8: Production Deployment & Observability**

---

## Deliverables Dokumentasi Module 02.0

Dokumen rekayasa resmi yang telah diselesaikan untuk Submodule 02.0:

1. [Arsitektur Frontend VOID Supply](./architecture.md): Sasaran aplikasi, keputusan stack, strategi rendering, struktur direktori, alur data, batasan keamanan, dan alur rilis.
2. [Panduan Environment & Konfigurasi](./environment.md): Penjelasan mendalam lingkungan development, staging, dan production, serta pengelolaan berkas kredensial `.env`.
3. [Konvensi Folder & Arsitektur Fitur](./folder-convention.md): Paradigma _Feature Sliced Thinking_, struktur internal fitur, aturan isolasi, dan konvensi penamaan.
4. [Strategi Pengelolaan State](./state-management.md): Pemisahan tegas Server State (TanStack Query), Client State (Zustand), dan URL State (Next.js SearchParams).
5. [Strategi Data Layer & API](./api-strategy.md): Perbandingan Server Actions vs Route Handlers, validasi runtime Zod, transaksi atomik Drizzle ORM, serta integrasi Midtrans dan Biteship.

---

## Gate Kelulusan Submodule 02.0

Sebelum memulai penulisan kode fitur, pastikan Anda memahami dan dapat menjawab pertanyaan berikut:

1. **Kenapa Halaman Produk menggunakan Server Component?**
   _Jawaban:_ Data produk bersifat server state, memerlukan optimasi SEO, dan tidak memerlukan interaksi peramban yang rumit, sehingga menghasilkan HTML cepat tanpa beban bundel JavaScript klien.
2. **Kenapa keranjang belanja menggunakan Zustand?**
   _Jawaban:_ Interaksi keranjang belanja adalah client state sementara yang sering berubah tanpa memerlukan request jaringan berulang, dan didukung persistensi LocalStorage untuk mode tamu.
3. **Kenapa kita membutuhkan Zod jika TypeScript sudah ada?**
   _Jawaban:_ TypeScript hanya bekerja saat kompilasi (_compile-time_), sementara Zod memberikan validasi runtime (_runtime validation_) terhadap data eksternal dari formulir pengguna, API pihak ketiga, dan webhook.
