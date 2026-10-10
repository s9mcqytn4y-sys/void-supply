import { z } from "zod";
import { niatItemKeranjangSkema } from "@/features/cart";

/**
 * Skema Validasi Formulir Checkout Pembeli (Module 02.13 & 03.0)
 * Memastikan data pengiriman dan niat beli valid sebelum transaksi atomik dibuat di basis data.
 */
export const formulirCheckoutSkema = z.object({
  namaLengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  telepon: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+]+$/, "Nomor telepon hanya boleh memuat angka dan tanda +"),
  alamatLengkap: z.string().min(10, "Alamat pengiriman minimal 10 karakter"),
  kota: z.string().min(2, "Nama kota/kabupaten wajib diisi"),
  provinsi: z.string().min(2, "Nama provinsi wajib diisi"),
  kodePos: z
    .string()
    .length(5, "Kode pos harus terdiri dari 5 digit angka")
    .regex(/^[0-9]+$/, "Kode pos harus berupa angka"),
  catatan: z.string().max(250, "Catatan maksimal 250 karakter").optional(),
  kodeKurir: z.string().min(2, "Pilihan kurir wajib dipilih"),
  namaKurir: z.string().min(2, "Nama kurir wajib ada"),
  layananKurir: z.string().min(2, "Layanan kurir wajib ada"),
  tarifOngkirIdr: z.number().int().nonnegative("Tarif ongkir tidak boleh negatif"),
  items: z.array(niatItemKeranjangSkema).min(1, "Keranjang belanja tidak boleh kosong"),
});

export type FormulirCheckout = z.infer<typeof formulirCheckoutSkema>;
