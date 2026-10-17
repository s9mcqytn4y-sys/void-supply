import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  selesaikanKonfigurasiEnvironment,
  resetCacheKonfigurasi,
} from "../resolver";

describe("Environment Resolver & Demo Mode Guard Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetCacheKonfigurasi();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    resetCacheKonfigurasi();
    process.env = originalEnv;
  });

  it("berhasil meresolusi konfigurasi default demo mode dengan Midtrans Sandbox dan Biteship Testing", () => {
    process.env.DEMO_MODE = "true";
    process.env.APP_ENV = "staging";
    process.env.MIDTRANS_ENV = "sandbox";
    process.env.BITESHIP_ENV = "test";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/void_supply";

    const config = selesaikanKonfigurasiEnvironment();

    expect(config.demoMode).toBe(true);
    expect(config.appEnv).toBe("staging");
    expect(config.midtrans.isProduction).toBe(false);
    expect(config.biteship.isProduction).toBe(false);
    expect(config.biteship.webhookHeaderKey).toBe("x-void-biteship-secret");
  });

  it("menolak eksekusi dan melempar error jika DEMO_MODE aktif namun MIDTRANS_ENV disetel ke production", () => {
    process.env.DEMO_MODE = "true";
    process.env.MIDTRANS_ENV = "production";

    expect(() => selesaikanKonfigurasiEnvironment()).toThrowError(
      "DEMO_MODE hanya boleh menggunakan Midtrans Sandbox dan Biteship Testing."
    );
  });

  it("menolak eksekusi dan melempar error jika DEMO_MODE aktif namun BITESHIP_ENV disetel ke production", () => {
    process.env.DEMO_MODE = "true";
    process.env.BITESHIP_ENV = "production";

    expect(() => selesaikanKonfigurasiEnvironment()).toThrowError(
      "DEMO_MODE hanya boleh menggunakan Midtrans Sandbox dan Biteship Testing."
    );
  });

  it("mendukung BITESHIP_ENV=test secara konsisten sebagai mode non-produksi", () => {
    process.env.DEMO_MODE = "false";
    process.env.APP_ENV = "staging";
    process.env.BITESHIP_ENV = "test";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/void_supply";

    const config = selesaikanKonfigurasiEnvironment();
    expect(config.biteship.isProduction).toBe(false);
  });

  it("melempar error jika DATABASE_URL tidak dikonfigurasi pada deployment Vercel/staging non-CI", () => {
    process.env.CI = "false";
    process.env.VERCEL = "1";
    process.env.APP_ENV = "staging";
    delete process.env.DATABASE_URL;

    expect(() => selesaikanKonfigurasiEnvironment()).toThrowError(
      "DATABASE_URL wajib dikonfigurasi dan tidak boleh kosong pada staging/production Vercel."
    );
  });

  it("membaca BITESHIP_WEBHOOK_HEADER_KEY dan BITESHIP_WEBHOOK_SECRET khusus", () => {
    process.env.DEMO_MODE = "true";
    process.env.BITESHIP_WEBHOOK_HEADER_KEY = "x-custom-biteship-auth";
    process.env.BITESHIP_WEBHOOK_SECRET = "super-secret-token-123";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/void_supply";

    const config = selesaikanKonfigurasiEnvironment();
    expect(config.biteship.webhookHeaderKey).toBe("x-custom-biteship-auth");
    expect(config.biteship.webhookSecret).toBe("super-secret-token-123");
  });
});
