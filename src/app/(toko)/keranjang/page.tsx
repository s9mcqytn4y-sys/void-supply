import type { Metadata } from "next";
import { HalamanKeranjang } from "@/features/cart/components/HalamanKeranjang";

export const metadata: Metadata = {
  title: "Keranjang Belanja | VOID Supply",
  description:
    "Daftar artikel pesanan, kuantitas item, kalkulasi berat fisik garmen, dan estimasi biaya belanja busana streetwear VOID Supply.",
};

export default function KeranjangPage() {
  return <HalamanKeranjang />;
}
