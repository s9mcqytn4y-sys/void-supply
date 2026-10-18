import type { ReactNode } from "react";

export interface KolomTabelAdmin<T> {
  kunci: string;
  label: string;
  rataKanan?: boolean;
  className?: string;
  render: (item: T, index: number) => ReactNode;
}

interface TabelDataAdminProps<T> {
  kolom: KolomTabelAdmin<T>[];
  data: T[];
  sedangMemuat?: boolean;
  pesanKosong?: string;
  kunciUnik?: (item: T, index: number) => string;
}

export function TabelDataAdmin<T>({
  kolom,
  data,
  sedangMemuat = false,
  pesanKosong = "Tidak ada data yang sesuai dengan kriteria pencarian.",
  kunciUnik,
}: TabelDataAdminProps<T>) {
  if (sedangMemuat) {
    return (
      <div className="w-full border border-zinc-800 bg-zinc-950 p-8 text-center">
        <div className="inline-flex items-center gap-3 font-mono text-xs text-zinc-400 uppercase">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>MEMUAT DATA OPERASIONAL...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full border border-zinc-800 bg-zinc-950 p-12 text-center">
        <p className="font-mono text-xs text-zinc-500 uppercase">{pesanKosong}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-zinc-800 bg-zinc-950">
      <table className="w-full border-collapse text-left font-mono text-xs">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] tracking-wider text-zinc-400 uppercase">
            {kolom.map((col) => (
              <th
                key={col.kunci}
                scope="col"
                className={`p-3.5 font-semibold ${
                  col.rataKanan ? "text-right" : "text-left"
                } ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850">
          {data.map((item, rowIdx) => {
            const key = kunciUnik ? kunciUnik(item, rowIdx) : `row-${rowIdx}`;
            return (
              <tr
                key={key}
                className="transition-colors hover:bg-zinc-900/50"
              >
                {kolom.map((col) => (
                  <td
                    key={`${key}-${col.kunci}`}
                    className={`p-3.5 text-zinc-300 align-middle ${
                      col.rataKanan ? "text-right" : "text-left"
                    } ${col.className || ""}`}
                  >
                    {col.render(item, rowIdx)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
