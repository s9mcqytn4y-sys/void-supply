"use client";

import React, { useState } from "react";
import type { ProdukDetail, VarianProdukItem } from "../../types/product.type";
import { PdpGalleryViewer } from "./PdpGalleryViewer";
import { PdpHeaderInfo } from "./PdpHeaderInfo";
import { PemilihVarian } from "../PemilihVarian";
import { TransparansiMaterial } from "../TransparansiMaterial";

export interface PdpInteractiveSectionProps {
  produk: ProdukDetail;
}

export function PdpInteractiveSection({ produk }: PdpInteractiveSectionProps) {
  const [gambarVarianAktif, setGambarVarianAktif] = useState<string | null>(null);

  const totalStok = produk.varian.reduce((acc: number, v: VarianProdukItem) => acc + v.stok, 0);
  const apakahHabis = totalStok === 0;
  const apakahStokMenipis = totalStok > 0 && totalStok < 15;

  return (
    <article className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      {/* Kolom Kiri: Galeri Foto Multi-Angle dengan Fullscreen Zoom & Dynamic Variant Switch */}
      <section aria-label={`Galeri foto ${produk.nama}`}>
        <PdpGalleryViewer
          namaProduk={produk.nama}
          gambarUtama={produk.gambarUtama}
          galeriGambar={produk.galeriGambar}
          gambarVarianKustom={gambarVarianAktif}
        />
      </section>

      {/* Kolom Kanan: Informasi, Pemilihan Ukuran, Warna & Transparansi Material */}
      <section aria-label="Informasi dan Pembelian Produk" className="flex flex-col gap-8">
        <PdpHeaderInfo
          nama={produk.nama}
          kategori={produk.kategori}
          hargaDasar={produk.hargaDasar}
          deskripsi={produk.deskripsi}
          totalStok={totalStok}
          apakahHabis={apakahHabis}
          apakahStokMenipis={apakahStokMenipis}
        />

        <PemilihVarian
          kategori={produk.kategori}
          produkId={produk.id}
          slug={produk.slug}
          gambarUtama={produk.gambarUtama}
          hargaDasar={produk.hargaDasar}
          namaProduk={produk.nama}
          panduanUkuran={produk.panduanUkuran}
          varian={produk.varian}
          apakahHabisTotal={apakahHabis}
          onPilihWarna={(_warna, gambarVarian) => {
            if (gambarVarian) {
              setGambarVarianAktif(gambarVarian);
            }
          }}
          onPilihVarian={(v) => {
            if (v.gambar) {
              setGambarVarianAktif(v.gambar);
            }
          }}
        />

        <TransparansiMaterial
          kategori={produk.kategori}
          spesifikasi={produk.spesifikasi}
        />
      </section>
    </article>
  );
}
