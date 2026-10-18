import { db } from "@/lib/db";
import { logEmail } from "@/lib/db/schema";

export type TipeEmail =
  | "konfirmasi_pesanan"
  | "pembayaran_berhasil"
  | "resi_pengiriman"
  | "pesanan_batal";

export interface ParameterKirimEmail {
  pesananId?: string;
  emailPenerima?: string;
  emailTujuan?: string;
  tipe?: TipeEmail;
  jenis?: TipeEmail;
  subjek?: string;
  nomorPesanan?: string;
  namaPelanggan?: string;
  nominal?: number;
  tautan?: string;
  data?: Record<string, unknown>;
}

export interface HasilKirimEmail {
  sukses: boolean;
  logId?: string;
  driver: string;
  pesan: string;
}

/**
 * Template generator email berestetika Brutalist Dark Utilitarian
 * Bersih, tanpa hiasan berlebih, mematuhi prinsip anti-slop (tanpa em dash).
 */
function buatHtmlEmail(
  tipe: TipeEmail,
  subjek: string,
  data?: Record<string, unknown>
): string {
  const payload = data || {};
  const nomorPesanan = (payload.nomorPesanan as string) || "-";
  const namaPelanggan = (payload.namaPelanggan as string) || "Pelanggan";
  const rincian = (payload.rincian as string) || "";
  const total = (payload.total as string) || "";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjek}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #fafafa; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 20px; }
    .header { border-bottom: 2px solid #27272a; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px; color: #fafafa; }
    .tagline { font-family: monospace; font-size: 10px; color: #71717a; text-transform: uppercase; margin-top: 4px; }
    .content { background-color: #18181b; border: 1px solid #27272a; padding: 24px; }
    .title { font-family: monospace; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #fafafa; margin-top: 0; }
    .text { font-size: 13px; line-height: 1.6; color: #a1a1aa; }
    .meta-box { background-color: #09090b; border: 1px dashed #3f3f46; padding: 12px; margin: 16px 0; font-family: monospace; font-size: 12px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .meta-label { color: #71717a; }
    .meta-value { color: #fafafa; font-weight: bold; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #27272a; font-family: monospace; font-size: 10px; color: #71717a; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">VOID SUPPLY // NOTIFIKASI</div>
      <div class="tagline">Atelier & Studio: Johar Baru, Jakarta Pusat (10560)</div>
    </div>
    <div class="content">
      <h1 class="title">${subjek}</h1>
      <p class="text">Halo ${namaPelanggan},</p>
      <p class="text">${rincian}</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">NOMOR PESANAN:</span>
          <span class="meta-value">${nomorPesanan}</span>
        </div>
        ${total ? `
        <div class="meta-row">
          <span class="meta-label">TOTAL AKHIR:</span>
          <span class="meta-value">${total}</span>
        </div>` : ""}
        <div class="meta-row">
          <span class="meta-label">WAKTU SISTEM:</span>
          <span class="meta-value">${new Date().toISOString()}</span>
        </div>
      </div>

      <p class="text">
        Pantau status pesanan dan rincian transaksi Anda secara langsung melalui tautan kanonikal toko kami.
      </p>
    </div>
    <div class="footer">
      &copy; 2026 VOID SUPPLY. Seluruh hak cipta dilindungi undang-undang.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Layanan terpusat pengiriman notifikasi email transaksi
 * Terhubung ke database log_email untuk riwayat audit imutabel.
 */
export async function kirimEmailNotifikasi(params: ParameterKirimEmail): Promise<HasilKirimEmail> {
  const emailTarget = params.emailPenerima || params.emailTujuan || "pelanggan@voidsupply.com";
  const tipeFinal: TipeEmail = params.tipe || params.jenis || "konfirmasi_pesanan";
  const subjekFinal =
    params.subjek ||
    (tipeFinal === "konfirmasi_pesanan"
      ? `Konfirmasi Pesanan #${params.nomorPesanan || ""}`
      : `Pemberitahuan Transaksi VOID Supply`);

  const payloadData: Record<string, unknown> = params.data || {
    nomorPesanan: params.nomorPesanan,
    namaPelanggan: params.namaPelanggan,
    total: params.nominal ? `Rp ${params.nominal.toLocaleString("id-ID")}` : "",
    tautan: params.tautan,
  };

  const pesananId = params.pesananId;
  const resendApiKey = process.env.RESEND_API_KEY;

  let driver = "console_mock";
  let statusPengiriman: "terkirim" | "gagal" | "simulasi" = "simulasi";
  let pesanHasil = "Email disimulasikan (console mock) dan dicatat di database log_email.";

  const htmlContent = buatHtmlEmail(tipeFinal, subjekFinal, payloadData);

  if (resendApiKey && resendApiKey.trim().length > 0 && !resendApiKey.includes("xxxx")) {
    try {
      driver = "resend";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VOID Supply <orders@voidsupply.com>",
          to: [emailTarget],
          subject: subjekFinal,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        statusPengiriman = "gagal";
        pesanHasil = `Resend API error: ${res.statusText}`;
      } else {
        statusPengiriman = "terkirim";
        pesanHasil = "Email berhasil terkirim melalui Resend API.";
      }
    } catch (err) {
      statusPengiriman = "gagal";
      pesanHasil = err instanceof Error ? err.message : "Kesalahan pengiriman email";
    }
  } else {
    // Mode Mock Logging (Local & Staging)
    console.log(`[EMAIL LOG // ${tipeFinal.toUpperCase()}] Penerima: ${emailTarget} | Subjek: ${subjekFinal}`);
  }

  // Rekam riwayat ke tabel log_email
  try {
    const [inserted] = await db
      .insert(logEmail)
      .values({
        pesananId: pesananId || null,
        emailPenerima: emailTarget,
        tipeEmail: tipeFinal,
        subjek: subjekFinal,
        statusPengiriman,
        driver,
        payloadRingkasan: payloadData,
      })
      .returning({ id: logEmail.id });

    return {
      sukses: statusPengiriman === "terkirim" || statusPengiriman === "simulasi",
      logId: inserted?.id,
      driver,
      pesan: pesanHasil,
    };
  } catch (dbErr) {
    console.error("[EMAIL SERVICE] Gagal mencatat log_email ke database:", dbErr);
    return {
      sukses: false,
      driver,
      pesan: "Gagal menyimpan log_email ke database.",
    };
  }
}
