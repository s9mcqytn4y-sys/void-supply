export function MarqueeTicker() {
  const items = [
    "VOID SUPPLY CO.",
    "HEAVYWEIGHT 235 - 420 GSM",
    "DROP 04: NIGHT TRANSMISSION",
    "JOHAR BARU, JAKARTA PUSAT (10560)",
    "DOUBLE CHAIN STITCH",
    "ZERO FAST-FASHION",
    "LIMITED EDITION ARCHIVE",
  ];

  return (
    <div
      aria-label="Informasi Berjalan Spesifikasi VOID Supply"
      className="w-full overflow-hidden border-y border-zinc-800 bg-zinc-950 py-2.5"
    >
      <div className="flex w-max animate-marquee space-x-8 hover:[animation-play-state:paused] motion-reduce:animate-none">
        <div className="flex shrink-0 items-center space-x-8 font-mono text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          {items.map((item, idx) => (
            <span key={`ticker-1-${idx}`} className="inline-flex items-center gap-8">
              <span>{item}</span>
              <span className="text-zinc-600">//</span>
            </span>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center space-x-8 font-mono text-xs font-semibold tracking-widest text-zinc-400 uppercase"
        >
          {items.map((item, idx) => (
            <span key={`ticker-2-${idx}`} className="inline-flex items-center gap-8">
              <span>{item}</span>
              <span className="text-zinc-600">//</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
