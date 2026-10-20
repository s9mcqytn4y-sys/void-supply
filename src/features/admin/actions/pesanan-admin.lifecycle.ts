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

      const [pesananDibatalkan] = await tx
        .update(pesanan)
        .set({ statusPesanan: "dibatalkan", diperbaruiPada: new Date() })
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
        payloadAman: { alasan },
      });

      return {
        sukses: true,
        pesan: `Pesanan #${nomorPesanan} berhasil dibatalkan dan seluruh stok artikel telah dipulihkan.`,
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
