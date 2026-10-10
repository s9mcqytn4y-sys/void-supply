import { test, expect } from "@playwright/test";

test.describe("E2E: Validasi Keamanan & Aksesibilitas Checkout (Module 02.15)", () => {
  test.beforeEach(async ({ page }) => {
    // Siapkan item di dalam keranjang belanja menggunakan LocalStorage
    await page.goto("/katalog");
    await page.evaluate(() => {
      const dummyCart = {
        state: {
          items: [
            {
              varianId: "67224465-cf89-4022-ac5b-5ea21de9c08a",
              produkId: "71f0bb88-693e-4d70-8e05-969d1a1fff01",
              nama: "Void Heavyweight Oversized Tee 01",
              slug: "void-heavyweight-tee-01",
              gambar: "/images/products/drop-04/void-tee-01-front.webp",
              sku: "VOID-D04-TEE-BLK-S",
              ukuran: "S",
              warna: "Hitam",
              hargaTampilanIdr: 389000,
              jumlah: 1,
            },
          ],
          apakahBuka: false,
          apakahHydrated: true,
          sedangRekonsiliasi: false,
          terakhirDiubah: Date.now(),
        },
        version: 1,
      };
      localStorage.setItem("void-supply-cart", JSON.stringify(dummyCart));
    });
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
