import { test, expect } from "@playwright/test";

test.describe("Fase 3: Master Shopper Journey & Storefront UX E2E", () => {
  test("menjalankan alur lengkap dari pencarian katalog, kalkulator postur ukuran, halaman keranjang, hingga status pesanan", async ({
    page,
  }) => {
    // 1. DISCOVERY & FILTER DI KATALOG (/katalog)
    await page.goto("/katalog");
    await expect(page).toHaveTitle(/Katalog/i);

    // Verifikasi elemen toolbar pencarian & kategori
    const inputCari = page.locator("#pencarian-katalog");
    await expect(inputCari).toBeVisible();

    // Uji live filter kategori tab T-SHIRT
    const tabTshirt = page.locator('button:has-text("T-SHIRT")');
    await expect(tabTshirt).toBeVisible();
    await tabTshirt.click();

    // Uji live debounced search
    await inputCari.fill("Heavyweight");
    await page.waitForTimeout(400); // Tunggu debounce 300ms

    // 2. NAVIGASI KE PDP
    const kartuProduk = page.locator('article a[href^="/katalog/"]').first();
    await expect(kartuProduk).toBeVisible();
    await kartuProduk.click({ force: true });

    // Tunggu navigasi selesai ke Product Detail Page
    await page.waitForURL(/\/katalog\/[a-z0-9-]+/, { timeout: 15000 });

    // 3. SIZE CONFIDENCE MODAL & KALKULATOR POSTUR
    const tombolPanduanUkuran = page.locator('button:has-text("PANDUAN UKURAN (CM)")');
    await expect(tombolPanduanUkuran).toBeVisible({ timeout: 15000 });
    await tombolPanduanUkuran.click();

    // Verifikasi modal terbuka
    const dialogPanduan = page.locator('[role="dialog"][aria-labelledby="judul-panduan-ukuran"]');
    await expect(dialogPanduan).toBeVisible();

    // Buka tab Kalkulator Postur (AI Fit)
    const tabKalkulator = dialogPanduan.locator('button:has-text("KALKULATOR POSTUR")');
    await expect(tabKalkulator).toBeVisible();
    await tabKalkulator.click();

    // Klik tombol Terapkan Ukuran
    const tombolTerapkan = dialogPanduan.locator('button:has-text("TERAPKAN UKURAN")');
    await expect(tombolTerapkan).toBeVisible();
    await tombolTerapkan.click();

    // Verifikasi modal otomatis tertutup
    await expect(dialogPanduan).toBeHidden();

    // 4. TAMBAH KE KERANJANG (dukung desktop & mobile sticky bar)
    const tombolTambahKeranjang = page
      .locator(
        'button[data-testid="tombol-tambah-keranjang"], button[data-testid="tombol-tambah-keranjang-mobile"], button:has-text("TAMBAH KE KERANJANG"), button:has-text("+ BAG")'
      )
      .filter({ visible: true })
      .first();
    await expect(tombolTambahKeranjang).toBeVisible();
    await tombolTambahKeranjang.click();

    // 5. DRAWER KERANJANG & NAVIGASI KE /keranjang
    const judulDrawer = page.locator('text="KERANJANG BELANJA"').first();
    await expect(judulDrawer).toBeVisible();

    const linkKeranjangLengkap = page.locator('a:has-text("LIHAT KERANJANG LENGKAP")');
    await expect(linkKeranjangLengkap).toBeVisible();
    await linkKeranjangLengkap.click();

    // 6. HALAMAN KERANJANG RESMI (/keranjang)
    await expect(page).toHaveURL(/\/keranjang/);
    await expect(page.locator("h1:has-text('KERANJANG BELANJA')")).toBeVisible();

    // Verifikasi indikator berat logistik
    const indikatorBerat = page.locator("text=ESTIMASI BERAT LOGISTIK");
    await expect(indikatorBerat).toBeVisible();

    // Verifikasi tombol lanjut ke checkout
    const tombolKeCheckout = page.locator('a:has-text("LANJUT KE CHECKOUT")');
    await expect(tombolKeCheckout).toBeVisible();
    await tombolKeCheckout.scrollIntoViewIfNeeded();
    await tombolKeCheckout.click({ force: true });

    // 7. HALAMAN CHECKOUT (/checkout)
    await expect(page).toHaveURL(/\/checkout/);

    // Verifikasi tidak ada horizontal overflow pada layout (Anti-Slop R-03)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
