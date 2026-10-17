import React from "react";
import Image from "next/image";

export interface BadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const containerSizeClasses = {
  sm: "h-6 px-2 py-0.5",
  md: "h-8 px-2.5 py-1",
  lg: "h-10 px-3.5 py-1.5",
};

const imageDimensions = {
  sm: { height: 16, width: 44 },
  md: { height: 20, width: 56 },
  lg: { height: 24, width: 68 },
};

export function BCABadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Metode Pembayaran BCA"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/payment/bca.webp"
          alt="BCA"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function MandiriBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Metode Pembayaran Mandiri"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/payment/mandiri.webp"
          alt="Mandiri"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function BNIBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Metode Pembayaran BNI"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/payment/bni.webp"
          alt="BNI"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function BRIBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Metode Pembayaran BRI"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/payment/bri.webp"
          alt="BRI"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function QRISBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Metode Pembayaran QRIS"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/payment/qris.webp"
          alt="QRIS"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function GoPayBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Metode Pembayaran GoPay"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/payment/gopay.webp"
          alt="GoPay"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function JNEBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Kurir JNE Express"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/shipping/jne.webp"
          alt="JNE"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function SiCepatBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Kurir SiCepat Ekspres"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/shipping/sicepat.webp"
          alt="SiCepat"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function JNTBadge({ className = "", size = "md" }: BadgeProps) {
  const dim = imageDimensions[size];
  return (
    <div
      aria-label="Kurir J&T Express"
      className={`inline-flex items-center justify-center border border-zinc-800 bg-zinc-950/90 select-none transition-all duration-200 hover:border-zinc-500 ${containerSizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center grayscale contrast-125 opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-200">
        <Image
          src="/assets/shipping/jnt.webp"
          alt="J&T Express"
          width={dim.width}
          height={dim.height}
          className="object-contain max-h-4 w-auto"
        />
      </div>
    </div>
  );
}

export function PaymentLogosRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Daftar Metode Pembayaran yang Didukung">
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
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Daftar Mitra Logistik Resmi">
      <JNEBadge size="sm" />
      <SiCepatBadge size="sm" />
      <JNTBadge size="sm" />
    </div>
  );
}
