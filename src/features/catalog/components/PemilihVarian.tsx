"use client";

import { useState } from "react";
import type { VarianProdukItem, DimensiUkuranGarmen } from "../types/product.type";
import { dapatDibeli } from "../types/product.type";
import { Button } from "@/components/ui/button";
import { PanduanUkuran } from "./PanduanUkuran";
import { useKeranjangStore } from "@/features/cart/stores/keranjang.store";
import { toast } from "sonner";

export interface PropertiPemilihVarian {
  kategori: string;
  produkId?: string;
  slug?: string;
  gambarUtama?: string;
  hargaDasar?: number;
  namaProduk?: string;
  panduanUkuran?: readonly DimensiUkuranGarmen[] | null;
  varian: readonly VarianProdukItem[];
  apakahHabisTotal: boolean;
  onPilihWarna?: (warna: string, gambarVarian?: string | null) => void;
  onPilihVarian?: (varian: VarianProdukItem) => void;
}

const PALET_WARNA: Record<string, { label: string; hex: string; border?: string }> = {
  Hitam: { label: "Jet Black", hex: "#0a0a0a" },
  "Jet Black": { label: "Jet Black", hex: "#0a0a0a" },
  "Washed Black": { label: "Washed Black", hex: "#1a1a1a" },
  "Phantom Charcoal": { label: "Phantom Charcoal", hex: "#2e3033" },
  "Raw Olive": { label: "Raw Olive", hex: "#4a4b3a" },
  "Bone White": { label: "Bone White", hex: "#e5e5dc", border: "#737373" },
  Charcoal: { label: "Charcoal Grey", hex: "#2b2b2b" },
  "Vintage Wash Moss": { label: "Washed Moss", hex: "#3b443b" },
  "Cyber Silver": { label: "Cyber Silver", hex: "#8c929d" },
  "Pitch Black": { label: "Pitch Black", hex: "#050505" },
  "Olive Drab": { label: "Mil-Spec Olive", hex: "#3f4637" },
  "Shadow Black": { label: "Shadow Black", hex: "#141518" },
  "Black Onyx": { label: "Black Onyx", hex: "#111215" },
  "Desaturated Khaki": { label: "Tactical Khaki", hex: "#635f52" },
  "Deep Grey": { label: "Deep Grey", hex: "#2a2d32" },
  "Concrete Grey": { label: "Concrete Grey", hex: "#7a7d82" },
  "Charcoal Acid Wash": { label: "Acid Wash Charcoal", hex: "#2c2d32" },
  "Vintage Slate": { label: "Vintage Slate", hex: "#383a42" },
  "Steel Grey": { label: "Steel Grey", hex: "#484b54" },
  "Midnight Black": { label: "Midnight Black", hex: "#0a0b10" },
  "Sage Green": { label: "Sage Green", hex: "#465042" },
  "Matte Black": { label: "Matte Black", hex: "#141416" },
  "Dark Khaki": { label: "Dark Khaki", hex: "#565144" },
  "Deep Charcoal": { label: "Deep Charcoal", hex: "#222326" },
  "Off-Black": { label: "Off-Black", hex: "#18191c" },
  "Obsidian Black": { label: "Obsidian Black", hex: "#09090b" },
};

function ambilInfoWarna(namaWarna: string): { label: string; hex: string; border?: string } {
  if (PALET_WARNA[namaWarna]) return PALET_WARNA[namaWarna];
  const warnaLower = namaWarna.toLowerCase();
  if (warnaLower.includes("black") || warnaLower.includes("hitam")) return { label: namaWarna, hex: "#0c0d0e" };
  if (warnaLower.includes("white") || warnaLower.includes("putih")) return { label: namaWarna, hex: "#e5e5dc", border: "#737373" };
  if (warnaLower.includes("grey") || warnaLower.includes("abu")) return { label: namaWarna, hex: "#4b4d52" };
  if (warnaLower.includes("olive") || warnaLower.includes("green")) return { label: namaWarna, hex: "#3f4637" };
  if (warnaLower.includes("khaki") || warnaLower.includes("tan")) return { label: namaWarna, hex: "#635f52" };
  return { label: namaWarna, hex: "#262626" };
}

