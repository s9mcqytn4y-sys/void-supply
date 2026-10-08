import sharp from "sharp";
import fs from "fs";
import path from "path";

const productImages = [
  { name: "void-tee-01-front.webp", label: "VOID TEE 01 [FRONT]" },
  { name: "void-tee-01-back.webp", label: "VOID TEE 01 [BACK]" },
  { name: "void-tee-02-front.webp", label: "ACID WASH TEE [FRONT]" },
  { name: "void-tee-02-back.webp", label: "ACID WASH TEE [BACK]" },
  { name: "cybernetic-ls-01-front.webp", label: "CYBER LONGSLEEVE [FRONT]" },
  { name: "cybernetic-ls-01-back.webp", label: "CYBER LONGSLEEVE [BACK]" },
  { name: "hoodie-zip-front.webp", label: "ZIP HOODIE [FRONT]" },
  { name: "hoodie-zip-back.webp", label: "ZIP HOODIE [BACK]" },
  { name: "bomber-front.webp", label: "MODULAR BOMBER [FRONT]" },
  { name: "bomber-back.webp", label: "MODULAR BOMBER [BACK]" },
  { name: "cargo-pants-front.webp", label: "CARGO PANTS [FRONT]" },
  { name: "cargo-pants-back.webp", label: "CARGO PANTS [BACK]" },
  { name: "pleated-pants-front.webp", label: "PLEATED TROUSERS [FRONT]" },
  { name: "pleated-pants-back.webp", label: "PLEATED TROUSERS [BACK]" },
  { name: "balaclava-front.webp", label: "BALACLAVA [FRONT]" },
  { name: "balaclava-detail.webp", label: "BALACLAVA [DETAIL]" },
];

async function generate() {
  const dir = path.resolve("public/images/products/drop-04");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const img of productImages) {
    const filePath = path.join(dir, img.name);
    const svg = `
      <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="1000" fill="#121212" />
        <rect x="20" y="20" width="760" height="960" fill="none" stroke="#262626" stroke-width="2" />
        <line x1="20" y1="20" x2="100" y2="20" stroke="#737373" stroke-width="4" />
        <line x1="700" y1="980" x2="780" y2="980" stroke="#737373" stroke-width="4" />
        <text x="400" y="450" font-family="monospace" font-size="28" font-weight="bold" fill="#f5f5f5" text-anchor="middle" letter-spacing="4">VOID SUPPLY</text>
        <text x="400" y="500" font-family="monospace" font-size="16" fill="#a3a3a3" text-anchor="middle" letter-spacing="3">${img.label}</text>
        <text x="400" y="540" font-family="monospace" font-size="12" fill="#525252" text-anchor="middle" letter-spacing="2">DROP 04 // 4:5 PORTRAIT</text>
      </svg>
    `;

    await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(filePath);
  }

  // Lookbook banner
  const heroPath = path.resolve("public/images/lookbook/drop-04-editorial-hero.webp");
  const heroSvg = `
    <svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="900" fill="#0a0a0a" />
      <rect x="40" y="40" width="1520" height="820" fill="none" stroke="#262626" stroke-width="2" />
      <text x="800" y="430" font-family="monospace" font-size="48" font-weight="bold" fill="#f5f5f5" text-anchor="middle" letter-spacing="8">DROP 04: NIGHT TRANSMISSION</text>
      <text x="800" y="490" font-family="monospace" font-size="20" fill="#737373" text-anchor="middle" letter-spacing="4">VOID SUPPLY HIGH-DENSITY STREETWEAR</text>
    </svg>
  `;
  await sharp(Buffer.from(heroSvg)).webp({ quality: 85 }).toFile(heroPath);

  console.log(`✓ Selesai membuat ${productImages.length + 1} aset WebP 4:5 di folder public/`);
}

generate().catch(console.error);
