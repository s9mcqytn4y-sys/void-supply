import { and, eq, lt, or, sql } from "drizzle-orm";
import {
  db,
  outboxPekerjaan,
  pengiriman,
  pelacakanPengiriman,
  itemPesanan,
} from "@/lib/db";
import { kirimEmailNotifikasi, type ParameterKirimEmail } from "./email.service";
import { buatOrderPengirimanBiteship } from "./biteship.service";
import { simpanSnapshotArsipFaktur } from "@/features/checkout/services/arsip-faktur.service";

export interface ParameterTambahOutbox {
  tipePekerjaan: "kirim_email" | "buat_order_biteship" | string;
  pesananId?: string;
  payload: Record<string, unknown>;
  maksimalPercobaan?: number;
}

export interface HasilProsesOutbox {
  sukses: boolean;
  totalDiproses: number;
  totalBerhasil: number;
  totalGagal: number;
  rincian: Array<{
    id: string;
    tipePekerjaan: string;
    status: "berhasil" | "gagal";
    pesan?: string;
  }>;
}

/**
 * Sisipkan Tugas Outbox ke dalam Transaksi Basis Data Atomik
 */
export async function tambahTugasOutbox(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  params: ParameterTambahOutbox
) {
  const [tugas] = await tx
    .insert(outboxPekerjaan)
    .values({
      tipePekerjaan: params.tipePekerjaan,
      pesananId: params.pesananId || null,
      payload: params.payload,
      status: "antre",
      percobaan: 0,
      maksimalPercobaan: params.maksimalPercobaan || 5,
    })
    .returning({ id: outboxPekerjaan.id });

  return tugas;
}

/**
 * Sisipkan Tugas Outbox secara Mandiri (Non-Transaksi) dan Langsung Picu Eksekusi Background
 */
export async function tambahTugasOutboxLangsung(
  params: ParameterTambahOutbox
) {
  const [tugas] = await db
    .insert(outboxPekerjaan)
    .values({
      tipePekerjaan: params.tipePekerjaan,
      pesananId: params.pesananId || null,
      payload: params.payload,
      status: "antre",
      percobaan: 0,
      maksimalPercobaan: params.maksimalPercobaan || 5,
    })
    .returning({ id: outboxPekerjaan.id });

  // Segera picu pemrosesan outbox di latar belakang (non-blocking)
  picuProsesOutboxNonBlocking();

  return tugas;
}

/**
 * Eksekutor Antrean Transactional Outbox (P0 Resiliensi Serverless)
 * Mengambil tugas berstatus 'antre' atau 'gagal' (yang masih memiliki kuota percobaan),
 * memproses secara idempoten, dan mencatat status penyelesaian.
 */
