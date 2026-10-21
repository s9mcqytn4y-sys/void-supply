"use server";

import { eq, and, isNull, or, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pesanan,
  itemPesanan,
  pelanggan,
  pengiriman,
  pelacakanPengiriman,
} from "@/lib/db/schema";
import {
  catatanOperasionalPesanan,
  auditAktivitasAdmin,
} from "@/lib/db/admin.schema";
import { verifikasiStafAdmin } from "./auth-guard";
import { selesaikanKonfigurasiEnvironment } from "@/lib/environment/resolver";
import {
  buatOrderPengirimanBiteship,
  lacakPengirimanBiteship,
} from "@/lib/services/biteship.service";
import { tambahTugasOutboxLangsung } from "@/lib/services/outbox.service";

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
        const biteshipOrderSah =
          orderData.pengiriman.biteshipOrderId &&
          !orderData.pengiriman.biteshipOrderId.startsWith("DISPATCHING_")
            ? orderData.pengiriman.biteshipOrderId
            : null;
        const resiEksis = orderData.pengiriman.nomorResi || biteshipOrderSah;
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

        // P1 Single Dispatch Guard: Kunci optimistik pada pengiriman sebelum side-effect eksternal
        const lockReservationId = `DISPATCHING_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const limaMenitLalu = new Date(Date.now() - 5 * 60 * 1000);

        // Pola Inquiry-Before-Dispatch: Jika pengiriman memiliki tanda in-flight sebelumnya,
        // cek status pelacakan Biteship terlebih dahulu untuk mencegah pembuatan order ganda jika API sempat timeout.
        if (
          orderData.pengiriman.biteshipOrderId &&
          orderData.pengiriman.biteshipOrderId.startsWith("DISPATCHING_")
        ) {
          try {
            const inkuiriEksis = await lacakPengirimanBiteship(
              nomorPesanan,
              orderData.pengiriman.kurir
            );
            if (
              inkuiriEksis.sukses &&
              inkuiriEksis.nomorResi &&
              inkuiriEksis.status !== "unknown"
            ) {
              const nomorResiTersedia = inkuiriEksis.nomorResi;

              await db
                .update(pengiriman)
                .set({
                  nomorResi: nomorResiTersedia,
                  statusPengiriman: "dalam_pengiriman",
                  diperbaruiPada: new Date(),
                })
                .where(eq(pengiriman.pesananId, orderData.pesanan.id));

              await db
                .update(pesanan)
                .set({
                  statusPesanan: "dikirim",
                  diperbaruiPada: new Date(),
                })
                .where(eq(pesanan.id, orderData.pesanan.id));

              daftarSukses.push({
                nomorPesanan,
                nomorResi: nomorResiTersedia,
                kurir: orderData.pengiriman.kurir,
              });
              continue;
            }
          } catch {
            // Lanjutkan jika inkuiri tidak menemukan data
          }
        }

        const [pengirimanTerkunci] = await db
          .update(pengiriman)
          .set({
            biteshipOrderId: lockReservationId,
            diperbaruiPada: new Date(),
          })
          .where(
            and(
              eq(pengiriman.id, orderData.pengiriman.id),
              isNull(pengiriman.nomorResi),
              or(
                isNull(pengiriman.biteshipOrderId),
                lt(pengiriman.diperbaruiPada, limaMenitLalu)
              )
            )
          )
          .returning({ id: pengiriman.id });

        if (!pengirimanTerkunci) {
          daftarGagal.push({
            nomorPesanan,
            alasan: "Permintaan penjemputan sedang berlangsung atau telah diproses oleh sesi lain.",
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
          // Lepas lock pengiriman kembali ke null jika masih memegang lock reservation
          await db
            .update(pengiriman)
            .set({
              biteshipOrderId: null,
              diperbaruiPada: new Date(),
            })
            .where(
              and(
                eq(pengiriman.id, orderData.pengiriman.id),
                eq(pengiriman.biteshipOrderId, lockReservationId)
              )
            );

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
