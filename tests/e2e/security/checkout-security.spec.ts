import { test, expect } from "@playwright/test";

test.describe("E2E: Validasi Keamanan & Aksesibilitas Checkout (Module 02.15)", () => {
  test.beforeEach(async ({ page }) => {
    // Siapkan item di dalam keranjang belanja melalui alur pengguna nyata (deterministik lintas environment)
    await page.goto("/katalog");
    const kartuProduk = page.locator('article a[href^="/katalog/"]').first();
    await expect(kartuProduk).toBeVisible();
    await kartuProduk.click({ force: true });

    // Tunggu navigasi selesai ke PDP
    await page.waitForURL(/\/katalog\/[a-z0-9-]+/, { timeout: 15000 });

    // Pilih ukuran varian yang tersedia
    const tombolUkuran = page.locator('button[role="radio"]:not([disabled])').first();
    await expect(tombolUkuran).toBeVisible({ timeout: 10000 });
    await tombolUkuran.click({ force: true });

    // Tambahkan artikel ke keranjang
    const tombolTambah = page.locator('button:has-text("TAMBAHKAN KE KERANJANG"), button:has-text("TAMBAH KE KERANJANG")').first();
    await expect(tombolTambah).toBeVisible();
    await tombolTambah.click({ force: true });

    // Tunggu drawer keranjang terbuka mengonfirmasi penambahan sukses
    await expect(page.locator('text="KERANJANG BELANJA"')).toBeVisible({ timeout: 10000 });
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

  test("berhasil melakukan checkout dan diarahkan ke halaman status pesanan kanonikal", async ({
    page,
  }) => {
    await page.goto("/checkout");

    // Isi formulir pengiriman pembeli
    await page.locator('input[name="namaLengkap"]').fill("Rian Pratama");
    await page.locator('input[name="email"]').fill("rian.trendsetter@voidsupply.test");
    await page.locator('input[name="telepon"]').fill("081298765432");
    await page
      .locator('textarea[name="alamatLengkap"]')
      .fill("Jl. Senopati No. 42, Kebayoran Baru");
    await page.locator('input[name="kota"]').fill("Jakarta Selatan");
    await page.locator('input[name="provinsi"]').fill("DKI Jakarta");
    await page.locator('input[name="kodePos"]').fill("12190");

    // Tunggu opsi kurir muncul dan pilih salah satu
    const opsiKurir = page.locator('label:has(input[name="kurir"])').first();
    await opsiKurir.waitFor({ state: "visible", timeout: 20000 });
    await opsiKurir.scrollIntoViewIfNeeded();
    await opsiKurir.click();

    // Verifikasi tombol submit aktif dan klik
    const tombolBayar = page.locator('button:has-text("LANJUT KE PEMBAYARAN")');
    await expect(tombolBayar).toBeEnabled({ timeout: 15000 });
    await tombolBayar.click();

    // Verifikasi navigasi ke /pesanan/VOID-...
    await expect(page).toHaveURL(/\/pesanan\/VOID-/, { timeout: 20000 });
    await expect(page.locator('text="STATUS: MENUNGGU PEMBAYARAN"')).toBeVisible();
    await expect(
      page.locator('text="BATAS WAKTU SELESAIKAN PEMBAYARAN"')
    ).toBeVisible();
  });
});

