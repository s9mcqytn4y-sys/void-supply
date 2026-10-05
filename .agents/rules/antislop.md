# Anti-Slop System Rules (Core, Code, Copywriting, Human, Mobile, UI)

Mode Operasi: **Mode 1 (DURING)** — Seluruh aturan diterapkan langsung selama proses implementasi.

## 1. Hard Gate Rules (Pelanggaran = Ditolak Mutlak)

- **R-02 (Copywriting)**: DILARANG menggunakan karakter em dash (`—`) pada seluruh teks UI / copywriting. Gunakan tanda koma (`,`), titik (`.`), titik dua (`:`), atau tanda kurung `()`.
- **R-03 (Mobile Responsiveness)**: Layout mobile wajib sempurna (mobile-first). Tidak ada horizontal overflow, tidak ada teks terpotong, minimum tap target button adalah 44px.
- **R-17 & R-36 (Data Jujur)**: Dilarang menampilkan statistik atau angka palsu (misal: "10K+ users", "99.9% uptime") tanpa sumber data nyata. Kosong lebih baik daripada manipulatif.
- **R-18 (Testimoni Asli)**: Dilarang membuat testimonial rekaan, avatar AI acak, atau profil fiktif.
- **R-23 & R-38 (Aset & Konten Nyata)**: Gunakan data/aset nyata atau beri label placeholder yang jujur seperti `[REAL DATA]` atau "Segera Hadir".
- **R-24 & R-26 (Navigasi & Interaktivitas Nyata)**: Semua tombol, link, dan item navbar wajib memiliki tujuan nyata yang berfungsi. Tidak boleh ada tombol mati tanpa aksi atau link kosong.
- **R-25 (Kontras Warna WCAG AA)**: Seluruh teks wajib memenuhi rasio kontras minimum 4.5:1 untuk teks normal dan 3:1 untuk teks besar.
- **R-27 (UI States Lengkap)**: Setiap tampilan data wajib memiliki 3 state: Empty State, Loading State, dan Error State.
- **R-32 (Aksesibilitas Keyboard)**: Semua elemen interaktif dapat diakses melalui tombol Tab, Enter, dan Escape dengan indikator fokus yang jelas (dilarang `outline: none` tanpa pengganti).
- **R-33 (No Script Patching)**: Dilarang memanipulasi styling melalui script eksternal replace string; seluruh style ditulis langsung di komponen source.

## 2. Code Comment Hygiene (antislop-code)

- **Dilarang Separator Dekoratif**: Hindari `// =======================`, `/* ---- ROUTES ---- */`, atau ALL CAPS banner.
- **Dilarang Menarasikan Kode**: Hindari komentar yang sekadar mengulang kode di bawahnya (misal: `// Initialize variable` di atas `let x = 0`).
- **Dilarang Emoji Dekoratif**: Hindari emoji pada komentar kode (misal: `// 🚀 Performance`, `// ✅ Validation`).
- **Simpan Komentar Berbobot**: Pertahankan komentar yang menjelaskan _alasan_ arsitektur, trade-off performa, batasan keamanan, penanganan webhook payment, atau edge cases bisnis.

## 3. Copywriting & Bahasa (antislop-copywriting)

- Hindari kata-kata klise AI marketing: "Revolutionary", "Next-Gen", "Seamless", "Cutting-edge", "Intelligent".
- Tulis dengan gaya bahasa natural, lugas, ringkas, dan fokus pada manfaat langsung produk merchandise VOID Supply bagi target audiens 18–30 tahun.

## 4. UI & Visual Identity (antislop-ui)

- Batasi palet aktif: maksimal 2–3 warna utama + 1 warna aksen terarah.
- Tiga Dial Liveliness VOID Supply:
  - **ENERGY**: Dial 2 (Balanced) — modern streetwear aesthetic, bersih namun berkarakter.
  - **RHYTHM**: Dial 2 (Consistent with breaks) — komposisi produk yang rapi dengan aksen visual dinamis.
  - **MOTION**: Dial 1–2 (Subtle micro-animations) — transisi hover halus, responsif tanpa animasi berlebihan.
