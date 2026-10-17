/**
 * @file manifest.mjs
 * @description Catalog manifest generator & integrity verifier.
 * Reads public/assets and creates a machine-verifiable manifest.json.
 */

import { readdir, stat, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

/**
 * Computes SHA-256 hash of a file.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function computeSha256(filePath) {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Scans a directory recursively and indexes all image assets.
 * @param {string} baseDir
 * @param {string} [currentSubdir=""]
 * @returns {Promise<import('./types').CatalogAssetEntry[]>}
 */
export async function scanAssetsDirectory(baseDir, currentSubdir = "") {
  const dirPath = join(baseDir, currentSubdir);
  const items = await readdir(dirPath, { withFileTypes: true });
  const entries = [];

  for (const item of items) {
    const relativePath = currentSubdir ? `${currentSubdir}/${item.name}` : item.name;
    const fullPath = join(baseDir, relativePath);

    if (item.isDirectory()) {
      const nested = await scanAssetsDirectory(baseDir, relativePath);
      entries.push(...nested);
    } else if (item.isFile() && [".webp", ".png", ".jpg", ".jpeg"].includes(extname(item.name).toLowerCase())) {
      const fileStat = await stat(fullPath);
      let width = 0;
      let height = 0;
      let format = extname(item.name).replace(".", "");

      try {
        const metadata = await sharp(fullPath).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;
        format = metadata.format || format;
      } catch {
        // Fallback jika bukan gambar valid
      }

      const hash = await computeSha256(fullPath);

      entries.push({
        id: relativePath.replace(/[\/\\]/g, "-"),
        fileName: item.name,
        filePath: `/assets/${relativePath.replace(/\\/g, "/")}`,
        fileSizeBytes: fileStat.size,
        width,
        height,
        format,
        category: currentSubdir.split("/")[0] || "root",
        sha256: hash,
      });
    }
  }

  return entries;
}

/**
 * Generates and saves public/assets/manifest.json.
 * @param {string} assetsRoot - Absolute path to public/assets
 * @returns {Promise<import('./types').AssetManifest>}
 */
export async function generateAssetManifest(assetsRoot) {
  const assets = await scanAssetsDirectory(assetsRoot);
  const manifest = {
    version: "2.0.0",
    updatedAt: new Date().toISOString(),
    totalAssets: assets.length,
    assets,
  };

  const manifestPath = join(assetsRoot, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  return manifest;
}
