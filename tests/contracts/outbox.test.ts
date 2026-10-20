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

  it("failure injection: tugas dengan tipe tidak dikenal gagal dan mencatat pesan kesalahan", async () => {
    const [tugas] = await db
      .insert(outboxPekerjaan)
      .values({
        tipePekerjaan: "tipe_pekerjaan_palsu_failure_injection",
        payload: { test: true },
        status: "antre",
        percobaan: 0,
        maksimalPercobaan: 3,
      })
      .returning({ id: outboxPekerjaan.id });

    const hasil = await prosesAntreanOutbox(10);
    expect(hasil.totalGagal).toBeGreaterThanOrEqual(1);

    const [tugasDb] = await db
      .select()
      .from(outboxPekerjaan)
      .where(eq(outboxPekerjaan.id, tugas.id))
      .limit(1);

    expect(tugasDb).toBeDefined();
    expect(tugasDb.status).toBe("gagal");
    expect(tugasDb.percobaan).toBe(1);
    expect(tugasDb.pesanKesalahan).toContain("tidak dikenali");
  });

  it("dead-letter queue: tugas yang mencapai batas maksimal percobaan tidak lagi diproses", async () => {
    const [tugasDlq] = await db
      .insert(outboxPekerjaan)
      .values({
        tipePekerjaan: "kirim_email",
        payload: { emailPenerima: "dlq@test.com" },
        status: "gagal",
        percobaan: 5,
        maksimalPercobaan: 5,
        pesanKesalahan: "Kegagalan permanen sebelumnya",
      })
      .returning({ id: outboxPekerjaan.id });

    // Jalankan antrean outbox
    await prosesAntreanOutbox(10);

    const [tugasDb] = await db
      .select()
      .from(outboxPekerjaan)
      .where(eq(outboxPekerjaan.id, tugasDlq.id))
      .limit(1);

    expect(tugasDb.status).toBe("gagal");
    expect(tugasDb.percobaan).toBe(5);
  });

  it("lease reaper: memulihkan tugas 'diproses' yang kedaluwarsa kembali ke status antre", async () => {
    const sepuluhMenitLalu = new Date(Date.now() - 10 * 60 * 1000);

    const [tugasStuck] = await db
      .insert(outboxPekerjaan)
      .values({
        tipePekerjaan: "kirim_email",
        payload: {
          emailPenerima: "reaper-recovery@voidsupply.test",
          tipe: "konfirmasi_pesanan",
          subjek: "Uji Reaper Recovery",
          data: { nomorPesanan: "VOID-REAPER-1" },
        },
        status: "diproses",
        percobaan: 1,
        maksimalPercobaan: 5,
        diperbaruiPada: sepuluhMenitLalu,
      })
      .returning({ id: outboxPekerjaan.id });

    // Saat prosesAntreanOutbox dipanggil, lease reaper aktif membersihkan tugas stuck
    await prosesAntreanOutbox(10);

    const [tugasDb] = await db
      .select()
      .from(outboxPekerjaan)
      .where(eq(outboxPekerjaan.id, tugasStuck.id))
      .limit(1);

    // Tugas dipulihkan dan berhasil dieksekusi atau berstatus berhasil
    expect(["antre", "berhasil"]).toContain(tugasDb.status);
  });

  it("lease reaper dead-letter: tugas 'diproses' yang kedaluwarsa dan melampaui kuota percobaan ditandai 'gagal'", async () => {
    const sepuluhMenitLalu = new Date(Date.now() - 10 * 60 * 1000);

    const [tugasExhausted] = await db
      .insert(outboxPekerjaan)
      .values({
        tipePekerjaan: "kirim_email",
        payload: { test: "exhausted" },
        status: "diproses",
        percobaan: 5,
        maksimalPercobaan: 5,
        diperbaruiPada: sepuluhMenitLalu,
      })
      .returning({ id: outboxPekerjaan.id });

    await prosesAntreanOutbox(10);

    const [tugasDb] = await db
      .select()
      .from(outboxPekerjaan)
      .where(eq(outboxPekerjaan.id, tugasExhausted.id))
      .limit(1);

    expect(tugasDb.status).toBe("gagal");
    expect(tugasDb.pesanKesalahan).toContain("Dead-letter");
  });
});

