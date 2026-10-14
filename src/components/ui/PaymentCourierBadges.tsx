import React from "react";

export interface BadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 text-[10px] px-2 py-0.5",
  md: "h-6 text-xs px-2.5 py-1",
  lg: "h-8 text-sm px-3.5 py-1.5",
};

export function BCABadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Metode Pembayaran BCA"
      className={`inline-flex items-center justify-center font-mono font-bold tracking-widest border border-zinc-700 bg-zinc-900/90 text-zinc-100 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span className="font-extrabold tracking-wider">BCA</span>
    </div>
  );
}

export function MandiriBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Metode Pembayaran Mandiri"
      className={`inline-flex items-center justify-center font-mono font-bold tracking-wider border border-zinc-700 bg-zinc-900/90 text-zinc-100 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span>MANDIRI</span>
    </div>
  );
}

export function BNIBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Metode Pembayaran BNI"
      className={`inline-flex items-center justify-center font-mono font-bold tracking-widest border border-zinc-700 bg-zinc-900/90 text-zinc-100 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span>BNI</span>
    </div>
  );
}

export function BRIBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Metode Pembayaran BRI"
      className={`inline-flex items-center justify-center font-mono font-bold tracking-widest border border-zinc-700 bg-zinc-900/90 text-zinc-100 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span>BRI</span>
    </div>
  );
}

export function QRISBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Metode Pembayaran QRIS"
      className={`inline-flex items-center gap-1.5 justify-center font-mono font-bold tracking-widest border border-zinc-700 bg-zinc-900/90 text-zinc-100 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <svg className="w-3.5 h-3.5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="3" height="3" />
        <rect x="18" y="18" width="3" height="3" />
      </svg>
      <span>QRIS</span>
    </div>
  );
}

export function GoPayBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Metode Pembayaran GoPay"
      className={`inline-flex items-center gap-1 justify-center font-mono font-bold tracking-wider border border-zinc-700 bg-zinc-900/90 text-zinc-100 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block" />
      <span>GOPAY</span>
    </div>
  );
}

export function JNEBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Kurir JNE Express"
      className={`inline-flex items-center justify-center font-mono font-black tracking-widest border border-zinc-700 bg-zinc-900/90 text-zinc-200 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span>JNE</span>
    </div>
  );
}

export function SiCepatBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Kurir SiCepat Ekspres"
      className={`inline-flex items-center justify-center font-mono font-bold tracking-wider border border-zinc-700 bg-zinc-900/90 text-zinc-200 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span>SICEPAT</span>
    </div>
  );
}

export function JNTBadge({ className = "", size = "md" }: BadgeProps) {
  return (
    <div
      aria-label="Kurir J&T Express"
      className={`inline-flex items-center justify-center font-mono font-bold tracking-widest border border-zinc-700 bg-zinc-900/90 text-zinc-200 uppercase select-none transition-colors hover:border-zinc-500 hover:text-white ${sizeClasses[size]} ${className}`}
    >
      <span>J&T</span>
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
