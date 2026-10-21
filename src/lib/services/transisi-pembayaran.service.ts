import { and, eq, sql } from "drizzle-orm";
import {
  db,
  pesanan,
  pembayaran,
  itemPesanan,
  varianProduk,
  faktur,
} from "@/lib/db";
import {
  riwayatMutasiStok,
  catatanOperasionalPesanan,
  auditAktivitasAdmin,
} from "@/lib/db/admin.schema";
import { tambahTugasOutbox } from "./outbox.service";

export type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface ParameterSettlement {
  nomorPesanan: string;
  transactionStatus: string;
  fraudStatus?: string;
  paymentType?: string;
  transactionId?: string;
  settlementTime?: string;
  rawPayload?: Record<string, unknown>;
  asalPemicu: "webhook" | "admin_inquiry";
  adminId?: string;
}

export interface HasilTransisiPembayaran {
  sukses: boolean;
  transisiDijalankan: boolean;
  kasus: "lunas_baru" | "sudah_lunas" | "late_settlement" | "diabaikan";
  nomorFaktur?: string;
  pesan: string;
}

/**
 * Domain Service: Transisi Pembayaran Terpadu (Unified Payment Lifecycle)
 * Menjamin keseragaman logika antara notifikasi webhook Midtrans dan inquiry admin.
 * Memastikan CAS atomik, penerbitan faktur idempoten, dan penanganan late settlement.
 */
