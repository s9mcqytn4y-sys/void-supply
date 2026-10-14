import { Page, expect } from "@playwright/test";

/**
 * Helper terpusat Playwright untuk menyiapkan alur keranjang belanja
 */
export async function addSampleProductToCart(page: Page): Promise<void> {
  await page.goto("/katalog");
  const kartuProduk = page.locator('article a[href^="/katalog/"]').first();
  await expect(kartuProduk).toBeVisible();
  await kartuProduk.click({ force: true });

  const tombolUkuran = page.locator('button[role="radio"]:not([disabled])').first();
  await expect(tombolUkuran).toBeVisible();
  await tombolUkuran.click({ force: true });

  const tombolTambah = page.locator('button:has-text("TAMBAHKAN KE KERANJANG"), button:has-text("TAMBAH KE KERANJANG")').first();
  await expect(tombolTambah).toBeVisible();
  await tombolTambah.click({ force: true });

  await expect(page.locator('text="BAG BELANJA", text="KERANJANG BELANJA"')).toBeVisible();
}
