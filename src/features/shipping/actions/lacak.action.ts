"use server";

import { eq, or, desc } from "drizzle-orm";
import {
  db,
  pesanan,
  pengiriman,
  itemPesanan,
  pelacakanPengiriman,
} from "@/lib/db";
import { lacakPengirimanBiteship } from "@/lib/services/biteship.service";
import type { DetailPelacakan, EventPelacakan } from "@/features/checkout/actions/status-pesanan.action";

export interface HasilPelacakanPublik {
  sukses: boolean;
  pesan: string;
  data?: {
    nomorPesanan: string;
    nomorResi: string | null;
    kurir: string;
    layanan: string;
    estimasiHari: string;
    statusPengiriman: "menunggu_resi" | "dalam_pengiriman" | "terkirim" | "gagal";
    statusPesanan: "menunggu_pembayaran" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
    namaPenerimaMasked: string;
    kotaTujuan: string;
    dibuatPada: string;
    totalItem: number;
    linkTrackingResmi?: string | null;
    pelacakan: DetailPelacakan;
  };
}

function sensorNama(nama: string): string {
  if (!nama) return "***";
  const kata = nama.trim().split(" ");
  return kata
    .map((k) => (k.length <= 2 ? k : `${k[0]}${"*".repeat(k.length - 2)}${k[k.length - 1]}`))
    .join(" ");
}

/**
 * Server Action: Lacak Status Pesanan & Pengiriman Publik (/lacak)
 * Menerima kata kunci berupa Nomor Pesanan (VOID-...) atau Nomor Resi Kurir.
 * Mengembalikan data pelacakan dengan sensor PII untuk keamanan publik.
 */
