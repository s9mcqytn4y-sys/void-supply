"use client";

export function TombolCetakResi() {
  return (
    <div className="flex gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
      >
        CETAK LABEL RESI (100x150 mm)
      </button>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex min-h-11 items-center justify-center border border-neutral-700 bg-neutral-900 px-6 font-mono text-xs font-bold text-white uppercase transition-colors hover:border-white"
      >
        KEMBALI
      </button>
    </div>
  );
}
