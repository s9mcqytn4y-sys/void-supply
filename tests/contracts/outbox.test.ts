import { describe, it, expect, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import { db, outboxPekerjaan } from "@/lib/db";
import {
  tambahTugasOutbox,
  prosesAntreanOutbox,
} from "@/lib/services/outbox.service";
import { GET as handlerCronOutbox } from "@/app/api/cron/proses-outbox/route";

describe("Fase 5: Transactional Outbox Engine & Cron Worker Matrix", () => {
  const CRON_SECRET_TEST = "test_cron_secret_key_void_999";

  beforeAll(() => {
    process.env.ALLOW_PAYMENT_MOCK = "true";
    process.env.CRON_SECRET = CRON_SECRET_TEST;
  });

  it("tambahTugasOutbox menyisipkan entri berstatus 'antre' ke dalam database", async () => {
    let outboxId = "";

    await db.transaction(async (tx) => {
      const tugas = await tambahTugasOutbox(tx, {
        tipePekerjaan: "kirim_email",
        payload: {
          emailPenerima: "outbox-test@voidsupply.test",
          tipe: "konfirmasi_pesanan",
          subjek: "Uji Outbox Insert",
          data: { nomorPesanan: "VOID-TEST-OUTBOX-1" },
        },
      });
      outboxId = tugas.id;
    });

    expect(outboxId).toBeTruthy();

    const [tugasDb] = await db
      .select()
      .from(outboxPekerjaan)
      .where(eq(outboxPekerjaan.id, outboxId))
      .limit(1);

    expect(tugasDb).toBeDefined();
    expect(tugasDb.status).toBe("antre");
    expect(tugasDb.percobaan).toBe(0);
    expect(tugasDb.tipePekerjaan).toBe("kirim_email");
  });

  it("prosesAntreanOutbox mengeksekusi tugas kirim_email dan menandai status 'berhasil'", async () => {
    let outboxId = "";

    await db.transaction(async (tx) => {
      const tugas = await tambahTugasOutbox(tx, {
        tipePekerjaan: "kirim_email",
        payload: {
          emailPenerima: "worker-test@voidsupply.test",
          tipe: "pembayaran_berhasil",
          subjek: "Uji Worker Outbox Execution",
          data: { nomorPesanan: "VOID-TEST-WORKER-1" },
        },
      });
      outboxId = tugas.id;
    });

    const hasil = await prosesAntreanOutbox(10);
    expect(hasil.totalDiproses).toBeGreaterThanOrEqual(1);

    const [tugasDb] = await db
      .select()
      .from(outboxPekerjaan)
      .where(eq(outboxPekerjaan.id, outboxId))
      .limit(1);

    expect(tugasDb.status).toBe("berhasil");
    expect(tugasDb.percobaan).toBeGreaterThanOrEqual(1);
    expect(tugasDb.dieksekusiPada).toBeDefined();
  });

  it("route cron proses-outbox menolak request dengan secret salah (HTTP 401)", async () => {
    const req = new Request("http://localhost:3000/api/cron/proses-outbox", {
      method: "GET",
      headers: {
        Authorization: "Bearer invalid_secret_token",
      },
    });

    const res = await handlerCronOutbox(req);
    expect(res.status).toBe(401);
  });

  it("route cron proses-outbox memproses antrean dengan secret valid (HTTP 200)", async () => {
    const req = new Request("http://localhost:3000/api/cron/proses-outbox", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CRON_SECRET_TEST}`,
      },
    });

    const res = await handlerCronOutbox(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(typeof json.totalDiproses).toBe("number");
  });
});
