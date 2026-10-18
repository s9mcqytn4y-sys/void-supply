"use server";

import crypto from "crypto";
import { inArray, eq, and, gte, sql, isNull, lt, or } from "drizzle-orm";
import {
  db,
  produk,
  varianProduk,
  pesanan,
  itemPesanan,
  pembayaran,
  pengiriman,
  pelanggan,
  aturanDiskon,
} from "@/lib/db";
import { formulirCheckoutSkema, type FormulirCheckout } from "../schemas/checkout.schema";
import { buatTransaksiMidtrans } from "@/lib/services/midtrans.service";
import { hitungOngkirBiteship } from "@/lib/services/biteship.service";
import { kirimEmailNotifikasi } from "@/lib/services/email.service";
import { gabungkanNiatItem } from "@/features/cart";
import { ambilSesiPengguna } from "@/lib/auth/session";

function hitungHashPayload(data: FormulirCheckout): string {
  const sortedItems = [...data.items]
    .sort((a, b) => a.varianId.localeCompare(b.varianId))
    .map((i) => ({ varianId: i.varianId, jumlah: i.jumlah }));

  const payloadString = JSON.stringify({
    email: data.email.trim().toLowerCase(),
    telepon: data.telepon.trim(),
    kodePos: data.kodePos.trim(),
    kodeKurir: data.kodeKurir,
    layananKurir: data.layananKurir,
    kodeVoucher: data.kodeVoucher?.trim().toUpperCase() || "",
    items: sortedItems,
  });

  return crypto.createHash("sha256").update(payloadString).digest("hex");
}

export interface HasilBuatPesanan {
  sukses: boolean;
  pesan: string;
  nomorPesanan?: string;
  tokenAkses?: string;
  snapToken?: string;
  redirectUrl?: string;
}

/**
 * Server Action: Buat Transaksi Pesanan Atomik (Module 02.15)
 * Alur Transaksi Dua Fase:
 * Fase 1: Validasi server-authoritative & Transaksi Database Atomik
 *   - Penggabungan SKU duplikat & penegakan kuota maksimal 10 unit per SKU
 *   - Perhitungan berat & verifikasi tarif resmi Biteship dari origin Johar Baru, Jakarta Pusat (10560)
 *   - Penolakan tegas (strict error) jika kurir/layanan tidak ditemukan
 *   - Pengurangan stok bersyarat secara atomik (stok = stok - qty WHERE stok >= qty)
 *   - Penyimpanan pesanan (status: menunggu_pembayaran), item snapshot, pengiriman, dan record pembayaran
 *   - Commit transaksi database segera untuk melepas row lock
 *
 * Fase 2: Pemanggilan Gateway Midtrans di luar lock database
 *   - Request token Snap Midtrans
 *   - Jika gateway menolak/gagal: jalankan kompensasi rollback stok atomik & batalkan pesanan
 *   - Jika sukses: simpan snap token pada record pembayaran
 */
