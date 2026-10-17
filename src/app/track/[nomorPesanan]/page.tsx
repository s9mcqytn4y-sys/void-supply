import type { Metadata } from "next";
import Link from "next/link";
import { eq, or, desc } from "drizzle-orm";
import {
  db,
  pesanan,
  pengiriman,
  itemPesanan,
  pelacakanPengiriman,
} from "@/lib/db";
import { lacakPengirimanBiteship } from "@/lib/services/biteship.service";

interface PropsHalamanLacakPesanan {
  params: Promise<{
    nomorPesanan: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropsHalamanLacakPesanan): Promise<Metadata> {
  const { nomorPesanan } = await params;
  return {
    title: `Lacak Pengiriman #${nomorPesanan} | VOID Supply`,
    description: `Status dan riwayat pergerakan kurir untuk pesanan #${nomorPesanan}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

function sensorNama(nama: string): string {
  if (!nama) return "***";
  const kata = nama.trim().split(" ");
  return kata.map((k) => (k.length > 1 ? `${k[0]}***` : k)).join(" ");
}

function sensorTelepon(telp: string): string {
  if (!telp || telp.length < 6) return "******";
  return `${telp.slice(0, 4)}****${telp.slice(-3)}`;
}

function sensorAlamat(alamat: string, kota: string): string {
  return `${alamat.slice(0, 6)}***, ${kota}`;
}

export default async function HalamanLacakDetail({
  params,
}: PropsHalamanLacakPesanan) {
  const { nomorPesanan } = await params;
  const decodedTarget = decodeURIComponent(nomorPesanan).trim();

  // 1. Cari pesanan berdasarkan nomor pesanan ATAU nomor resi
  const [pesananDb] = await db
    .select({
      id: pesanan.id,
      nomorPesanan: pesanan.nomorPesanan,
      statusPesanan: pesanan.statusPesanan,
      dibuatPada: pesanan.dibuatPada,
      namaPelanggan: pesanan.namaPelanggan,
      teleponPelanggan: pesanan.teleponPelanggan,
    })
    .from(pesanan)
    .where(eq(pesanan.nomorPesanan, decodedTarget))
    .limit(1);

  let pesananId = pesananDb?.id;
  let nomorPesananFinal = pesananDb?.nomorPesanan || decodedTarget;

  // Jika tidak ditemukan lewat nomor pesanan, cari lewat nomor resi
  if (!pesananDb) {
    const [pengirimanByResi] = await db
      .select({
        pesananId: pengiriman.pesananId,
      })
      .from(pengiriman)
      .where(eq(pengiriman.nomorResi, decodedTarget))
      .limit(1);

    if (pengirimanByResi) {
      pesananId = pengirimanByResi.pesananId;
      const [orderInduk] = await db
        .select({
          nomorPesanan: pesanan.nomorPesanan,
        })
        .from(pesanan)
        .where(eq(pesanan.id, pesananId))
        .limit(1);
      if (orderInduk) {
        nomorPesananFinal = orderInduk.nomorPesanan;
      }
    }
  }

  // Jika pesanan tetap tidak ditemukan di database
  if (!pesananId) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="border border-neutral-800 bg-neutral-950 p-8 sm:p-12">
          <span className="font-mono text-xs font-bold text-rose-400 uppercase">
            PELACAKAN TIDAK DITEMUKAN
          </span>
          <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase">
            RESI / PESANAN TIDAK TERDAFTAR
          </h1>
          <p className="mt-4 font-mono text-xs text-neutral-400">
            Nomor &apos;{decodedTarget}&apos; belum memiliki riwayat pengiriman atau nomor pesanan tidak valid.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/track"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase hover:bg-neutral-200"
            >
              CARI NOMOR LAIN
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. Ambil data pengiriman & artikel
  const [dataPengiriman] = await db
    .select()
    .from(pengiriman)
    .where(eq(pengiriman.pesananId, pesananId))
    .limit(1);

  const daftarArtikel = await db
    .select({
      namaProduk: itemPesanan.namaProduk,
      namaVarian: itemPesanan.namaVarian,
      jumlah: itemPesanan.jumlah,
    })
    .from(itemPesanan)
    .where(eq(itemPesanan.pesananId, pesananId));

  // 3. Ambil timeline titik pelacakan lokal dari database
  const timelineLokal = await db
    .select()
    .from(pelacakanPengiriman)
    .where(eq(pelacakanPengiriman.pesananId, pesananId))
    .orderBy(desc(pelacakanPengiriman.waktuPeristiwa));

  // 4. Kueri status real-time ke Biteship jika ada nomor resi valid
  let liveTrackingLink: string | undefined;
  let statusLogistikAktif = dataPengiriman?.statusPengiriman || "menunggu_resi";
  const nomorResi = dataPengiriman?.nomorResi;

  if (nomorResi && nomorResi !== "MENUNGGU-RESI") {
    try {
      const resLive = await lacakPengirimanBiteship(nomorResi, dataPengiriman?.kurir);
      if (resLive.sukses) {
        liveTrackingLink = resLive.linkWebview;
        if (resLive.status) {
          statusLogistikAktif = resLive.status as typeof statusLogistikAktif;
        }
      }
    } catch (err) {
      console.warn("Gagal mengambil status live Biteship:", err);
    }
  }

  const penerimaNamaMasked = sensorNama(dataPengiriman?.namaPenerima || pesananDb?.namaPelanggan || "");
  const penerimaTeleponMasked = sensorTelepon(dataPengiriman?.teleponPenerima || pesananDb?.teleponPelanggan || "");
  const alamatMasked = sensorAlamat(dataPengiriman?.alamatLengkap || "", dataPengiriman?.kota || "");

  return (
    <main className="mx-auto min-h-[80vh] max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Pelacakan */}
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs font-semibold text-neutral-400 uppercase">
            PELACAKAN PENGIRIMAN // BITESHIP GATEWAY
          </span>
          <h1 className="mt-1 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            {nomorPesananFinal}
          </h1>
          <p className="mt-1 font-mono text-xs text-neutral-400">
            Resi AWB:{" "}
            <span className="font-bold text-white">
              {nomorResi || "MENUNGGU PENGALOKASIAN RESI"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {nomorResi && (
            <Link
              href={`/pesanan/${encodeURIComponent(nomorPesananFinal)}/resi`}
              target="_blank"
              className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-4 font-mono text-xs font-bold text-white uppercase transition-colors hover:border-white"
            >
              CETAK RESI (100x150)
            </Link>
          )}
          {liveTrackingLink && (
            <a
              href={liveTrackingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center border border-emerald-600 bg-emerald-950/60 px-4 font-mono text-xs font-bold text-emerald-300 uppercase transition-colors hover:bg-emerald-900"
            >
              LIVE MAPS BITESHIP
            </a>
          )}
        </div>
      </div>

      {/* Ringkasan Status & Ekspedisi */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="border border-neutral-800 bg-neutral-950 p-5 font-mono text-xs">
          <span className="text-[11px] text-neutral-500 uppercase">STATUS KURIR</span>
          <p className="mt-2 text-sm font-bold text-emerald-400 uppercase">
            {statusLogistikAktif.replace(/_/g, " ")}
          </p>
          <span className="mt-1 block text-[10px] text-neutral-500">
            Fulfillment dari Johar Baru 10530
          </span>
        </div>

        <div className="border border-neutral-800 bg-neutral-950 p-5 font-mono text-xs">
          <span className="text-[11px] text-neutral-500 uppercase">EKSPEDISI & LAYANAN</span>
          <p className="mt-2 text-sm font-bold text-white uppercase">
            {dataPengiriman?.kurir || "Kurir Resmi"} ({dataPengiriman?.layanan || "Standar"})
          </p>
          <span className="mt-1 block text-[10px] text-neutral-500">
            Estimasi: {dataPengiriman?.estimasiHari || "1-2 Hari"}
          </span>
        </div>

        <div className="border border-neutral-800 bg-neutral-950 p-5 font-mono text-xs">
          <span className="text-[11px] text-neutral-500 uppercase">PENERIMA (TERPROTEKSI PRIVASI)</span>
          <p className="mt-2 text-sm font-bold text-white">
            {penerimaNamaMasked}
          </p>
          <span className="mt-1 block text-[10px] text-neutral-500">
            {alamatMasked} // {penerimaTeleponMasked}
          </span>
        </div>
      </div>

      {/* Rincian Paket Merchandise */}
      <div className="mt-6 border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
          ARTIKEL DALAM PAKET PENGIRIMAN
        </h2>
        <div className="mt-4 divide-y divide-neutral-900 font-mono text-xs">
          {daftarArtikel.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 text-neutral-300">
              <div>
                <span className="font-bold text-white">{item.namaProduk}</span>
                <span className="block text-[11px] text-neutral-500">Varian: {item.namaVarian}</span>
              </div>
              <span className="text-neutral-400">{item.jumlah} Unit</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Riwayat Pergerakan Kurir */}
      <div className="mt-6 border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
          TIMELINE PELACAKAN REAL-TIME
        </h2>

        {timelineLokal.length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-neutral-500">
            Belum ada pergerakan paket tercatat. Paket sedang dipersiapkan di warehouse pusat Johar Baru.
          </div>
        ) : (
          <ol className="relative mt-6 border-l border-neutral-800 ml-3 space-y-6">
            {timelineLokal.map((event) => (
              <li key={event.id} className="ml-6">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-neutral-950 bg-emerald-500" />
                <time className="font-mono text-[11px] text-neutral-400">
                  {new Date(event.waktuPeristiwa).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
                <h3 className="mt-1 font-mono text-xs font-bold text-white uppercase">
                  {event.statusPelacakan.replace(/_/g, " ")} // {event.kurir}
                </h3>
                <p className="mt-1 font-mono text-xs text-neutral-300">
                  {event.keterangan}
                </p>
                {event.lokasi && (
                  <span className="mt-1 block font-mono text-[11px] text-neutral-500">
                    Lokasi: {event.lokasi}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Tombol Navigasi */}
      <div className="mt-8 flex justify-between border-t border-neutral-800 pt-6">
        <Link
          href={`/pesanan/${encodeURIComponent(nomorPesananFinal)}`}
          className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-6 font-mono text-xs font-bold text-white uppercase hover:border-white"
        >
          STATUS PESANAN
        </Link>
        <Link
          href="/katalog"
          className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase hover:bg-neutral-200"
        >
          KATALOG DROP 04
        </Link>
      </div>
    </main>
  );
}
