"use server";

import { inArray, eq, and, gte, sql } from "drizzle-orm";
import {
  db,
  produk,
  varianProduk,
  pesanan,
  itemPesanan,
  pembayaran,
  pengiriman,
  pelanggan,
} from "@/lib/db";
import { formulirCheckoutSkema, type FormulirCheckout } from "../schemas/checkout.schema";
import { buatTransaksiMidtrans } from "@/lib/services/midtrans.service";
import { hitungOngkirBiteship } from "@/lib/services/biteship.service";
import { gabungkanNiatItem } from "@/features/cart";

export interface HasilBuatPesanan {
  sukses: boolean;
  pesan: string;
  nomorPesanan?: string;
  snapToken?: string;
  redirectUrl?: string;
}

/**
 * Server Action: Buat Transaksi Pesanan Atomik (Module 02.15)
 * Alur Transaksi Dua Fase:
 * Fase 1: Validasi server-authoritative & Transaksi Database Atomik
 *   - Penggabungan SKU duplikat & penegakan kuota maksimal 10 unit per SKU
 *   - Perhitungan berat & verifikasi tarif resmi Biteship dari origin Johar Baru, Jakarta Pusat (10560)
 *   - Penolakan tegas (strict error) jika kurir/layanan tidak ditemukan
 *   - Pengurangan stok bersyarat secara atomik (stok = stok - qty WHERE stok >= qty)
 *   - Penyimpanan pesanan (status: menunggu_pembayaran), item snapshot, pengiriman, dan record pembayaran
 *   - Commit transaksi database segera untuk melepas row lock
 *
 * Fase 2: Pemanggilan Gateway Midtrans di luar lock database
 *   - Request token Snap Midtrans
 *   - Jika gateway menolak/gagal: jalankan kompensasi rollback stok atomik & batalkan pesanan
 *   - Jika sukses: simpan snap token pada record pembayaran
 */
