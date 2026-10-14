# Visual System & Design Tokens: VOID Supply

> **Estetika**: Technical Streetwear, Brutalist Monochrome, Minimalist Utilitarian  
> **Standar Aksesibilitas**: WCAG 2.2 AA (Rasio Kontras Minimal 4.5:1 untuk Teks Normal, 3:1 untuk Elemen Grafis)

---

## 1. Palet Warna & Token Desain

| Token | Nilai Hex | Tailwind Class | Peran |
| :--- | :--- | :--- | :--- |
| Background Canvas | `#09090b` | `bg-zinc-950` | Latar belakang utama antarmuka |
| Surface Raised | `#18181b` | `bg-zinc-900` | Latar belakang kartu, drawer, modal |
| Border Subdued | `#27272a` | `border-zinc-800` | Garis batas sekat dan container |
| Border Highlight | `#3f3f46` | `border-zinc-700` | Indikator fokus dan status aktif |
| Text Primary | `#fafafa` | `text-zinc-50` | Heading dan label penting (Kontras 16.5:1) |
| Text Secondary | `#a1a1aa` | `text-zinc-400` | Teks pendukung dan metadata (Kontras 5.3:1) |
| Accent Alert | `#f43f5e` | `text-rose-500` | Peringatan kedaluwarsa atau stok kritis |

---

## 2. Tipografi & Hierarki

- **Heading & Judul Koleksi**: Sans-serif tegas berbobot tebal (`font-bold`, `tracking-tight`), uppercase pada nomor kode seri atau drop.
- **Micro-Metadata & Spesifikasi Teknis**: Monospace (`font-mono`, `text-xs`) untuk gramasi kain, nomor pesanan, SKU, koordinat studio, dan hash idempotensi.
- **Body Text**: Sans-serif proporsional dengan tinggi baris rileks (`leading-relaxed`) untuk kemudahan membaca narasi material.

---

## 3. Komponen UI & Status

- **Tombol Utama**: Latar putih kontras tinggi dengan teks hitam (`bg-zinc-50 text-zinc-950 font-medium hover:bg-zinc-200 transition-colors`), ukuran tap target minimal 44px (`min-h-11`).
- **Indikator Fokus**: Outline zinc-400 dengan offset 2px terlihat jelas saat bernavigasi menggunakan Tab keyboard.
- **Lencana Status**: Badge monokromatik dengan border teknikal tipis untuk metode pembayaran dan kurir logistik.
