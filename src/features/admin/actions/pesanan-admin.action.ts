"use server";

import { desc, eq, and, sql, or } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  pesanan,
  itemPesanan,
  pelanggan,
  pengiriman,
  pembayaran,
  varianProduk,
  pelacakanPengiriman,
} from "@/lib/db/schema";
import {
  riwayatMutasiStok,
  catatanOperasionalPesanan,
  auditAktivitasAdmin,
} from "@/lib/db/admin.schema";
import { verifikasiStafAdmin } from "./auth-guard";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment/resolver";
import { buatOrderPengirimanBiteship } from "@/lib/services/biteship.service";
import { tambahTugasOutboxLangsung } from "@/lib/services/outbox.service";

export interface ItemPesananAdmin {
  id: string;
  namaProduk: string;
  namaVarian: string;
  sku: string;
  jumlah: number;
  hargaSatuan: number;
  subtotalItem: number;
}

export interface PesananAdminRow {
  id: string;
  nomorPesanan: string;
  namaPelanggan: string;
  emailPelanggan: string;
  teleponPelanggan: string;
  totalAkhir: number;
  statusPesanan: string;
  statusPembayaran: string | null;
  kurir: string | null;
  layanan: string | null;
  nomorResi: string | null;
  dibuatPada: string;
  jumlahItem: number;
}

export interface DetailPesananAdminData {
  pesanan: {
    id: string;
    nomorPesanan: string;
    namaPelanggan: string;
    emailPelanggan: string;
    teleponPelanggan: string;
    statusPesanan: string;
    subtotal: number;
    totalOngkir: number;
    totalDiskon: number;
    totalAkhir: number;
    catatan: string | null;
    dibuatPada: string;
  };
  pembayaran: {
    gateway: string;
    statusPembayaran: string;
    metodePembayaran: string | null;
    jumlahBayar: number;
    dibayarPada: string | null;
    snapToken: string | null;
  } | null;
  pengiriman: {
    kurir: string;
    layanan: string;
    nomorResi: string | null;
    namaPenerima: string;
    teleponPenerima: string;
    alamatTujuan: string;
    kotaTujuan: string;
    provinsiTujuan: string;
    kodePosTujuan: string;
    biayaOngkir: number;
  } | null;
  daftarItem: ItemPesananAdmin[];
  catatanOperasional: {
    id: string;
    adminNama: string;
    isiCatatan: string;
    tingkatUrgensi: string;
    dibuatPada: string;
  }[];
}

/**
 * Server Action: Mengambil daftar pesanan untuk tabel admin dengan filter status & pencarian
 */
export async function ambilDaftarPesananAdminAction(filter?: {
  status?: string;
  cari?: string;
}): Promise<{
  sukses: boolean;
  pesanan: PesananAdminRow[];
  totalData: number;
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, pesanan: [], totalData: 0, pesan: cek.pesan };
    }

    const kondisi: any[] = [];

    if (filter?.status && filter.status !== "semua") {
      kondisi.push(eq(pesanan.statusPesanan, filter.status as any));
    }

    if (filter?.cari && filter.cari.trim()) {
      const q = `%${filter.cari.trim().toLowerCase()}%`;
      kondisi.push(
        or(
          sql`lower(${pesanan.nomorPesanan}) LIKE ${q}`,
          sql`lower(${pesanan.namaPelanggan}) LIKE ${q}`,
          sql`lower(${pesanan.emailPelanggan}) LIKE ${q}`
        )
      );
    }

    const whereClause = kondisi.length > 0 ? and(...kondisi) : undefined;

    const rows = await db
      .select({
        id: pesanan.id,
        nomorPesanan: pesanan.nomorPesanan,
        namaPelanggan: pesanan.namaPelanggan,
        emailPelanggan: pesanan.emailPelanggan,
        teleponPelanggan: pesanan.teleponPelanggan,
        totalAkhir: pesanan.totalAkhir,
        statusPesanan: pesanan.statusPesanan,
        statusPembayaran: pembayaran.statusPembayaran,
        kurir: pengiriman.kurir,
        layanan: pengiriman.layanan,
        nomorResi: pengiriman.nomorResi,
        dibuatPada: pesanan.dibuatPada,
        jumlahItem: sql<number>`(SELECT COALESCE(sum(jumlah), 0) FROM item_pesanan WHERE item_pesanan.pesanan_id = ${pesanan.id})`,
      })
      .from(pesanan)
      .leftJoin(pembayaran, eq(pembayaran.pesananId, pesanan.id))
      .leftJoin(pengiriman, eq(pengiriman.pesananId, pesanan.id))
      .where(whereClause)
      .orderBy(desc(pesanan.dibuatPada))
      .limit(50);

    const hasil: PesananAdminRow[] = rows.map((r) => ({
      id: r.id,
      nomorPesanan: r.nomorPesanan,
      namaPelanggan: r.namaPelanggan,
      emailPelanggan: r.emailPelanggan,
      teleponPelanggan: r.teleponPelanggan,
      totalAkhir: r.totalAkhir,
      statusPesanan: r.statusPesanan,
      statusPembayaran: r.statusPembayaran,
      kurir: r.kurir,
      layanan: r.layanan,
      nomorResi: r.nomorResi,
      dibuatPada: new Date(r.dibuatPada).toISOString(),
      jumlahItem: Number(r.jumlahItem || 0),
    }));

    return { sukses: true, pesanan: hasil, totalData: hasil.length };
  } catch (error) {
    console.error("[ADMIN PESANAN] Gagal memuat daftar pesanan:", error);
    return {
      sukses: false,
      pesanan: [],
      totalData: 0,
      pesan: "Gagal memuat daftar pesanan.",
    };
  }
}

