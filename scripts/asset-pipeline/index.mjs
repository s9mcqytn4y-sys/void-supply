/**
 * @file index.mjs
 * @description Master entrypoint for VOID Supply Asset Pipeline Toolchain.
 */

import { resolve } from "node:path";
import { generateAssetManifest } from "./manifest.mjs";

export * from "./downloader.mjs";
export * from "./converter.mjs";
export * from "./mapper.mjs";
export * from "./manifest.mjs";

async function main() {
  const args = process.argv.slice(2);
  const assetsDir = resolve("public/assets");

  if (args.includes("--manifest") || args.length === 0) {
    console.log("--- Menjalankan Pemindaian Aset & Pembuatan Manifest ---");
    const manifest = await generateAssetManifest(assetsDir);
    console.log(`✓ Selesai mengindeks ${manifest.totalAssets} aset di ${assetsDir}/manifest.json`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("index.mjs")) {
  main().catch(console.error);
}
