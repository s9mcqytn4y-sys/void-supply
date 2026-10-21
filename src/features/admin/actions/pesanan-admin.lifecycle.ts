"use server";

import { eq, and, sql, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pesanan,
  itemPesanan,
  pembayaran,
  varianProduk,
} from "@/lib/db/schema";
import {
  riwayatMutasiStok,
  catatanOperasionalPesanan,
  auditAktivitasAdmin,
} from "@/lib/db/admin.schema";
import { verifikasiStafAdmin, verifikasiHakAksesAdmin } from "./auth-guard";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment/resolver";
import {
  prosesSettlementMidtransDomain,
  prosesKegagalanMidtransDomain,
} from "@/lib/services/transisi-pembayaran.service";

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
    const fraudStatus = (dataGateway.fraud_status as string | undefined)?.toLowerCase();

    // 1. Kasus Lunas / Settlement / Capture Resmi Terverifikasi
    const apakahLunasSah =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");

    // 2. Kasus Gagal / Kadaluwarsa di Gateway
    const apakahKedaluwarsaAtauGagal =
      transactionStatus === "expire" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny";

    await db.transaction(async (tx) => {
      const stafId = cek.staf?.id;

      if (apakahLunasSah) {
        await prosesSettlementMidtransDomain(tx, {
          nomorPesanan,
          transactionStatus,
          fraudStatus,
          paymentType: dataGateway.payment_type || "qris",
          transactionId: dataGateway.transaction_id,
          settlementTime: dataGateway.settlement_time,
          rawPayload: dataGateway,
          asalPemicu: "admin_inquiry",
          adminId: stafId,
        });
      } else if (apakahKedaluwarsaAtauGagal) {
        await prosesKegagalanMidtransDomain(tx, {
          nomorPesanan,
          transactionStatus,
          rawPayload: dataGateway,
        });
      }

      // Catat log audit staf
      if (stafId) {
        await tx.insert(auditAktivitasAdmin).values({
          adminId: stafId,
          tindakan: "inquire_midtrans",
          targetId: nomorPesanan,
          payloadAman: {
            transactionStatus,
            fraudStatus: fraudStatus || null,
            gateway: dataGateway.payment_type,
          },
        });
      }
    });

    return {
      sukses: true,
      pesan: `Status terkini Midtrans: ${transactionStatus.toUpperCase()}${fraudStatus ? ` (Fraud: ${fraudStatus.toUpperCase()})` : ""}`,
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
    const cek = await verifikasiHakAksesAdmin();
    if (!cek.sah || !cek.admin) {
      return { sukses: false, pesan: cek.pesan || "Akses tidak sah." };
    }

    const adminAktif = cek.admin;

    const hasilTransaksi = await db.transaction(async (tx) => {
      const [dataPesanan] = await tx
        .select({
          id: pesanan.id,
          statusPesanan: pesanan.statusPesanan,
        })
        .from(pesanan)
        .where(eq(pesanan.nomorPesanan, nomorPesanan))
        .limit(1);

      if (!dataPesanan) {
        return { sukses: false, pesan: "Pesanan tidak ditemukan." };
      }

      if (dataPesanan.statusPesanan === "dibatalkan") {
        return { sukses: false, pesan: "Pesanan ini sudah dibatalkan sebelumnya." };
      }

      if (dataPesanan.statusPesanan === "dikirim" || dataPesanan.statusPesanan === "selesai") {
        return {
          sukses: false,
          pesan: `Pesanan berstatus '${dataPesanan.statusPesanan}' tidak dapat dibatalkan secara sepihak karena barang telah dalam pengiriman atau selesai. Silakan gunakan prosedur retur.`,
        };
      }

      const statusSebelumnya = dataPesanan.statusPesanan;
      const apakahPesananSudahDibayar = statusSebelumnya === "diproses";

      const [pesananDibatalkan] = await tx
        .update(pesanan)
        .set({
          statusPesanan: "dibatalkan",
          perluTinjauanManual: apakahPesananSudahDibayar ? true : false,
          diperbaruiPada: new Date(),
        })
        .where(
          and(
            eq(pesanan.id, dataPesanan.id),
            or(
              eq(pesanan.statusPesanan, "menunggu_pembayaran"),
              eq(pesanan.statusPesanan, "diproses")
            )
          )
        )
        .returning({ id: pesanan.id });

      if (!pesananDibatalkan) {
        return {
          sukses: false,
          pesan: "Gagal membatalkan pesanan karena status telah berubah oleh transaksi lain.",
        };
      }

      // Sinkronkan status pembayaran secara atomik
      if (apakahPesananSudahDibayar) {
        // P0 State Machine: Tandai menunggu_refund (bukan dikembalikan) sampai ada bukti refund
        await tx
          .update(pembayaran)
          .set({
            statusPembayaran: "menunggu_refund",
            diperbaruiPada: new Date(),
          })
          .where(eq(pembayaran.pesananId, pesananDibatalkan.id));

        await tx.insert(catatanOperasionalPesanan).values({
          pesananId: pesananDibatalkan.id,
          adminId: adminAktif.id,
          isiCatatan: `Pesanan berbayar dibatalkan oleh admin (${adminAktif.nama}). Alasan: ${alasan}. Status pembayaran dialihkan ke 'menunggu_refund'. Diperlukan pengembalian dana manual ke pelanggan.`,
          tingkatUrgensi: "penting",
        });
      } else {
        await tx
          .update(pembayaran)
          .set({
            statusPembayaran: "gagal",
            diperbaruiPada: new Date(),
          })
          .where(eq(pembayaran.pesananId, pesananDibatalkan.id));
      }

      const items = await tx
        .select()
        .from(itemPesanan)
        .where(eq(itemPesanan.pesananId, pesananDibatalkan.id));

      for (const item of items) {
        if (item.varianId) {
          const [varianTerupdate] = await tx
            .update(varianProduk)
            .set({
              stok: sql`${varianProduk.stok} + ${item.jumlah}`,
              diperbaruiPada: new Date(),
            })
            .where(eq(varianProduk.id, item.varianId))
            .returning({ stok: varianProduk.stok });

          const stokSesudah = varianTerupdate?.stok ?? 0;
          const stokSebelum = Math.max(0, stokSesudah - item.jumlah);

          await tx.insert(riwayatMutasiStok).values({
            varianId: item.varianId,
            adminId: adminAktif.id,
            jenisMutasi: "koreksi_fisik",
            kuantitasSebelum: stokSebelum,
            perubahan: item.jumlah,
            kuantitasSesudah: stokSesudah,
            nomorReferensi: nomorPesanan,
            catatan: `Pemulihan stok akibat pembatalan pesanan admin: ${alasan}`,
          });
        }
      }

      await tx.insert(auditAktivitasAdmin).values({
        adminId: adminAktif.id,
        tindakan: "batalkan_pesanan",
        targetId: nomorPesanan,
        payloadAman: {
          alasan,
          statusSebelumnya,
          apakahPesananSudahDibayar,
          perluRefundManual: apakahPesananSudahDibayar,
        },
      });

      return {
        sukses: true,
        pesan: apakahPesananSudahDibayar
          ? `Pesanan #${nomorPesanan} (berstatus dibayar) berhasil dibatalkan. Seluruh stok artikel telah dipulihkan dan status pembayaran dialihkan ke 'menunggu_refund' (perlu rekonsiliasi refund manual).`
          : `Pesanan #${nomorPesanan} berhasil dibatalkan dan seluruh stok artikel telah dipulihkan.`,
      };
    });

    return hasilTransaksi;
  } catch (error) {
    console.error("[BATALKAN PESANAN] Gagal membatalkan pesanan:", error);
    return {
      sukses: false,
      pesan: "Gagal membatalkan pesanan karena kendala server.",
    };
  }
}