export async function prosesSettlementMidtransDomain(
  tx: DbTx,
  params: ParameterSettlement
): Promise<HasilTransisiPembayaran> {
  const {
    nomorPesanan,
    transactionStatus,
    paymentType,
    transactionId,
    settlementTime,
    rawPayload,
    asalPemicu,
    adminId,
  } = params;

  // 1. Ambil data pesanan dan pembayaran terkini di dalam transaksi atomik (anti-stale read)
  const [dataPesanan] = await tx
    .select({
      id: pesanan.id,
      nomorPesanan: pesanan.nomorPesanan,
      statusPesanan: pesanan.statusPesanan,
      totalAkhir: pesanan.totalAkhir,
      namaPelanggan: pesanan.namaPelanggan,
      emailPelanggan: pesanan.emailPelanggan,
    })
    .from(pesanan)
    .where(eq(pesanan.nomorPesanan, nomorPesanan))
    .limit(1);

  if (!dataPesanan) {
    return {
      sukses: false,
      transisiDijalankan: false,
      kasus: "diabaikan",
      pesan: `Pesanan '${nomorPesanan}' tidak ditemukan.`,
    };
  }

  // 2. Kasus A: Pesanan Masih Menunggu Pembayaran -> Transisikan ke 'diproses'
  if (dataPesanan.statusPesanan === "menunggu_pembayaran") {
    const [orderTerupdate] = await tx
      .update(pesanan)
      .set({
        statusPesanan: "diproses",
        diperbaruiPada: new Date(),
      })
      .where(
        and(
          eq(pesanan.id, dataPesanan.id),
          eq(pesanan.statusPesanan, "menunggu_pembayaran")
        )
      )
      .returning({ id: pesanan.id });

    // Verifikasi keberhasilan CAS sebelum memperbarui pembayaran (P0-B anti-TOCTOU)
    if (!orderTerupdate) {
      // Terjadi race condition: transaksi lain telah mengubah status pesanan sesaat sebelumnya
      return {
        sukses: false,
        transisiDijalankan: false,
        kasus: "diabaikan",
        pesan: "CAS pesanan gagal karena status telah berubah oleh proses lain.",
      };
    }

    // Perbarui entitas pembayaran
    await tx
      .update(pembayaran)
      .set({
        statusPembayaran: "berhasil",
        metodePembayaran: paymentType || "midtrans",
        gatewayTransactionId: transactionId,
        dibayarPada: new Date(),
        metadataGateway: rawPayload || {},
        diperbaruiPada: new Date(),
      })
      .where(eq(pembayaran.pesananId, dataPesanan.id));

    // Terbitkan faktur resmi e-receipt idempoten
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const nomorFaktur = `INV/${dateStr}/${nomorPesanan.replace(/^VOID-/, "")}`;

    const [fakturBaru] = await tx
      .insert(faktur)
      .values({
        nomorFaktur,
        pesananId: dataPesanan.id,
        totalTagihan: dataPesanan.totalAkhir,
        statusFaktur: "lunas",
        metadataFaktur: {
          gatewayTransactionId: transactionId,
          metodePembayaran: paymentType || "midtrans",
          settlementTime: settlementTime || new Date().toISOString(),
        },
      })
      .onConflictDoNothing()
      .returning({ id: faktur.id });

    // Sisipkan tugas outbox snapshot arsip faktur
    const idFakturFinal = fakturBaru?.id;
    if (idFakturFinal) {
      await tambahTugasOutbox(tx, {
        tipePekerjaan: "buat_arsip_faktur",
        pesananId: dataPesanan.id,
        payload: {
          fakturId: idFakturFinal,
          nomorFaktur,
          pesananId: dataPesanan.id,
        },
      });
    }

    // Sisipkan tugas notifikasi email pembayaran lunas
    await tambahTugasOutbox(tx, {
      tipePekerjaan: "kirim_email",
      pesananId: dataPesanan.id,
      payload: {
        pesananId: dataPesanan.id,
        emailPenerima: dataPesanan.emailPelanggan,
        tipe: "pembayaran_berhasil",
        subjek: `Pembayaran Berhasil // Faktur ${nomorFaktur}`,
        data: {
          nomorPesanan,
          namaPelanggan: dataPesanan.namaPelanggan,
          rincian: `Pembayaran sebesar Rp ${dataPesanan.totalAkhir.toLocaleString("id-ID")} melalui ${paymentType || "Midtrans"} telah terverifikasi.`,
          total: `Rp ${dataPesanan.totalAkhir.toLocaleString("id-ID")}`,
        },
      },
    });

    // Sisipkan tugas order Biteship ke antrean outbox
    await tambahTugasOutbox(tx, {
      tipePekerjaan: "buat_order_biteship",
      pesananId: dataPesanan.id,
      payload: {
        pesananId: dataPesanan.id,
        nomorPesanan,
      },
    });

    return {
      sukses: true,
      transisiDijalankan: true,
      kasus: "lunas_baru",
      nomorFaktur,
      pesan: `Pesanan #${nomorPesanan} berhasil dilunasi dan dialihkan ke 'diproses'.`,
    };
  }

  // 3. Kasus B: Pesanan Sudah Berada Pada Status 'diproses', 'dikirim', atau 'selesai'
  if (
    dataPesanan.statusPesanan === "diproses" ||
    dataPesanan.statusPesanan === "dikirim" ||
    dataPesanan.statusPesanan === "selesai"
  ) {
    // Sinkronkan data pembayaran jika gateway transaction id belum terisi
    await tx
      .update(pembayaran)
      .set({
        statusPembayaran: "berhasil",
        metodePembayaran: paymentType || "midtrans",
        gatewayTransactionId: transactionId,
        dibayarPada: new Date(),
        metadataGateway: rawPayload || {},
        diperbaruiPada: new Date(),
      })
      .where(eq(pembayaran.pesananId, dataPesanan.id));

    return {
      sukses: true,
      transisiDijalankan: false,
      kasus: "sudah_lunas",
      pesan: `Pesanan #${nomorPesanan} sudah berada pada status lunas/aktif (${dataPesanan.statusPesanan}).`,
    };
  }

  // 4. Kasus C: Late Settlement Guard (P0-A)
  // Pesanan telah berstatus 'dibatalkan'. Jangan pulihkan stok, tandai 'menunggu_refund', dan aktifkan tinjauan manual.
  if (dataPesanan.statusPesanan === "dibatalkan") {
    await tx
      .update(pembayaran)
      .set({
        statusPembayaran: "menunggu_refund",
        metodePembayaran: paymentType || "midtrans",
        gatewayTransactionId: transactionId,
        dibayarPada: new Date(),
        metadataGateway: rawPayload || {},
        diperbaruiPada: new Date(),
      })
      .where(eq(pembayaran.pesananId, dataPesanan.id));

    await tx
      .update(pesanan)
      .set({
        perluTinjauanManual: true,
        diperbaruiPada: new Date(),
      })
      .where(eq(pesanan.id, dataPesanan.id));

    await tx.insert(catatanOperasionalPesanan).values({
      pesananId: dataPesanan.id,
      adminId: adminId || null,
      isiCatatan: `Anomali Late Settlement [${asalPemicu.toUpperCase()}]: Dana lunas terkonfirmasi oleh Midtrans (${paymentType || "gateway"}, TRX: ${transactionId || "-"}) setelah pesanan berstatus dibatalkan. Status pembayaran dialihkan ke 'menunggu_refund' untuk tinjauan dan refund manual.`,
      tingkatUrgensi: "kritis",
    });

    await tx.insert(auditAktivitasAdmin).values({
      adminId: adminId || null,
      tindakan: "late_settlement_detected",
      targetId: nomorPesanan,
      payloadAman: {
        asalPemicu,
        transactionStatus,
        gateway: paymentType,
        transactionId: transactionId || null,
      },
    });

    return {
      sukses: true,
      transisiDijalankan: true,
      kasus: "late_settlement",
      pesan: `Anomali late settlement terdeteksi untuk pesanan #${nomorPesanan}. Status pembayaran dialihkan ke 'menunggu_refund'.`,
    };
  }

  return {
    sukses: true,
    transisiDijalankan: false,
    kasus: "diabaikan",
    pesan: `Status pesanan (${dataPesanan.statusPesanan}) tidak memenuhi syarat transisi settlement.`,
  };
}