export async function buatPesanan(input: FormulirCheckout): Promise<HasilBuatPesanan> {
  // 1. Validasi skema runtime Zod
  const parseResult = formulirCheckoutSkema.safeParse(input);
  if (!parseResult.success) {
    const errorPesan = parseResult.error.errors.map((e) => e.message).join(", ");
    return {
      sukses: false,
      pesan: `Data formulir tidak valid: ${errorPesan}`,
    };
  }

  const data = parseResult.data;

  // 2. Gabungkan SKU / varianId duplikat & validasi batas maksimal per SKU
  const hasilGabung = gabungkanNiatItem(data.items);
  if (!hasilGabung.sukses || hasilGabung.itemTergabung.length === 0) {
    return {
      sukses: false,
      pesan: hasilGabung.pesanGalat || "Format item keranjang belanja tidak valid.",
    };
  }

  const itemDaftar = hasilGabung.itemTergabung;
  const daftarVarianIdUnik = itemDaftar.map((i) => i.varianId);
  const hashPayloadSaatIni = hitungHashPayload(data);

  try {
    // 2b. Idempotency Check: Jika idempotensiKey ada dan pesanan sudah tercatat, kembalikan pesanan eksis (PAY-06)
    if (data.idempotensiKey) {
      const [pesananEksis] = await db
        .select({
          id: pesanan.id,
          nomorPesanan: pesanan.nomorPesanan,
          tokenAkses: pesanan.tokenAkses,
          statusPesanan: pesanan.statusPesanan,
          hashPayload: pesanan.hashPayload,
        })
        .from(pesanan)
        .where(eq(pesanan.idempotensiKey, data.idempotensiKey))
        .limit(1);

      if (pesananEksis) {
        // PAY-06: Verifikasi kesesuaian fingerprint payload. Jika berbeda, tolak sebagai konflik idempotensi
        if (pesananEksis.hashPayload && pesananEksis.hashPayload !== hashPayloadSaatIni) {
          return {
            sukses: false,
            pesan: "Konflik idempotensi: Kunci permintaan ini telah digunakan dengan isi pesanan yang berbeda.",
          };
        }

        const [pembayaranEksis] = await db
          .select({
            snapToken: pembayaran.snapToken,
            snapRedirectUrl: pembayaran.snapRedirectUrl,
          })
          .from(pembayaran)
          .where(eq(pembayaran.pesananId, pesananEksis.id))
          .limit(1);

        return {
          sukses: true,
          pesan: "Pesanan telah tercatat sebelumnya (idempotent).",
          nomorPesanan: pesananEksis.nomorPesanan,
          tokenAkses: pesananEksis.tokenAkses || undefined,
          snapToken: pembayaranEksis?.snapToken || undefined,
          redirectUrl: pembayaranEksis?.snapRedirectUrl || undefined,
        };
      }
    }

    // 3. Ambil data varian & produk terkini dari basis data
    const dataVarianDb = await db
      .select({
        varianId: varianProduk.id,
        produkId: produk.id,
        namaProduk: produk.nama,
        sku: varianProduk.sku,
        ukuran: varianProduk.ukuran,
        warna: varianProduk.warna,
        stok: varianProduk.stok,
        harga: varianProduk.harga,
        beratGram: varianProduk.beratGram,
        statusProduk: produk.status,
      })
      .from(varianProduk)
      .innerJoin(produk, eq(varianProduk.produkId, produk.id))
      .where(inArray(varianProduk.id, daftarVarianIdUnik));

    const varianMap = new Map(dataVarianDb.map((row) => [row.varianId, row]));

    // 4. Validasi ketersediaan artikel & hitung subtotal serta berat server
    let subtotalServer = 0;
    let totalBeratServer = 0;
    const snapshotItem: Array<{
      varianId: string;
      namaProduk: string;
      namaVarian: string;
      sku: string;
      hargaSatuan: number;
      beratGram: number;
      jumlah: number;
      subtotalItem: number;
    }> = [];

    for (const item of itemDaftar) {
      const itemDb = varianMap.get(item.varianId);

      if (!itemDb) {
        return {
          sukses: false,
          pesan: `Artikel dengan ID varian '${item.varianId}' tidak ditemukan di katalog.`,
        };
      }

      if (itemDb.statusProduk !== "aktif") {
        return {
          sukses: false,
          pesan: `Artikel '${itemDb.namaProduk}' sedang tidak aktif atau diarsipkan.`,
        };
      }

      if (itemDb.stok < item.jumlah) {
        return {
          sukses: false,
          pesan: `Stok untuk '${itemDb.namaProduk} (${itemDb.ukuran})' tidak mencukupi (Tersisa: ${itemDb.stok}, Diminta: ${item.jumlah}).`,
        };
      }

      const subtotalItem = itemDb.harga * item.jumlah;
      subtotalServer += subtotalItem;
      totalBeratServer += itemDb.beratGram * item.jumlah;

      snapshotItem.push({
        varianId: itemDb.varianId,
        namaProduk: itemDb.namaProduk,
        namaVarian: `${itemDb.ukuran} / ${itemDb.warna}`,
        sku: itemDb.sku,
        hargaSatuan: itemDb.harga,
        beratGram: itemDb.beratGram,
        jumlah: item.jumlah,
        subtotalItem,
      });
    }

    // 5. Hitung tarif ongkir resmi secara server-authoritative via Biteship service
    const opsiOngkir = await hitungOngkirBiteship({
      kodePosTujuan: data.kodePos,
      totalBeratGram: totalBeratServer,
      latitudeTujuan: data.latitude,
      longitudeTujuan: data.longitude,
    });

    // Validasi ketat (strict matching): Tolak jika layanan yang dipilih tidak cocok persis
    const opsiCocok = opsiOngkir.find(
      (o) =>
        o.kodeKurir.toLowerCase() === data.kodeKurir.toLowerCase() &&
        (o.layanan.toLowerCase() === data.layananKurir.toLowerCase() ||
          (Boolean(o.kodeLayananKurir) &&
            Boolean(data.kodeLayananKurir) &&
            o.kodeLayananKurir?.toLowerCase() === data.kodeLayananKurir?.toLowerCase()))
    );

    if (!opsiCocok) {
      return {
        sukses: false,
        pesan: `Layanan pengiriman '${data.kodeKurir.toUpperCase()} (${data.layananKurir})' tidak tersedia untuk rute tujuan ${data.kota} (${data.kodePos}). Silakan pilih layanan kurir resmi yang tersedia.`,
      };
    }

    const totalOngkir = opsiCocok.tarifIdr;
    const namaKurir = opsiCocok.namaKurir;
    const layananKurir = opsiCocok.layanan;
    const estimasiHari = opsiCocok.estimasiHari;

    // 5b. Validasi & kalkulasi diskon voucher (Module 02.17)
    let totalDiskon = 0;
    let kodeVoucherDiterapkan: string | null = null;
    if (data.kodeVoucher && data.kodeVoucher.trim() !== "") {
      const kodeBersih = data.kodeVoucher.trim().toUpperCase();
      const [diskonDb] = await db
        .select()
        .from(aturanDiskon)
        .where(eq(aturanDiskon.kode, kodeBersih))
        .limit(1);

      if (diskonDb && diskonDb.apakahAktif) {
        const sekarang = new Date();
        const belumMulai = diskonDb.tanggalMulai && diskonDb.tanggalMulai > sekarang;
        const sudahSelesai = diskonDb.tanggalBerakhir && diskonDb.tanggalBerakhir < sekarang;
        const kuotaHabis = diskonDb.kuotaPenggunaan !== null && diskonDb.totalDigunakan >= diskonDb.kuotaPenggunaan;
        const kurangMinBelanja = diskonDb.minimalPembelian && subtotalServer < diskonDb.minimalPembelian;

        if (!belumMulai && !sudahSelesai && !kuotaHabis && !kurangMinBelanja) {
          kodeVoucherDiterapkan = diskonDb.kode;
          if (diskonDb.tipeDiskon === "persentase") {
            const hitungPotongan = Math.round((subtotalServer * diskonDb.nilaiDiskon) / 100);
            totalDiskon = diskonDb.maksimalPotongan ? Math.min(hitungPotongan, diskonDb.maksimalPotongan) : hitungPotongan;
          } else {
            totalDiskon = Math.min(diskonDb.nilaiDiskon, subtotalServer);
          }
        }
      }
    }

    const totalAkhir = Math.max(0, subtotalServer - totalDiskon + totalOngkir);

    // 6. Generate Nomor Pesanan Unik (Format VOID-YYYYMMDD-XXXXXXXX)
    const tanggalFormat = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const acak = crypto.randomBytes(4).toString("hex").toUpperCase();
    const nomorPesanan = `VOID-${tanggalFormat}-${acak}`;

    // Ambil identitas sesi server-authoritative jika ada pengguna yang masuk
    const sesiPengguna = await ambilSesiPengguna();
    const penggunaId = sesiPengguna?.pengguna?.id || null;

    // 7. FASE 1: Mutasi Basis Data Atomik Cepat
    let pesananId = "";
    let tokenAksesPesanan = "";
    await db.transaction(async (tx) => {
      // 7a. Pengurangan stok bersyarat secara atomik (pencegahan overselling saat konkurensi)
      for (const item of snapshotItem) {
        const [updated] = await tx
          .update(varianProduk)
          .set({
            stok: sql`${varianProduk.stok} - ${item.jumlah}`,
          })
          .where(
            and(
              eq(varianProduk.id, item.varianId),
              gte(varianProduk.stok, item.jumlah)
            )
          )
          .returning({ id: varianProduk.id });

        if (!updated) {
          throw new Error(
            `Stok untuk '${item.namaProduk} (${item.namaVarian})' tidak mencukupi atau telah dibeli oleh pengguna lain.`
          );
        }
      }

      // 7b. Simpan atau perbarui profil pelanggan (Server-authoritative binding penggunaId)
      let pelangganId: string | undefined;
      const [pelangganEksis] = await tx
        .select({ id: pelanggan.id, penggunaId: pelanggan.penggunaId })
        .from(pelanggan)
        .where(eq(pelanggan.email, data.email))
        .limit(1);

      if (pelangganEksis) {
        pelangganId = pelangganEksis.id;
        const updatePayload: Record<string, unknown> = {
          diperbaruiPada: new Date(),
        };
        if (penggunaId && !pelangganEksis.penggunaId) {
          updatePayload.penggunaId = penggunaId;
        }
        if (data.simpanAlamatSebagaiDefault) {
          updatePayload.namaLengkap = data.namaLengkap;
          updatePayload.telepon = data.telepon;
          updatePayload.alamatDefault = data.alamatLengkap;
          updatePayload.kotaDefault = data.kota;
          updatePayload.provinsiDefault = data.provinsi;
          updatePayload.kodePosDefault = data.kodePos;
        }
        await tx
          .update(pelanggan)
          .set(updatePayload)
          .where(eq(pelanggan.id, pelangganEksis.id));
      } else {
        const [pelangganBaru] = await tx
          .insert(pelanggan)
          .values({
            penggunaId,
            namaLengkap: data.namaLengkap,
            email: data.email,
            telepon: data.telepon,
            alamatDefault: data.alamatLengkap,
            kotaDefault: data.kota,
            provinsiDefault: data.provinsi,
            kodePosDefault: data.kodePos,
          })
          .returning({ id: pelanggan.id });
        pelangganId = pelangganBaru?.id;
      }

      // 7c. Simpan Entitas Pesanan (status: menunggu_pembayaran)
      const kedaluwarsaPada = new Date(Date.now() + 15 * 60 * 1000); // 15 menit jendela reservasi
      const tokenAkses = crypto.randomUUID();
      const hashTokenAkses = crypto.createHash("sha256").update(tokenAkses).digest("hex");
      const [pesananBaru] = await tx
        .insert(pesanan)
        .values({
          nomorPesanan,
          pelangganId,
          namaPelanggan: data.namaLengkap,
          emailPelanggan: data.email,
          teleponPelanggan: data.telepon,
          statusPesanan: "menunggu_pembayaran",
          subtotal: subtotalServer,
          totalOngkir,
          totalDiskon,
          totalAkhir,
          kodeVoucher: kodeVoucherDiterapkan,
          catatan: data.catatan,
          idempotensiKey: data.idempotensiKey || null,
          hashPayload: hashPayloadSaatIni,
          tokenAkses,
          hashTokenAkses,
          kedaluwarsaPada,
        })
        .returning({ id: pesanan.id, tokenAkses: pesanan.tokenAkses });

      pesananId = pesananBaru.id;
      tokenAksesPesanan = pesananBaru.tokenAkses || tokenAkses;

      // 7c-2. Catat penggunaan voucher secara atomik bersyarat (P0: Pencegahan Overshoot Kuota)
      if (kodeVoucherDiterapkan) {
        const [updatedVoucher] = await tx
          .update(aturanDiskon)
          .set({ totalDigunakan: sql`${aturanDiskon.totalDigunakan} + 1` })
          .where(
            and(
              eq(aturanDiskon.kode, kodeVoucherDiterapkan),
              or(
                isNull(aturanDiskon.kuotaPenggunaan),
                lt(aturanDiskon.totalDigunakan, aturanDiskon.kuotaPenggunaan)
              )
            )
          )
          .returning({ id: aturanDiskon.id });

        if (!updatedVoucher) {
          throw new Error("Kuota penggunaan voucher diskon telah habis.");
        }
      }

      // 7d. Simpan Snapshot Item Pesanan Imutabel
      for (const item of snapshotItem) {
        await tx.insert(itemPesanan).values({
          pesananId: pesananBaru.id,
          varianId: item.varianId,
          namaProduk: item.namaProduk,
          namaVarian: item.namaVarian,
          sku: item.sku,
          hargaSatuan: item.hargaSatuan,
          beratGram: item.beratGram,
          jumlah: item.jumlah,
          subtotalItem: item.subtotalItem,
        });
      }

      // 7e. Simpan Entitas Pengiriman Terverifikasi Server
      await tx.insert(pengiriman).values({
        pesananId: pesananBaru.id,
        kurir: namaKurir,
        layanan: layananKurir,
        kodeLayananKurir: opsiCocok.kodeLayananKurir || null,
        biayaOngkir: totalOngkir,
        beratTotalGram: totalBeratServer,
        alamatLengkap: data.alamatLengkap,
        kota: data.kota,
        provinsi: data.provinsi,
        kodePos: data.kodePos,
        namaPenerima: data.namaLengkap,
        teleponPenerima: data.telepon,
        estimasiHari: estimasiHari || "1-2 Hari",
        statusPengiriman: "menunggu_resi",
      });

      // 7f. Simpan Entitas Pembayaran Awal
      await tx.insert(pembayaran).values({
        pesananId: pesananBaru.id,
        gateway: "midtrans",
        gatewayOrderId: nomorPesanan,
        statusPembayaran: "menunggu_pembayaran",
        jumlahBayar: totalAkhir,
      });
    });

    // 8. FASE 2: Request Gateway Pembayaran Midtrans Snap (di luar DB lock)
    const midtransItems = [
      ...snapshotItem.map((s) => ({
        id: s.sku,
        price: s.hargaSatuan,
        quantity: s.jumlah,
        name: s.namaProduk,
      })),
      {
        id: `SHIPPING-${data.kodeKurir.toUpperCase()}`,
        price: totalOngkir,
        quantity: 1,
        name: `Ongkos Kirim ${namaKurir} (${layananKurir})`,
      },
    ];

    if (totalDiskon > 0 && kodeVoucherDiterapkan) {
      midtransItems.push({
        id: `VOUCHER-${kodeVoucherDiterapkan}`,
        price: -totalDiskon,
        quantity: 1,
        name: `Potongan Voucher (${kodeVoucherDiterapkan})`,
      });
    }

    const midtransResponse = await buatTransaksiMidtrans({
      nomorPesanan,
      totalAkhirIdr: totalAkhir,
      items: midtransItems,
      pelanggan: {
        namaLengkap: data.namaLengkap,
        email: data.email,
        telepon: data.telepon,
        alamat: `${data.alamatLengkap}, ${data.kota}, ${data.provinsi} ${data.kodePos}`,
      },
    });

    // 9. Penanganan jika Midtrans Gagal: Transaksi Kompensasi Rollback Stok (Compare-and-Set)
    if (!midtransResponse.sukses || !midtransResponse.token) {
      console.error("Gagal mendapatkan sesi pembayaran Midtrans:", midtransResponse.pesan);

      // Kembalikan stok yang sempat didekremen secara compare-and-set & rollback kuota voucher
      await db.transaction(async (tx) => {
        const [dibatalkan] = await tx
          .update(pesanan)
          .set({ statusPesanan: "dibatalkan" })
          .where(
            and(
              eq(pesanan.id, pesananId),
              eq(pesanan.statusPesanan, "menunggu_pembayaran")
            )
          )
          .returning({ id: pesanan.id });

        if (dibatalkan) {
          if (kodeVoucherDiterapkan) {
            await tx
              .update(aturanDiskon)
              .set({ totalDigunakan: sql`GREATEST(0, ${aturanDiskon.totalDigunakan} - 1)` })
              .where(eq(aturanDiskon.kode, kodeVoucherDiterapkan));
          }

          for (const item of snapshotItem) {
            await tx
              .update(varianProduk)
              .set({ stok: sql`${varianProduk.stok} + ${item.jumlah}` })
              .where(eq(varianProduk.id, item.varianId));
          }

          await tx
            .update(pembayaran)
            .set({ statusPembayaran: "gagal" })
            .where(eq(pembayaran.pesananId, pesananId));
        }
      });

      return {
        sukses: false,
        pesan:
          midtransResponse.pesan ||
          "Gagal menghubungkan ke gateway pembayaran. Pesanan Anda tidak diproses dan stok dikembalikan.",
      };
    }

    // 10. Pembaruan Token Snap pada Entitas Pembayaran
    await db
      .update(pembayaran)
      .set({
        snapToken: midtransResponse.token,
        snapRedirectUrl: midtransResponse.redirectUrl,
      })
      .where(eq(pembayaran.pesananId, pesananId));

    // 11. Kirim Email Notifikasi Konfirmasi Pesanan secara asinkron
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://voidsupply.com";
    void kirimEmailNotifikasi({
      jenis: "konfirmasi_pesanan",
      emailTujuan: data.email,
      namaPelanggan: data.namaLengkap,
      nomorPesanan,
      nominal: totalAkhir,
      tautan: `${appUrl}/pesanan/${nomorPesanan}?token=${tokenAksesPesanan}`,
    }).catch((err) => console.error("Gagal mengirim email konfirmasi pesanan:", err));

    // 12. Tetapkan Cookie Akses Pesanan HttpOnly di Server (SEC-05 P0 Remediation)
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      cookieStore.set(`void_order_token_${nomorPesanan}`, tokenAksesPesanan, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600 * 24,
      });
    } catch {
      // Non-SSR / test context
    }

    return {
      sukses: true,
      pesan: "Pesanan berhasil dibuat. Melanjutkan ke pembayaran.",
      nomorPesanan,
      tokenAkses: tokenAksesPesanan,
      snapToken: midtransResponse.token,
      redirectUrl: midtransResponse.redirectUrl,
    };
  } catch (error) {
    // Penanganan anggun jika terjadi unique violation pada idempotensi_key (PAY-02)
    if (
      data.idempotensiKey &&
      error &&
      typeof error === "object" &&
      (("code" in error && error.code === "23505") ||
        ("constraint" in error && String(error.constraint).includes("idempotensi")))
    ) {
      try {
        const [pesananEksis] = await db
          .select({
            id: pesanan.id,
            nomorPesanan: pesanan.nomorPesanan,
            tokenAkses: pesanan.tokenAkses,
            hashPayload: pesanan.hashPayload,
          })
          .from(pesanan)
          .where(eq(pesanan.idempotensiKey, data.idempotensiKey))
          .limit(1);

        if (pesananEksis) {
          if (pesananEksis.hashPayload && pesananEksis.hashPayload !== hashPayloadSaatIni) {
            return {
              sukses: false,
              pesan: "Konflik idempotensi: Kunci permintaan ini telah digunakan dengan isi pesanan yang berbeda.",
            };
          }
          const [pembayaranEksis] = await db
            .select({
              snapToken: pembayaran.snapToken,
              snapRedirectUrl: pembayaran.snapRedirectUrl,
            })
            .from(pembayaran)
            .where(eq(pembayaran.pesananId, pesananEksis.id))
            .limit(1);

          try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            if (pesananEksis.tokenAkses) {
              cookieStore.set(`void_order_token_${pesananEksis.nomorPesanan}`, pesananEksis.tokenAkses, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 3600 * 24,
              });
            }
          } catch {
            // Non-SSR context
          }

          return {
            sukses: true,
            pesan: "Pesanan telah diproses secara bersamaan (idempotent concurrent resolution).",
            nomorPesanan: pesananEksis.nomorPesanan,
            tokenAkses: pesananEksis.tokenAkses || undefined,
            snapToken: pembayaranEksis?.snapToken || undefined,
            redirectUrl: pembayaranEksis?.snapRedirectUrl || undefined,
          };
        }
      } catch (errDb) {
        console.error("Gagal mengambil pesanan konflik idempotensi:", errDb);
      }
    }

    console.error("Galat proses buat pesanan:", error);
    return {
      sukses: false,
      pesan:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan sistem saat memproses transaksi.",
    };
  }
}
