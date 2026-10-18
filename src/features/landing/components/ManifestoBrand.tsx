export function ManifestoBrand() {
  return (
    <section
      id="manifesto"
      aria-label="Manifesto Merek VOID Supply"
      className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl text-center">
        <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
          VOID SUPPLY // FILOSOFI OPERASIONAL
        </span>
        <h2 className="mt-3 font-mono text-2xl font-black tracking-tight text-white uppercase sm:text-4xl">
          TANPA GIMMICK. HANYA MATERIAL BERMUTU TINGGI.
        </h2>
        <p className="mt-6 text-xs leading-relaxed text-zinc-300 sm:text-sm">
          Kami menolak fast-fashion yang lekas rusak. Setiap helai artikel VOID Supply dirancang
          dengan spesifikasi gramasi kain nyata, jahitan rantai berulang, dan ketahanan uji pakai
          panjang. Tidak ada testimoni rekaan, tidak ada klaim kosong.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-700">
            <span className="font-mono text-xs font-semibold text-zinc-400">01 // GSM NYATA</span>
            <h3 className="mt-2 font-mono text-base font-bold text-white uppercase">235 : 420 GSM</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Katun combed 16s berbobot mantap serta fleece rajut rapat anti susut setelah pencucian.
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-700">
            <span className="font-mono text-xs font-semibold text-zinc-400">02 // EDISI TERBATAS</span>
            <h3 className="mt-2 font-mono text-base font-bold text-white uppercase">KUOTA TERKONTROL</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Penyusunan kurasi rilis edisi terbatas dengan kuota produksi terkontrol pada setiap artikel.
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-700">
            <span className="font-mono text-xs font-semibold text-zinc-400">03 // TRANSPARANSI</span>
            <h3 className="mt-2 font-mono text-base font-bold text-white uppercase">UKURAN PRESISI</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Tabel ukuran riil dalam sentimeter dengan panduan fitting terstandarisasi untuk kenyamanan Anda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
