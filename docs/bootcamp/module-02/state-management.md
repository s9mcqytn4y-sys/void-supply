# VOID Supply State Management Strategy

Dokumen ini mendefinisikan strategi dan arsitektur pengelolaan status data (_State Management_) pada aplikasi VOID Supply.

---

## 1. Tiga Pilar Klasifikasi State dalam E-Commerce

Kesalahan umum dalam pengembangan frontend adalah menyimpan seluruh data ke dalam satu global store (misal Redux untuk segalanya). VOID Supply membagi state secara deterministik ke dalam 3 domain berbeda:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             VOID SUPPLY STATES                              │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
  [ SERVER STATE ]            [ CLIENT STATE ]            [ URL STATE ]
• Katalog Produk            • Item Keranjang Belanja    • Filter Kategori (?category)
• Sisa Stok Inventaris      • Status Laci (Cart Drawer) • Ukuran Terpilih (?size)
• Status Tagihan Midtrans   • Notifikasi Toast Aktif    • Kata Kunci Cari (?q)
• Detail Riwayat Pesanan    • Modal Panduan Ukuran      • Urutan Harga (?sort)
          │                           │                           │
          ▼                           ▼                           ▼
  TanStack Query v5            Zustand 5 Store          Next.js SearchParams
  & Server Components        & LocalStorage Persist       & Shallow Routing
```

---

## 2. Server State: TanStack Query & Server Components

Server State adalah data yang **berada di server**, bukan milik browser, dan diambil secara asinkron. Data ini dapat berubah sewaktu-waktu oleh pengguna lain (contoh: stok artikel dibeli oleh pembeli lain).

### Mengapa TanStack Query v5?

1. **Deduplikasi Request Otomatis:** Jika 3 komponen berbeda meminta data stok produk yang sama pada saat bersamaan, TanStack Query hanya menjalankan 1 panggilan jaringan ke server.
2. **Caching & Stale-Time Terukur:** Mengurangi beban query basis data dengan menyimpan hasil pembacaan selama durasi tertentu (`staleTime: 5 * 60 * 1000` untuk katalog produk).
3. **Optimistic Updates:** Memperbarui antarmuka secara instan saat pengguna melakukan aksi dan membatalkannya (_rollback_) secara otomatis jika server melaporkan kegagalan.

```typescript
// Contoh Penggunaan Hook Server State (features/product/hooks/use-stock.ts)
import { useQuery } from "@tanstack/react-query";

export function useStock(productId: string) {
  return useQuery({
    queryKey: ["stock", productId],
    queryFn: async () => {
      const res = await fetch(`/api/stock/${productId}`);
      if (!res.ok) throw new Error("Gagal mengambil sisa stok");
      return res.json();
    },
    refetchInterval: 30000, // Cek stok berkala setiap 30 detik pada drop aktif
  });
}
```

---

## 3. Client State: Zustand Store

Client State adalah data sementara yang **hanya ada di memori browser** dan mengatur perilaku antarmuka pengguna saat itu juga.

### Mengapa Zustand?

- Ukuran berkas sangat kecil (< 1.5 kB) dibanding Redux Toolkit (25 kB+).
- Bebas dari pembungkus _Context Provider_ bertingkat (_No Provider Hell_).
- Komponen hanya me-render ulang jika nilai spesifik yang dilanggan berubah (_Atomic Selectors_).

### A. Keranjang Belanja Tamu (Cart Store dengan LocalStorage Persist)

Mengingat alur utama VOID Supply adalah _Guest Checkout_ tanpa kewajiban login, keranjang belanja pelanggan disimpan langsung ke penyimpanan lokal (_LocalStorage_) browser menggunakan middleware `persist`:

```typescript
// Konsep Arsitektur Cart Store (features/cart/hooks/use-cart-store.ts)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ItemKeranjang {
  variantId: string;
  produkId: string;
  nama: string;
  ukuran: string;
  harga: number;
  kuantitas: number;
  maksStok: number;
  fotoUrl: string;
}

