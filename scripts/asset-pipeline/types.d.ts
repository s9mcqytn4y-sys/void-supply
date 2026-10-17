/**
 * @file types.d.ts
 * @description Type definitions for VOID Supply Asset Processing Pipeline
 */

export interface AssetDownloadTask {
  name: string;
  url: string;
  category: "payment" | "shipping" | "product" | "lookbook" | "brand";
  targetFormat?: "webp" | "png" | "jpg";
}

export interface ImageProcessOptions {
  width?: number;
  height?: number;
  quality?: number;
  aspectRatio?: "4:5" | "16:9" | "1:1" | "original";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  greyscale?: boolean;
}

export interface CatalogAssetEntry {
  id: string;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  format: string;
  category: string;
  sha256?: string;
}

export interface AssetManifest {
  version: string;
  updatedAt: string;
  totalAssets: number;
  assets: CatalogAssetEntry[];
}
