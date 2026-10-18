"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useKeranjangStore, type ItemKeranjang } from "@/features/cart";
import { rekonsiliasiKeranjang } from "@/features/cart/actions/reconciliation.action";
import { authClient } from "@/lib/auth/auth-client";
import type { OpsiKurir } from "@/lib/services/biteship.service";
import { hitungOngkirServerAction } from "@/features/checkout/actions/ongkir.action";
import { buatPesanan } from "@/features/checkout/actions/buat-pesanan.action";
import { ambilAlamatTersimpanAction } from "@/features/checkout/actions/alamat.action";
import {
  validasiVoucherAction,
  type HasilValidasiVoucher,
} from "@/features/checkout/actions/voucher.action";
import {
  skemaDataPengiriman,
  type DataPengirimanForm,
} from "../schemas/checkout.schema";

export interface CheckoutContextValue {
  // Sesi & Status Auth
  session: ReturnType<typeof authClient.useSession>["data"];
  sessionLoading: boolean;

  // Keranjang
  items: ItemKeranjang[];
  subtotal: number;
  totalOngkir: number;
  totalDiskon: number;
  totalAkhir: number;
  sedangMemuat: boolean;
  pesanNotifikasi: string | null;

  // React Hook Form
  form: UseFormReturn<DataPengirimanForm>;

  // Logistik & Kurir
  opsiKurir: OpsiKurir[];
  kurirTerpilih: OpsiKurir | null;
  setKurirTerpilih: (kurir: OpsiKurir | null) => void;
  sedangHitungOngkir: boolean;
  errorLogistik: string | null;
  cobaHitungUlangOngkir: () => void;
  kategoriKurirAktif: "semua" | "reguler" | "next_day" | "instant" | "kargo";
  setKategoriKurirAktif: (
    kat: "semua" | "reguler" | "next_day" | "instant" | "kargo"
  ) => void;

  // GPS & Geocoding
  koordinat: { latitude: number; longitude: number } | null;
  statusGps: "idle" | "mencari" | "berhasil" | "gagal";
  deteksiLokasiGps: () => Promise<void>;

  // Voucher
  kodeVoucherInput: string;
  setKodeVoucherInput: (kode: string) => void;
  voucherDiterapkan: HasilValidasiVoucher | null;
  sedangValidasiVoucher: boolean;
  handleTerapkanVoucher: (e?: React.FormEvent) => Promise<void>;
  handleHapusVoucher: () => void;

