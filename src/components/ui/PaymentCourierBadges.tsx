import React from "react";
import Image from "next/image";

export interface BadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const badgeVariants = {
  sm: {
    container: "h-7 px-2.5 py-1 rounded-xs",
    imgHeight: 18,
    imgWidth: 52,
  },
  md: {
    container: "h-8 px-3 py-1.5 rounded-xs",
    imgHeight: 22,
    imgWidth: 64,
  },
  lg: {
    container: "h-10 px-4 py-2 rounded-xs",
    imgHeight: 26,
    imgWidth: 76,
  },
};

const baseBadgeClass =
  "inline-flex items-center justify-center bg-white border border-neutral-200 shadow-xs select-none transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-neutral-400";

export function BCABadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Metode Pembayaran Bank Central Asia (BCA)"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/payment/bca.webp"
        alt="BCA"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function MandiriBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Metode Pembayaran Bank Mandiri"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/payment/mandiri.webp"
        alt="Mandiri"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function BNIBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Metode Pembayaran Bank Negara Indonesia (BNI)"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/payment/bni.webp"
        alt="BNI"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function BRIBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Metode Pembayaran Bank Rakyat Indonesia (BRI)"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/payment/bri.webp"
        alt="BRI"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function QRISBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Metode Pembayaran Standar QRIS Nasional"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/payment/qris.webp"
        alt="QRIS"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function GoPayBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Metode Pembayaran Dompet Digital GoPay"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/payment/gopay.webp"
        alt="GoPay"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function JNEBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Mitra Kurir JNE Express"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/shipping/jne.webp"
        alt="JNE"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function SiCepatBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Mitra Kurir SiCepat Ekspres"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/shipping/sicepat.webp"
        alt="SiCepat"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function JNTBadge({ className = "", size = "md" }: BadgeProps) {
  const v = badgeVariants[size];
  return (
    <div
      aria-label="Mitra Kurir J&T Express"
      className={`${baseBadgeClass} ${v.container} ${className}`}
    >
      <Image
        src="/assets/shipping/jnt.webp"
        alt="J&T Express"
        width={v.imgWidth}
        height={v.imgHeight}
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export function PaymentLogosRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 ${className}`}
      aria-label="Daftar Metode Pembayaran yang Didukung"
    >
      <QRISBadge size="sm" />
      <GoPayBadge size="sm" />
      <BCABadge size="sm" />
      <MandiriBadge size="sm" />
      <BNIBadge size="sm" />
      <BRIBadge size="sm" />
    </div>
  );
}

export function CourierLogosRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 ${className}`}
      aria-label="Daftar Mitra Logistik Resmi"
    >
      <JNEBadge size="sm" />
      <SiCepatBadge size="sm" />
      <JNTBadge size="sm" />
    </div>
  );
}
