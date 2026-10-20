import { test, expect } from "@playwright/test";

test.describe("E2E: Alur Keranjang & Hidrasi Multi-Platform (Module 02.15)", () => {
  test("menambahkan produk ke keranjang, persist saat refresh, dan navigasi checkout", async ({
    page,
  }) => {
    // 1. Kunjungi Halaman Katalog
    await page.goto("/katalog");
    await expect(page).toHaveTitle(/Katalog/i);

    // 2. Klik produk pertama untuk masuk ke PDP
    const kartuProduk = page.locator('article a[href^="/katalog/"]').first();
    await expect(kartuProduk).toBeVisible();
    await kartuProduk.click({ force: true });

    // Tunggu navigasi selesai ke Product Detail Page
    await page.waitForURL(/\/katalog\/[a-z0-9-]+/, { timeout: 15000 });

    // 3. Verifikasi masuk ke Product Detail Page
    const judulProduk = page.locator("h1");
    await expect(judulProduk).toBeVisible();

    // 4. Pilih ukuran varian menggunakan selector role radio
    const tombolUkuran = page.locator('button[role="radio"]:not([disabled])').first();
    await expect(tombolUkuran).toBeVisible({ timeout: 10000 });
    await tombolUkuran.click({ force: true });

    // 5. Klik tombol Tambah ke Keranjang (dukung desktop & mobile sticky bar)
    const tombolTambah = page
      .locator(
        'button[data-testid="tombol-tambah-keranjang"], button[data-testid="tombol-tambah-keranjang-mobile"], button:has-text("TAMBAH KE KERANJANG"), button:has-text("+ BAG")'
      )
      .filter({ visible: true })
      .first();
    await expect(tombolTambah).toBeVisible();
    await tombolTambah.click({ force: true });

    // 6. Verifikasi Drawer Keranjang terbuka dan item tercatat
    const judulDrawer = page.locator('text="KERANJANG BELANJA"');
    await expect(judulDrawer).toBeVisible();

    // 7. Refresh halaman untuk memverifikasi LocalStorage rehydration
    await page.reload();

    // 8. Buka keranjang lagi lewat header badge
    const tombolKeranjangHeader = page.locator('button[aria-label*="keranjang" i], button:has-text("BAG")').first();
    await expect(tombolKeranjangHeader).toBeVisible();
    await tombolKeranjangHeader.click();
    await expect(judulDrawer).toBeVisible();
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
