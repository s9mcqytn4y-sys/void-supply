# VOID Design System

Dokumentasi spesifikasi desain resmi untuk antarmuka VOID Supply. Seluruh komponen antarmuka toko wajib mematuhi panduan token, hirarki tipografi, ritme tata letak (4px system), dan prinsip psikologi konversi e-commerce berikut.

---

## Brand Direction

VOID Supply mengusung identitas visual **Cyberpunk Brutalism & High-End Techwear**:

- **Tone & Mood**: Monokromatik, dingin, presisi teknis, utilitarian, dan eksklusif.
- **Rhythm & Energy**: Visual Dial 2 (Modern streetwear aesthetic). Tata letak terstruktur dengan garis pembatas tegas (1px borders), sudut tajam (sharp edges atau zero-radius), dan kontras tinggi.
- **Micro-Interactions**: Transisi halus (150ms hingga 300ms cubic-bezier), hover state yang terarah tanpa animasi berlebih yang memperlambat alur belanja pengguna.

---

## Color Tokens

Palet warna VOID berpusat pada spektrum monokromatis gelap (dark mode native) dengan rasio kontras kepatuhan WCAG AA minimal 4.5:1 untuk teks normal dan 3:1 untuk elemen grafis.

| CSS Token | Nilai Hex | Nilai HSL | Peran Semantik |
| :--- | :--- | :--- | :--- |
| `--void-black` | `#0a0a0a` | `hsl(0, 0%, 4%)` | Kanvas latar belakang utama (`body`, kanvas toko) |
| `--void-card` | `#121212` | `hsl(0, 0%, 7%)` | Latar wadah kartu, modal, popover, dan panel kontainer |
| `--void-gray` | `#737373` | `hsl(0, 0%, 45%)` | Teks sekunder, label pembantu, status non-aktif |
| `--void-border` | `#262626` | `hsl(0, 0%, 15%)` | Garis batas struktural komponen, pemisah grid artikel |
| `--void-light` | `#ededed` | `hsl(0, 0%, 93%)` | Teks tubuh utama (body text) dengan keterbacaan tinggi |
| `--void-white` | `#ffffff` | `hsl(0, 0%, 100%)` | Judul tebal, penekanan harga, state fokus interaktif |

### Integrasi Tailwind CSS v4 (`@theme`)

```css
@theme {
  --color-void-black: #0a0a0a;
  --color-void-card: #121212;
  --color-void-border: #262626;
  --color-void-muted: #737373;
  --color-void-light: #ededed;
  --color-void-white: #ffffff;
}
```

---

## Typography

Hirarki tipografi VOID membedakan tipe data teknis (metadata, harga, kode SKU) menggunakan font monospace, sedangkan headline dan body menggunakan sans-serif modern berbobot tegas.

| Tingkat Hirarki | Ukuran / Line-Height | Weight | Tracking | Utility Tailwind | Contoh Penerapan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 48px - 64px / 1.1 | Black (900) | `-0.05em` | `text-5xl md:text-6xl font-black uppercase tracking-tighter` | Dipakai untuk judul utama hero visual dan identitas rilis drop koleksi berskala besar. |
| **Hero** | 32px - 40px / 1.15 | Black (900) | `-0.03em` | `text-3xl md:text-4xl font-black uppercase tracking-tight` | Digunakan secara khusus pada header pembuka etalase katalog produk. |
| **Heading** | 20px - 24px / 1.25 | Bold (700) | `-0.02em` | `text-xl md:text-2xl font-bold uppercase` | Dipakai sebagai penamaan artikel pakaian serta penanda pemisah setiap section. |
| **Body** | 14px - 16px / 1.5 | Regular (400) | `normal` | `text-sm md:text-base font-normal text-neutral-300` | Berfungsi menyajikan deskripsi material, detail ukuran, dan narasi artikel. |
| **Caption** | 12px / 1.4 | Medium (500) | `+0.05em` | `text-xs font-mono uppercase tracking-wider text-neutral-400` | Label kategori busana, penanda nomor batch, serta kode SKU pakaian. |
| **Label** | 10px - 11px / 1.2 | SemiBold (600) | `+0.1em` | `text-[11px] font-mono tracking-widest uppercase` | Status ketersediaan stok tersisa, badge peringatan, dan spesifikasi teknis ringkas. |