interface CartState {
  items: ItemKeranjang[];
  isDrawerOpen: boolean;
  tambahItem: (item: ItemKeranjang) => void;
  ubahKuantitas: (variantId: string, kuantitas: number) => void;
  hapusItem: (variantId: string) => void;
  kosongkanKeranjang: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,
      tambahItem: (itemBaru) =>
        set((state) => {
          const itemAda = state.items.find((i) => i.variantId === itemBaru.variantId);
          if (itemAda) {
            const kuantitasBaru = Math.min(
              itemAda.kuantitas + itemBaru.kuantitas,
              itemBaru.maksStok
            );
            return {
              items: state.items.map((i) =>
                i.variantId === itemBaru.variantId ? { ...i, kuantitas: kuantitasBaru } : i
              ),
              isDrawerOpen: true, // Buka Cart Drawer otomatis saat item ditambah
            };
          }
          return { items: [...state.items, itemBaru], isDrawerOpen: true };
        }),
      ubahKuantitas: (variantId, kuantitas) =>
        set((state) => ({
          items: state.items.map((i) => (i.variantId === variantId ? { ...i, kuantitas } : i)),
        })),
      hapusItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      kosongkanKeranjang: () => set({ items: [] }),
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
    }),
    {
      name: "void_cart_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Hanya simpan items, bukan state drawer
    }
  )
);
```

### B. Sistem Notifikasi Toast (Toast Store)

Notifikasi umpan balik aplikasi dikelola melalui store tersentralisasi tanpa dependensi paket pihak ketiga:

```typescript
// Konsep Toast Store (src/components/ui/use-toast-store.ts)
import { create } from "zustand";

export type ToastTipe = "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  tipe: ToastTipe;
  pesan: string;
  deskripsi?: string;
}

interface ToastState {
  toasts: ToastItem[];
  tambahToast: (toast: Omit<ToastItem, "id">) => void;
  hapusToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  tambahToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000); // Otomatis hilang setelah 3 detik
  },
  hapusToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
```

---

## 4. URL State: Kueri Alamat yang Dapat Dibagikan (Shareable)

Kategori katalog (`?category=new-drop`), ukuran terpilih (`?size=L`), dan kata kunci pencarian dilarang keras disimpan di dalam Zustand.

### Mengapa State Filter Wajib di URL?

1. **Dapat Dibagikan (_Shareability_):** Pengguna dapat menyalin tautan link dan mengirimkannya ke teman di WhatsApp/Instagram, dan teman tersebut akan melihat filter yang persis sama.
2. **Dukungan Tombol Back/Forward Browser:** Pengguna dapat menekan tombol kembali di peramban tanpa merusak riwayat filter mereka.
3. **Penyelarasan Server Component:** Next.js Server Component dapat membaca properti `searchParams` secara langsung untuk mengeksekusi query database Drizzle tanpa intervensi JavaScript klien.

---

## 5. Ringkasan Matriks Pengambilan Keputusan State

| Pertanyaan Evaluasi                                                         | Simpan Dimana?          | Alat Rekayasa                    |
| :-------------------------------------------------------------------------- | :---------------------- | :------------------------------- |
| Apakah data ini berasal dari database dan dipakai pengguna lain?            | Server State            | TanStack Query / RSC             |
| Apakah data ini hilang tidak masalah jika tab ditutup?                      | Local Client State      | React `useState`                 |
| Apakah data ini perlu tersimpan saat tab ditutup (misal item keranjang)?    | Persistent Client State | Zustand + `persist` LocalStorage |
| Apakah data ini menentukan tampilan halaman yang ingin dibagikan tautannya? | URL State               | Next.js `searchParams`           |
| Apakah data ini merupakan mutasi transaksi permanen (buat pesanan)?         | Server Mutation         | Next.js Server Action            |
