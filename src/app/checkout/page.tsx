"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { useKeranjangStore } from "@/features/cart";
import { rekonsiliasiKeranjang } from "@/features/cart/actions/reconciliation.action";
import { hitungOngkirBiteship, type OpsiKurir } from "@/lib/services/biteship.service";
import { buatPesanan } from "@/features/checkout";

export default function HalamanCheckout() {
  const items = useKeranjangStore((state) => state.items);
  const kosongkanKeranjang = useKeranjangStore((state) => state.kosongkan);
  const terapkanHasilRekonsiliasi = useKeranjangStore(
    (state) => state.terapkanHasilRekonsiliasi
  );

  const [isPending, startTransition] = useTransition();
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanNotifikasi, setPesanNotifikasi] = useState<string | null>(null);
  const [opsiKurir, setOpsiKurir] = useState<OpsiKurir[]>([]);
  const [kurirTerpilih, setKurirTerpilih] = useState<OpsiKurir | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    namaLengkap: "Rian Pratama",
    email: "rian.trendsetter@voidsupply.test",
    telepon: "081298765432",
    alamatLengkap: "Jl. Kemang Timur No. 42, Bangka, Mampang Prapatan",
    kota: "Jakarta Selatan",
    provinsi: "DKI Jakarta",
    kodePos: "12730",
    catatan: "",
  });

  const [suksesTransaksi, setSuksesTransaksi] = useState<{
    nomorPesanan: string;
    redirectUrl?: string;
  } | null>(null);

  // 1. Rekonsiliasi Server Saat Checkout Dimuat
  useEffect(() => {
    if (items.length === 0) {
      setSedangMemuat(false);
      return;
    }

    rekonsiliasiKeranjang({
      items: items.map((i) => ({ varianId: i.varianId, jumlah: i.jumlah })),
    })
      .then((hasil) => {
        if (hasil.sukses) {
          if (hasil.apakahAdaPerubahan) {
            terapkanHasilRekonsiliasi(hasil);
            setPesanNotifikasi(
              "Perhatian: Ketersediaan atau harga artikel telah diverifikasi ulang dengan basis data."
            );
          }

          // Hitung opsi pengiriman Biteship
          hitungOngkirBiteship({
            kodePosTujuan: formData.kodePos,
            totalBeratGram: hasil.totalBeratGram || 500,
          }).then((kurir) => {
            setOpsiKurir(kurir);
            if (kurir.length > 0) {
              setKurirTerpilih(kurir[0]);
            }
          });
        }
      })
      .catch((err) => {
        console.error("Gagal rekonsiliasi checkout:", err);
      })
      .finally(() => {
        setSedangMemuat(false);
      });
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmitPesanan(e: React.FormEvent) {
    e.preventDefault();
    if (!kurirTerpilih) {
      alert("Silakan pilih opsi kurir pengiriman.");
      return;
    }

    startTransition(async () => {
      const hasil = await buatPesanan({
        namaLengkap: formData.namaLengkap,
        email: formData.email,
        telepon: formData.telepon,
        alamatLengkap: formData.alamatLengkap,
        kota: formData.kota,
        provinsi: formData.provinsi,
        kodePos: formData.kodePos,
        catatan: formData.catatan,
        kodeKurir: kurirTerpilih.kodeKurir,
        namaKurir: kurirTerpilih.namaKurir,
        layananKurir: kurirTerpilih.layanan,
        tarifOngkirIdr: kurirTerpilih.tarifIdr,
        items: items.map((i) => ({ varianId: i.varianId, jumlah: i.jumlah })),
      });

      if (hasil.sukses && hasil.nomorPesanan) {
        kosongkanKeranjang();
        setSuksesTransaksi({
          nomorPesanan: hasil.nomorPesanan,
          redirectUrl: hasil.redirectUrl,
        });
      } else {
        alert(hasil.pesan);
      }
    });
  }

  const subtotal = items.reduce((acc, i) => acc + i.hargaTampilanIdr * i.jumlah, 0);
  const totalOngkir = kurirTerpilih?.tarifIdr || 0;
  const totalAkhir = subtotal + totalOngkir;

  if (suksesTransaksi) {
    return (
      <main className="mx-auto min-h-[75vh] max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="border border-neutral-800 bg-neutral-950 p-8 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-emerald-500/40 bg-emerald-950/20 font-mono text-2xl text-emerald-400">
            ✓
          </div>
          <span className="mt-6 inline-block font-mono text-[11px] font-semibold tracking-widest text-emerald-400 uppercase">
            TRANSAKSI ATOMIK TERCATAT
          </span>
          <h1 className="mt-2 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
            PESANAN BERHASIL DIBUAT
          </h1>
          <p className="mt-4 font-mono text-xs text-neutral-400">
            Nomor Pesanan Resmi:{" "}
            <span className="font-bold text-white">{suksesTransaksi.nomorPesanan}</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400">
            Sesi pembayaran terverifikasi Midtrans Snap telah diinisialisasi.
            Stok inventaris telah diamankan secara atomik pada database PostgreSQL VOID Supply.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {suksesTransaksi.redirectUrl && (
              <a
                href={suksesTransaksi.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
              >
                BAYAR SEKARANG (MIDTRANS SNAP)
              </a>
            )}
            <Link
              href="/katalog"
              className="inline-flex min-h-11 items-center justify-center border border-neutral-800 bg-neutral-900 px-6 font-mono text-xs font-semibold text-white uppercase transition-colors hover:border-neutral-700"
            >
              KEMBALI KE KATALOG
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[75vh] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Checkout Bebas Distraksi */}
      <div className="mb-8 border-b border-neutral-800 pb-4">
        <span className="font-mono text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
          ETALASE PEMBAYARAN // TRANSAKSI TERVERIFIKASI
        </span>
        <h1 className="mt-1 font-mono text-2xl font-black text-white uppercase sm:text-3xl">
          CHECKOUT TRANSAKSI
        </h1>
        {pesanNotifikasi && (
          <div className="mt-3 border border-amber-900/60 bg-amber-950/20 p-3 font-mono text-xs text-amber-300">
            {pesanNotifikasi}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950 p-12 text-center">
          <p className="font-mono text-xs text-neutral-400">KERANJANG BELANJA ANDA KOSONG</p>
          <Link
            href="/katalog"
            className="mt-6 inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
          >
            JELAJAHI KATALOG DROP 04
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitPesanan} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Kolom Kiri: Data Pengiriman & Pilihan Kurir */}
          <div className="space-y-6 lg:col-span-7">
            {/* 1. Identitas Pembeli */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
                01 // INFORMASI PENERIMA
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] text-neutral-400">NAMA LENGKAP</label>
                  <input
                    type="text"
                    name="namaLengkap"
                    required
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-neutral-400">EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-neutral-400">NOMOR TELEPON</label>
                  <input
                    type="tel"
                    name="telepon"
                    required
                    value={formData.telepon}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Alamat Pengiriman */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
                02 // ALAMAT PENGIRIMAN
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block font-mono text-[11px] text-neutral-400">ALAMAT LENGKAP</label>
                  <textarea
                    name="alamatLengkap"
                    rows={2}
                    required
                    value={formData.alamatLengkap}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-mono text-[11px] text-neutral-400">KOTA / KABUPATEN</label>
                    <input
                      type="text"
                      name="kota"
                      required
                      value={formData.kota}
                      onChange={handleInputChange}
                      className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-neutral-400">PROVINSI</label>
                    <input
                      type="text"
                      name="provinsi"
                      required
                      value={formData.provinsi}
                      onChange={handleInputChange}
                      className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-neutral-400">KODE POS</label>
                    <input
                      type="text"
                      name="kodePos"
                      maxLength={5}
                      required
                      value={formData.kodePos}
                      onChange={handleInputChange}
                      className="mt-1 w-full border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pilihan Logistik Kurir (Biteship) */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
                03 // OPSI KURIR PENGIRIMAN (BITESHIP LOGISTICS)
              </h2>
              <div className="mt-4 space-y-2">
                {opsiKurir.length === 0 ? (
                  <p className="font-mono text-xs text-neutral-500">Memuat tarif kurir...</p>
                ) : (
                  opsiKurir.map((kurir) => {
                    const isSelected = kurirTerpilih?.kodeKurir === kurir.kodeKurir && kurirTerpilih?.layanan === kurir.layanan;
                    return (
                      <label
                        key={`${kurir.kodeKurir}-${kurir.layanan}`}
                        className={`flex cursor-pointer items-center justify-between border p-3 font-mono text-xs transition-colors ${
                          isSelected
                            ? "border-white bg-neutral-900 text-white"
                            : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="kurir"
                            checked={isSelected}
                            onChange={() => setKurirTerpilih(kurir)}
                            className="accent-white"
                          />
                          <div>
                            <span className="font-bold text-white uppercase">{kurir.namaKurir}</span>
                            <span className="text-neutral-400"> - {kurir.layanan} ({kurir.estimasiHari})</span>
                          </div>
                        </div>
                        <span className="font-bold text-white">{formatRupiah(kurir.tarifIdr)}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Biaya & Eksekusi Pembayaran */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 border border-neutral-800 bg-neutral-950 p-6">
              <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
                RINGKASAN PESANAN ({items.reduce((acc, i) => acc + i.jumlah, 0)} ARTIKEL)
              </h2>

              <ul className="mt-4 divide-y divide-neutral-900 border border-neutral-800 bg-neutral-900/30 p-3 font-mono text-xs">
                {items.map((item) => (
                  <li key={item.varianId} className="flex items-center justify-between py-2">
                    <div className="pr-2">
                      <p className="font-bold text-white">{item.nama}</p>
                      <p className="text-[11px] text-neutral-400">
                        {item.ukuran} // {item.warna} x {item.jumlah}
                      </p>
                    </div>
                    <span className="font-bold text-white">
                      {formatRupiah(item.hargaTampilanIdr * item.jumlah)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-neutral-800 pt-4 font-mono text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL PRODUK:</span>
                  <span className="font-bold text-white">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>ONGKOS KIRIM:</span>
                  <span className="font-bold text-white">{formatRupiah(totalOngkir)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm text-white">
                  <span className="font-bold">TOTAL PEMBAYARAN:</span>
                  <span className="font-black text-emerald-400">{formatRupiah(totalAkhir)}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isPending || sedangMemuat || items.length === 0}
                  className="flex min-h-12 w-full items-center justify-center border border-white bg-white font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "MEMPROSES TRANSAKSI ATOMIK..." : `BAYAR DENGAN MIDTRANS (${formatRupiah(totalAkhir)})`}
                </button>
                <p className="mt-2 text-center font-mono text-[10px] text-neutral-500">
                  Total gross_amount dihitung dan diverifikasi secara resmi di sisi server.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}