/**
 * Server Action: Konfirmasi penyelesaian pengembalian dana (refund) oleh admin
 */
export async function konfirmasiRefundAdminAction(
  nomorPesanan: string,
  referensiRefund: string,
  catatan?: string
): Promise<{ sukses: boolean; pesan: string }> {
  try {
    const cek = await verifikasiHakAksesAdmin();
    if (!cek.sah || !cek.admin) {
      return { sukses: false, pesan: cek.pesan || "Akses tidak sah." };
    }

    if (!referensiRefund || !referensiRefund.trim()) {
      return {
        sukses: false,
        pesan: "Nomor referensi bukti refund wajib diisi (misal: nomor transfer bank atau ID refund gateway).",
      };
    }

    const adminAktif = cek.admin;

    const hasilTransaksi = await db.transaction(async (tx) => {
      const [dataPesanan] = await tx
        .select({
          id: pesanan.id,
          statusPesanan: pesanan.statusPesanan,
        })
        .from(pesanan)
        .where(eq(pesanan.nomorPesanan, nomorPesanan))
        .limit(1);

      if (!dataPesanan) {
        return { sukses: false, pesan: "Pesanan tidak ditemukan." };
      }

      const [dataPembayaran] = await tx
        .select({
          id: pembayaran.id,
          statusPembayaran: pembayaran.statusPembayaran,
        })
        .from(pembayaran)
        .where(eq(pembayaran.pesananId, dataPesanan.id))
        .limit(1);

      if (!dataPembayaran) {
        return { sukses: false, pesan: "Data pembayaran untuk pesanan ini tidak ditemukan." };
      }

      if (dataPembayaran.statusPembayaran === "dikembalikan") {
        return { sukses: false, pesan: "Pesanan ini sudah berstatus refund/dikembalikan sebelumnya." };
      }

      if (dataPembayaran.statusPembayaran !== "menunggu_refund") {
        return {
          sukses: false,
          pesan: `Status pembayaran saat ini adalah '${dataPembayaran.statusPembayaran}'. Hanya pesanan dengan status 'menunggu_refund' yang dapat dikonfirmasi refund.`,
        };
      }

      // Update status pembayaran menjadi 'dikembalikan'
      await tx
        .update(pembayaran)
        .set({
          statusPembayaran: "dikembalikan",
          diperbaruiPada: new Date(),
        })
        .where(eq(pembayaran.id, dataPembayaran.id));

      // Selesaikan tanda tinjauan manual jika tidak ada masalah lain
      await tx
        .update(pesanan)
        .set({
          perluTinjauanManual: false,
          diperbaruiPada: new Date(),
        })
        .where(eq(pesanan.id, dataPesanan.id));

      await tx.insert(catatanOperasionalPesanan).values({
        pesananId: dataPesanan.id,
        adminId: adminAktif.id,
        isiCatatan: `Pengembalian dana (refund) telah dikonfirmasi oleh admin (${adminAktif.nama}). No. Referensi: ${referensiRefund.trim()}. Catatan: ${catatan?.trim() || "-"}`,
        tingkatUrgensi: "normal",
      });

      await tx.insert(auditAktivitasAdmin).values({
        adminId: adminAktif.id,
        tindakan: "konfirmasi_refund",
        targetId: nomorPesanan,
        payloadAman: {
          referensiRefund: referensiRefund.trim(),
          catatan: catatan?.trim() || null,
        },
      });

      return {
        sukses: true,
        pesan: `Pengembalian dana untuk pesanan #${nomorPesanan} berhasil dikonfirmasi (No. Ref: ${referensiRefund.trim()}).`,
      };
    });

    return hasilTransaksi;
  } catch (error) {
    console.error("[KONFIRMASI REFUND] Gagal mengonfirmasi refund:", error);
    return {
      sukses: false,
      pesan: "Gagal mengonfirmasi refund karena kendala server.",
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