export function PemilihVarian({
  kategori,
  produkId,
  slug = "",
  gambarUtama = "/images/products/drop-04/void-tee-01-front.webp",
  hargaDasar = 0,
  namaProduk,
  panduanUkuran,
  varian,
  apakahHabisTotal,
  onPilihWarna,
  onPilihVarian,
}: PropertiPemilihVarian) {
  const tambahItem = useKeranjangStore((state) => state.tambahItem);
  const setBukaKeranjang = useKeranjangStore((state) => state.setBuka);

  // Daftar warna unik yang ada pada artikel produk
  const daftarWarna = Array.from(new Set(varian.map((v) => v.warna || "Hitam")));

  // Cari varian default pertama yang memiliki stok
  const varianPertamaTersedia = varian.find((v) => v.stok > 0) ?? varian[0];

  const [warnaTerpilih, setWarnaTerpilih] = useState<string>(
    varianPertamaTersedia?.warna ?? daftarWarna[0] ?? "Hitam"
  );

  // Varian yang termasuk dalam warna terpilih
  const varianDalamWarna = varian.filter((v) => (v.warna || "Hitam") === warnaTerpilih);

  const [varianTerpilihId, setVarianTerpilihId] = useState<string | null>(
    varianPertamaTersedia && (varianPertamaTersedia.warna || "Hitam") === warnaTerpilih
      ? varianPertamaTersedia.id
      : varianDalamWarna[0]?.id ?? null
  );

  const varianAktif = varian.find((v) => v.id === varianTerpilihId);
  const stokMaksimal = varianAktif ? Math.min(10, varianAktif.stok) : 0;
  const apakahVarianHabis = !varianAktif || varianAktif.stok <= 0;

  // Client State: Kuantitas Pembelian
  const [kuantitas, setKuantitas] = useState<number>(apakahVarianHabis ? 0 : 1);
  const [pesanStatus, setPesanStatus] = useState<string | null>(null);
  const [apakahPesanSukses, setApakahPesanSukses] = useState<boolean>(true);

  // Penanganan perubahan seleksi warna
  const tanganiPilihWarna = (warnaBaru: string) => {
    setWarnaTerpilih(warnaBaru);
    setPesanStatus(null);
    const varianWarnaBaru = varian.filter((v) => (v.warna || "Hitam") === warnaBaru);
    const varianTersedia = varianWarnaBaru.find((v) => v.stok > 0) ?? varianWarnaBaru[0];
    if (varianTersedia) {
      setVarianTerpilihId(varianTersedia.id);
      setKuantitas(varianTersedia.stok > 0 ? 1 : 0);
      onPilihWarna?.(warnaBaru, varianTersedia.gambar);
      onPilihVarian?.(varianTersedia);
    }
  };

  // Penanganan perubahan seleksi varian ukuran
  const tanganiPilihVarian = (idVarian: string) => {
    setVarianTerpilihId(idVarian);
    setPesanStatus(null);
    const targetVarian = varian.find((v) => v.id === idVarian);
    if (targetVarian && targetVarian.stok > 0) {
      setKuantitas(1);
      onPilihVarian?.(targetVarian);
    } else {
      setKuantitas(0);
    }
  };

  // Aksesibilitas Keyboard Radio Group (WAI-ARIA Pattern: Panah Kiri/Kanan/Atas/Bawah)
  const tanganiRadioKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    indexSekarang: number
  ) => {
    let indexTarget = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      indexTarget = (indexSekarang + 1) % varianDalamWarna.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      indexTarget = (indexSekarang - 1 + varianDalamWarna.length) % varianDalamWarna.length;
    }

    if (indexTarget !== -1) {
      const target = varianDalamWarna[indexTarget];
      if (target && target.stok > 0) {
        tanganiPilihVarian(target.id);
      }
    }
  };

  const kurangiKuantitas = () => {
    setPesanStatus(null);
    setKuantitas((prev) => Math.max(1, prev - 1));
  };

  const tambahKuantitas = () => {
    setPesanStatus(null);
    setKuantitas((prev) => Math.min(stokMaksimal, prev + 1));
  };

  const apakahBisaBeli = varianAktif ? dapatDibeli(varianAktif.stok, kuantitas) : false;

  const tanganiTambahKeranjang = () => {
    if (!varianAktif || !apakahBisaBeli) return;

    const hasil = tambahItem({
      varianId: varianAktif.id,
      produkId: produkId ?? "",
      nama: namaProduk ?? "Artikel VOID",
      slug,
      gambar: varianAktif.gambar || gambarUtama,
      sku: varianAktif.sku,
      ukuran: varianAktif.ukuran,
      warna: varianAktif.warna,
      hargaTampilanIdr: varianAktif.harga || hargaDasar,
      jumlah: kuantitas,
    });

    setPesanStatus(hasil.pesan);
    setApakahPesanSukses(hasil.sukses);

    if (hasil.sukses) {
      toast.success("Artikel ditambahkan ke keranjang", {
        description: `${namaProduk} (${varianAktif.warna} / ${varianAktif.ukuran}) // ${kuantitas} unit`,
      });
      // Tampilkan notifikasi lalu buka slide-over keranjang belanja
      setBukaKeranjang(true);
    } else {
      toast.error("Gagal menambahkan artikel", {
        description: hasil.pesan,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 0. Pemilihan Colorway / Varian Warna */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <label className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            PILIH WARNA // [{ambilInfoWarna(warnaTerpilih).label.toUpperCase()}]
          </label>
          <span className="font-mono text-[10px] text-neutral-400">
            {daftarWarna.length} WARNA TERSEDIA
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5" data-testid="pilihan-warna-group">
          {daftarWarna.map((w) => {
            const info = ambilInfoWarna(w);
            const isSelected = w === warnaTerpilih;
            const varianWarna = varian.filter((v) => (v.warna || "Hitam") === w);
            const totalStokWarna = varianWarna.reduce((acc, curr) => acc + curr.stok, 0);
            const isHabis = totalStokWarna <= 0;

            return (
              <button
                key={w}
                type="button"
                onClick={() => tanganiPilihWarna(w)}
                disabled={isHabis}
                title={`${info.label} (${isHabis ? "Habis" : `${totalStokWarna} stok`})`}
                aria-label={`Pilih warna ${info.label}`}
                className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-xs transition-all duration-150 ${
                  isSelected
                    ? "border-white bg-neutral-900 text-white ring-1 ring-white"
                    : isHabis
                      ? "cursor-not-allowed border-neutral-900 bg-neutral-950 text-neutral-600 opacity-50"
                      : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-500 hover:text-white"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 border shrink-0"
                  style={{
                    backgroundColor: info.hex,
                    borderColor: info.border || (isSelected ? "#ffffff" : "#525252"),
                  }}
                />
                <span className="font-medium tracking-wide">{info.label}</span>
                {isHabis && <span className="text-[10px] text-rose-400">(Habis)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Header Pemilihan Ukuran + Link Modal Panduan Ukuran */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            PILIH UKURAN {varianAktif ? `// [${varianAktif.ukuran}]` : ""}
          </label>
          <PanduanUkuran
            kategori={kategori}
            namaProduk={namaProduk}
            panduanUkuran={panduanUkuran}
            ukuranTersedia={varianDalamWarna.map((v) => v.ukuran)}
            onPilihUkuran={(ukuran) => {
              const varianTarget = varianDalamWarna.find((v) => v.ukuran === ukuran && v.stok > 0);
              if (varianTarget) {
                tanganiPilihVarian(varianTarget.id);
              } else {
                toast.info(`Ukuran ${ukuran} sedang habis`, {
                  description: "Silakan pilih ukuran lain yang masih tersedia.",
                });
              }
            }}
          />
        </div>

        {/* Grid Ukuran Buttons (Berdasarkan Warna Aktif) */}
        <div
          role="radiogroup"
          aria-label="Pilihan ukuran produk"
          className="grid grid-cols-5 gap-2 sm:gap-3"
        >
          {varianDalamWarna.map((v, idx) => {
            const isTersedia = v.stok > 0;
            const isSelected = v.id === varianTerpilihId;

            const buttonStateClass =
              isSelected && isTersedia
                ? "border-white bg-white text-black ring-1 ring-white"
                : isTersedia
                  ? "border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:text-white active:scale-98"
                  : "cursor-not-allowed border-neutral-900 bg-neutral-950 text-neutral-600 line-through opacity-50";

            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!isTersedia}
                onClick={() => tanganiPilihVarian(v.id)}
                onKeyDown={(e) => tanganiRadioKeyDown(e, idx)}
                className={`flex min-h-11 flex-col items-center justify-center py-1 border font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${buttonStateClass}`}
              >
                <span>{v.ukuran}</span>
                {!isTersedia ? (
                  <span className="text-[9px] font-normal tracking-tight text-neutral-500">HABIS</span>
                ) : v.stok <= 5 ? (
                  <span className={`text-[9px] font-normal tracking-tight ${isSelected ? "text-neutral-900" : "text-amber-400"}`}>
                    SISA {v.stok}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Quantity Selector + Batas Stok (Module 02.11) */}
      <div className="flex items-center justify-between border-t border-b border-neutral-800/80 py-4">
        <div>
          <span className="block font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            KUANTITAS
          </span>
          <span className="font-mono text-[10px] text-neutral-400">
            {apakahVarianHabis ? "Stok habis" : `Maksimal ${stokMaksimal} unit / pesanan`}
          </span>
        </div>

        <div className="flex items-center border border-neutral-800 bg-neutral-900">
          <button
            type="button"
            onClick={kurangiKuantitas}
            disabled={kuantitas <= 1 || apakahVarianHabis}
            aria-label="Kurangi satu unit kuantitas"
            className="flex h-11 w-11 items-center justify-center font-mono text-base text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            -
          </button>
          <span
            aria-live="polite"
            className="flex h-11 min-w-12 items-center justify-center border-x border-neutral-800 px-3 font-mono text-xs font-bold text-white"
          >
            {kuantitas}
          </span>
          <button
            type="button"
            onClick={tambahKuantitas}
            disabled={kuantitas >= stokMaksimal || apakahVarianHabis}
            aria-label="Tambah satu unit kuantitas"
            className="flex h-11 w-11 items-center justify-center font-mono text-base text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            +
          </button>
        </div>
      </div>

      {/* 3. Indikator Status Stok Aktual Real-time */}
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-neutral-400">STATUS INVENTARIS:</span>
        {apakahHabisTotal ? (
          <span className="font-semibold text-rose-400">SELURUH VARIAN TELAH HABIS</span>
        ) : apakahVarianHabis ? (
          <span className="font-semibold text-neutral-500">UKURAN INI HABIS</span>
        ) : varianAktif && varianAktif.stok < 10 ? (
          <span className="font-semibold text-amber-400">
            SISA {varianAktif.stok} UNIT DI GUDANG
          </span>
        ) : (
          <span className="font-semibold text-emerald-400">STOK TERSEDIA (SIAP KIRIM)</span>
        )}
      </div>

      {/* 4. Notifikasi Jujur Feedback Tambah Keranjang */}
      {pesanStatus && (
        <div
          role="status"
          aria-live="polite"
          className={`border-l-2 bg-neutral-900/90 p-3 font-mono text-xs ${
            apakahPesanSukses
              ? "border-emerald-400 text-neutral-200"
              : "border-rose-500 text-rose-300"
          }`}
        >
          {pesanStatus}
        </div>
      )}

      {/* 5. Tombol Aksi Tambah ke Keranjang */}
      <Button
        type="button"
        data-testid="tombol-tambah-keranjang"
        variant={apakahVarianHabis || apakahHabisTotal ? "secondary" : "primary"}
        size="lg"
        disabled={!apakahBisaBeli}
        onClick={tanganiTambahKeranjang}
        className="min-h-11 w-full text-xs tracking-widest sm:text-sm"
      >
        {apakahHabisTotal
          ? "PRODUK DIARSIPKAN // HABIS"
          : apakahVarianHabis
            ? "UKURAN TIDAK TERSEDIA"
            : "TAMBAH KE KERANJANG"}
      </Button>

      {/* 6. Sticky Mobile Conversion Bar (UI-02) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden items-center justify-between border-t border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
            {varianAktif ? `UKURAN: ${varianAktif.ukuran}` : "PILIH UKURAN"}
          </span>
          <span className="font-mono text-xs font-bold text-white">
            Rp {(varianAktif?.harga || hargaDasar).toLocaleString("id-ID")}
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          data-testid="tombol-tambah-keranjang-mobile"
          disabled={!apakahBisaBeli}
          onClick={tanganiTambahKeranjang}
          className="min-h-11 px-5 font-mono text-xs font-bold tracking-wider"
        >
          {apakahVarianHabis ? "HABIS" : "+ BAG"}
        </Button>
      </div>
    </div>
  );
}

