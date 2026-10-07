# VOID Supply Data Layer & API Strategy

Dokumen ini mendefinisikan strategi lapisan data (_Data Layer_) dan arsitektur antarmuka program aplikasi (_API Strategy_) untuk platform VOID Supply.

---

## 1. Arsitektur Fullstack Next.js 16

VOID Supply tidak menggunakan server backend terpisah (seperti Express.js atau Django) untuk API belanja internal. Seluruh logika data ditangani langsung di dalam Next.js 16 App Router melalui kombinasi:

1. **Server Actions (`"use server"`):** Untuk seluruh mutasi formulir internal, checkout, dan aksi pengguna.
2. **Route Handlers (`src/app/api/...`):** Khusus untuk endpoint webhook eksternal pihak ketiga (Midtrans & Biteship).
3. **Drizzle ORM + PostgreSQL 18:** Sebagai lapisan akses data (_Data Access Layer_) relasional terenkripsi langsung dari server Next.js.

---

## 2. Server Actions vs. Route Handlers

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KLASIFIKASI PEMANGGILAN                            │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
  [ SERVER ACTIONS ]                                      [ ROUTE HANDLERS ]
• Pemicu: Aksi pengguna di browser                      • Pemicu: Server eksternal pihak ketiga
• Contoh: buatPesanan(), cekOngkir()                    • Contoh: /api/midtrans/webhook
• Karakter: Eksekusi RPC terenkripsi                    • Karakter: Endpoint REST murni (JSON)
• Keamanan: CSRF dilindungi otomatis                    • Keamanan: Verifikasi hash tanda tangan
• Revalidasi: revalidatePath()                          • Status: Mengembalikan HTTP 200 / 400 / 500
```

### Kapan Menggunakan Server Actions?

- Formulir checkout pembeli (`buatPesanan`).
- Verifikasi kode kupon diskon komunitas (`verifikasiVoucher`).
- Pengecekan ongkos kirim real-time ke Biteship (`ambilOpsiKurir`).
- **Keuntungan:** Tidak perlu mendefinisikan URL API publik, tipe data dijamin sinkron dari server ke klien (_end-to-end type safety_), dan terlindung dari serangan CSRF secara bawaan.

### Kapan Menggunakan Route Handlers?

- Menerima notifikasi pembayaran webhook dari Midtrans.
- Menerima webhook pembaruan status pos pemeriksaan kurir dari Biteship.
- **Keuntungan:** Menyediakan endpoint HTTP konvensional yang dapat dihubungi oleh server eksternal di luar peramban pengguna.

---

## 3. Validasi Runtime dengan Zod (Batas Keamanan)

TypeScript saja **TIDAK CUKUP** untuk menjaga keamanan data karena sistem tipe TypeScript dihapus saat kompilasi (_compile-time erasure_).

Sistem menerapkan validasi runtime ketat menggunakan Zod pada setiap pintu masuk data:

```typescript
// Contoh Skema Checkout (features/checkout/schemas/checkout.schema.ts)
import { z } from "zod";

export const checkoutSkema = z.object({
  namaPenerima: z
    .string()
    .min(3, "Nama penerima minimal 3 karakter")
    .max(100, "Nama penerima maksimal 100 karakter"),
  nomorWhatsApp: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Nomor WhatsApp Indonesia tidak valid"),
  email: z.string().email("Format alamat email tidak valid"),
  alamatLengkap: z.string().min(10, "Alamat pengiriman harus lengkap dan jelas"),
  kodePos: z.string().length(5, "Kode pos harus 5 digit numerik"),
  kurirKode: z.enum(["jne", "sicepat", "jnt"], {
    errorMap: () => ({ message: "Kurir pengiriman tidak didukung" }),
  }),
  layananKurir: z.string().min(1, "Layanan kurir wajib dipilih"),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid("ID varian produk tidak valid"),
        kuantitas: z.number().int().positive("Kuantitas minimal 1 pcs"),
      })
    )
    .min(1, "Keranjang belanja tidak boleh kosong"),
});

