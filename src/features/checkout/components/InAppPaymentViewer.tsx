"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";

interface PropsInAppPaymentViewer {
  nomorPesanan: string;
  nominal: number;
  metodePembayaran?: string | null;
  nomorVa?: string | null;
  bankVa?: string | null;
  qrString?: string | null;
  snapRedirectUrl?: string | null;
  sisaWaktuDetik: number;
  stringCountdown: string;
}

const PANDUAN_TRANSFER: Record<
  string,
  {
    namaBank: string;
    logo: string;
    mbanking: string[];
    atm: string[];
    ibanking: string[];
  }
> = {
  bca: {
    namaBank: "BCA Virtual Account",
    logo: "/images/payments/bca.webp",
    mbanking: [
      "Buka aplikasi BCA Mobile, lalu pilih menu m-BCA.",
      "Pilih m-Transfer, lalu klik BCA Virtual Account.",
      "Masukkan nomor Virtual Account VOID Supply.",
      "Periksa nominal tagihan persis, lalu masukkan PIN m-BCA.",
      "Transaksi selesai, simpan bukti konfirmasi transfer.",
    ],
    atm: [
      "Masukkan Kartu ATM BCA dan PIN Anda.",
      "Pilih menu Transaksi Lainnya, lalu pilih Transfer.",
      "Pilih ke Rekening BCA Virtual Account.",
      "Masukkan nomor Virtual Account dan pastikan jumlah tagihan sesuai.",
      "Ikuti instruksi di layar mesin ATM untuk menyelesaikan transaksi.",
    ],
    ibanking: [
      "Login ke KlikBCA Individual.",
      "Pilih menu Transfer Dana, lalu klik Transfer ke BCA Virtual Account.",
      "Masukkan nomor Virtual Account.",
      "Validasi respon KeyBCA dan selesaikan otorisasi pembayaran.",
    ],
  },
  mandiri: {
    namaBank: "Mandiri Bill Payment",
    logo: "/images/payments/mandiri.webp",
    mbanking: [
      "Buka aplikasi Livin' by Mandiri, lalu masuk dengan akun Anda.",
      "Pilih menu Bayar, lalu pilih Pembayaran Baru.",
      "Ketik penyedia jasa 'Midtrans' atau kode perusahaan 70012.",
      "Masukkan kode bayar / nomor Virtual Account Anda.",
      "Konfirmasi nominal pembayaran, masukkan PIN Livin'.",
    ],
    atm: [
      "Masukkan kartu Mandiri dan PIN di mesin ATM.",
      "Pilih menu Bayar/Beli, lalu pilih Multi Payment.",
      "Masukkan kode perusahaan Midtrans (70012).",
      "Masukkan nomor Virtual Account dan konfirmasi total tagihan.",
      "Tekan Benar untuk menyelesaikan pembayaran.",
    ],
    ibanking: [
      "Login ke Mandiri Internet Banking.",
      "Pilih menu Bayar, lalu Multi Payment.",
      "Pilih penyedia Midtrans dan masukkan kode tagihan.",
      "Otorisasi transaksi dengan token Mandiri Anda.",
    ],
  },
  bni: {
    namaBank: "BNI Virtual Account",
    logo: "/images/payments/bni.webp",
    mbanking: [
      "Buka aplikasi BNI Mobile Banking.",
      "Pilih menu Pembayaran, lalu klik Virtual Account Billing.",
      "Pilih rekening debet dan masukkan nomor Virtual Account.",
      "Tagihan akan muncul di layar, masukkan Password Transaksi Anda.",
      "Pembayaran terverifikasi seketika.",
    ],
    atm: [
      "Masukkan kartu ATM BNI dan PIN.",
      "Pilih Menu Lain, lalu pilih Transfer.",
      "Pilih Jenis Rekening, lalu ke Rekening Tabungan.",
      "Pilih ke Rekening BNI, masukkan nomor Virtual Account.",
      "Konfirmasi pembayaran dan simpan struk transaksi.",
    ],
    ibanking: [
      "Login ke BNI Internet Banking.",
      "Pilih menu Transaksi, lalu Pembelian/Pembayaran.",
      "Pilih Virtual Account Billing, masukkan nomor VA.",
      "Selesaikan otentikasi dengan BNI e-Secure.",
    ],
  },
  bri: {
    namaBank: "BRI Virtual Account (BRIVA)",
    logo: "/images/payments/bri.webp",
    mbanking: [
      "Buka aplikasi BRImo, lalu login.",
      "Pilih menu Tagihan, lalu pilih BRIVA.",
      "Pilih Tambah Pembayaran Baru dan masukkan nomor BRIVA.",
      "Periksa nama merchant VOID Supply dan nominal tagihan.",
      "Masukkan PIN BRImo Anda untuk memproses transaksi.",
    ],
    atm: [
      "Masukkan Kartu ATM BRI dan PIN Anda.",
      "Pilih Transaksi Lain, lalu pilih Pembayaran.",
      "Pilih Lainnya, lalu pilih menu BRIVA.",
      "Masukkan nomor BRIVA Anda dan tekan Benar.",
      "Periksa informasi transaksi di layar dan konfirmasi.",
    ],
    ibanking: [
      "Login ke Internet Banking BRI.",
      "Pilih menu Pembayaran, lalu BRIVA.",
      "Masukkan nomor rekening Virtual Account.",
      "Verifikasi detail pembayaran dan masukkan password transaksi.",
    ],
  },
};