export async function buatPesanan(input: FormulirCheckout): Promise<HasilBuatPesanan> {
  // 1. Validasi skema runtime Zod
  const parseResult = formulirCheckoutSkema.safeParse(input);
  if (!parseResult.success) {
    const errorPesan = parseResult.error.errors.map((e) => e.message).join(", ");
    return {
      sukses: false,
      pesan: `Data formulir tidak valid: ${errorPesan}`,
    };
  }

  const data = parseResult.data;

  // 2. Gabungkan SKU / varianId duplikat & validasi batas maksimal per SKU
  const hasilGabung = gabungkanNiatItem(data.items);
  if (!hasilGabung.sukses || hasilGabung.itemTergabung.length === 0) {
    return {
      sukses: false,
      pesan: hasilGabung.pesanGalat || "Format item keranjang belanja tidak valid.",
    };
  }

  const itemDaftar = hasilGabung.itemTergabung;
  const daftarVarianIdUnik = itemDaftar.map((i) => i.varianId);

  try {
    // 3. Ambil data varian & produk terkini dari basis data
    const dataVarianDb = await db
      .select({
        varianId: varianProduk.id,
        produkId: produk.id,
        namaProduk: produk.nama,
        sku: varianProduk.sku,
        ukuran: varianProduk.ukuran,
        warna: varianProduk.warna,
        stok: varianProduk.stok,
        harga: varianProduk.harga,
        beratGram: varianProduk.beratGram,
        statusProduk: produk.status,
      })
      .from(varianProduk)
      .innerJoin(produk, eq(varianProduk.produkId, produk.id))
      .where(inArray(varianProduk.id, daftarVarianIdUnik));

    const varianMap = new Map(dataVarianDb.map((row) => [row.varianId, row]));

    // 4. Validasi ketersediaan artikel & hitung subtotal serta berat server
    let subtotalServer = 0;
    let totalBeratServer = 0;
    const snapshotItem: Array<{
      varianId: string;
      namaProduk: string;
      namaVarian: string;
      sku: string;
      hargaSatuan: number;
      beratGram: number;
      jumlah: number;
      subtotalItem: number;
    }> = [];

    for (const item of itemDaftar) {
      const itemDb = varianMap.get(item.varianId);

      if (!itemDb) {
        return {
          sukses: false,
          pesan: `Artikel dengan ID varian '${item.varianId}' tidak ditemukan di katalog.`,
        };
      }

      if (itemDb.statusProduk !== "aktif") {
        return {
          sukses: false,
          pesan: `Artikel '${itemDb.namaProduk}' sedang tidak aktif atau diarsipkan.`,
        };
      }

      if (itemDb.stok < item.jumlah) {
        return {
          sukses: false,
          pesan: `Stok untuk '${itemDb.namaProduk} (${itemDb.ukuran})' tidak mencukupi (Tersisa: ${itemDb.stok}, Diminta: ${item.jumlah}).`,
        };
      }

      const subtotalItem = itemDb.harga * item.jumlah;
      subtotalServer += subtotalItem;
      totalBeratServer += itemDb.beratGram * item.jumlah;

      snapshotItem.push({
        varianId: itemDb.varianId,
        namaProduk: itemDb.namaProduk,
        namaVarian: `${itemDb.ukuran} / ${itemDb.warna}`,
        sku: itemDb.sku,
        hargaSatuan: itemDb.harga,
        beratGram: itemDb.beratGram,
        jumlah: item.jumlah,
        subtotalItem,
      });
    }

    // 5. Hitung tarif ongkir resmi secara server-authoritative via Biteship service
    const opsiOngkir = await hitungOngkirBiteship({
      kodePosTujuan: data.kodePos,
      totalBeratGram: totalBeratServer,
    });

    // Validasi ketat (strict matching): Tolak jika layanan yang dipilih tidak cocok persis
    const opsiCocok = opsiOngkir.find(
      (o) =>
        o.kodeKurir.toLowerCase() === data.kodeKurir.toLowerCase() &&
        o.layanan.toLowerCase() === data.layananKurir.toLowerCase()
    );

    if (!opsiCocok) {
      return {
        sukses: false,
        pesan: `Layanan pengiriman '${data.kodeKurir.toUpperCase()} (${data.layananKurir})' tidak tersedia untuk rute tujuan ${data.kota} (${data.kodePos}). Silakan pilih layanan kurir resmi yang tersedia.`,
      };
    }

    const totalOngkir = opsiCocok.tarifIdr;
    const namaKurir = opsiCocok.namaKurir;
    const layananKurir = opsiCocok.layanan;
    const estimasiHari = opsiCocok.estimasiHari;
    const totalAkhir = subtotalServer + totalOngkir;

    // 6. Generate Nomor Pesanan Unik (Format VOID-YYYYMMDD-XXXXX)
    const tanggalFormat = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const acak = Math.floor(10000 + Math.random() * 90000);
    const nomorPesanan = `VOID-${tanggalFormat}-${acak}`;

    // 7. FASE 1: Mutasi Basis Data Atomik Cepat
    let pesananId = "";
    await db.transaction(async (tx) => {
      // 7a. Pengurangan stok bersyarat secara atomik (pencegahan overselling saat konkurensi)
      for (const item of snapshotItem) {
        const [updated] = await tx
          .update(varianProduk)
          .set({
            stok: sql`${varianProduk.stok} - ${item.jumlah}`,
          })
          .where(
            and(
              eq(varianProduk.id, item.varianId),
              gte(varianProduk.stok, item.jumlah)
            )
          )
          .returning({ id: varianProduk.id });

        if (!updated) {
          throw new Error(
            `Stok untuk '${item.namaProduk} (${item.namaVarian})' tidak mencukupi atau telah dibeli oleh pengguna lain.`
          );
        }
      }

      // 7b. Simpan atau perbarui profil pelanggan
      let pelangganId: string | undefined;
      const [pelangganEksis] = await tx
        .select({ id: pelanggan.id })
        .from(pelanggan)
        .where(eq(pelanggan.email, data.email))
        .limit(1);

      if (pelangganEksis) {
        pelangganId = pelangganEksis.id;
      } else {
        const [pelangganBaru] = await tx
          .insert(pelanggan)
          .values({
            namaLengkap: data.namaLengkap,
            email: data.email,
            telepon: data.telepon,
            alamatDefault: data.alamatLengkap,
            kotaDefault: data.kota,
            provinsiDefault: data.provinsi,
            kodePosDefault: data.kodePos,
          })
          .returning({ id: pelanggan.id });
        pelangganId = pelangganBaru?.id;
      }

      // 7c. Simpan Entitas Pesanan (status: menunggu_pembayaran)
      const [pesananBaru] = await tx
        .insert(pesanan)
        .values({
          nomorPesanan,
          pelangganId,
          namaPelanggan: data.namaLengkap,
          emailPelanggan: data.email,
          teleponPelanggan: data.telepon,
          statusPesanan: "menunggu_pembayaran",
          subtotal: subtotalServer,
          totalOngkir,
          totalDiskon: 0,
          totalAkhir,
          catatan: data.catatan,
        })
        .returning({ id: pesanan.id });

      pesananId = pesananBaru.id;

      // 7d. Simpan Snapshot Item Pesanan Imutabel
      for (const item of snapshotItem) {
        await tx.insert(itemPesanan).values({
          pesananId: pesananBaru.id,
          varianId: item.varianId,
          namaProduk: item.namaProduk,
          namaVarian: item.namaVarian,
          sku: item.sku,
          hargaSatuan: item.hargaSatuan,
          beratGram: item.beratGram,
          jumlah: item.jumlah,
          subtotalItem: item.subtotalItem,
        });
      }

      // 7e. Simpan Entitas Pengiriman Terverifikasi Server
      await tx.insert(pengiriman).values({
        pesananId: pesananBaru.id,
        kurir: namaKurir,
        layanan: layananKurir,
        biayaOngkir: totalOngkir,
        beratTotalGram: totalBeratServer,
        alamatLengkap: data.alamatLengkap,
        kota: data.kota,
        provinsi: data.provinsi,
        kodePos: data.kodePos,
        namaPenerima: data.namaLengkap,
        teleponPenerima: data.telepon,
        estimasiHari: estimasiHari || "1-2 Hari",
        statusPengiriman: "menunggu_resi",
      });

      // 7f. Simpan Entitas Pembayaran Awal
      await tx.insert(pembayaran).values({
        pesananId: pesananBaru.id,
        gateway: "midtrans",
        gatewayOrderId: nomorPesanan,
        statusPembayaran: "menunggu_pembayaran",
        jumlahBayar: totalAkhir,
      });
    });

    // 8. FASE 2: Request Gateway Pembayaran Midtrans Snap (di luar DB lock)
    const midtransResponse = await buatTransaksiMidtrans({
      nomorPesanan,
      totalAkhirIdr: totalAkhir,
      items: [
        ...snapshotItem.map((s) => ({
          id: s.sku,
          price: s.hargaSatuan,
          quantity: s.jumlah,
          name: s.namaProduk,
        })),
        {
          id: `SHIPPING-${data.kodeKurir.toUpperCase()}`,
          price: totalOngkir,
          quantity: 1,
          name: `Ongkos Kirim ${namaKurir} (${layananKurir})`,
        },
      ],
      pelanggan: {
        namaLengkap: data.namaLengkap,
        email: data.email,
        telepon: data.telepon,
        alamat: `${data.alamatLengkap}, ${data.kota}, ${data.provinsi} ${data.kodePos}`,
      },
    });

    // 9. Penanganan jika Midtrans Gagal: Transaksi Kompensasi Rollback Stok
    if (!midtransResponse.sukses || !midtransResponse.token) {
      console.error("Gagal mendapatkan sesi pembayaran Midtrans:", midtransResponse.pesan);

      // Kembalikan stok yang sempat didekremen & ubah status pesanan menjadi dibatalkan
      await db.transaction(async (tx) => {
        for (const item of snapshotItem) {
          await tx
            .update(varianProduk)
            .set({ stok: sql`${varianProduk.stok} + ${item.jumlah}` })
            .where(eq(varianProduk.id, item.varianId));
        }

        await tx
          .update(pesanan)
          .set({ statusPesanan: "dibatalkan" })
          .where(eq(pesanan.id, pesananId));

        await tx
          .update(pembayaran)
          .set({ statusPembayaran: "gagal" })
          .where(eq(pembayaran.pesananId, pesananId));
      });

      return {
        sukses: false,
        pesan:
          midtransResponse.pesan ||
          "Gagal menghubungkan ke gateway pembayaran. Pesanan Anda tidak diproses dan stok dikembalikan.",
      };
    }

    // 10. Pembaruan Token Snap pada Entitas Pembayaran
    await db
      .update(pembayaran)
      .set({
        snapToken: midtransResponse.token,
        snapRedirectUrl: midtransResponse.redirectUrl,
      })
      .where(eq(pembayaran.pesananId, pesananId));

    return {
      sukses: true,
      pesan: "Pesanan berhasil dibuat. Melanjutkan ke pembayaran.",
      nomorPesanan,
      snapToken: midtransResponse.token,
      redirectUrl: midtransResponse.redirectUrl,
    };
  } catch (error) {
    console.error("Galat proses buat pesanan:", error);
    return {
      sukses: false,
      pesan:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat memproses transaksi.",
    };
  }
}
