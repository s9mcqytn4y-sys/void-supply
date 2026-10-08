import sharp from "sharp";
import fs from "fs";
import path from "path";

const brainDir =
  "C:\\Users\\Acer\\.gemini\\antigravity-ide\\brain\\a0c41ab3-8c68-4c90-8b7e-6e54c26a946a";
const productsOutDir = path.resolve("public/images/products/drop-04");
const lookbookOutDir = path.resolve("public/images/lookbook");

const mappings = [
  {
    src: "void_heavyweight_tee_1791474266913.jpg",
    targets: ["void-tee-01-front.webp", "void-tee-01-back.webp"],
  },
  {
    src: "void_acid_wash_tee_1791474291733.jpg",
    targets: ["void-tee-02-front.webp", "void-tee-02-back.webp"],
  },
  {
    src: "cybernetic_longsleeve_1791474312759.jpg",
    targets: ["cybernetic-ls-01-front.webp", "cybernetic-ls-01-back.webp"],
  },
  {
    src: "transmission_zip_hoodie_1791474332582.jpg",
    targets: ["hoodie-zip-front.webp", "hoodie-zip-back.webp"],
  },
  {
    src: "modular_bomber_jacket_1791474352840.jpg",
    targets: ["bomber-front.webp", "bomber-back.webp"],
  },
  {
    src: "tactical_cargo_pants_1791474377062.jpg",
    targets: ["cargo-pants-front.webp", "cargo-pants-back.webp"],
  },
  {
    src: "relaxed_pleated_trousers_1791474404543.jpg",
    targets: ["pleated-pants-front.webp", "pleated-pants-back.webp"],
  },
  {
    src: "utility_balaclava_1791474423113.jpg",
    targets: ["balaclava-front.webp", "balaclava-detail.webp"],
  },
];

async function run() {
  if (!fs.existsSync(productsOutDir)) fs.mkdirSync(productsOutDir, { recursive: true });
  if (!fs.existsSync(lookbookOutDir)) fs.mkdirSync(lookbookOutDir, { recursive: true });

  for (const item of mappings) {
    const srcPath = path.join(brainDir, item.src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`File sumber tidak ditemukan: ${srcPath}`);
      continue;
    }

    for (const targetName of item.targets) {
      const destPath = path.join(productsOutDir, targetName);
      // Resize ke rasio 4:5 tepat (800x1000px) dengan format WebP kualitas 88%
      await sharp(srcPath)
        .resize(800, 1000, { fit: "cover", position: "center" })
        .webp({ quality: 88 })
        .toFile(destPath);
      console.log(`✓ Berhasil memetakan: ${targetName}`);
    }
  }

  // Hero Lookbook
  const heroSrc = path.join(brainDir, "lookbook_night_transmission_1791474442779.jpg");
  if (fs.existsSync(heroSrc)) {
    const heroDest = path.join(lookbookOutDir, "drop-04-editorial-hero.webp");
    await sharp(heroSrc)
      .resize(1920, 1080, { fit: "cover", position: "center" })
      .webp({ quality: 90 })
      .toFile(heroDest);
    console.log(`✓ Berhasil memetakan: drop-04-editorial-hero.webp`);
  }

  console.log("--- Semua gambar generative berhasil dipetakan ke public/ ---");
}

run().catch(console.error);
