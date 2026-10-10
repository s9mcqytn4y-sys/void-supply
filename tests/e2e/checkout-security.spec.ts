import { test, expect } from "@playwright/test";

test.describe("E2E: Validasi Keamanan & Aksesibilitas Checkout (Module 02.14)", () => {
  test("menolak pengiriman formulir jika data penerima tidak valid", async ({ page }) => {
    await page.goto("/checkout");

    // Jika form ada (keranjang memiliki item atau form ditampilkan)
    const tombolBayar = page.locator('button:has-text("BAYAR DENGAN MIDTRANS")');
    if (await tombolBayar.isVisible()) {
      // Kosongkan nama lengkap
      const inputNama = page.locator('input[name="namaLengkap"]');
      await inputNama.fill("");

      // Klik bayar
      await tombolBayar.click();

      // Verifikasi pesan in-field error muncul
      await expect(page.locator("#error-namaLengkap, text=/Nama lengkap minimal 3 karakter/")).toBeVisible();
    }
  });

  test("elemen formulir memiliki tap target minimal 44px (min-h-11) sesuai WCAG AA", async ({
    page,
  }) => {
    await page.goto("/checkout");

    const inputElements = page.locator('input[type="text"], input[type="email"], input[type="tel"]');
    const count = await inputElements.count();

    for (let i = 0; i < count; i++) {
      const box = await inputElements.nth(i).boundingBox();
      if (box && box.height > 0) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
