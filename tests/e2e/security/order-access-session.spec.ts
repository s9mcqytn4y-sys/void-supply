import { test, expect } from "@playwright/test";

test.describe("E2E: SEC-05 Token Order Access Session Cookie", () => {
  test("endpoint /access menukarkan query param token ke cookie dan redirect ke URL bersih", async ({ page }) => {
    // Kunjungi endpoint access dengan nomor pesanan dummy dan token
    const response = await page.goto("/pesanan/VOID-TEST-DUMMY/access?token=test-token-123");
    
    // Harus redirect kembali ke rute pesanan tanpa ?token di URL
    expect(page.url()).not.toContain("token=test-token-123");
    expect(page.url()).toContain("/pesanan/VOID-TEST-DUMMY");
  });
});
