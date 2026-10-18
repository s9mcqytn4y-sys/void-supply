import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, logEmail, outboxPekerjaan } from "@/lib/db";

export const metadata: Metadata = {
  title: "In-App Dev Mailbox & Transactional Outbox | VOID Supply",
  description: "Kotak masuk simulasi email transaksi dan antrean outbox untuk pengujian Vercel Hobby tanpa SMTP server.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PropsHalamanDemoInbox {
  searchParams: Promise<{ key?: string }>;
}

function samarkanEmail(email: string): string {
  if (!email || !email.includes("@")) return "***";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function bersihkanPayloadAman(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  try {
    const jsonStr = JSON.stringify(payload);
    const sanitized = jsonStr.replace(
      /"(token|password|kataSandi|secret|kunci|authorization)":\s*"[^"]+"/gi,
      '"$1": "[TERLINDUNGI/REDACTED]"'
    );
    return JSON.parse(sanitized);
  } catch {
    return { status: "Payload terproteksi" };
  }
}

export default async function HalamanDemoInbox({ searchParams }: PropsHalamanDemoInbox) {
  const { key } = await searchParams;
  const isProduction = process.env.NODE_ENV === "production" && process.env.APP_ENV === "production";
  const expectedKey = process.env.DEMO_INBOX_KEY || process.env.CRON_SECRET || "void-operator-key";
  const isAuthorized = Boolean(key && key === expectedKey);

  // Hard Gate (SEC-GATE-0): Di lingkungan produksi publik, wajib menyertakan kunci otorisasi operator
  if (isProduction && !isAuthorized) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-xl px-4 py-20 text-center font-mono sm:px-6">
        <div className="border border-neutral-800 bg-neutral-950 p-8">
          <span className="text-xs font-bold text-rose-400 uppercase">
            AKSES TERBATAS // OPERATOR SAJA
          </span>
          <h1 className="mt-2 text-xl font-black text-white uppercase">
            OTORISASI OPERATOR DIPERLUKAN
          </h1>
          <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
            Halaman inspeksi antrean outbox dan log email transaksi diproteksi di lingkungan produksi.
            Silakan akses dengan menyertakan parameter token operator yang sah.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 text-xs font-bold text-black uppercase hover:bg-neutral-200"
            >
              KEMBALI KE BERANDA
            </Link>
          </div>
        </div>
      </main>
    );
  }
  const daftarLogEmail = await db
    .select()
    .from(logEmail)
    .orderBy(desc(logEmail.dikirimPada))
    .limit(20)
    .catch(() => []);

  const daftarOutbox = await db
    .select()
    .from(outboxPekerjaan)
    .orderBy(desc(outboxPekerjaan.dibuatPada))
    .limit(20)
    .catch(() => []);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 font-mono text-neutral-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              DEMO UTILITY // STAGING & VERCEL HOBBY
            </span>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              TRANSACTIONAL MAILBOX & OUTBOX
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-9 items-center justify-center border border-neutral-700 bg-neutral-900 px-4 text-xs font-bold uppercase text-white hover:bg-neutral-800"
          >
            KEMBALI KE STORE
          </Link>
        </div>

        {/* Technical Architecture Info Box */}
        <div className="mb-8 border border-neutral-800 bg-neutral-900/40 p-5 text-xs text-neutral-300">
          <div className="flex items-center gap-2 font-bold text-white uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            ARSITEKTUR EMAIL VERCEL SERVERLESS: TRANSACTIONAL OUTBOX + MOCK INBOX
          </div>
          <p className="mt-2 text-neutral-400 leading-relaxed">
            Pada environment Vercel Hobby (tanpa SMTP production), notifikasi transaksi (konfirmasi pesanan, pembayaran, dan kontak) tidak dibuang. Sistem menyimpannya secara atomik ke tabel <code className="text-white">log_email</code> dan <code className="text-white">outbox_pekerjaan</code>. Saat <code className="text-white">RESEND_API_KEY</code> dipasang di Vercel, worker otomatis mengirimkan email fisik ke penerima asli tanpa mengubah kode aplikasi.
          </p>
        </div>

        {/* Section 1: Log Email Transaksi */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              DAFTAR EMAIL TERCATAT ({daftarLogEmail.length})
            </h2>
            <span className="text-[11px] text-neutral-500">Auto-refresh per request</span>
          </div>

          {daftarLogEmail.length === 0 ? (
            <div className="border border-dashed border-neutral-800 p-8 text-center text-xs text-neutral-500">
              Belum ada email yang dihasilkan. Coba lakukan checkout pesanan atau kirim pesan melalui halaman kontak.
            </div>
          ) : (
            <div className="space-y-3">
              {daftarLogEmail.map((item) => (
                <div
                  key={item.id}
                  className="border border-neutral-800 bg-neutral-900/60 p-4 transition-colors hover:border-neutral-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                          item.statusPengiriman === "terkirim"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : item.statusPengiriman === "simulasi"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-rose-950 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {item.statusPengiriman}
                      </span>
                      <span className="text-[10px] text-neutral-400 uppercase">
                        DRIVER: {item.driver}
                      </span>
                    </div>
                    <time className="text-[11px] text-neutral-500">
                      {new Date(item.dikirimPada).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-bold text-white">{item.subjek}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Penerima: <span className="text-neutral-200">{item.emailPenerima}</span>
                    </p>
                  </div>

                  {item.payloadRingkasan ? (
                    <div className="mt-3 border border-neutral-800 bg-neutral-950 p-2.5 text-[11px] text-neutral-300">
                      <pre className="overflow-x-auto whitespace-pre-wrap font-mono">
                        {JSON.stringify(item.payloadRingkasan, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Antrean Transactional Outbox */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              ANTREAN OUTBOX PEKERJAAN ({daftarOutbox.length})
            </h2>
            <span className="text-[11px] text-neutral-500">Pekerjaan latar serverless</span>
          </div>

          {daftarOutbox.length === 0 ? (
            <div className="border border-dashed border-neutral-800 p-8 text-center text-xs text-neutral-500">
              Antrean outbox kosong. Seluruh pekerjaan telah diselesaikan atau belum ada mutasi event.
            </div>
          ) : (
            <div className="space-y-3">
              {daftarOutbox.map((outbox) => (
                <div
                  key={outbox.id}
                  className="border border-neutral-800 bg-neutral-900/30 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs text-white uppercase">
                      {outbox.tipePekerjaan}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                        outbox.status === "berhasil"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : outbox.status === "antre"
                          ? "bg-sky-950 text-sky-400 border border-sky-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      }`}
                    >
                      {outbox.status}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400">
                    Percobaan: {outbox.percobaan} / {outbox.maksimalPercobaan} | Waktu:{" "}
                    {new Date(outbox.dibuatPada).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
