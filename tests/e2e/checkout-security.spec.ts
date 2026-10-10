import { test, expect } from "@playwright/test";

test.describe("E2E: Validasi Keamanan & Aksesibilitas Checkout (Module 02.15)", () => {
  test.beforeEach(async ({ page }) => {
    // Siapkan item di dalam keranjang belanja melalui alur pengguna nyata (deterministik lintas environment)
    await page.goto("/katalog");
    const kartuProduk = page.locator('article a[href^="/katalog/"]').first();
    await expect(kartuProduk).toBeVisible();
    await kartuProduk.click();

    // Pilih ukuran varian yang tersedia
    const tombolUkuran = page.locator('button[role="radio"]:not([disabled])').first();
    await expect(tombolUkuran).toBeVisible();
    await tombolUkuran.click();

    // Tambahkan artikel ke keranjang
    const tombolTambah = page.locator('button:has-text("TAMBAHKAN KE KERANJANG"), button:has-text("TAMBAH KE KERANJANG")').first();
    await expect(tombolTambah).toBeVisible();
    await tombolTambah.click();

    // Tunggu drawer keranjang terbuka mengonfirmasi penambahan sukses
    await expect(page.locator('text="KERANJANG BELANJA"')).toBeVisible();
  });

  test("menolak pengiriman formulir jika data penerima tidak lengkap", async ({ page }) => {
    await page.goto("/checkout");

    const tombolBayar = page.locator('button:has-text("LANJUT KE PEMBAYARAN")');
    await expect(tombolBayar).toBeVisible();

    // Verifikasi perlindungan keamanan: tombol bayar disabled jika kurir belum dipilih
    await expect(tombolBayar).toBeDisabled();

    // Isi kode pos untuk memicu penghitungan ongkir
    const inputKodePos = page.locator('input[name="kodePos"]');
    await inputKodePos.fill("12730");

    // Form submission validasi jika nama kosong
    const inputNama = page.locator('input[name="namaLengkap"]');
    await inputNama.fill("");
    
    // Verifikasi pesan input required pada level form
    await expect(inputNama).toHaveAttribute("required", "");
  });

  test("elemen formulir memiliki tap target minimal 44px (min-h-11) sesuai pedoman aksesibilitas sentuh", async ({
    page,
  }) => {
    await page.goto("/checkout");

    const inputElements = page.locator('input[type="text"], input[type="email"], input[type="tel"]');
    await expect(inputElements.first()).toBeVisible();
    const count = await inputElements.count();

    for (let i = 0; i < count; i++) {
      const box = await inputElements.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
