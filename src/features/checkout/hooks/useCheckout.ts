"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useKeranjangStore } from "@/features/cart";
import { rekonsiliasiKeranjang } from "@/features/cart/actions/reconciliation.action";
import { hitungOngkirServerAction } from "@/features/checkout/actions/ongkir.action";
import { buatPesanan } from "@/features/checkout/actions/buat-pesanan.action";
import {
  validasiVoucherAction,
  type HasilValidasiVoucher,
} from "@/features/checkout/actions/voucher.action";
import { toast } from "sonner";
import type { OpsiKurir } from "@/lib/services/biteship.service";

export interface DataFormulirCheckout {
  namaLengkap: string;
  email: string;
  telepon: string;
  alamatLengkap: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  catatan: string;
}

export function useCheckout() {
  const router = useRouter();
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

  // State Voucher Diskon (Module 02.17)
  const [kodeVoucherInput, setKodeVoucherInput] = useState("");
  const [voucherDiterapkan, setVoucherDiterapkan] = useState<HasilValidasiVoucher | null>(null);
  const [sedangValidasiVoucher, setSedangValidasiVoucher] = useState(false);

  // Kunci Idempotensi unik per sesi pengisian formulir
  const idempotensiKeyRef = useRef<string>("");
  useEffect(() => {
    if (!idempotensiKeyRef.current) {
      idempotensiKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }, []);

  const [formData, setFormData] = useState<DataFormulirCheckout>({
    namaLengkap: "",
    email: "",
    telepon: "",
    alamatLengkap: "",
    kota: "",
    provinsi: "",
    kodePos: "",
    catatan: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Panggil Server Action Hitung Ongkir
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
        } else {
          setOpsiKurir([]);
          setKurirTerpilih(null);
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
              "Perhatian: Ketersediaan atau harga artikel telah diverifikasi ulang dengan stok terkini."
            );
          }

          if (formData.kodePos.length === 5) {
            muatTarifOngkir(formData.kodePos, items);
          }
        }
      })
      .catch((err) => {
        console.error("Gagal rekonsiliasi checkout:", err);
      })
      .finally(() => {
        setSedangMemuat(false);
      });
  }, [muatTarifOngkir, formData.kodePos, items, terapkanHasilRekonsiliasi]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

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
    if (
      !formData.kodePos.trim() ||
      formData.kodePos.length !== 5 ||
      !/^[0-9]+$/.test(formData.kodePos)
    ) {
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
      try {
        const hasil = await buatPesanan({
          namaLengkap: formData.namaLengkap,
          email: formData.email,
          telepon: formData.telepon,
          alamatLengkap: formData.alamatLengkap,
          kota: formData.kota,
          provinsi: formData.provinsi,
          kodePos: formData.kodePos,
          catatan: formData.catatan || undefined,
          idempotensiKey: idempotensiKeyRef.current || undefined,
          kodeKurir: kurirTerpilih.kodeKurir,
          layananKurir: kurirTerpilih.layanan,
          kodeVoucher: voucherDiterapkan?.sukses ? voucherDiterapkan.kode : undefined,
          items: items.map((i) => ({ varianId: i.varianId, jumlah: i.jumlah })),
        });

        if (hasil.sukses && hasil.nomorPesanan) {
          kosongkanKeranjang();
          // Simpan token otorisasi ke cookie SameSite=Strict & Max-Age=3600 (SEC-02A)
          if (hasil.tokenAkses && typeof document !== "undefined") {
            const isSecure = window.location.protocol === "https:";
            const secureFlag = isSecure ? "; Secure" : "";
            document.cookie = `void_order_token_${encodeURIComponent(hasil.nomorPesanan)}=${encodeURIComponent(hasil.tokenAkses)}; path=/; max-age=3600; SameSite=Strict${secureFlag}`;
          }
          toast.success("Pesanan berhasil dibuat. Mengalihkan ke pembayaran...");
          // Arahkan ke halaman status pesanan kanonikal tanpa membocorkan token di URL
          router.push(`/pesanan/${encodeURIComponent(hasil.nomorPesanan)}`);
        } else {
          setPesanErrorGlobal(hasil.pesan);
          toast.error(hasil.pesan || "Gagal membuat pesanan.");
        }
      } catch (err) {
        console.error("Galat proses checkout:", err);
        setPesanErrorGlobal("Terjadi kendala sistem. Silakan coba kembali.");
        toast.error("Terjadi kendala sistem saat checkout.");
      }
    });
  }

  const subtotal = items.reduce((acc, i) => acc + i.hargaTampilanIdr * i.jumlah, 0);
  const totalOngkir = kurirTerpilih?.tarifIdr || 0;
  const totalDiskon = voucherDiterapkan?.sukses ? voucherDiterapkan.potonganIdr : 0;
  const totalAkhir = Math.max(0, subtotal - totalDiskon + totalOngkir);

  async function handleTerapkanVoucher(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!kodeVoucherInput.trim()) {
      toast.error("Silakan masukkan kode voucher");
      return;
    }

    setSedangValidasiVoucher(true);
    try {
      const hasil = await validasiVoucherAction({
        kode: kodeVoucherInput,
        subtotal,
      });

      if (hasil.sukses) {
        setVoucherDiterapkan(hasil);
        toast.success(hasil.pesan);
      } else {
        toast.error(hasil.pesan);
      }
    } catch (err) {
      console.error("Gagal validasi voucher:", err);
      toast.error("Gagal memeriksa voucher diskon.");
    } finally {
      setSedangValidasiVoucher(false);
    }
  }

  function handleHapusVoucher() {
    setVoucherDiterapkan(null);
    setKodeVoucherInput("");
    toast.info("Voucher diskon dihapus.");
  }

  return {
    items,
    isPending,
    sedangMemuat,
    sedangHitungOngkir,
    pesanNotifikasi,
    pesanErrorGlobal,
    opsiKurir,
    kurirTerpilih,
    setKurirTerpilih,
    formData,
    formErrors,
    handleInputChange,
    handleSubmitPesanan,
    subtotal,
    totalOngkir,
    totalDiskon,
    totalAkhir,
    // Voucher features
    kodeVoucherInput,
    setKodeVoucherInput,
    voucherDiterapkan,
    sedangValidasiVoucher,
    handleTerapkanVoucher,
    handleHapusVoucher,
  };
}
