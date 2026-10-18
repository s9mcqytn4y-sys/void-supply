"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface OpsiFilterTab {
  readonly id: string;
  readonly label: string;
  readonly hitungan?: number;
}

interface FilterStatusTabsProps {
  opsi: readonly OpsiFilterTab[];
  paramKunci?: string;
}

export function FilterStatusTabs({
  opsi,
  paramKunci = "status",
}: FilterStatusTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nilaiAktif = searchParams.get(paramKunci) || "semua";

  const handlePilihTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "semua") {
      params.delete(paramKunci);
    } else {
      params.set(paramKunci, id);
    }
    params.delete("page"); // reset pagination ke halaman 1
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      role="tablist"
      aria-label="Filter Status Operasional"
      className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-800 pb-3"
    >
      {opsi.map((tab) => {
        const apakahAktif = nilaiAktif === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={apakahAktif}
            onClick={() => handlePilihTab(tab.id)}
            className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2 font-mono text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white whitespace-nowrap ${
              apakahAktif
                ? "border-white bg-white text-black"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.hitungan === "number" && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold ${
                  apakahAktif ? "bg-black text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.hitungan}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