/**
 * Server Action: Mengambil detail lengkap satu pesanan untuk halaman inspeksi & tindakan admin
 */
export async function ambilDetailPesananAdminAction(
  nomorPesanan: string
): Promise<{
  sukses: boolean;
  data?: DetailPesananAdminData;
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, pesan: cek.pesan };
    }

    const [dataPesanan] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    if (!dataPesanan) {
      return { sukses: false, pesan: `Pesanan #${nomorPesanan} tidak ditemukan.` };
    }

    const [dataPembayaran] = await db
      .select()
      .from(pembayaran)
      .where(eq(pembayaran.pesananId, dataPesanan.id))
      .limit(1);

    const [dataPengiriman] = await db
      .select()
      .from(pengiriman)
      .where(eq(pengiriman.pesananId, dataPesanan.id))
      .limit(1);

    const barisItem = await db
      .select()
      .from(itemPesanan)
      .where(eq(itemPesanan.pesananId, dataPesanan.id));

    const catatan = await db
      .select()
      .from(catatanOperasionalPesanan)
      .where(eq(catatanOperasionalPesanan.pesananId, dataPesanan.id))
      .orderBy(desc(catatanOperasionalPesanan.dibuatPada));

    return {
      sukses: true,
      data: {
        pesanan: {
          id: dataPesanan.id,
          nomorPesanan: dataPesanan.nomorPesanan,
          namaPelanggan: dataPesanan.namaPelanggan,
          emailPelanggan: dataPesanan.emailPelanggan,
          teleponPelanggan: dataPesanan.teleponPelanggan,
          statusPesanan: dataPesanan.statusPesanan,
          subtotal: dataPesanan.subtotal,
          totalOngkir: dataPesanan.totalOngkir,
          totalDiskon: dataPesanan.totalDiskon,
          totalAkhir: dataPesanan.totalAkhir,
          catatan: dataPesanan.catatan,
          dibuatPada: new Date(dataPesanan.dibuatPada).toISOString(),
        },
        pembayaran: dataPembayaran
          ? {
              gateway: dataPembayaran.gateway,
              statusPembayaran: dataPembayaran.statusPembayaran,
              metodePembayaran: dataPembayaran.metodePembayaran,
              jumlahBayar: dataPembayaran.jumlahBayar,
              dibayarPada: dataPembayaran.dibayarPada
                ? new Date(dataPembayaran.dibayarPada).toISOString()
                : null,
              snapToken: dataPembayaran.snapToken,
            }
          : null,
        pengiriman: dataPengiriman
          ? {
              kurir: dataPengiriman.kurir,
              layanan: dataPengiriman.layanan,
              nomorResi: dataPengiriman.nomorResi,
              namaPenerima: dataPengiriman.namaPenerima,
              teleponPenerima: dataPengiriman.teleponPenerima,
              alamatTujuan: dataPengiriman.alamatLengkap,
              kotaTujuan: dataPengiriman.kota,
              provinsiTujuan: dataPengiriman.provinsi,
              kodePosTujuan: dataPengiriman.kodePos,
              biayaOngkir: dataPengiriman.biayaOngkir,
            }
          : null,
        daftarItem: barisItem.map((item) => ({
          id: item.id,
          namaProduk: item.namaProduk,
          namaVarian: item.namaVarian,
          sku: item.sku,
          jumlah: item.jumlah,
          hargaSatuan: item.hargaSatuan,
          subtotalItem: item.subtotalItem,
        })),
        catatanOperasional: catatan.map((c) => ({
          id: c.id,
          adminNama: "Staf Operasional",
          isiCatatan: c.isiCatatan,
          tingkatUrgensi: c.tingkatUrgensi,
          dibuatPada: new Date(c.dibuatPada).toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("[ADMIN PESANAN] Gagal memuat detail pesanan:", error);
    return { sukses: false, pesan: "Gagal memuat detail pesanan." };
  }
}

/**
 * Server Action: Inquire langsung ke Gateway Midtrans API untuk rekonsiliasi status
 */
export async function inquireMidtransStatusAction(
  nomorPesanan: string
): Promise<{ sukses: boolean; pesan: string; statusGateway?: string }> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah || !cek.staf) {
      return { sukses: false, pesan: cek.pesan || "Akses tidak sah." };
    }

    const [dataPesanan] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    if (!dataPesanan) {
      return { sukses: false, pesan: "Pesanan tidak ditemukan." };
    }

    const envConfig = selesaikanKonfigurasiEnvironment();
    const serverKey = envConfig.midtrans.serverKey;
    const isProd = envConfig.midtrans.isProduction;

    const baseUrl = isProd
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

    const res = await fetch(`${baseUrl}/v2/${nomorPesanan}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        sukses: false,
        pesan: `Midtrans API merespons dengan status HTTP ${res.status}. Transaksi belum diinisiasi di gateway.`,
      };
    }

    const dataGateway = await res.json();
    const transactionStatus = dataGateway.transaction_status as string;

    // Sinkronisasi status jika lunas / settlement
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      await db
        .update(pesanan)
        .set({ statusPesanan: "diproses", diperbaruiPada: new Date() })
        .where(
          and(
            eq(pesanan.id, dataPesanan.id),
            eq(pesanan.statusPesanan, "menunggu_pembayaran")
          )
        );

      await db
        .update(pembayaran)
        .set({
          statusPembayaran: "berhasil",
          dibayarPada: new Date(),
          metodePembayaran: dataGateway.payment_type || "qris",
          gatewayTransactionId: dataGateway.transaction_id,
          diperbaruiPada: new Date(),
        })
        .where(eq(pembayaran.pesananId, dataPesanan.id));
    }

    // Catat log audit staf
    await db.insert(auditAktivitasAdmin).values({
      adminId: cek.staf.id,
      tindakan: "inquire_midtrans",
      targetId: nomorPesanan,
      payloadAman: { transactionStatus, gateway: dataGateway.payment_type },
    });

    return {
      sukses: true,
      pesan: `Status terkini Midtrans: ${transactionStatus.toUpperCase()}`,
      statusGateway: transactionStatus,
    };
  } catch (error) {
    console.error("[INQUIRE MIDTRANS] Gagal melakukan inkuiri gateway:", error);
    return {
      sukses: false,
      pesan: "Gagal menghubungkan ke gateway Midtrans API.",
    };
  }
}

/**
 * Server Action: Pembatalan pesanan secara manual oleh staf admin + Pemulihan Stok Atomik
 */
export async function batalkanPesananAdminAction(
  nomorPesanan: string,
  alasan: string
): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah || !cek.staf) {
      return { sukses: false, pesan: cek.pesan || "Akses tidak sah." };
    }

    const [dataPesanan] = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, nomorPesanan))
      .limit(1);

    if (!dataPesanan) {
      return { sukses: false, pesan: "Pesanan tidak ditemukan." };
    }

    if (dataPesanan.statusPesanan === "dibatalkan") {
      return { sukses: false, pesan: "Pesanan ini sudah dibatalkan sebelumnya." };
    }

    // Ubah status pesanan menjadi dibatalkan
    const hasilUpdate = await db
      .update(pesanan)
      .set({ statusPesanan: "dibatalkan", diperbaruiPada: new Date() })
      .where(
        and(
          eq(pesanan.id, dataPesanan.id),
          eq(pesanan.statusPesanan, dataPesanan.statusPesanan)
        )
      );

    // Ambil seluruh item untuk memulihkan stok
    const items = await db
      .select()
      .from(itemPesanan)
      .where(eq(itemPesanan.pesananId, dataPesanan.id));

    for (const item of items) {
      if (item.varianId) {
        // Ambil stok sekarang
        const [v] = await db
          .select({ stok: varianProduk.stok })
          .from(varianProduk)
          .where(eq(varianProduk.id, item.varianId))
          .limit(1);

        const stokSebelum = v?.stok || 0;
        const stokSesudah = stokSebelum + item.jumlah;

        await db
          .update(varianProduk)
          .set({
            stok: sql`${varianProduk.stok} + ${item.jumlah}`,
            diperbaruiPada: new Date(),
          })
          .where(eq(varianProduk.id, item.varianId));

        // Catat ke buku besar mutasi stok
        await db.insert(riwayatMutasiStok).values({
          varianId: item.varianId,
          adminId: cek.staf.id,
          jenisMutasi: "koreksi_fisik",
          kuantitasSebelum: stokSebelum,
          perubahan: item.jumlah,
          kuantitasSesudah: stokSesudah,
          nomorReferensi: nomorPesanan,
          catatan: `Pemulihan stok akibat pembatalan pesanan admin: ${alasan}`,
        });
      }
    }

    // Catat log audit admin
    await db.insert(auditAktivitasAdmin).values({
      adminId: cek.staf.id,
      tindakan: "batalkan_pesanan",
      targetId: nomorPesanan,
      payloadAman: { alasan },
    });

    return {
      sukses: true,
      pesan: `Pesanan #${nomorPesanan} berhasil dibatalkan dan seluruh stok artikel telah dipulihkan.`,
    };
  } catch (error) {
    console.error("[BATALKAN PESANAN] Gagal membatalkan pesanan:", error);
    return {
      sukses: false,
      pesan: "Gagal membatalkan pesanan karena kendala server.",
    };
  }
}

