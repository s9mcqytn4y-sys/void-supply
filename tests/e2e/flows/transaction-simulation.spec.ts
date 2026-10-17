import { test, expect } from "@playwright/test";

test.describe("Fase 3 Master Regression: Alur UI Transaksi & Simulasi DevTools E2E", () => {
  // Alokasikan batas waktu 90 detik untuk penjelajahan multi-halaman dan kompilasi dev server
  test.setTimeout(90000);

  test("menjalankan penjelajahan menyeluruh dari pemilihan produk katalog hingga simulasi siklus pesanan DevTools", async ({
    page,
  }) => {
    // 1. DISCOVERY & SELEKSI VARIAN DI PDP (/katalog/void-heavyweight-tee-01)
    await page.goto("/katalog/void-heavyweight-tee-01");
    await expect(page).toHaveTitle(/VOID Heavyweight/i);

    // Verifikasi pemilih ukuran aktif
    const tombolUkuranTersedia = page.locator(
      'button[role="radio"]:not([disabled])'
    ).first();
    await expect(tombolUkuranTersedia).toBeVisible({ timeout: 15000 });
    await tombolUkuranTersedia.click({ force: true });

    // Tambahkan artikel ke keranjang
    const tombolTambah = page.locator(
      'button:has-text("TAMBAHKAN KE KERANJANG"), button:has-text("TAMBAH KE KERANJANG")'
    ).first();
    await expect(tombolTambah).toBeVisible();
    await tombolTambah.click({ force: true });

    // Verifikasi drawer keranjang terbuka
    const drawerKeranjang = page.locator('text="KERANJANG BELANJA"').first();
    await expect(drawerKeranjang).toBeVisible({ timeout: 10000 });

    // 2. NAVIGASI KE CHECKOUT (/checkout)
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/checkout/);

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

    // Tunggu opsi penawaran kurir muncul dan pilih kurir pertama
    const opsiKurir = page.locator('[data-testid="opsi-kurir-item"]').first();
    await opsiKurir.waitFor({ state: "visible", timeout: 20000 });
    await opsiKurir.scrollIntoViewIfNeeded();
    await opsiKurir.click();

    // Pastikan tombol submit aktif lalu klik
    const tombolBayar = page.locator('button:has-text("LANJUT KE PEMBAYARAN")');
    await expect(tombolBayar).toBeEnabled({ timeout: 15000 });
    await tombolBayar.click();

    // 3. HALAMAN STATUS PESANAN (/pesanan/[nomorPesanan])
    await expect(page).toHaveURL(/\/pesanan\/VOID-/, { timeout: 30000 });
    const urlPesanan = page.url();

    // Verifikasi status awal: MENUNGGU PEMBAYARAN
    await expect(page.getByText("STATUS: MENUNGGU PEMBAYARAN")).toBeVisible({
      timeout: 15000,
    });

    // Verifikasi komponen In-App Native Payment Viewer
    await expect(
      page.getByText("PEMBAYARAN VIRTUAL ACCOUNT RESMI")
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("TOTAL TAGIHAN TEPAT:")).toBeVisible({
      timeout: 15000,
    });

    // 4. BUKA DEVTOOLS SANDBOX DRAWER
    const tombolDevTools = page.locator('button[aria-label="Buka Sandbox DevTools Drawer"]');
    await expect(tombolDevTools).toBeVisible({ timeout: 10000 });
    await tombolDevTools.click();

    // Verifikasi panel drawer terbuka
    await expect(page.locator('h2:has-text("SANDBOX DEVTOOLS")')).toBeVisible({
      timeout: 10000,
    });

    // 5. SIMULASI AKSI 1: PELUNASAN (SETTLEMENT)
    const tombolLunas = page.locator(
      'button:has-text("1. SIMULASI LUNAS (SETTLEMENT)")'
    );
    await expect(tombolLunas).toBeVisible();
    await tombolLunas.click();

    // Verifikasi perubahan status menjadi DIPROSES
    await expect(page.getByText("STATUS: DIPROSES")).toBeVisible({
      timeout: 20000,
    });

    // 6. VERIFIKASI DOKUMEN FAKTUR RESMI (A4) DENGAN BARCODE CODE128
    const tautanFaktur = page.locator('a:has-text("FAKTUR (A4)")');
    await expect(tautanFaktur).toBeVisible({ timeout: 10000 });
    const hrefFaktur = await tautanFaktur.getAttribute("href");
    expect(hrefFaktur).toBeTruthy();
    await page.goto(hrefFaktur!);

    // Verifikasi halaman faktur termuat dengan teks judul resmi dan barcode Code128
    await expect(page).toHaveURL(/\/pesanan\/VOID-[^/]+\/faktur/);
    await expect(page.getByText("FAKTUR RESMI PEMBELIAN")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("STATUS: LUNAS (PAID)")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("TOTAL PEMBAYARAN:")).toBeVisible();
    const barcodeSvg = page.locator("div.overflow-hidden svg");
    await expect(barcodeSvg).toBeVisible({ timeout: 10000 });

    // 7. KEMBALI KE PESANAN & SIMULASI LOGISTIK BITESHIP
    await page.goto(urlPesanan);
    await expect(page.getByText("STATUS: DIPROSES")).toBeVisible({
      timeout: 15000,
    });

    // Buka DevTools drawer untuk memicu kurir pickup
    await tombolDevTools.click();
    const tombolPickup = page.locator(
      'button:has-text("2. BITESHIP: KURIR PICKUP")'
    );
    await expect(tombolPickup).toBeVisible();
    await tombolPickup.click();

    // Verifikasi status menjadi DIKIRIM
    await expect(page.getByText("STATUS: DIKIRIM")).toBeVisible({
      timeout: 20000,
    });

    // Tutup panel drawer agar interaksi halaman utama tidak terhalang
    const tombolTutupDrawer = page.locator('button:has-text("✕")');
    if (await tombolTutupDrawer.isVisible()) {
      await tombolTutupDrawer.click();
    }

    // 8. DUAL-TRIGGER PROGRESSIVE ACCEPTANCE & GARANSI UNBOXING 2X24 JAM
    // Verifikasi tombol konfirmasi penerimaan barang aktif saat barang dalam status dikirim
    const tombolKonfirmasi = page.locator(
      'button:has-text("KONFIRMASI PESANAN DITERIMA")'
    );
    await expect(tombolKonfirmasi).toBeVisible({ timeout: 15000 });
    await tombolKonfirmasi.click();

    // Verifikasi status transaksi menjadi SELESAI
    await expect(page.getByText("STATUS: SELESAI")).toBeVisible({
      timeout: 20000,
    });

    // Verifikasi kartu garansi purna jual 2x24 jam aktif dengan hitung mundur
    await expect(
      page.getByText("GARANSI PURNA JUAL 2X24 JAM AKTIF")
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("SISA WAKTU KLAIM:")).toBeVisible();
  });
});