export async function prosesAntreanOutbox(batchLimit = 10): Promise<HasilProsesOutbox> {
  const sekarang = new Date();

  // 0. Lease Reaper (P0 Ghost Bug / Serverless Recovery):
  // Pulihkan tugas 'diproses' yang tertahan > 5 menit akibat function termination tak terduga
  const batasTimeoutLease = new Date(sekarang.getTime() - 5 * 60 * 1000);
  try {
    await db
      .update(outboxPekerjaan)
      .set({
        status: "antre",
        pesanKesalahan: "Lease timeout: tugas dipulihkan secara otomatis oleh outbox reaper.",
        diperbaruiPada: sekarang,
      })
      .where(
        and(
          eq(outboxPekerjaan.status, "diproses"),
          lt(outboxPekerjaan.diperbaruiPada, batasTimeoutLease),
          lt(outboxPekerjaan.percobaan, outboxPekerjaan.maksimalPercobaan)
        )
      );

    // Tandai permanen gagal (Dead-Letter) untuk tugas 'diproses' yang kedaluwarsa dan telah mencapai batas maksimal percobaan
    await db
      .update(outboxPekerjaan)
      .set({
        status: "gagal",
        pesanKesalahan: "Dead-letter: tugas kedaluwarsa dan telah mencapai batas maksimal percobaan.",
        diperbaruiPada: sekarang,
      })
      .where(
        and(
          eq(outboxPekerjaan.status, "diproses"),
          lt(outboxPekerjaan.diperbaruiPada, batasTimeoutLease),
          sql`${outboxPekerjaan.percobaan} >= ${outboxPekerjaan.maksimalPercobaan}`
        )
      );
  } catch (reaperErr) {
    console.warn("[OUTBOX REAPER] Peringatan saat memulihkan lease tugas tertahan:", reaperErr);
  }

  // 1. Ambil daftar tugas yang siap dieksekusi
  const antrean = await db
    .select()
    .from(outboxPekerjaan)
    .where(
      or(
        eq(outboxPekerjaan.status, "antre"),
        and(
          eq(outboxPekerjaan.status, "gagal"),
          lt(outboxPekerjaan.percobaan, outboxPekerjaan.maksimalPercobaan)
        )
      )
    )
    .orderBy(outboxPekerjaan.dibuatPada)
    .limit(batchLimit);

  if (antrean.length === 0) {
    return {
      sukses: true,
      totalDiproses: 0,
      totalBerhasil: 0,
      totalGagal: 0,
      rincian: [],
    };
  }

  let totalBerhasil = 0;
  let totalGagal = 0;
  const rincian: HasilProsesOutbox["rincian"] = [];

  for (const tugas of antrean) {
    // 2. Kunci tugas dengan Compare-and-Set atomik ke status 'diproses'
    const [tugasTerkunci] = await db
      .update(outboxPekerjaan)
      .set({
        status: "diproses",
        percobaan: sql`${outboxPekerjaan.percobaan} + 1`,
        diperbaruiPada: sekarang,
      })
      .where(
        and(
          eq(outboxPekerjaan.id, tugas.id),
          or(
            eq(outboxPekerjaan.status, "antre"),
            eq(outboxPekerjaan.status, "gagal")
          )
        )
      )
      .returning({ id: outboxPekerjaan.id });

    if (!tugasTerkunci) {
      // Tugas telah diambil oleh worker paralel lain
      continue;
    }

    try {
      if (tugas.tipePekerjaan === "kirim_email") {
        const payloadEmail = tugas.payload as unknown as ParameterKirimEmail;
        const hasilEmail = await kirimEmailNotifikasi(payloadEmail);
        if (!hasilEmail.sukses) {
          throw new Error(
            hasilEmail.pesan || "Pengiriman email gagal di tingkat provider logistik/email."
          );
        }
      } else if (tugas.tipePekerjaan === "buat_order_biteship") {
        const payloadOrder = tugas.payload as {
          pesananId: string;
          nomorPesanan: string;
        };

        const [dataPengiriman] = await db
          .select()
          .from(pengiriman)
          .where(eq(pengiriman.pesananId, payloadOrder.pesananId))
          .limit(1);

        if (!dataPengiriman) {
          throw new Error(
            `Data pengiriman tidak ditemukan untuk pesanan ${payloadOrder.nomorPesanan}`
          );
        }

        const daftarItem = await db
          .select()
          .from(itemPesanan)
          .where(eq(itemPesanan.pesananId, payloadOrder.pesananId));

        if (dataPengiriman.biteshipOrderId) {
          console.info(
            `[OUTBOX BITESHIP] Order Biteship sudah tercatat (${dataPengiriman.biteshipOrderId}) untuk pesanan ${payloadOrder.nomorPesanan}. Melewati request baru untuk menghemat saldo Biteship.`
          );
        } else {
          const resBiteship = await buatOrderPengirimanBiteship({
            nomorPesanan: payloadOrder.nomorPesanan,
            namaPenerima: dataPengiriman.namaPenerima,
            teleponPenerima: dataPengiriman.teleponPenerima,
            alamatLengkap: dataPengiriman.alamatLengkap,
            kodePos: dataPengiriman.kodePos,
            kodeKurir: dataPengiriman.kurir,
            layanan: dataPengiriman.layanan,
            kodeLayananKurir: dataPengiriman.kodeLayananKurir ?? undefined,
            totalBeratGram: dataPengiriman.beratTotalGram,
            items: daftarItem.map((it) => ({
              name: it.namaProduk,
              value: it.hargaSatuan,
              quantity: it.jumlah,
              weight: it.beratGram,
            })),
          });

          if (!resBiteship.sukses) {
            throw new Error(
              resBiteship.pesan || "Pemesanan kurir ke Biteship gagal merespons sukses."
            );
          }

          // Simpan hasil Biteship ke entitas pengiriman:
          // Simpan ID order eksternal meskipun waybill fisik belum langsung tersedia
          const updatePengiriman: Record<string, unknown> = {
            diperbaruiPada: new Date(),
          };

          if (resBiteship.orderId) {
            updatePengiriman.biteshipOrderId = resBiteship.orderId;
          }
          if (resBiteship.trackingId) {
            updatePengiriman.biteshipTrackingId = resBiteship.trackingId;
          }
          if (resBiteship.waybillId) {
            updatePengiriman.nomorResi = resBiteship.waybillId;
            updatePengiriman.statusPengiriman = "dalam_pengiriman";
          }

          await db
            .update(pengiriman)
            .set(updatePengiriman)
            .where(eq(pengiriman.pesananId, payloadOrder.pesananId));

          // Catat titik pelacakan awal
          if (resBiteship.waybillId) {
            await db.insert(pelacakanPengiriman).values({
              pesananId: payloadOrder.pesananId,
              nomorResi: resBiteship.waybillId,
              kurir: dataPengiriman.kurir,
              statusPelacakan: resBiteship.status || "allocated",
              keterangan: "Pemesanan kurir berhasil dibuat di Biteship. Menunggu penjemputan.",
              lokasi: "Warehouse Johar Baru, Jakarta Pusat",
              waktuPeristiwa: new Date(),
            });
          }
        }
      } else if (tugas.tipePekerjaan === "buat_arsip_faktur") {
        const payloadArsip = tugas.payload as {
          fakturId: string;
          nomorFaktur: string;
          pesananId: string;
        };
        const hasilArsip = await simpanSnapshotArsipFaktur(
          payloadArsip.fakturId,
          payloadArsip.nomorFaktur,
          payloadArsip.pesananId
        );
        if (!hasilArsip.sukses) {
          throw new Error(
            hasilArsip.pesan || "Perekaman snapshot arsip faktur outbox gagal."
          );
        }
      } else {
        throw new Error(`Tipe pekerjaan outbox '${tugas.tipePekerjaan}' tidak dikenali.`);
      }

      // Tandai tugas outbox berhasil
      await db
        .update(outboxPekerjaan)
        .set({
          status: "berhasil",
          pesanKesalahan: null,
          dieksekusiPada: new Date(),
          diperbaruiPada: new Date(),
        })
        .where(eq(outboxPekerjaan.id, tugas.id));

      totalBerhasil++;
      rincian.push({
        id: tugas.id,
        tipePekerjaan: tugas.tipePekerjaan,
        status: "berhasil",
      });
    } catch (err) {
      const pesanError = err instanceof Error ? err.message : String(err);
      console.error(`[OUTBOX ERROR] Gagal mengeksekusi tugas ${tugas.id} (${tugas.tipePekerjaan}):`, pesanError);

      await db
        .update(outboxPekerjaan)
        .set({
          status: "gagal",
          pesanKesalahan: pesanError,
          diperbaruiPada: new Date(),
        })
        .where(eq(outboxPekerjaan.id, tugas.id));

      totalGagal++;
      rincian.push({
        id: tugas.id,
        tipePekerjaan: tugas.tipePekerjaan,
        status: "gagal",
        pesan: pesanError,
      });
    }
  }

  return {
    sukses: totalGagal === 0,
    totalDiproses: antrean.length,
    totalBerhasil,
    totalGagal,
    rincian,
  };
}

/**
 * Pemicu Proses Outbox Segera secara Non-Blocking
 * Dipanggil pasca-commit webhook untuk memproses tugas outbox secepat mungkin
 * tanpa menahan siklus hidup respons serverless.
 */
export function picuProsesOutboxNonBlocking(): void {
  prosesAntreanOutbox(5).catch((err) => {
    console.warn("[OUTBOX NON-BLOCKING] Galat saat memproses antrean outbox segera:", err);
  });
}
