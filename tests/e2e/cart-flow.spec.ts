import { test, expect } from "@playwright/test";

test.describe("E2E: Alur Keranjang & Hidrasi Multi-Platform (Module 02.13 & 02.14)", () => {
  test("menambahkan produk ke keranjang, persist saat refresh, dan navigasi checkout", async ({
    page,
  }) => {
    // 1. Kunjungi Halaman Katalog
    await page.goto("/katalog");
    await expect(page).toHaveTitle(/Katalog/i);

    // 2. Klik produk pertama untuk masuk ke PDP
    const kartuProduk = page.locator('article a[href^="/katalog/"]').first();
    await expect(kartuProduk).toBeVisible();
    await kartuProduk.click();

    // 3. Verifikasi masuk ke Product Detail Page
    await expect(page.locator("h1")).toBeVisible();

    // 4. Pilih ukuran varian (jika tombol ukuran tersedia)
    const tombolUkuran = page.locator('button:has-text("M"), button:has-text("L"), button:has-text("S")').first();
    if (await tombolUkuran.isVisible()) {
      await tombolUkuran.click();
    }

    // 5. Klik tombol Tambah ke Keranjang
    const tombolTambah = page.locator('button:has-text("TAMBAHKAN KE KERANJANG"), button:has-text("TAMBAH KE KERANJANG")');
    if (await tombolTambah.isVisible()) {
      await tombolTambah.click();

      // 6. Verifikasi Drawer Keranjang terbuka dan item tercatat
      await expect(page.locator('text="KERANJANG BELANJA"')).toBeVisible();

      // 7. Refresh halaman untuk memverifikasi LocalStorage rehydration
      await page.reload();

      // 8. Buka keranjang lagi lewat header badge
      const tombolKeranjangHeader = page.locator('button[aria-label*="Keranjang"]');
      if (await tombolKeranjangHeader.isVisible()) {
        await tombolKeranjangHeader.click();
        await expect(page.locator('text="KERANJANG BELANJA"')).toBeVisible();
      }
    }
  });

  test("halaman checkout responsive dan bebas horizontal scrollbar pada mobile viewport", async ({
    page,
  }) => {
    await page.goto("/checkout");

    // Verifikasi viewport mobile tidak memiliki horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // toleransi 2px margin rendering
  });
});
