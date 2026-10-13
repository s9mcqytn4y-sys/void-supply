import sharp from "sharp";
import fs from "fs";
import path from "path";

async function run() {
  const iconSvgPath = path.resolve("public/icon.svg");
  const faviconIcoPath = path.resolve("public/favicon.ico");
  const ogCardPath = path.resolve("public/images/brand/void-og-image.jpg");

  const svgContent = fs.readFileSync(iconSvgPath);

  // 1. Generate Favicon (32x32 png container for .ico)
  await sharp(svgContent)
    .resize(32, 32)
    .png()
    .toFile(faviconIcoPath);
  console.log("✓ Berhasil membuat public/favicon.ico");

  // 2. Generate OpenGraph Banner (1200x630)
  const ogSvg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#080808" />
      <rect x="30" y="30" width="1140" height="570" fill="none" stroke="#222222" stroke-width="2" />
      
      <rect x="30" y="30" width="120" height="4" fill="#ffffff" />
      <rect x="1050" y="596" width="120" height="4" fill="#ffffff" />

      <g transform="translate(100, 160)">
        <path d="M0 0 L50 100 L100 0 L75 0 L50 50 L25 0 Z" fill="#ffffff" />
      </g>

      <text x="230" y="210" font-family="monospace" font-size="20" font-weight="bold" fill="#737373" letter-spacing="4">VOID SUPPLY // MERCHANDISE ARCHIVE</text>
      <text x="230" y="270" font-family="monospace" font-size="64" font-weight="900" fill="#ffffff" letter-spacing="-2">DROP 04 : NIGHT TRANSMISSION</text>
      
      <text x="100" y="420" font-family="sans-serif" font-size="24" fill="#a3a3a3">Curated Heavyweight Streetwear. High-Density Combed Cotton 235 GSM &amp; 420 GSM Loopback.</text>
      <text x="100" y="460" font-family="monospace" font-size="16" fill="#525252">NO TESTIMONIAL GIMMICKS // VERIFIED SPECS // ZERO MASS PRODUCTION</text>

      <rect x="100" y="520" width="180" height="40" fill="#ffffff" />
      <text x="190" y="546" font-family="monospace" font-size="14" font-weight="bold" fill="#000000" text-anchor="middle" letter-spacing="2">JAKARTA PUSAT</text>
    </svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 90 })
    .toFile(ogCardPath);
  console.log("✓ Berhasil membuat public/images/brand/void-og-image.jpg");
}

run().catch((err) => {
  console.error("Gagal generate aset:", err);
  process.exit(1);
});
