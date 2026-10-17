/**
 * @file downloader.mjs
 * @description Robust, stream-oriented asset downloader with exponential backoff retry.
 * Follows /javascript-mastery principles: pure helpers, async/await, proper timeout guards.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Downloads a binary asset from a remote URL with automatic retries and timeout protection.
 * @param {string} url - Target resource URL.
 * @param {string} destinationPath - Absolute or relative local path to write.
 * @param {object} [options] - Download configuration.
 * @param {number} [options.maxRetries=3] - Maximum retry attempts upon failure.
 * @param {number} [options.timeoutMs=10000] - Request timeout in milliseconds.
 * @param {Record<string, string>} [options.headers={}] - Optional HTTP headers.
 * @returns {Promise<{ success: boolean; bytesWritten: number; path: string }>}
 */
export async function downloadAsset(url, destinationPath, options = {}) {
  const { maxRetries = 3, timeoutMs = 10000, headers = {} } = options;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "VOID-Supply-Asset-Engine/2.0 (+https://voidsupply.com)",
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText} for URL: ${url}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Pastikan direktori tujuan tersedia
      await mkdir(dirname(destinationPath), { recursive: true });
      await writeFile(destinationPath, buffer);

      return {
        success: true,
        bytesWritten: buffer.byteLength,
        path: destinationPath,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff delay: 500ms, 1000ms, 2000ms...
        const backoffMs = Math.pow(2, attempt - 1) * 500;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw new Error(
    `Gagal mengunduh aset setelah ${maxRetries} percobaan. URL: ${url}. Alasan: ${lastError?.message}`
  );
}

/**
 * Batch download helper using Promise.allSettled to prevent single-failure cascade.
 * @param {Array<{ url: string; path: string }>} tasks
 * @returns {Promise<Array<{ url: string; success: boolean; error?: string }>>}
 */
export async function batchDownloadAssets(tasks) {
  const settled = await Promise.allSettled(
    tasks.map(async (task) => {
      await downloadAsset(task.url, task.path);
      return task.url;
    })
  );

  return settled.map((result, idx) => ({
    url: tasks[idx].url,
    success: result.status === "fulfilled",
    error: result.status === "rejected" ? result.reason?.message : undefined,
  }));
}
