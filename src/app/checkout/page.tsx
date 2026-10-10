"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { useKeranjangStore } from "@/features/cart";
import { rekonsiliasiKeranjang } from "@/features/cart/actions/reconciliation.action";
import { hitungOngkirServerAction } from "@/features/checkout/actions/ongkir.action";
import { buatPesanan } from "@/features/checkout";
import type { OpsiKurir } from "@/lib/services/biteship.service";

export default function HalamanCheckout() {
  const items = useKeranjangStore((state) => state.items);
  const kosongkanKeranjang = useKeranjangStore((state) => state.kosongkan);
  const terapkanHasilRekonsiliasi = useKeranjangStore(
    (state) => state.terapkanHasilRekonsiliasi
  );

  const [isPending, startTransition] = useTransition();
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangHitungOngkir, setSedangHitungOngkir] = useState(false);
  const [pesanNotifikasi, setPesanNotifikasi] = useState<string | null>(null);
  const [pesanErrorGlobal, setPesanErrorGlobal] = useState<string | null>(null);
  const [opsiKurir, setOpsiKurir] = useState<OpsiKurir[]>([]);
  const [kurirTerpilih, setKurirTerpilih] = useState<OpsiKurir | null>(null);

  // Form State & In-Field Validation Errors
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [suksesTransaksi, setSuksesTransaksi] = useState<{
    nomorPesanan: string;
    redirectUrl?: string;
  } | null>(null);

  // Fungsi Panggil Server Action Hitung Ongkir
  const muatTarifOngkir = useCallback(
    async (kodePos: string, itemDaftar: typeof items) => {
      if (!kodePos || kodePos.length !== 5 || !/^[0-9]+$/.test(kodePos)) {
        return;
      }
      if (itemDaftar.length === 0) return;

      setSedangHitungOngkir(true);
      try {
        const hasil = await hitungOngkirServerAction({
          kodePosTujuan: kodePos,
          items: itemDaftar.map((i) => ({ varianId: i.varianId, jumlah: i.jumlah })),
        });

        if (hasil.sukses && hasil.opsiKurir.length > 0) {
          setOpsiKurir(hasil.opsiKurir);
          setKurirTerpilih((prev) => {
            if (!prev) return hasil.opsiKurir[0];
            const tetapCocok = hasil.opsiKurir.find(
              (k) => k.kodeKurir === prev.kodeKurir && k.layanan === prev.layanan
            );
            return tetapCocok || hasil.opsiKurir[0];
          });
        }
      } catch (err) {
        console.error("Gagal menghitung ongkir server:", err);
      } finally {
        setSedangHitungOngkir(false);
      }
    },
    []
  );

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

          // Hitung tarif via Server Action (bukan direct Biteship client call)
          muatTarifOngkir(formData.kodePos, items);
        }
      })
      .catch((err) => {
        console.error("Gagal rekonsiliasi checkout:", err);
      })
      .finally(() => {
        setSedangMemuat(false);
      });
  }, [muatTarifOngkir, formData.kodePos, items, terapkanHasilRekonsiliasi]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus error field saat pengguna mengetik
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Jika kode pos berubah dan lengkap 5 digit, hitung ulang ongkir server
    if (name === "kodePos" && value.length === 5 && /^[0-9]+$/.test(value)) {
      muatTarifOngkir(value, items);
    }
  }

  function validasiFormSebelumSubmit(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.namaLengkap.trim() || formData.namaLengkap.length < 3) {
      errors.namaLengkap = "Nama lengkap minimal 3 karakter";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }
    if (!formData.telepon.trim() || formData.telepon.length < 10) {
      errors.telepon = "Nomor telepon minimal 10 digit angka";
    }
    if (!formData.alamatLengkap.trim() || formData.alamatLengkap.length < 10) {
      errors.alamatLengkap = "Alamat pengiriman minimal 10 karakter";
    }
    if (!formData.kota.trim() || formData.kota.length < 2) {
      errors.kota = "Nama kota/kabupaten wajib diisi";
    }
    if (!formData.provinsi.trim() || formData.provinsi.length < 2) {
      errors.provinsi = "Nama provinsi wajib diisi";
    }
    if (!formData.kodePos.trim() || formData.kodePos.length !== 5 || !/^[0-9]+$/.test(formData.kodePos)) {
      errors.kodePos = "Kode pos harus terdiri dari 5 digit angka";
    }
    if (!kurirTerpilih) {
      errors.kurir = "Silakan pilih salah satu opsi kurir pengiriman";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmitPesanan(e: React.FormEvent) {
    e.preventDefault();
    setPesanErrorGlobal(null);

    if (!validasiFormSebelumSubmit()) {
      return;
    }

    if (!kurirTerpilih) return;

    startTransition(async () => {
      const hasil = await buatPesanan({
        namaLengkap: formData.namaLengkap,
        email: formData.email,
        telepon: formData.telepon,
        alamatLengkap: formData.alamatLengkap,
        kota: formData.kota,
        provinsi: formData.provinsi,
        kodePos: formData.kodePos,
        catatan: formData.catatan || undefined,
        kodeKurir: kurirTerpilih.kodeKurir,
        layananKurir: kurirTerpilih.layanan,
        items: items.map((i) => ({ varianId: i.varianId, jumlah: i.jumlah })),
      });

      if (hasil.sukses && hasil.nomorPesanan) {
        kosongkanKeranjang();
        setSuksesTransaksi({
          nomorPesanan: hasil.nomorPesanan,
          redirectUrl: hasil.redirectUrl,
        });
      } else {
        setPesanErrorGlobal(hasil.pesan);
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
        {pesanErrorGlobal && (
          <div
            role="alert"
            className="mt-3 border border-rose-900/60 bg-rose-950/20 p-3 font-mono text-xs text-rose-300"
          >
            {pesanErrorGlobal}
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
        <form onSubmit={handleSubmitPesanan} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Kolom Kiri: Data Pengiriman & Pilihan Kurir */}
          <div className="space-y-6 lg:col-span-7">
            {/* 1. Identitas Pembeli */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <h2 className="border-b border-neutral-800 pb-3 font-mono text-xs font-bold text-white uppercase">
                01 // INFORMASI PENERIMA
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="input-nama" className="block font-mono text-[11px] text-neutral-400">
                    NAMA LENGKAP
                  </label>
                  <input
                    id="input-nama"
                    type="text"
                    name="namaLengkap"
                    required
                    aria-invalid={!!formErrors.namaLengkap}
                    aria-describedby={formErrors.namaLengkap ? "error-namaLengkap" : undefined}
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                      formErrors.namaLengkap ? "border-rose-500" : "border-neutral-800 focus:border-white"
                    }`}
                  />
                  {formErrors.namaLengkap && (
                    <p id="error-namaLengkap" className="mt-1 font-mono text-[11px] text-rose-400">
                      {formErrors.namaLengkap}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="input-email" className="block font-mono text-[11px] text-neutral-400">
                    EMAIL
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    name="email"
                    required
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? "error-email" : undefined}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                      formErrors.email ? "border-rose-500" : "border-neutral-800 focus:border-white"
                    }`}
                  />
                  {formErrors.email && (
                    <p id="error-email" className="mt-1 font-mono text-[11px] text-rose-400">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="input-telepon" className="block font-mono text-[11px] text-neutral-400">
                    NOMOR TELEPON
                  </label>
                  <input
                    id="input-telepon"
                    type="tel"
                    name="telepon"
                    required
                    aria-invalid={!!formErrors.telepon}
                    aria-describedby={formErrors.telepon ? "error-telepon" : undefined}
                    value={formData.telepon}
                    onChange={handleInputChange}
                    className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                      formErrors.telepon ? "border-rose-500" : "border-neutral-800 focus:border-white"
                    }`}
                  />
                  {formErrors.telepon && (
                    <p id="error-telepon" className="mt-1 font-mono text-[11px] text-rose-400">
                      {formErrors.telepon}
                    </p>
                  )}
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
                  <label htmlFor="input-alamat" className="block font-mono text-[11px] text-neutral-400">
                    ALAMAT LENGKAP
                  </label>
                  <textarea
                    id="input-alamat"
                    name="alamatLengkap"
                    rows={2}
                    required
                    aria-invalid={!!formErrors.alamatLengkap}
                    aria-describedby={formErrors.alamatLengkap ? "error-alamatLengkap" : undefined}
                    value={formData.alamatLengkap}
                    onChange={handleInputChange}
                    className={`mt-1 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                      formErrors.alamatLengkap ? "border-rose-500" : "border-neutral-800 focus:border-white"
                    }`}
                  />
                  {formErrors.alamatLengkap && (
                    <p id="error-alamatLengkap" className="mt-1 font-mono text-[11px] text-rose-400">
                      {formErrors.alamatLengkap}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="input-kota" className="block font-mono text-[11px] text-neutral-400">
                      KOTA / KABUPATEN
                    </label>
                    <input
                      id="input-kota"
                      type="text"
                      name="kota"
                      required
                      aria-invalid={!!formErrors.kota}
                      aria-describedby={formErrors.kota ? "error-kota" : undefined}
                      value={formData.kota}
                      onChange={handleInputChange}
                      className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                        formErrors.kota ? "border-rose-500" : "border-neutral-800 focus:border-white"
                      }`}
                    />
                    {formErrors.kota && (
                      <p id="error-kota" className="mt-1 font-mono text-[11px] text-rose-400">
                        {formErrors.kota}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="input-provinsi" className="block font-mono text-[11px] text-neutral-400">
                      PROVINSI
                    </label>
                    <input
                      id="input-provinsi"
                      type="text"
                      name="provinsi"
                      required
                      aria-invalid={!!formErrors.provinsi}
                      aria-describedby={formErrors.provinsi ? "error-provinsi" : undefined}
                      value={formData.provinsi}
                      onChange={handleInputChange}
                      className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                        formErrors.provinsi ? "border-rose-500" : "border-neutral-800 focus:border-white"
                      }`}
                    />
                    {formErrors.provinsi && (
                      <p id="error-provinsi" className="mt-1 font-mono text-[11px] text-rose-400">
                        {formErrors.provinsi}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="input-kodepos" className="block font-mono text-[11px] text-neutral-400">
                      KODE POS
                    </label>
                    <input
                      id="input-kodepos"
                      type="text"
                      name="kodePos"
                      maxLength={5}
                      required
                      aria-invalid={!!formErrors.kodePos}
                      aria-describedby={formErrors.kodePos ? "error-kodePos" : undefined}
                      value={formData.kodePos}
                      onChange={handleInputChange}
                      className={`mt-1 min-h-11 w-full border bg-neutral-900 px-3 py-2 font-mono text-xs text-white focus:outline-none ${
                        formErrors.kodePos ? "border-rose-500" : "border-neutral-800 focus:border-white"
                      }`}
                    />
                    {formErrors.kodePos && (
                      <p id="error-kodePos" className="mt-1 font-mono text-[11px] text-rose-400">
                        {formErrors.kodePos}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pilihan Logistik Kurir (Server-Authoritative Biteship) */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h2 className="font-mono text-xs font-bold text-white uppercase">
                  03 // OPSI KURIR PENGIRIMAN
                </h2>
                {sedangHitungOngkir && (
                  <span className="font-mono text-[10px] text-neutral-400 animate-pulse">
                    MENGHITUNG TARIF RESMI...
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {opsiKurir.length === 0 ? (
                  <p className="font-mono text-xs text-neutral-500">
                    {sedangHitungOngkir ? "Memverifikasi tarif kurir ke server..." : "Masukkan kode pos valid untuk menghitung ongkir."}
                  </p>
                ) : (
                  opsiKurir.map((kurir) => {
                    const isSelected =
                      kurirTerpilih?.kodeKurir === kurir.kodeKurir &&
                      kurirTerpilih?.layanan === kurir.layanan;
                    return (
                      <label
                        key={`${kurir.kodeKurir}-${kurir.layanan}`}
                        className={`flex min-h-11 cursor-pointer items-center justify-between border p-3 font-mono text-xs transition-colors ${
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
                            <span className="text-neutral-400">
                              {" "}
                              - {kurir.layanan} ({kurir.estimasiHari})
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-white">{formatRupiah(kurir.tarifIdr)}</span>
                      </label>
                    );
                  })
                )}
                {formErrors.kurir && (
                  <p className="mt-2 font-mono text-[11px] text-rose-400">{formErrors.kurir}</p>
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
                  <span className="font-bold text-white">
                    {sedangHitungOngkir ? "Menghitung..." : formatRupiah(totalOngkir)}
                  </span>
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
                  {isPending
                    ? "MEMPROSES TRANSAKSI ATOMIK..."
                    : `BAYAR DENGAN MIDTRANS (${formatRupiah(totalAkhir)})`}
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
