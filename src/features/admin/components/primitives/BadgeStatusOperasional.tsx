interface BadgeStatusOperasionalProps {
  status: string;
  label?: string;
}

export function BadgeStatusOperasional({
  status,
  label,
}: BadgeStatusOperasionalProps) {
  const norm = status.toLowerCase();

  let warnaBadge = "border-zinc-700 bg-zinc-900 text-zinc-300";
  let warnaDot = "bg-zinc-400";
  let teksTampil = label || status.replace(/_/g, " ").toUpperCase();

  if (norm.includes("lunas") || norm.includes("selesai") || norm.includes("delivered") || norm.includes("berhasil")) {
    warnaBadge = "border-emerald-500/30 bg-emerald-950/30 text-emerald-400";
    warnaDot = "bg-emerald-400";
  } else if (norm.includes("menunggu") || norm.includes("pending")) {
    warnaBadge = "border-amber-500/30 bg-amber-950/30 text-amber-400";
    warnaDot = "bg-amber-400 animate-pulse";
  } else if (norm.includes("proses") || norm.includes("diproses") || norm.includes("picking")) {
    warnaBadge = "border-sky-500/30 bg-sky-950/30 text-sky-400";
    warnaDot = "bg-sky-400";
  } else if (norm.includes("kirim") || norm.includes("dikirim") || norm.includes("drop")) {
    warnaBadge = "border-violet-500/30 bg-violet-950/30 text-violet-400";
    warnaDot = "bg-violet-400";
  } else if (norm.includes("batal") || norm.includes("dibatalkan") || norm.includes("kadaluwarsa") || norm.includes("gagal") || norm.includes("rusak")) {
    warnaBadge = "border-rose-500/30 bg-rose-950/30 text-rose-400";
    warnaDot = "bg-rose-400";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${warnaBadge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${warnaDot}`} aria-hidden="true" />
      <span>{teksTampil}</span>
    </span>
  );
}
