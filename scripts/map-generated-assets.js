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
    src: "void_tee_macro_1791476250659.jpg",
    targets: ["void-tee-01-detail.webp"],
  },
  {
    src: "void_acid_wash_tee_1791474291733.jpg",
    targets: ["void-tee-02-front.webp", "void-tee-02-back.webp"],
    detailCrop: "void-tee-02-detail.webp",
  },
  {
    src: "cybernetic_longsleeve_1791474312759.jpg",
    targets: ["cybernetic-ls-01-front.webp", "cybernetic-ls-01-back.webp"],
    detailCrop: "cybernetic-ls-01-detail.webp",
  },
  {
    src: "transmission_zip_hoodie_1791474332582.jpg",
    targets: ["hoodie-zip-front.webp", "hoodie-zip-back.webp"],
  },
  {
    src: "hoodie_zipper_macro_1791476322381.jpg",
    targets: ["hoodie-zip-detail.webp"],
  },
  {
    src: "modular_bomber_jacket_1791474352840.jpg",
    targets: ["bomber-front.webp", "bomber-back.webp"],
  },
  {
    src: "bomber_hardware_macro_1791476353838.jpg",
    targets: ["bomber-detail.webp"],
  },
  {
    src: "tactical_cargo_pants_1791474377062.jpg",
    targets: ["cargo-pants-front.webp", "cargo-pants-back.webp"],
    detailCrop: "cargo-pants-detail.webp",
  },
  {
    src: "relaxed_pleated_trousers_1791474404543.jpg",
    targets: ["pleated-pants-front.webp", "pleated-pants-back.webp"],
    detailCrop: "pleated-pants-detail.webp",
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

    // Pemetaan Foto Standar 4:5
    for (const targetName of item.targets) {
      const destPath = path.join(productsOutDir, targetName);
      await sharp(srcPath)
        .resize(800, 1000, { fit: "cover", position: "center" })
        .webp({ quality: 88 })
        .toFile(destPath);
      console.log(`✓ Berhasil memetakan: ${targetName}`);
    }

    // Pemetaan Foto Detail Makro via Zoom Crop
    if (item.detailCrop) {
      const destDetailPath = path.join(productsOutDir, item.detailCrop);
      const metadata = await sharp(srcPath).metadata();
      const width = metadata.width || 1024;
      const height = metadata.height || 1024;
      const cropW = Math.round(width * 0.5);
      const cropH = Math.round(height * 0.625);
      const left = Math.round((width - cropW) / 2);
      const top = Math.round((height - cropH) / 2.5);

      await sharp(srcPath)
        .extract({ left, top, width: cropW, height: cropH })
        .resize(800, 1000, { fit: "cover" })
        .webp({ quality: 90 })
        .toFile(destDetailPath);
      console.log(`✓ Berhasil memetakan macro detail: ${item.detailCrop}`);
    }
  }

  // Hero Lookbook 16:9
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