/**
 * Server Action: Menambahkan catatan operasional internal pada pesanan
 */
export async function tambahCatatanOperasionalAction(
  pesananId: string,
  isiCatatan: string,
  tingkatUrgensi: string = "normal"
): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah || !cek.staf) {
      return { sukses: false, pesan: cek.pesan || "Akses tidak sah." };
    }

    if (!isiCatatan.trim()) {
      return { sukses: false, pesan: "Catatan tidak boleh kosong." };
    }

    await db.insert(catatanOperasionalPesanan).values({
      pesananId,
      adminId: cek.staf.id,
      isiCatatan: isiCatatan.trim(),
      tingkatUrgensi,
    });

    return { sukses: true, pesan: "Catatan internal berhasil disimpan." };
  } catch (error) {
    console.error("[CATATAN OPERASIONAL] Gagal menyimpan catatan:", error);
    return { sukses: false, pesan: "Gagal menyimpan catatan operasional." };
  }
}

export interface HasilBatchFulfillment {
  sukses: boolean;
  pesan: string;
  totalDiminta: number;
  totalBerhasil: number;
  totalGagal: number;
  daftarSukses: Array<{
    nomorPesanan: string;
    nomorResi: string;
    kurir: string;
  }>;
  daftarGagal: Array<{
    nomorPesanan: string;
    alasan: string;
  }>;
}