/**
 * Domain Service: Menangani Kegagalan / Kedaluwarsa Transaksi Midtrans
 */
export async function prosesKegagalanMidtransDomain(
  tx: DbTx,
  params: {
    nomorPesanan: string;
    transactionStatus: "expire" | "cancel" | "deny" | string;
    rawPayload?: Record<string, unknown>;
  }
): Promise<{ sukses: boolean; dibatalkan: boolean; pesan: string }> {
  const { nomorPesanan, transactionStatus, rawPayload } = params;

  const [dataPesanan] = await tx
    .select({
      id: pesanan.id,
      statusPesanan: pesanan.statusPesanan,
    })
    .from(pesanan)
    .where(eq(pesanan.nomorPesanan, nomorPesanan))
    .limit(1);

  if (!dataPesanan) {
    return {
      sukses: false,
      dibatalkan: false,
      pesan: `Pesanan '${nomorPesanan}' tidak ditemukan.`,
    };
  }

  // CAS: Hanya batalkan jika status saat ini 'menunggu_pembayaran'
  const [pesananDibatalkan] = await tx
    .update(pesanan)
    .set({
      statusPesanan: "dibatalkan",
      diperbaruiPada: new Date(),
    })
    .where(
      and(
        eq(pesanan.id, dataPesanan.id),
        eq(pesanan.statusPesanan, "menunggu_pembayaran")
      )
    )
    .returning({ id: pesanan.id });

  if (pesananDibatalkan) {
    // Pulihkan stok varian artikel secara atomik
    const items = await tx
      .select({
        varianId: itemPesanan.varianId,
        jumlah: itemPesanan.jumlah,
      })
      .from(itemPesanan)
      .where(eq(itemPesanan.pesananId, dataPesanan.id));

    for (const item of items) {
      if (item.varianId) {
        await tx
          .update(varianProduk)
          .set({
            stok: sql`${varianProduk.stok} + ${item.jumlah}`,
            diperbaruiPada: new Date(),
          })
          .where(eq(varianProduk.id, item.varianId));
      }
    }

    const statusBayarAkhir =
      transactionStatus === "expire" ? "kadaluarsa" : "gagal";

    await tx
      .update(pembayaran)
      .set({
        statusPembayaran: statusBayarAkhir,
        metadataGateway: rawPayload || {},
        diperbaruiPada: new Date(),
      })
      .where(eq(pembayaran.pesananId, dataPesanan.id));

    return {
      sukses: true,
      dibatalkan: true,
      pesan: `Pesanan #${nomorPesanan} dibatalkan (${transactionStatus}) dan stok dipulihkan.`,
    };
  }

  // Jika pesanan sudah dibatalkan sebelumnya, perbarui status pembayaran jika masih 'menunggu_pembayaran'
  if (dataPesanan.statusPesanan === "dibatalkan") {
    await tx
      .update(pembayaran)
      .set({
        statusPembayaran: transactionStatus === "expire" ? "kadaluarsa" : "gagal",
        metadataGateway: rawPayload || {},
        diperbaruiPada: new Date(),
      })
      .where(
        and(
          eq(pembayaran.pesananId, dataPesanan.id),
          eq(pembayaran.statusPembayaran, "menunggu_pembayaran")
        )
      );
  }

  return {
    sukses: true,
    dibatalkan: false,
    pesan: `Pesanan #${nomorPesanan} sudah berada pada status final (${dataPesanan.statusPesanan}).`,
  };
}
