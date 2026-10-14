"use client";

export function TombolCetakFaktur() {
  return (
    <div className="flex items-center gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-neutral-200"
      >
        CETAK / SIMPAN SEBAGAI PDF
      </button>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex min-h-11 items-center justify-center border border-neutral-800 bg-neutral-900 px-6 font-mono text-xs text-neutral-300 uppercase transition-colors hover:border-neutral-700 hover:text-white"
      >
        KEMBALI
      </button>
    </div>
  );
}