export type CheckoutInput = z.infer<typeof checkoutSkema>;
```

### Pola Eksekusi yang Aman (Safe Parsing)

```typescript
export async function buatPesanan(inputMentah: unknown) {
  // 1. Validasi struktur dan tipe data runtime
  const hasilValidasi = checkoutSkema.safeParse(inputMentah);
  if (!hasilValidasi.success) {
    return {
      sukses: false,
      pesan: "Data formulir tidak valid",
      galat: hasilValidasi.error.flatten().fieldErrors,
    };
  }

  const data = hasilValidasi.data;
  // 2. Lanjutkan ke pemrosesan transaksi basis data...
}
```

---

## 4. Akses Basis Data dengan Drizzle ORM & Transaksi Atomik

Untuk mencegah barang terjual melebihi stok (_overselling_) saat rilis terbatas diserbu ribuan pembeli dalam hitungan detik, pengurangan stok inventaris dan pencatatan pesanan wajib dieksekusi di dalam **Transaksi Atomik (ACID Transaction)**:

```typescript
// Konsep Transaksi Atomik Drizzle ORM (lib/db/transaksi.ts)
import { db } from "@/lib/db";
import { pesanan, itemPesanan, inventaris } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function reservasiStokDanBuatPesanan(dataPesanan: CheckoutInput) {
  return await db.transaction(async (tx) => {
    // 1. Validasi & kunci stok setiap varian
    for (const item of dataPesanan.items) {
      const inv = await tx
        .select()
        .from(inventaris)
        .where(eq(inventaris.variantId, item.variantId))
        .for("update"); // Row-level lock di PostgreSQL

      if (!inv.length || inv[0].stokTersedia < item.kuantitas) {
        throw new Error(`Stok untuk salah satu artikel tidak mencukupi`);
      }

      // Kurangi stok atomik
      await tx
        .update(inventaris)
        .set({
          stokTersedia: sql`${inventaris.stokTersedia} - ${item.kuantitas}`,
          diperbaruiPada: new Date(),
        })
        .where(eq(inventaris.variantId, item.variantId));
    }

    // 2. Simpan rekaman pesanan baru
    const [pesananBaru] = await tx
      .insert(pesanan)
      .values({
        namaPenerima: dataPesanan.namaPenerima,
        nomorWhatsApp: dataPesanan.nomorWhatsApp,
        email: dataPesanan.email,
        statusPembayaran: "MENUNGGU_PEMBAYARAN",
      })
      .returning();

    return pesananBaru;
  });
}
```

---

## 5. Integrasi Gerbang Pembayaran Midtrans Snap

Alur integrasi Midtrans Snap menerapkan prinsip pemisahan tanggung jawab (_Separation of Concerns_):

1. **Pembuatan Token Snap (Server-to-Server):** Server Action memanggil Midtrans Core API menggunakan `MIDTRANS_SERVER_KEY` rahasia untuk menghasilkan token unik transaksi.
2. **Pop-up Pembayaran Klien:** Browser membuka dialog Snap JS menggunakan token tersebut, memungkinkan pembeli memilih QRIS, GoPay, atau Virtual Account.
3. **Verifikasi Webhook (Asinkron):** Saat pembayaran berhasil, server Midtrans memanggil endpoint `/api/midtrans/webhook`. Server VOID Supply memverifikasi tanda tangan kriptografis SHA-512 sebelum menandai pesanan sebagai `DIBAYAR`:

$$\text{Signature} = \text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{ServerKey})$$

Jika tanda tangan tidak cocok, permintaan langsung ditolak dengan status HTTP 401 Unauthorized guna menggagalkan upaya manipulasi pembayaran palsu.

---

## 6. Integrasi Logistik Biteship API & Penanganan Galat

1. **Pengecekan Tarif Real-Time:** Menghitung ongkos kirim berdasarkan berat total pakaian (gram) dari gudang Sleman (`55281`) ke kecamatan tujuan pembeli.
2. **Penciptaan Resi Otomatis:** Setelah webhook Midtrans mengonfirmasi pembayaran lunas, sistem secara otomatis menerbitkan pesanan kurir ke Biteship dan memperoleh nomor resi (AWB).
3. **Penanganan Kendala (Graceful Fallback):** Jika koneksi API Biteship mengalami gangguan sementara (_timeout_), antarmuka secara otomatis menyediakan opsi tarif estimasi flat darurat agar pembeli tidak terhalang untuk menyelesaikan transaksi rilis terbatas.
