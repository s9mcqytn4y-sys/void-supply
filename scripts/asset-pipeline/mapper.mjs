/**
 * @file mapper.mjs
 * @description Asset distribution and structured renaming mapper.
 * Enforces standardized naming conventions: [brand]-[category]-[model]-[view]-[colorway].[ext]
 */

import { readdir, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { convertToWebP, generateMacroCrop } from "./converter.mjs";

/**
 * Normalizes an arbitrary filename into VOID Supply canonical format.
 * @param {object} params
 * @param {string} params.category - e.g. 'tee', 'hoodie', 'outerwear', 'pants', 'acc'
 * @param {string} params.model - e.g. 'heavyweight', 'acid-wash', 'zip'
 * @param {'front' | 'back' | 'detail' | 'lookbook' | 'swatch'} params.view
 * @param {string} [params.colorway='default'] - e.g. 'washed-black', 'phantom-charcoal', 'raw-olive'
 * @returns {string} e.g. 'void-tee-heavyweight-front-washed-black.webp'
 */
export function buildCanonicalFilename({ category, model, view, colorway = "default" }) {
  const cleanCategory = category.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanModel = model.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const cleanColor = colorway.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `void-${cleanCategory}-${cleanModel}-${view}-${cleanColor}.webp`;
}

/**
 * Maps a single visual asset into front, back, and macro crops.
 * @param {string} sourceFile - Absolute path to source image
 * @param {string} targetDir - Directory where webp files will be placed
 * @param {object} meta - Asset metadata
 */
export async function mapApparelAsset(sourceFile, targetDir, meta) {
  const frontName = buildCanonicalFilename({ ...meta, view: "front" });
  const backName = buildCanonicalFilename({ ...meta, view: "back" });
  const detailName = buildCanonicalFilename({ ...meta, view: "detail" });

  const frontPath = join(targetDir, frontName);
  const backPath = join(targetDir, backName);
  const detailPath = join(targetDir, detailName);

  // Generate 4:5 Front View
  await convertToWebP(sourceFile, frontPath, "PRODUCT_CARD");

  // Generate 4:5 Back View (with slight tonal offset or dedicated source)
  await convertToWebP(sourceFile, backPath, "PRODUCT_CARD");

  // Generate 1:1 / 4:5 Macro Crop
  await generateMacroCrop(sourceFile, detailPath, 0.45);

  return { frontPath, backPath, detailPath };
}
