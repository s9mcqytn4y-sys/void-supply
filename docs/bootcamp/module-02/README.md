# Module 02 - Frontend Engineering Foundation

Module ini fokus pada penerjemahan keputusan produk dan spesifikasi wireframe menjadi pondasi rekayasa frontend (_Frontend Engineering Foundation_) yang terukur, modular, dan siap produksi.

---

## Roadmap Submodule 02

- **Submodule 02.0: Repository Audit & Engineering Foundation:** Melakukan audit menyeluruh terhadap pustaka dan menetapkan standar arsitektur awal repositori.
- **Submodule 02.1: Environment & Tooling:** Mengonfigurasi standarisasi runtime Node.js v22, variabel rahasia dual-slot, dan otomasi tooling lokal.
- **Submodule 02.2: Next.js Architecture & Rendering Strategy:** Merancang hierarki App Router, Server Service Layer, dan strategi rendering Client Island.
- **Submodule 02.3: TypeScript Domain Modeling:** Membangun kontrak tipe data bisnis yang ketat tanpa kompromi tipe any.
- **Submodule 02.4: Feature Based Architecture:** Menerapkan pembagian modul direktori berbasis domain mandiri pada struktur sumber kode.
- **Submodule 02.5: Data Layer & API Strategy:** Mengintegrasikan query Drizzle ORM ke PostgreSQL serta menyusun handler integrasi pihak ketiga.
- **Submodule 02.6: State Management (Server vs Client):** Mengklasifikasikan kepemilikan data antara TanStack Query, Zustand, dan SearchParams URL.
- **Submodule 02.7: Testing Strategy (Vitest & Playwright):** Menyiapkan pengujian unit secepat kilat serta pengujian browser end-to-end terpadu.
- **Submodule 02.8: Production Deployment & Observability:** Menyelaraskan hosting serverless Vercel dengan pemantauan galat sistem secara terpusat.

---

## Deliverables Dokumentasi Module 02.0

Daftar dokumen rekayasa resmi yang diselesaikan secara komprehensif untuk Submodule 02.0:

1. [Arsitektur Frontend VOID Supply](./architecture.md): Memuat sasaran aplikasi, arsitektur rendering Next.js, struktur direktori, diagram alur data, batasan keamanan, serta alur deployment.
2. [Arsitektur Next.js 16 App Router](./nextjs-architecture.md): Menguraikan hierarki routing store, perpaduan Server Component dengan Client Island, Server Service Layer, dan siklus transaksi commerce.
3. [Panduan Environment & Konfigurasi](./environment.md): Menyajikan dokumentasi menyeluruh mengenai lingkungan development, staging, dan production, serta pengelolaan aman kredensial `.env`.
4. [Konvensi Folder & Arsitektur Fitur](./folder-convention.md): Menetapkan paradigma Feature-Sliced modular, batasan komponen antarmuka, dan konvensi penamaan berkas.
5. [Arsitektur Aliran Data](./data-flow.md): Memetakan siklus pergerakan data dari Server Component hingga webhook transaksi Midtrans secara menyeluruh.
6. [Batasan Keamanan & Arsitektur Proteksi](./security.md): Mendefinisikan boundary keamanan, proteksi rahasia server, validasi runtime Zod, dan verifikasi hash tanda tangan transaksi.
7. [Strategi Pengelolaan State](./state-management.md): Mengatur kepemilikan data antara TanStack Query, Zustand store, serta URL SearchParams.
8. [Strategi Data Layer & API](./api-strategy.md): Membandingkan Server Actions dengan Route Handlers, skema validasi Zod, dan transaksi atomik Drizzle ORM.
9. [Pemodelan Domain Bisnis](./domain-modeling.md): Menguraikan entitas produk, varian stok fisik, pesanan snapshot imutabel, dan pemetaan basis data Drizzle ORM.
10. [Strategi Lapisan Data & Desain Domain Basis Data](./data-layer-strategy.md): Menetapkan klasifikasi data server, state klien, alur kerja repository fungsional, dan relasi tabel Drizzle ORM.
11. [Server Components & Implementasi UI Katalog](./server-components-catalog-ui.md): Merinci implementasi Server Component pada rute katalog /shop, komposisi ProductGrid, ProductCard, dan ProductImage, rasio gambar 4:5, serta pemenuhan standar aksesibilitas WCAG AA.

---

## Gate Kelulusan Submodule 02.0

Sebelum memulai penulisan kode fitur, pemahaman mendalam atas tiga keputusan rekayasa arsitektural berikut merupakan fondasi esensial:

1. **Kenapa Halaman Produk Menggunakan Server Component?**  
   Data katalog produk bersumber dari basis data relasional yang memerlukan optimasi mesin pencari secara maksimal dan minim interaksi peramban rumit, sehingga menghasilkan dokumen HTML instan tanpa membocorkan kredensial basis data atau membebani bundle JavaScript klien.
2. **Kenapa Keranjang Belanja Menggunakan Zustand?**  
   Interaksi keranjang belanja merupakan state antarmuka reaktif yang sering bertransisi di sisi peramban tanpa memerlukan latensi kueri jaringan berulang, serta diperkuat oleh persistensi penyimpanan lokal untuk kenyamanan pembeli tamu.
3. **Kenapa Kita Membutuhkan Zod Jika TypeScript Sudah Ada?**  
   Pemeriksaan tipe data TypeScript hanya aktif selama tahap kompilasi kode di editor, sedangkan pustaka validasi Zod mengeksekusi pemeriksaan tipe runtime terhadap masukan data formulir pengguna maupun muatan webhook pihak ketiga.
