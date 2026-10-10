"use server";

import { inArray, eq } from "drizzle-orm";
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

export interface HasilBuatPesanan {
  sukses: boolean;
  pesan: string;
  nomorPesanan?: string;
  snapToken?: string;
  redirectUrl?: string;
}

/**
 * Server Action: Buat Transaksi Pesanan Atomik (Module 02.13 & 03.0)
 * Menjalankan validasi server-authoritative:
 * 1. Verifikasi harga dan stok langsung ke database PostgreSQL
 * 2. Transaksi atomik (db.transaction) untuk isolasi data dan pencegahan overselling
 * 3. Integrasi Snap token Midtrans dengan total gross_amount resmi dari server
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

  try {
    // Jalankan seluruh mutasi dalam transaksi atomik PostgreSQL
    const hasilTransaksi = await db.transaction(async (tx) => {
      const daftarVarianId = data.items.map((i) => i.varianId);

      // Ambil data varian & produk terkini dari basis data
      const dataVarianDb = await tx
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
        .where(inArray(varianProduk.id, daftarVarianId));

      const varianMap = new Map(dataVarianDb.map((row) => [row.varianId, row]));

      // 2. Validasi stok dan ketersediaan setiap artikel
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

      for (const niat of data.items) {
        const itemDb = varianMap.get(niat.varianId);

        if (!itemDb) {
          throw new Error(`Artikel dengan ID varian '${niat.varianId}' tidak ditemukan di katalog.`);
        }

        if (itemDb.statusProduk !== "aktif") {
          throw new Error(`Artikel '${itemDb.namaProduk}' sedang tidak aktif atau diarsipkan.`);
        }

        if (itemDb.stok < niat.jumlah) {
          throw new Error(
            `Stok untuk '${itemDb.namaProduk} (${itemDb.ukuran})' tidak mencukupi (Tersisa: ${itemDb.stok}, Diminta: ${niat.jumlah}).`
          );
        }

        const subtotalItem = itemDb.harga * niat.jumlah;
        subtotalServer += subtotalItem;
        totalBeratServer += itemDb.beratGram * niat.jumlah;

        snapshotItem.push({
          varianId: itemDb.varianId,
          namaProduk: itemDb.namaProduk,
          namaVarian: `${itemDb.ukuran} / ${itemDb.warna}`,
          sku: itemDb.sku,
          hargaSatuan: itemDb.harga,
          beratGram: itemDb.beratGram,
          jumlah: niat.jumlah,
          subtotalItem,
        });

        // 3. Kurangi stok varian secara atomik
        await tx
          .update(varianProduk)
          .set({ stok: itemDb.stok - niat.jumlah })
          .where(eq(varianProduk.id, itemDb.varianId));
      }

      // 4. Hitung total akhir server
      const totalOngkir = data.tarifOngkirIdr;
      const totalAkhir = subtotalServer + totalOngkir;

      // 5. Generate Nomor Pesanan Unik (Format VOID-YYYYMMDD-XXXXX)
      const tanggalFormat = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const acak = Math.floor(10000 + Math.random() * 90000);
      const nomorPesanan = `VOID-${tanggalFormat}-${acak}`;

      // 6. Buat atau update profil pelanggan
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

      // 7. Simpan Entitas Pesanan
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

      // 8. Simpan Snapshot Item Pesanan
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

      // 9. Simpan Entitas Pengiriman
      await tx.insert(pengiriman).values({
        pesananId: pesananBaru.id,
        kurir: data.namaKurir,
        layanan: data.layananKurir,
        biayaOngkir: totalOngkir,
        beratTotalGram: totalBeratServer,
        alamatLengkap: data.alamatLengkap,
        kota: data.kota,
        provinsi: data.provinsi,
        kodePos: data.kodePos,
        namaPenerima: data.namaLengkap,
        teleponPenerima: data.telepon,
        estimasiHari: "2-3 Hari",
        statusPengiriman: "menunggu_resi",
      });

      // 10. Request Sesi Pembayaran Midtrans Snap
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
            name: `Ongkos Kirim ${data.namaKurir} (${data.layananKurir})`,
          },
        ],
        pelanggan: {
          namaLengkap: data.namaLengkap,
          email: data.email,
          telepon: data.telepon,
          alamat: `${data.alamatLengkap}, ${data.kota}, ${data.provinsi} ${data.kodePos}`,
        },
      });

      // 11. Simpan Entitas Pembayaran
      await tx.insert(pembayaran).values({
        pesananId: pesananBaru.id,
        gateway: "midtrans",
        gatewayOrderId: nomorPesanan,
        statusPembayaran: "menunggu_pembayaran",
        jumlahBayar: totalAkhir,
        snapToken: midtransResponse.token,
        snapRedirectUrl: midtransResponse.redirectUrl,
      });

      return {
        nomorPesanan,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirectUrl,
      };
    });

    return {
      sukses: true,
      pesan: "Pesanan berhasil dibuat. Melanjutkan ke pembayaran.",
      nomorPesanan: hasilTransaksi.nomorPesanan,
      snapToken: hasilTransaksi.snapToken,
      redirectUrl: hasilTransaksi.redirectUrl,
    };
  } catch (error) {
    console.error("Galat proses buat pesanan:", error);
    return {
      sukses: false,
      pesan: error instanceof Error ? error.message : "Terjadi kesalahan sistem saat memproses transaksi.",
    };
  }
}
