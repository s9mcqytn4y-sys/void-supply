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

Dokumen rekayasa resmi yang telah diselesaikan untuk Submodule 02.0:

1. [Arsitektur Frontend VOID Supply](./architecture.md): Memuat sasaran aplikasi, keputusan stack teknologi, strategi rendering, struktur direktori, alur data, batasan keamanan, dan alur rilis.
2. [Arsitektur Next.js 16 App Router](./nextjs-architecture.md): Mendokumentasikan strategi routing rute store, penggunaan Server Component berpadu Client Island, Server Service Layer, struktur fitur, dan siklus commerce.
3. [Panduan Environment & Konfigurasi](./environment.md): Penjelasan komprehensif mengenai lingkungan development, staging, dan production, serta tata kelola berkas kredensial `.env`.
4. [Konvensi Folder & Arsitektur Fitur](./folder-convention.md): Menguraikan paradigma _Feature Sliced Thinking_, struktur internal fitur, aturan isolasi komponen, dan konvensi penamaan berkas.
5. [Arsitektur Aliran Data](./data-flow.md): Memetakan pergerakan siklus data dari Server Component, Client Component, Server Action, hingga webhook penerima notifikasi Midtrans.
6. [Batasan Keamanan & Arsitektur Proteksi](./security.md): Mendefinisikan security boundary, tata kelola kredensial rahasia, validasi Zod saat runtime, serta verifikasi tanda tangan SHA-512.
7. [Strategi Pengelolaan State](./state-management.md): Mengatur pemisahan tegas Server State via TanStack Query, Client State via Zustand, dan URL State via Next.js SearchParams.
8. [Strategi Data Layer & API](./api-strategy.md): Membandingkan Server Actions dengan Route Handlers, validasi skema runtime Zod, transaksi atomik Drizzle ORM, serta integrasi Midtrans dan Biteship.
9. [Pemodelan Domain Bisnis](./domain-modeling.md): Menguraikan model entitas produk, varian stok fisik, pesanan snapshot imutabel, pembayaran Midtrans, logistik Biteship, serta pemetaan Drizzle ORM.

---

## Gate Kelulusan Submodule 02.0

Sebelum memulai penulisan kode fitur, pemahaman mendalam atas 3 keputusan rekayasa berikut merupakan syarat mutlak:

1. **Kenapa Halaman Produk Menggunakan Server Component?**
   Data produk bersumber dari server state yang membutuhkan optimasi mesin pencari secara optimal dan minim interaksi peramban rumit, sehingga menghasilkan dokumen HTML instan tanpa beban bundel JavaScript klien.
2. **Kenapa Keranjang Belanja Menggunakan Zustand?**
   Interaksi keranjang belanja merupakan client state sementara yang sering berubah di sisi peramban tanpa memerlukan kueri jaringan berulang, serta didukung persistensi penyimpanan lokal untuk pembeli tanpa akun.
3. **Kenapa Kita Membutuhkan Zod Jika TypeScript Sudah Ada?**
   TypeScript hanya menjamin pemeriksaan tipe saat tahap kompilasi kode di editor, sedangkan pustaka Zod menjalankan validasi runtime penting terhadap masukan data formulir pengguna maupun respon webhook pihak ketiga.
