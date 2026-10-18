import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeStatusStorefrontProps {
  status: string;
  label?: string;
  className?: string;
}

export function BadgeStatusStorefront({
  status,
  label,
  className,
}: BadgeStatusStorefrontProps) {
  const norm = status.toLowerCase();

  let warnaBadge = "border-zinc-800 bg-zinc-900/60 text-zinc-300";
  let warnaDot = "bg-zinc-400";
  let teksTampil = label || status.replace(/_/g, " ").toUpperCase();

  if (norm.includes("lunas") || norm.includes("selesai") || norm.includes("delivered") || norm.includes("berhasil")) {
    warnaBadge = "border-emerald-500/40 bg-emerald-950/40 text-emerald-400";
    warnaDot = "bg-emerald-400";
  } else if (norm.includes("menunggu") || norm.includes("pending")) {
    warnaBadge = "border-amber-500/40 bg-amber-950/40 text-amber-400";
    warnaDot = "bg-amber-400 animate-pulse";
  } else if (norm.includes("proses") || norm.includes("diproses")) {
    warnaBadge = "border-sky-500/40 bg-sky-950/40 text-sky-400";
    warnaDot = "bg-sky-400";
  } else if (norm.includes("kirim") || norm.includes("dikirim")) {
    warnaBadge = "border-violet-500/40 bg-violet-950/40 text-violet-400";
    warnaDot = "bg-violet-400";
  } else if (norm.includes("batal") || norm.includes("dibatalkan") || norm.includes("kadaluwarsa") || norm.includes("gagal")) {
    warnaBadge = "border-rose-500/40 bg-rose-950/40 text-rose-400";
    warnaDot = "bg-rose-400";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase",
        warnaBadge,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", warnaDot)} aria-hidden="true" />
      <span>{teksTampil}</span>
    </span>
  );
}
