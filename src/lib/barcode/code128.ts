/**
 * Generator Barcode Code 128 (Subset B) Murni - Standar Ekspedisi Nasional (JNE, SiCepat, J&T)
 * Menghasilkan representasi vector SVG matematis tajam (203 DPI compatible) tanpa ketergantungan library luar.
 */

// Pola pola bar-space 11-modul untuk tiap karakter Code 128 (0 hingga 106)
// Nilai string merepresentasikan ketebalan bergantian: Bar-Space-Bar-Space-Bar-Space
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"                                // 100-106 (106 = STOP 13 modul)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export interface Code128Options {
  lebarBar?: number; // Ketebalan satu modul bar dalam pixel (default: 1.4 untuk standar label thermal 100mm)
  tinggi?: number;   // Tinggi barcode dalam pixel (default: 60)
  tampilkanTeks?: boolean; // Tampilkan teks di bawah barcode (default: true)
}

/**
 * Mengonversi teks string alfanumerik menjadi barcode Code 128 Subset B SVG.
 */
export function generateCode128Svg(text: string, options: Code128Options = {}): string {
  const { lebarBar = 1.4, tinggi = 60, tampilkanTeks = true } = options;

  if (!text || text.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="${tinggi}"></svg>`;
  }

  // 1. Validasi karakter ASCII 32 - 126
  const cleanText = text.replace(/[^\x20-\x7E]/g, "");

  // 2. Kumpulkan kode nilai karakter
  const codes: number[] = [START_CODE_B];
  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    codes.push(charCode - 32);
  }

  // 3. Hitung Check Digit (Modulo 103)
  let checkSum = START_CODE_B;
  for (let i = 1; i < codes.length; i++) {
    checkSum += codes[i] * i;
  }
  const checkDigit = checkSum % 103;
  codes.push(checkDigit);
  codes.push(STOP_CODE);

  // 4. Hitung lebar total dalam modul (11 per karakter, +2 untuk stop) + quiet zone (10 modul kiri dan kanan)
  const quietZoneModul = 10;
  const totalModul = quietZoneModul * 2 + (codes.length - 1) * 11 + 13;
  const totalLebar = Math.round(totalModul * lebarBar * 10) / 10;
  const totalTinggi = tampilkanTeks ? tinggi + 18 : tinggi;

  // 5. Bangun path atau rect SVG
  let currentX = quietZoneModul * lebarBar;
  const rects: string[] = [];

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) continue;

    let isBar = true;
    for (let j = 0; j < pattern.length; j++) {
      const modulWidth = Math.round(parseInt(pattern[j], 10) * lebarBar * 10) / 10;
      if (isBar) {
        rects.push(`<rect x="${Math.round(currentX * 10) / 10}" y="0" width="${modulWidth}" height="${tinggi}" fill="#000000" />`);
      }
      currentX += modulWidth;
      isBar = !isBar;
    }
  }

  const teksSvg = tampilkanTeks
    ? `<text x="${totalLebar / 2}" y="${tinggi + 14}" font-family="monospace, monospace" font-size="12" font-weight="600" text-anchor="middle" fill="#000000" letter-spacing="1">${cleanText}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalLebar} ${totalTinggi}" width="${totalLebar}" height="${totalTinggi}" style="max-width: 100%; height: auto; background-color: transparent;" preserveAspectRatio="xMidYMid meet">
    ${rects.join("")}
    ${teksSvg}
  </svg>`;
}