export function InAppPaymentViewer({
  nomorPesanan,
  nominal,
  metodePembayaran,
  nomorVa,
  bankVa,
  snapRedirectUrl,
  sisaWaktuDetik,
  stringCountdown,
}: PropsInAppPaymentViewer) {
  const [tabAktif, setTabAktif] = useState<"mbanking" | "atm" | "ibanking">("mbanking");
  const [sudahDisalinVa, setSudahDisalinVa] = useState(false);
  const [sudahDisalinNominal, setSudahDisalinNominal] = useState(false);

  // Penentuan Bank Target (Default BCA jika tidak dispesifikasikan)
  const bankKunci = (bankVa || metodePembayaran || "bca").toLowerCase();
  const bankTerpilih =
    PANDUAN_TRANSFER[bankKunci] ||
    (bankKunci.includes("mandiri")
      ? PANDUAN_TRANSFER.mandiri
      : bankKunci.includes("bni")
      ? PANDUAN_TRANSFER.bni
      : bankKunci.includes("bri")
      ? PANDUAN_TRANSFER.bri
      : PANDUAN_TRANSFER.bca);

  // Nomor Rekening Virtual Account Terpilih (Murni bersumber dari Midtrans Gateway, tanpa angka sintetis)
  const nomorRekeningTampil = nomorVa ? nomorVa.trim() : null;

  const salinKeClipboard = async (teks: string, tipe: "va" | "nominal") => {
    try {
      await navigator.clipboard.writeText(teks);
      if (tipe === "va") {
        setSudahDisalinVa(true);
        setTimeout(() => setSudahDisalinVa(false), 2500);
        toast.success("Nomor Virtual Account berhasil disalin ke clipboard!");
      } else {
        setSudahDisalinNominal(true);
        setTimeout(() => setSudahDisalinNominal(false), 2500);
        toast.success("Nominal tagihan berhasil disalin ke clipboard!");
      }
    } catch {
      toast.error("Gagal menyalin teks. Silakan salin secara manual.");
    }
  };

  // Tautan Deep-link ke Midtrans Sandbox Simulator hanya jika nomor VA resmi ada
  const midtransSimulatorUrl = nomorRekeningTampil
    ? `https://simulator.sandbox.midtrans.com/openapi/va/index?va=${encodeURIComponent(nomorRekeningTampil)}`
    : null;

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
      {/* Header Countdown Timer & Status */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-neutral-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            IN-APP NATIVE PAYMENT GATEWAY // OFFICIAL SECURE CHECKOUT
          </span>
          <h2 className="mt-1 font-mono text-lg font-black text-white uppercase sm:text-xl">
            PEMBAYARAN VIRTUAL ACCOUNT RESMI
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            Selesaikan transfer sebelum batas waktu berakhir untuk konfirmasi instan otomatis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block font-mono text-[10px] font-semibold text-neutral-400 uppercase">
              SISA WAKTU
            </span>
            <span
              className={`font-mono text-xl font-black ${
                sisaWaktuDetik < 180 ? "text-rose-400 animate-pulse" : "text-amber-400"
              }`}
            >
              {stringCountdown}
            </span>
          </div>
        </div>
      </div>
      {/* Jika Nomor Virtual Account Resmi Tersedia */}
      {nomorRekeningTampil ? (
        <>
          {/* Kartu Utama Virtual Account */}
          <div className="mt-6 border border-neutral-700 bg-neutral-900/60 p-5 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-16 items-center justify-center rounded-xs border border-neutral-200 bg-white p-1.5 shadow-xs">
                  <div className="relative h-6 w-12">
                    <Image
                      src={bankTerpilih.logo}
                      alt={bankTerpilih.namaBank}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-white uppercase">
                    {bankTerpilih.namaBank}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Verifikasi otomatis tanpa perlu upload struk
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SISTEM ONLINE
                </span>
              </div>
            </div>

            {/* Kotak Nomor Virtual Account */}
            <div className="mt-5 border border-neutral-800 bg-neutral-950 p-4">
              <span className="font-mono text-[10px] text-neutral-400 uppercase">
                NOMOR VIRTUAL ACCOUNT:
              </span>
              <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <span className="font-mono text-xl font-black tracking-widest text-white sm:text-2xl">
                  {nomorRekeningTampil}
                </span>
                <button
                  type="button"
                  onClick={() => salinKeClipboard(nomorRekeningTampil, "va")}
                  className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-5 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200 active:scale-98"
                >
                  {sudahDisalinVa ? "BERHASIL DISALIN!" : "SALIN NOMOR VA"}
                </button>
              </div>
            </div>

            {/* Kotak Total Tagihan */}
            <div className="mt-3 flex flex-col justify-between gap-2 border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center">
              <div>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                  TOTAL TAGIHAN TEPAT:
                </span>
                <p className="font-mono text-lg font-black text-emerald-400 sm:text-xl">
                  {formatRupiah(nominal)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => salinKeClipboard(nominal.toString(), "nominal")}
                className="inline-flex min-h-9 items-center justify-center border border-neutral-700 bg-neutral-900 px-3 font-mono text-[11px] font-semibold text-neutral-300 uppercase transition-colors hover:border-neutral-500 hover:text-white"
              >
                {sudahDisalinNominal ? "NOMINAL TERSALIN" : "SALIN NOMINAL"}
              </button>
            </div>

            {/* Tautan Deep-link ke Midtrans Simulator (Sandbox Portofolio) */}
            {midtransSimulatorUrl && (
              <div className="mt-4 flex flex-col items-start justify-between gap-3 border border-amber-900/40 bg-amber-950/20 p-3 sm:flex-row sm:items-center">
                <div className="text-[11px] text-amber-200">
                  <span className="font-mono font-bold uppercase">UJI COBA REVIEWER:</span> Anda dapat
                  melunasi pesanan ini secara instan melalui portal resmi simulator Midtrans.
                </div>
                <a
                  href={midtransSimulatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => salinKeClipboard(nomorRekeningTampil, "va")}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center border border-amber-500 bg-amber-400 px-3 font-mono text-[11px] font-black text-black uppercase transition-colors hover:bg-amber-300"
                >
                  BUKA SIMULATOR VA
                </a>
              </div>
            )}
          </div>

          {/* Accordion Panduan Transfer Step-by-Step */}
          <div className="mt-6">
            <h3 className="border-b border-neutral-800 pb-2 font-mono text-xs font-bold text-white uppercase">
              PETUNJUK PEMBAYARAN {bankTerpilih.namaBank.toUpperCase()}
            </h3>

            {/* Tab Navigasi Instruksi */}
            <div className="mt-4 flex border-b border-neutral-800">
              <button
                type="button"
                onClick={() => setTabAktif("mbanking")}
                className={`min-h-11 border-b-2 px-4 font-mono text-xs font-bold uppercase transition-colors ${
                  tabAktif === "mbanking"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                MOBILE BANKING
              </button>
              <button
                type="button"
                onClick={() => setTabAktif("atm")}
                className={`min-h-11 border-b-2 px-4 font-mono text-xs font-bold uppercase transition-colors ${
                  tabAktif === "atm"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                ATM
              </button>
              <button
                type="button"
                onClick={() => setTabAktif("ibanking")}
                className={`min-h-11 border-b-2 px-4 font-mono text-xs font-bold uppercase transition-colors ${
                  tabAktif === "ibanking"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                INTERNET BANKING
              </button>
            </div>

            {/* Daftar Langkah Transfer */}
            <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4">
              <ol className="list-decimal space-y-2.5 pl-4 font-mono text-xs text-neutral-300">
                {tabAktif === "mbanking" &&
                  bankTerpilih.mbanking.map((langkah, idx) => <li key={idx}>{langkah}</li>)}
                {tabAktif === "atm" &&
                  bankTerpilih.atm.map((langkah, idx) => <li key={idx}>{langkah}</li>)}
                {tabAktif === "ibanking" &&
                  bankTerpilih.ibanking.map((langkah, idx) => <li key={idx}>{langkah}</li>)}
              </ol>
            </div>
          </div>
        </>
      ) : (
        /* Jika Nomor VA Belum Terbit / Menggunakan Midtrans Snap Langsung */
        <div className="mt-6 border border-neutral-700 bg-neutral-900/60 p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-xs font-bold text-white uppercase">
                INSTRUKSI PEMBAYARAN GATEWAY MIDTRANS
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Selesaikan transaksi melalui portal pembayaran resmi Midtrans Snap. Anda dapat memilih metode pembayaran Virtual Account, QRIS, GoPay, atau Kartu Kredit.
              </p>
            </div>

            {/* Kotak Total Tagihan */}
            <div className="flex flex-col justify-between gap-2 border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center">
              <div>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                  TOTAL TAGIHAN TEPAT:
                </span>
                <p className="font-mono text-lg font-black text-emerald-400 sm:text-xl">
                  {formatRupiah(nominal)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => salinKeClipboard(nominal.toString(), "nominal")}
                className="inline-flex min-h-9 items-center justify-center border border-neutral-700 bg-neutral-900 px-3 font-mono text-[11px] font-semibold text-neutral-300 uppercase transition-colors hover:border-neutral-500 hover:text-white"
              >
                {sudahDisalinNominal ? "NOMINAL TERSALIN" : "SALIN NOMINAL"}
              </button>
            </div>

            {snapRedirectUrl && (
              <a
                href={snapRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
              >
                BUKA PORTAL PEMBAYARAN MIDTRANS
              </a>
            )}
          </div>
        </div>
      )}

      {/* Opsi Cadangan Sekunder: Midtrans Snap Popup jika nomor VA ada tapi ingin metode lain */}
      {nomorRekeningTampil && snapRedirectUrl && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800 pt-4">
          <span className="font-mono text-[11px] text-neutral-400">
            Ingin bayar menggunakan kartu kredit atau channel lain?
          </span>
          <a
            href={snapRedirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-4 font-mono text-xs font-semibold text-neutral-200 transition-colors hover:border-white hover:text-white"
          >
            BUKA MIDTRANS SNAP
          </a>
        </div>
      )}
    </div>
  );
}