---

## Spacing

VOID mengadopsi sistem kelipatan ketat **4px System** untuk memastikan ritme vertikal dan horizontal yang konsisten di seluruh breakpoint antarmuka.

| Skala Sistem | Nilai Pixel | Tailwind Utility | Konteks Penerapan |
| :--- | :--- | :--- | :--- |
| **1** | 4px | `p-1`, `gap-1`, `m-1` | Jarak mikro internal chip ukuran varian, border offset |
| **2** | 8px | `p-2`, `gap-2`, `m-2` | Jarak antar item metadata teks kecil |
| **3** | 12px | `p-3`, `gap-3`, `m-3` | Padding tombol ringkas, jarak antar field input formulir |
| **4** | 16px | `p-4`, `gap-4`, `m-4` | Padding default wadah kartu (Card) dan tap target (44px+) |
| **6** | 24px | `p-6`, `gap-6`, `m-6` | Gap grid katalog desktop, margin antar grup kontrol |
| **8** | 32px | `p-8`, `gap-8`, `m-8` | Padding section hero editorial, header katalog |
| **12** | 48px | `p-12`, `py-12` | Batas antar blok konten utama di halaman toko |
| **16** | 64px | `p-16`, `py-16` | Jarak vertikal pemisah antar section lookbook |
| **24** | 96px | `p-24`, `py-24` | Ruang bernapas header halaman ke footer aplikasi |

---

## Component Rules

Komponen antarmuka VOID dibangun sebagai primitive UI yang reusable melalui pola `cva` (class-variance-authority) dan utilitas `cn()` (`clsx` + `tailwind-merge`). Hindari penulisan style ad-hoc inline secara berulang.

### 1. Button Primitive (`<Button />`)

- **Tap Target**: Wajib memiliki tinggi minimal 44px untuk memenuhi standar aksesibilitas mobile WCAG.
- **Variant Primary**: Latar belakang putih solid (`bg-white`), teks hitam pekat (`text-black`), hover inversi atau aksen abu-abu terang.
- **Variant Secondary**: Garis tepi tegas (`border border-neutral-700`), latar belakang gelap (`bg-transparent`), hover latar netral.
- **Variant Ghost**: Transparan dengan border hover minimal.

### 2. Card Primitive (`<Card />`)

- **Surface**: Wadah latar belakang gelap (`bg-neutral-950` atau `bg-neutral-900/60`).
- **Border**: Border tipis 1px (`border border-neutral-800`), hover border berubah menjadi netral 600 (`hover:border-neutral-600`).
- **Radius**: Tajam (`rounded-none` atau radius minimal `rounded-sm`) untuk menegaskan karakter teknikal.

### 3. Badge Primitive (`<Badge />`)

- Menggunakan tipografi monospace dengan tracking lebar (`font-mono text-[10px] tracking-widest uppercase`).
- Menandai rilis drop khusus, artikel habis terjual (`SOLD OUT`), atau stok kritis (`LOW STOCK`).

---

## Ecommerce UX Principles

Struktur visual setiap kartu produk dirancang berdasarkan 5 prioritas psikologi konversi pembeli busana (Persona Rian The Trendsetter):

1. **Image Dominance**: Gambar menempati 70% luas kartu dengan aspek rasio editorial 4:5 (`aspect-[4/5]`). Fokus visual utama pembeli tertuju pada detail potongan bahan dan siluet pakaian.
2. **Brand & Collection Identity**: Identitas seri rilisan (contoh: `DROP 04 // NIGHT TRANSMISSION`) diletakkan jelas di atas judul produk.
3. **Scarcity Signal**: Indikator kelangkaan (contoh: `3 PCS LEFT` atau `SOLD OUT`) ditampilkan secara tegas pada overlay atau metadata untuk memicu urgensi pembeli tanpa manipulasi data palsu.
4. **Price Clarity**: Harga disajikan dalam format mata uang resmi (Rupiah `Rp389.000`) dengan tipografi monospace kontras tinggi yang mudah dibaca sekilas.
5. **Decisive Call to Action (CTA)**: Tautan atau tombol interaksi (`VIEW PRODUCT ->` atau quick size selector) dapat diakses langsung tanpa friksi navigasi.
