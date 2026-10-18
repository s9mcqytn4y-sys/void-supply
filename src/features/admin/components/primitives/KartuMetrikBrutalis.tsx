import type { ReactNode } from "react";

interface KartuMetrikBrutalisProps {
  label: string;
  nilai: string | number;
  keterangan?: string;
  badge?: string;
  warnaAksen?: "default" | "emerald" | "amber" | "rose";
  ikon?: ReactNode;
}

export function KartuMetrikBrutalis({
  label,
  nilai,
  keterangan,
  badge,
  warnaAksen = "default",
  ikon,
}: KartuMetrikBrutalisProps) {
  let aksenBorder = "border-zinc-800";
  let warnaNilai = "text-white";

  if (warnaAksen === "emerald") {
    aksenBorder = "border-emerald-500/30";
    warnaNilai = "text-emerald-400";
  } else if (warnaAksen === "amber") {
    aksenBorder = "border-amber-500/30";
    warnaNilai = "text-amber-400";
  } else if (warnaAksen === "rose") {
    aksenBorder = "border-rose-500/30";
    warnaNilai = "text-rose-400";
  }

  return (
    <div
      className={`border bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700 ${aksenBorder}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
          {label}
        </span>
        {ikon && <div className="text-zinc-500">{ikon}</div>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-mono text-2xl font-bold tracking-tight sm:text-3xl ${warnaNilai}`}>
          {nilai}
        </span>
        {badge && (
          <span className="border border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[9px] text-zinc-300 uppercase">
            {badge}
          </span>
        )}
      </div>

      {keterangan && (
        <p className="mt-2 font-mono text-[11px] text-zinc-500 leading-tight">
          {keterangan}
        </p>
      )}
    </div>
  );
}