  // Order Submission
  isPending: boolean;
  pesanErrorGlobal: string | null;
  handleSubmitCheckout: (data: DataPengirimanForm) => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckoutContext(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error(
      "useCheckoutContext harus digunakan di dalam komponen CheckoutProvider."
    );
  }
  return context;
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const items = useKeranjangStore((state) => state.items);
  const kosongkanKeranjang = useKeranjangStore((state) => state.kosongkan);
  const terapkanHasilRekonsiliasi = useKeranjangStore(
    (state) => state.terapkanHasilRekonsiliasi
  );

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [isPending, startTransition] = useTransition();
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangHitungOngkir, setSedangHitungOngkir] = useState(false);
  const [errorLogistik, setErrorLogistik] = useState<string | null>(null);
  const [pesanNotifikasi, setPesanNotifikasi] = useState<string | null>(null);
  const [pesanErrorGlobal, setPesanErrorGlobal] = useState<string | null>(null);

  const [opsiKurir, setOpsiKurir] = useState<OpsiKurir[]>([]);
  const [kurirTerpilih, setKurirTerpilih] = useState<OpsiKurir | null>(null);
  const [kategoriKurirAktif, setKategoriKurirAktif] = useState<
    "semua" | "reguler" | "next_day" | "instant" | "kargo"
  >("semua");

  // GPS State
  const [koordinat, setKoordinat] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [statusGps, setStatusGps] = useState<
    "idle" | "mencari" | "berhasil" | "gagal"
  >("idle");

  // Voucher State
  const [kodeVoucherInput, setKodeVoucherInput] = useState("");
  const [voucherDiterapkan, setVoucherDiterapkan] =
    useState<HasilValidasiVoucher | null>(null);
  const [sedangValidasiVoucher, setSedangValidasiVoucher] = useState(false);

  // Kunci Idempotensi unik
  const idempotensiKeyRef = useRef<string>("");
  const cacheOngkirRef = useRef<Map<string, OpsiKurir[]>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!idempotensiKeyRef.current) {
      idempotensiKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }, []);

  // React Hook Form Setup dengan Zod Resolver
  const form = useForm<DataPengirimanForm>({
    resolver: zodResolver(skemaDataPengiriman),
    defaultValues: {
      namaLengkap: "",
      email: "",
      telepon: "",
      alamatLengkap: "",
      kota: "",
      provinsi: "",
      kodePos: "",
      catatan: "",
      simpanAlamatSebagaiDefault: true,
    },
    mode: "onBlur",
  });

  // 1. Redirect Guard: Pengguna belum login diarahkan ke /masuk?next=/checkout
  useEffect(() => {
    if (!sessionLoading && !session && items.length > 0) {
      toast.info(
        "Silakan masuk atau daftarkan akun untuk menyelesaikan pemesanan."
      );
      router.replace("/masuk?next=/checkout");
    }
  }, [sessionLoading, session, items.length, router]);

  // 2. Kalkulasi Ongkir Server-Authoritative
  const muatTarifOngkir = useCallback(
    async (
      kodePos: string,
      itemDaftar: typeof items,
      coordsParam?: { latitude: number; longitude: number } | null
    ) => {
      if (!kodePos || kodePos.length !== 5 || !/^[0-9]+$/.test(kodePos)) {
        return;
      }
      if (itemDaftar.length === 0) return;

      const activeCoords = coordsParam !== undefined ? coordsParam : koordinat;
      const cacheKey = `${kodePos}_${itemDaftar.map((i) => `${i.varianId}:${i.jumlah}`).join(",")}_${activeCoords?.latitude ?? 0},${activeCoords?.longitude ?? 0}`;

      const dataCache = cacheOngkirRef.current.get(cacheKey);
      if (dataCache && dataCache.length > 0) {
        setOpsiKurir(dataCache);
        setErrorLogistik(null);
        setKurirTerpilih((prev) => {
          if (!prev) return dataCache[0];
          const tetapCocok = dataCache.find(
            (k) => k.kodeKurir === prev.kodeKurir && k.layanan === prev.layanan
          );
          return tetapCocok || dataCache[0];
        });
        return;
      }

      setSedangHitungOngkir(true);
      setErrorLogistik(null);

      try {
        const hasil = await hitungOngkirServerAction({
          kodePosTujuan: kodePos,
          latitude: activeCoords?.latitude,
          longitude: activeCoords?.longitude,
          items: itemDaftar.map((i) => ({
            varianId: i.varianId,
            jumlah: i.jumlah,
          })),
        });

        if (hasil.sukses && hasil.opsiKurir.length > 0) {
          cacheOngkirRef.current.set(cacheKey, hasil.opsiKurir);
          setOpsiKurir(hasil.opsiKurir);
          setErrorLogistik(null);
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
          setErrorLogistik(
            hasil.pesan ||
              "Layanan pengiriman tidak ditemukan untuk kode pos tujuan ini. Silakan periksa kembali."
          );
        }
      } catch (err) {
        console.error("Gagal menghitung ongkir server:", err);
        setErrorLogistik(
          "Kendala koneksi ke server logistik Biteship. Silakan coba kembali."
        );
      } finally {
        setSedangHitungOngkir(false);
      }
    },
    [koordinat]
  );

  // 3. Pre-fill Alamat Tersimpan dari Database untuk Pengguna Terotentikasi
  useEffect(() => {
    if (session?.user) {
      ambilAlamatTersimpanAction()
        .then((res) => {
          if (res.sukses && res.alamat) {
            form.reset({
              namaLengkap: res.alamat.namaLengkap || session.user.name || "",
              email: res.alamat.email || session.user.email || "",
              telepon: res.alamat.telepon || "",
              alamatLengkap: res.alamat.alamatLengkap || "",
              kota: res.alamat.kota || "",
              provinsi: res.alamat.provinsi || "",
              kodePos: res.alamat.kodePos || "",
              catatan: "",
              simpanAlamatSebagaiDefault: true,
            });

            // Jika kode pos tersimpan valid 5 digit, hitung ongkir otomatis
            if (
              res.alamat.kodePos &&
              res.alamat.kodePos.length === 5 &&
              items.length > 0
            ) {
              muatTarifOngkir(res.alamat.kodePos, items, koordinat);
            }
          }
        })
        .catch((err) => {
          console.error("Gagal memuat alamat profil tersimpan:", err);
        });
    }
  }, [session, items, koordinat, form, muatTarifOngkir]);

  // 3. Rekonsiliasi Keranjang Belanja saat Pertama Kali Checkout Dimuat
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
        }
      })
      .catch((err) => {
        console.error("Gagal rekonsiliasi checkout:", err);
      })
      .finally(() => {
        setSedangMemuat(false);
      });
  }, []);


  // Watch input kodePos dengan Debounce 400ms
  const kodePosValue = form.watch("kodePos");
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (
      kodePosValue &&
      kodePosValue.length === 5 &&
      /^[0-9]+$/.test(kodePosValue) &&
      items.length > 0
    ) {
      debounceTimerRef.current = setTimeout(() => {
        muatTarifOngkir(kodePosValue, items, koordinat);
      }, 400);
    } else if (!kodePosValue || kodePosValue.length < 5) {
      setOpsiKurir([]);
      setKurirTerpilih(null);
      setErrorLogistik(null);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [kodePosValue, items, koordinat, muatTarifOngkir]);

  const cobaHitungUlangOngkir = useCallback(() => {
    const kp = form.getValues("kodePos");
    if (kp && kp.length === 5) {
      muatTarifOngkir(kp, items, koordinat);
    } else {
      toast.error("Masukkan 5 digit kode pos yang valid terlebih dahulu.");
    }
  }, [form, items, koordinat, muatTarifOngkir]);

  // 5. Deteksi Lokasi GPS Browser dengan fallback Geocoding Alamat
  const deteksiLokasiGps = useCallback(async () => {
    setStatusGps("mencari");
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
          };
          setKoordinat(coords);
          setStatusGps("berhasil");
          toast.success("Titik lokasi GPS berhasil disematkan.");
          const kp = form.getValues("kodePos");
          if (kp && kp.length === 5) {
            muatTarifOngkir(kp, items, coords);
          }
        },
        async (error) => {
          console.warn(
            "GPS browser ditolak/gagal, menggunakan geocoding alamat:",
            error.message
          );
          try {
            const formData = form.getValues();
            const query = [
              formData.alamatLengkap,
              formData.kota,
              formData.kodePos,
              "Indonesia",
            ]
              .filter(Boolean)
              .join(", ");
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
              { headers: { "Accept-Language": "id" } }
            );
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const coords = {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
              };
              setKoordinat(coords);
              setStatusGps("berhasil");
              toast.success("Titik koordinat berhasil diselaraskan dari alamat.");
              if (formData.kodePos && formData.kodePos.length === 5) {
                muatTarifOngkir(formData.kodePos, items, coords);
              }
              return;
            }
          } catch (geoErr) {
            console.error("Geocoding fallback gagal:", geoErr);
          }
          setStatusGps("gagal");
          toast.info(
            "Gunakan kode pos untuk layanan reguler jika titik GPS tidak aktif."
          );
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setStatusGps("gagal");
      toast.info("Fitur geolokasi tidak didukung browser ini.");
    }
  }, [form, items, muatTarifOngkir]);

  // 6. Total Biaya
  const subtotal = items.reduce(
    (acc, i) => acc + i.hargaTampilanIdr * i.jumlah,
    0
  );
  const totalOngkir = kurirTerpilih?.tarifIdr || 0;
  const totalDiskon = voucherDiterapkan?.sukses
    ? voucherDiterapkan.potonganIdr
    : 0;
  const totalAkhir = Math.max(0, subtotal - totalDiskon + totalOngkir);

  // 7. Voucher Action Handler
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

  // 8. Order Submission Handler
  async function handleSubmitCheckout(data: DataPengirimanForm) {
    setPesanErrorGlobal(null);

    if (!kurirTerpilih) {
      toast.error("Silakan pilih salah satu opsi kurir pengiriman.");
      return;
    }

    startTransition(async () => {
      try {
        const hasil = await buatPesanan({
          namaLengkap: data.namaLengkap,
          email: data.email,
          telepon: data.telepon,
          alamatLengkap: data.alamatLengkap,
          kota: data.kota,
          provinsi: data.provinsi,
          kodePos: data.kodePos,
          catatan: data.catatan || undefined,
          simpanAlamatSebagaiDefault: data.simpanAlamatSebagaiDefault,
          idempotensiKey: idempotensiKeyRef.current || undefined,
          kodeKurir: kurirTerpilih.kodeKurir,
          layananKurir: kurirTerpilih.layanan,
          latitude: koordinat?.latitude,
          longitude: koordinat?.longitude,
          kodeVoucher: voucherDiterapkan?.sukses
            ? voucherDiterapkan.kode
            : undefined,
          items: items.map((i) => ({
            varianId: i.varianId,
            jumlah: i.jumlah,
          })),
        });

        if (hasil.sukses && hasil.nomorPesanan) {
          kosongkanKeranjang();
          toast.success("Pesanan berhasil dibuat. Mengalihkan ke pembayaran...");
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

  const value: CheckoutContextValue = {
    session,
    sessionLoading,
    items,
    subtotal,
    totalOngkir,
    totalDiskon,
    totalAkhir,
    sedangMemuat,
    pesanNotifikasi,
    form,
    opsiKurir,
    kurirTerpilih,
    setKurirTerpilih,
    sedangHitungOngkir,
    errorLogistik,
    cobaHitungUlangOngkir,
    kategoriKurirAktif,
    setKategoriKurirAktif,
    koordinat,
    statusGps,
    deteksiLokasiGps,
    kodeVoucherInput,
    setKodeVoucherInput,
    voucherDiterapkan,
    sedangValidasiVoucher,
    handleTerapkanVoucher,
    handleHapusVoucher,
    isPending,
    pesanErrorGlobal,
    handleSubmitCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