export async function lacakPengirimanPublikAction(
  query: string
): Promise<HasilPelacakanPublik> {
  const kataKunci = query?.trim();

  if (!kataKunci || kataKunci.length < 4) {
    return {
      sukses: false,
      pesan: "Masukkan minimal 4 karakter nomor pesanan atau nomor resi kurir yang valid.",
    };
  }

  try {
    // 1. Cari pesanan berdasarkan nomorPesanan ATAU cari via tabel pengiriman (nomorResi, biteshipOrderId, biteshipTrackingId)
    let pesananTarget = await db
      .select()
      .from(pesanan)
      .where(eq(pesanan.nomorPesanan, kataKunci))
      .limit(1)
      .then((rows) => rows[0]);

    let dataPengirimanTarget = null;

    if (!pesananTarget) {
      // Cari di tabel pengiriman via nomorResi, biteshipOrderId, atau biteshipTrackingId
      const pengirimanRows = await db
        .select()
        .from(pengiriman)
        .where(
          or(
            eq(pengiriman.nomorResi, kataKunci),
            eq(pengiriman.biteshipOrderId, kataKunci),
            eq(pengiriman.biteshipTrackingId, kataKunci)
          )
        )
        .limit(1);

      if (pengirimanRows.length > 0) {
        dataPengirimanTarget = pengirimanRows[0];
        pesananTarget = await db
          .select()
          .from(pesanan)
          .where(eq(pesanan.id, dataPengirimanTarget.pesananId))
          .limit(1)
          .then((rows) => rows[0]);
      }
    }

    if (!pesananTarget) {
      return {
        sukses: false,
        pesan: `Pesanan atau nomor resi '${kataKunci}' tidak ditemukan. Mohon periksa kembali nomor Anda.`,
      };
    }

    if (!dataPengirimanTarget) {
      dataPengirimanTarget = await db
        .select()
        .from(pengiriman)
        .where(eq(pengiriman.pesananId, pesananTarget.id))
        .limit(1)
        .then((rows) => rows[0]);
    }

    // 2. Ambil riwayat pelacakan lokal dari basis data
    const riwayatDb = await db
      .select()
      .from(pelacakanPengiriman)
      .where(eq(pelacakanPengiriman.pesananId, pesananTarget.id))
      .orderBy(desc(pelacakanPengiriman.waktuPeristiwa));

    const eventsLokal: EventPelacakan[] = riwayatDb.map((r) => ({
      id: r.id,
      nomorResi: r.nomorResi || dataPengirimanTarget?.nomorResi || "MENUNGGU-RESI",
      kurir: r.kurir || dataPengirimanTarget?.kurir || "Kurir Resmi",
      statusPelacakan: r.statusPelacakan,
      keterangan: r.keterangan || "Pembaruan logistik pesanan.",
      lokasi: r.lokasi || null,
      waktuPeristiwa: r.waktuPeristiwa ? new Date(r.waktuPeristiwa).toISOString() : new Date().toISOString(),
    }));

    // 3. Jika nomor resi valid dan bukan simulasi, coba ambil update live dari Biteship API
    let linkTrackingResmi: string | null = null;
    if (dataPengirimanTarget?.biteshipTrackingId) {
      linkTrackingResmi = `https://biteship.com/track/${dataPengirimanTarget.biteshipTrackingId}`;
    }

    const nomorResi = dataPengirimanTarget?.nomorResi || null;
    const isMockOrPlaceholder =
      !nomorResi ||
      nomorResi.startsWith("VOID-MOCK") ||
      nomorResi.startsWith("RESI-") ||
      nomorResi === "MENUNGGU-RESI";

    if (nomorResi && !isMockOrPlaceholder && process.env.ALLOW_PAYMENT_MOCK !== "true") {
      try {
        const liveBiteship = await lacakPengirimanBiteship(
          nomorResi,
          dataPengirimanTarget?.kurir
        );

        if (liveBiteship.sukses && liveBiteship.riwayat.length > 0) {
          if (liveBiteship.linkWebview) {
            linkTrackingResmi = liveBiteship.linkWebview;
          }
          // Gabungkan event unik dari Biteship API ke daftar riwayat jika belum tercatat di DB
          for (const ev of liveBiteship.riwayat) {
            const sudahAda = eventsLokal.some(
              (e) => e.keterangan === ev.note && e.statusPelacakan === ev.status
            );
            if (!sudahAda) {
              eventsLokal.unshift({
                id: `biteship-live-${ev.updatedAt}-${Math.random().toString(36).substring(2, 6)}`,
                nomorResi,
                kurir: dataPengirimanTarget?.kurir || "Biteship",
                statusPelacakan: ev.status,
                keterangan: ev.note,
                lokasi: ev.location || null,
                waktuPeristiwa: ev.updatedAt || new Date().toISOString(),
              });
            }
          }
        }
      } catch (err) {
        console.warn("[LACAK PUBLIK] Gagal sinkronisasi data live Biteship:", err);
      }
    }

    // 4. Hitung total item pesanan
    const itemsDb = await db
      .select({ jumlah: itemPesanan.jumlah })
      .from(itemPesanan)
      .where(eq(itemPesanan.pesananId, pesananTarget.id));

    const totalItem = itemsDb.reduce((acc, curr) => acc + curr.jumlah, 0);

    const detailPelacakan: DetailPelacakan = {
      kurir: dataPengirimanTarget?.kurir || "Kurir Resmi",
      layanan: dataPengirimanTarget?.layanan || "Standar",
      estimasiHari: dataPengirimanTarget?.estimasiHari || "1-3 Hari Kerja",
      nomorResi: dataPengirimanTarget?.nomorResi || null,
      statusPengiriman: (dataPengirimanTarget?.statusPengiriman || "menunggu_resi") as
        | "menunggu_resi"
        | "dalam_pengiriman"
        | "terkirim"
        | "gagal",
      riwayat: eventsLokal,
    };

    return {
      sukses: true,
      pesan: "Data pelacakan berhasil ditemukan.",
      data: {
        nomorPesanan: pesananTarget.nomorPesanan,
        nomorResi: dataPengirimanTarget?.nomorResi || null,
        kurir: dataPengirimanTarget?.kurir || "Kurir Resmi",
        layanan: dataPengirimanTarget?.layanan || "Standar",
        estimasiHari: dataPengirimanTarget?.estimasiHari || "1-3 Hari Kerja",
        statusPengiriman: (dataPengirimanTarget?.statusPengiriman || "menunggu_resi") as
          | "menunggu_resi"
          | "dalam_pengiriman"
          | "terkirim"
          | "gagal",
        statusPesanan: pesananTarget.statusPesanan as
          | "menunggu_pembayaran"
          | "diproses"
          | "dikirim"
          | "selesai"
          | "dibatalkan",
        namaPenerimaMasked: sensorNama(dataPengirimanTarget?.namaPenerima || pesananTarget.namaPelanggan),
        kotaTujuan: dataPengirimanTarget?.kota || "DKI Jakarta",
        dibuatPada: new Date(pesananTarget.dibuatPada).toISOString(),
        totalItem,
        linkTrackingResmi,
        pelacakan: detailPelacakan,
      },
    };
  } catch (error) {
    console.error("[LACAK ACTION ERROR] Galat saat melacak pesanan:", error);
    return {
      sukses: false,
      pesan: "Terjadi kesalahan sistem saat mencari informasi pelacakan. Silakan coba kembali.",
    };
  }
}
