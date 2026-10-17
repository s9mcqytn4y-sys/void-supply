/**
 * @file converter.mjs
 * @description Standardized image processing engine using sharp.
 * Converts raw source images into high-performance, responsive WebP assets.
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Standard preset dimensions and compression settings for VOID Supply.
 */
export const ASSET_PRESETS = Object.freeze({
  /** 4:5 Studio Portrait for Catalog Items */
  PRODUCT_CARD: {
    width: 800,
    height: 1000,
    quality: 88,
    fit: "cover",
    position: "center",
  },
  /** 16:9 Lookbook & Editorial Campaign Banner */
  LOOKBOOK_HERO: {
    width: 1920,
    height: 1080,
    quality: 90,
    fit: "cover",
    position: "center",
  },
  /** 1:1 Macro Fabric & Texture Detail */
  MACRO_DETAIL: {
    width: 1000,
    height: 1000,
    quality: 90,
    fit: "cover",
    position: "center",
  },
  /** Transparent Bank/Courier Badge */
  BADGE_TRANSPARENT: {
    width: 240,
    height: 80,
    quality: 92,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
});

/**
 * Processes an input image buffer or file into optimized WebP.
 * @param {string | Buffer} input - Path to source image or raw Buffer.
 * @param {string} outputPath - Target destination path (.webp).
 * @param {keyof typeof ASSET_PRESETS | import('./types').ImageProcessOptions} options
 * @returns {Promise<sharp.OutputInfo>}
 */
export async function convertToWebP(input, outputPath, options = "PRODUCT_CARD") {
  const config = typeof options === "string" ? ASSET_PRESETS[options] : options;
  if (!config) {
    throw new Error(`Preset tidak valid atau tidak ditemukan: ${options}`);
  }

  await mkdir(dirname(outputPath), { recursive: true });

  let pipeline = sharp(input);

  if (config.width || config.height) {
    pipeline = pipeline.resize(config.width, config.height, {
      fit: config.fit || "cover",
      position: config.position || "center",
      background: config.background,
    });
  }

  if (config.greyscale) {
    pipeline = pipeline.greyscale();
  }

  return pipeline
    .webp({
      quality: config.quality || 88,
      effort: 6,
      lossless: false,
    })
    .toFile(outputPath);
}

/**
 * Extracts a center-zoomed detail crop for fabric texture.
 * @param {string | Buffer} input
 * @param {string} outputPath
 * @param {number} [zoomFactor=0.5]
 * @returns {Promise<sharp.OutputInfo>}
 */
export async function generateMacroCrop(input, outputPath, zoomFactor = 0.5) {
  const meta = await sharp(input).metadata();
  const width = meta.width || 1024;
  const height = meta.height || 1024;

  const cropW = Math.round(width * zoomFactor);
  const cropH = Math.round(height * (zoomFactor * 1.25));
  const left = Math.round((width - cropW) / 2);
  const top = Math.round((height - cropH) / 2);

  await mkdir(dirname(outputPath), { recursive: true });

  return sharp(input)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(800, 1000, { fit: "cover" })
    .webp({ quality: 90, effort: 6 })
    .toFile(outputPath);
}
