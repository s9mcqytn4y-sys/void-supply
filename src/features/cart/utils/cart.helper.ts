import { BATAS_MAKSIMAL_PER_SKU } from "../types/cart.type";

export interface ItemNiatBeli {
  varianId: string;
  jumlah: number;
}

/**
 * Domain Helper: Gabungkan Niat Item & Batasi Akumulasi Per SKU (Module 02.15)
 * Menggabungkan entri duplikat yang memiliki varianId sama dan memastikan
 * total akumulasi tidak melebihi batas maksimal 10 unit per SKU.
 */
export function gabungkanNiatItem(items: ItemNiatBeli[]): {
  sukses: boolean;
  itemTergabung: Array<{ varianId: string; jumlah: number }>;
  pesanGalat?: string;
} {
  const akumulasiMap = new Map<string, number>();

  for (const item of items) {
    if (!item.varianId || !Number.isInteger(item.jumlah) || item.jumlah <= 0) {
      return {
        sukses: false,
        itemTergabung: [],
        pesanGalat: "Format item keranjang belanja tidak valid.",
      };
    }

    const jumlahSaatIni = akumulasiMap.get(item.varianId) || 0;
    const jumlahBaru = jumlahSaatIni + item.jumlah;

    if (jumlahBaru > BATAS_MAKSIMAL_PER_SKU) {
      return {
        sukses: false,
        itemTergabung: [],
        pesanGalat: `Akumulasi pemesanan melebihi batas maksimal ${BATAS_MAKSIMAL_PER_SKU} unit per SKU untuk satu artikel.`,
      };
    }

    akumulasiMap.set(item.varianId, jumlahBaru);
  }

  const itemTergabung = Array.from(akumulasiMap.entries()).map(([varianId, jumlah]) => ({
    varianId,
    jumlah,
  }));

  return {
    sukses: true,
    itemTergabung,
  };
}