/**
 * Server Action: Batch Fulfillment & Request Pickup Biteship
 * Mengeksekusi penjemputan logistik massal untuk daftar pesanan berstatus 'diproses'.
 * Menerapkan pola fault-tolerance per-order, penghematan kuota API Biteship (reuse resi eksis),
 * Compare-and-Set status atomik, audit log staf, dan pengiriman notifikasi email resi via outbox.
 */
export async function batchRequestPickupBiteshipAction(
  daftarNomorPesanan: string[]
): Promise<HasilBatchFulfillment> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah || !cek.staf) {
      return {
        sukses: false,
        pesan: cek.pesan || "Akses tidak sah: sesi staf admin tidak valid.",
        totalDiminta: daftarNomorPesanan.length,
        totalBerhasil: 0,
        totalGagal: daftarNomorPesanan.length,
        daftarSukses: [],
        daftarGagal: daftarNomorPesanan.map((no) => ({
          nomorPesanan: no,
          alasan: "Akses tidak sah atau sesi kedaluwarsa.",
        })),
      };
    }

    if (!Array.isArray(daftarNomorPesanan) || daftarNomorPesanan.length === 0) {
      return {
        sukses: false,
        pesan: "Tidak ada pesanan yang dipilih untuk diproses.",
        totalDiminta: 0,
        totalBerhasil: 0,
        totalGagal: 0,
        daftarSukses: [],
        daftarGagal: [],
      };
    }

    const daftarSukses: Array<{
      nomorPesanan: string;
      nomorResi: string;
      kurir: string;
    }> = [];
    const daftarGagal: Array<{
      nomorPesanan: string;
      alasan: string;
    }> = [];

    const env = selesaikanKonfigurasiEnvironment();
    const baseUrl = env.siteUrl || "http://localhost:3000";

    // Eksekusi sekuensial terisolasi per pesanan (P0 fault tolerance)
    for (const nomorPesanan of daftarNomorPesanan) {
      try {
        const [orderData] = await db
          .select({
            pesanan: pesanan,
            pengiriman: pengiriman,
            pelanggan: pelanggan,
          })
          .from(pesanan)
          .innerJoin(pengiriman, eq(pengiriman.pesananId, pesanan.id))
          .innerJoin(pelanggan, eq(pelanggan.id, pesanan.pelangganId))
          .where(eq(pesanan.nomorPesanan, nomorPesanan))
          .limit(1);

        if (!orderData) {
          daftarGagal.push({
            nomorPesanan,
            alasan: "Data pesanan atau logistik tidak ditemukan di sistem basis data.",
          });
          continue;
        }

        if (orderData.pesanan.statusPesanan === "dibatalkan") {
          daftarGagal.push({
            nomorPesanan,
            alasan: "Pesanan telah dibatalkan, penjemputan logistik ditolak.",
          });
          continue;
        }

        // P0 Cost Guardrail: Bila sudah memiliki resi atau order Biteship eksis, lewati pemanggilan API ulang
        const resiEksis = orderData.pengiriman.nomorResi || orderData.pengiriman.biteshipOrderId;
        if (resiEksis) {
          daftarSukses.push({
            nomorPesanan,
            nomorResi: resiEksis,
            kurir: (orderData.pengiriman.kurir || "ekspedisi").toUpperCase(),
          });

          // Pastikan status minimal 'dikirim' jika resi sudah ada
          if (orderData.pesanan.statusPesanan === "diproses") {
            await db
              .update(pesanan)
              .set({ statusPesanan: "dikirim", diperbaruiPada: new Date() })
              .where(eq(pesanan.id, orderData.pesanan.id));
          }
          continue;
        }

        if (orderData.pesanan.statusPesanan !== "diproses") {
          daftarGagal.push({
            nomorPesanan,
            alasan: `Status pesanan saat ini '${orderData.pesanan.statusPesanan}'. Hanya pesanan 'diproses' yang dapat diajukan pickup.`,
          });
          continue;
        }

        // Ambil daftar item pesanan untuk manifest logistik Biteship
        const items = await db
          .select()
          .from(itemPesanan)
          .where(eq(itemPesanan.pesananId, orderData.pesanan.id));

        const resBiteship = await buatOrderPengirimanBiteship({
          nomorPesanan,
          namaPenerima: orderData.pengiriman.namaPenerima,
          teleponPenerima: orderData.pengiriman.teleponPenerima,
          alamatLengkap: orderData.pengiriman.alamatLengkap,
          kodePos: orderData.pengiriman.kodePos,
          kodeKurir: orderData.pengiriman.kurir,
          layanan: orderData.pengiriman.layanan,
          kodeLayananKurir: orderData.pengiriman.kodeLayananKurir ?? undefined,
          totalBeratGram: orderData.pengiriman.beratTotalGram || 1000,
          items: items.map((it) => ({
            name: it.namaProduk,
            value: it.hargaSatuan,
            quantity: it.jumlah,
            weight: it.beratGram || 500,
          })),
        });

        if (!resBiteship.sukses) {
          daftarGagal.push({
            nomorPesanan,
            alasan: resBiteship.pesan || "Pemesanan kurir ke Biteship API gagal merespons sukses.",
          });
          continue;
        }

        const nomorResiFinal =
          resBiteship.waybillId ||
          resBiteship.orderId ||
          `VOID-${nomorPesanan}`;

        // 1. Perbarui entitas pengiriman
        await db
          .update(pengiriman)
          .set({
            nomorResi: nomorResiFinal,
            biteshipOrderId: resBiteship.orderId,
            biteshipTrackingId: resBiteship.trackingId,
            statusPengiriman: "dalam_pengiriman",
            diperbaruiPada: new Date(),
          })
          .where(eq(pengiriman.pesananId, orderData.pesanan.id));

        // 2. Perbarui status pesanan menjadi 'dikirim' via compare-and-set atomik
        await db
          .update(pesanan)
          .set({
            statusPesanan: "dikirim",
            diperbaruiPada: new Date(),
          })
          .where(
            and(
              eq(pesanan.id, orderData.pesanan.id),
              eq(pesanan.statusPesanan, "diproses")
            )
          );

        // 3. Catat milestone awal pelacakan logistik
        await db.insert(pelacakanPengiriman).values({
          pesananId: orderData.pesanan.id,
          nomorResi: nomorResiFinal,
          kurir: orderData.pengiriman.kurir,
          statusPelacakan: resBiteship.status || "allocated",
          keterangan: "Pemesanan kurir berhasil dibuat via Batch Fulfillment Admin. Menunggu penjemputan.",
          lokasi: "Warehouse Johar Baru, Jakarta Pusat",
          waktuPeristiwa: new Date(),
        });

        // 4. Catat catatan operasional internal pesanan
        await db.insert(catatanOperasionalPesanan).values({
          pesananId: orderData.pesanan.id,
          adminId: cek.staf.id,
          isiCatatan: `Pickup kurir berhasil diajukan via batch. Resi: ${nomorResiFinal} (${orderData.pengiriman.kurir.toUpperCase()})`,
          tingkatUrgensi: "normal",
        });

        // 5. Catat audit aktivitas staf admin
        await db.insert(auditAktivitasAdmin).values({
          adminId: cek.staf.id,
          tindakan: "request_pickup_biteship",
          targetId: nomorPesanan,
          payloadAman: {
            waybillId: nomorResiFinal,
            biteshipOrderId: resBiteship.orderId,
            kurir: orderData.pengiriman.kurir,
          },
        });

        // 6. Masukkan notifikasi email resi pengiriman ke Transactional Outbox
        await tambahTugasOutboxLangsung({
          tipePekerjaan: "kirim_email",
          pesananId: orderData.pesanan.id,
          payload: {
            penerimaEmail: orderData.pelanggan.email,
            namaPenerima: orderData.pelanggan.namaLengkap,
            tipeEmail: "resi_pengiriman",
            payload: {
              nomorPesanan,
              resi: nomorResiFinal,
              kurir: orderData.pengiriman.kurir,
              tautanAksi: `${baseUrl}/pesanan/${nomorPesanan}?token=${orderData.pesanan.tokenAkses}`,
            },
          },
        });

        daftarSukses.push({
          nomorPesanan,
          nomorResi: nomorResiFinal,
          kurir: orderData.pengiriman.kurir.toUpperCase(),
        });
      } catch (itemErr) {
        console.error(`[BATCH FULFILLMENT] Kendala pada pesanan #${nomorPesanan}:`, itemErr);
        daftarGagal.push({
          nomorPesanan,
          alasan: itemErr instanceof Error ? itemErr.message : "Kesalahan sistem internal tak terduga.",
        });
      }
    }

    const ringkasanPesan =
      daftarSukses.length === daftarNomorPesanan.length
        ? `Seluruh ${daftarSukses.length} pesanan berhasil diproses pickup Biteship.`
        : daftarSukses.length > 0
        ? `Batch selesai parsial: ${daftarSukses.length} berhasil, ${daftarGagal.length} gagal.`
        : `Batch gagal: seluruh ${daftarGagal.length} pesanan tidak dapat diproses pickup.`;

    return {
      sukses: daftarSukses.length > 0,
      pesan: ringkasanPesan,
      totalDiminta: daftarNomorPesanan.length,
      totalBerhasil: daftarSukses.length,
      totalGagal: daftarGagal.length,
      daftarSukses,
      daftarGagal,
    };
  } catch (error) {
    console.error("[BATCH FULFILLMENT ACTION] Gagal total memproses batch:", error);
    return {
      sukses: false,
      pesan: "Gagal memproses batch fulfillment karena kesalahan internal server.",
      totalDiminta: daftarNomorPesanan.length,
      totalBerhasil: 0,
      totalGagal: daftarNomorPesanan.length,
      daftarSukses: [],
      daftarGagal: daftarNomorPesanan.map((no) => ({
        nomorPesanan: no,
        alasan: "Kesalahan server fatal saat batch execution.",
      })),
    };
  }
}

