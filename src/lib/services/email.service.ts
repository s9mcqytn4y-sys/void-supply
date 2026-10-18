import nodemailer, { type Transporter } from "nodemailer";
import { db } from "@/lib/db";
import { logEmail, type tipeEmailEnum } from "@/lib/db/schema";

export type TipeEmail =
  | "konfirmasi_pesanan"
  | "pembayaran_berhasil"
  | "resi_pengiriman"
  | "pesanan_batal"
  | "verifikasi_email"
  | "lupa_password"
  | "atur_ulang_password"
  | "perubahan_keamanan"
  | "notifikasi_keamanan"
  | "notifikasi_akun";

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

let nodemailerTransporter: Transporter | null = null;

/**
 * Inisialisasi Transporter Nodemailer untuk Google Mail SMTP
 */
function ambilTransporterGmail() {
  const user = process.env.GMAIL_USER?.trim();
  const rawPass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user || !rawPass) {
    return null;
  }

  // Google App Password 16 karakter tanpa spasi
  const pass = rawPass.replace(/\s+/g, "");

  if (!nodemailerTransporter) {
    nodemailerTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  const pengirim =
    process.env.EMAIL_PENGIRIM?.trim() || `VOID Supply <${user}>`;

  return {
    transporter: nodemailerTransporter,
    pengirim,
  };
}

/**
 * Generator template email berestetika Brutalist Dark Utilitarian
 * Bersih, profesional, bebas karakter em dash, ramah pembaca email mobile & desktop.
 */
function buatHtmlEmail(
  tipe: TipeEmail,
  subjek: string,
  data?: Record<string, unknown>
): string {
  const payload = data || {};
  const nomorPesanan = (payload.nomorPesanan as string) || "";
  const namaPelanggan = (payload.namaPelanggan as string) || "Pelanggan";
  const rincian = (payload.rincian as string) || "";
  const total = (payload.total as string) || "";
  const tautan = (payload.tautan as string) || "";
  const waktuSistem = new Date().toISOString();

  // Konten spesifik per tipe email
  let headerLabel = "// VOID SUPPLY : TRANSMISI RESMI";
  let judulUtama = subjek;
  let pesanDeskripsi = rincian;
  let teksTombol = "KUNJUNGI VOID SUPPLY";
  let infoKotakMeta: Array<{ label: string; nilai: string }> = [];

  switch (tipe) {
    case "verifikasi_email":
      headerLabel = "// PROTOKOL OTORISASI IDENTITAS";
      judulUtama = "VERIFIKASI ALAMAT EMAIL";
      pesanDeskripsi =
        "Selamat datang di VOID Supply. Klik tombol di bawah untuk memverifikasi akun Anda dan mengaktifkan akses checkout aman.";
      teksTombol = "VERIFIKASI EMAIL SEKARANG";
      infoKotakMeta = [
        { label: "AKUN TUJUAN", nilai: namaPelanggan },
        { label: "STATUS", nilai: "MENUNGGU AKTIVASI" },
        { label: "WAKTU SISTEM", nilai: waktuSistem },
      ];
      break;

    case "atur_ulang_password":
      headerLabel = "// PROTOKOL PEMULIHAN AKSES";
      judulUtama = "PERMINTAAN ATUR ULANG KATA SANDI";
      pesanDeskripsi =
        "Kami menerima permintaan pengaturan ulang kata sandi untuk akun Anda. Klik tombol konfirmasi di bawah untuk membuat kata sandi baru.";
      teksTombol = "ATUR ULANG KATA SANDI";
      infoKotakMeta = [
        { label: "AKUN TUJUAN", nilai: namaPelanggan },
        { label: "MASA BERLAKU", nilai: "24 JAM" },
        { label: "WAKTU SISTEM", nilai: waktuSistem },
      ];
      break;

    case "konfirmasi_pesanan":
      headerLabel = "// STATUS TRANSAKSI : DIBUAT";
      judulUtama = `KONFIRMASI PESANAN #${nomorPesanan}`;
      pesanDeskripsi =
        pesanDeskripsi ||
        "Pesanan Anda telah berhasil dibuat dalam sistem. Silakan selesaikan pembayaran sebelum batas waktu kedaluwarsa reservasi stok.";
      teksTombol = "LIHAT DETAIL PESANAN";
      infoKotakMeta = [
        { label: "NOMOR PESANAN", nilai: nomorPesanan },
        ...(total ? [{ label: "TOTAL TAGIHAN", nilai: total }] : []),
        { label: "STATUS", nilai: "MENUNGGU PEMBAYARAN" },
      ];
      break;

    case "pembayaran_berhasil":
      headerLabel = "// STATUS TRANSAKSI : DIBAYAR";
      judulUtama = `PEMBAYARAN DIVERIFIKASI // #${nomorPesanan}`;
      pesanDeskripsi =
        pesanDeskripsi ||
        "Pembayaran Anda telah tuntas diverifikasi oleh sistem. Faktur resmi diterbitkan dan pesanan sedang disiapkan di atelier kami.";
      teksTombol = "LIHAT FAKTUR RESMI";
      infoKotakMeta = [
        { label: "NOMOR PESANAN", nilai: nomorPesanan },
        ...(total ? [{ label: "TOTAL LUNAS", nilai: total }] : []),
        { label: "STATUS FAKTUR", nilai: "LUNAS (SETTLED)" },
      ];
      break;

    case "resi_pengiriman":
      headerLabel = "// STATUS LOGISTIK : DIKIRIM";
      judulUtama = `PAKET DALAM PENGIRIMAN // #${nomorPesanan}`;
      pesanDeskripsi =
        pesanDeskripsi ||
        "Paket busana pesanan Anda telah diserahkan kepada kurir ekspedisi dan sedang bergerak menuju alamat tujuan.";
      teksTombol = "LACAK PERJALANAN PAKET";
      infoKotakMeta = [
        { label: "NOMOR PESANAN", nilai: nomorPesanan },
        ...(payload.resi
          ? [{ label: "NOMOR RESI", nilai: String(payload.resi) }]
          : []),
        ...(payload.kurir
          ? [{ label: "KURIR EKSPEDISI", nilai: String(payload.kurir).toUpperCase() }]
          : []),
      ];
      break;

    case "notifikasi_keamanan":
      headerLabel = "// AUDIT KEAMANAN AKUN";
      judulUtama = "PERINGATAN AKTIVITAS KEAMANAN";
      pesanDeskripsi =
        pesanDeskripsi ||
        "Terdeteksi pembaruan informasi keamanan pada akun VOID Supply Anda. Jika ini bukan tindakan Anda, segera ubah kata sandi akun.";
      teksTombol = "PERIKSA PUSAT KEAMANAN";
      infoKotakMeta = [
        { label: "PERISTIWA", nilai: String(payload.aktivitas || "Pembaruan Akun") },
        { label: "WAKTU SISTEM", nilai: waktuSistem },
      ];
      break;

    case "pesanan_batal":
      headerLabel = "// STATUS TRANSAKSI : DIBATALKAN";
      judulUtama = `PESANAN DIBATALKAN // #${nomorPesanan}`;
      pesanDeskripsi =
        pesanDeskripsi ||
        "Pesanan Anda telah dibatalkan atau melewati batas waktu pembayaran. Kuota reservasi stok artikel telah dipulihkan secara otomatis.";
      teksTombol = "KUNJUNGI KATALOG LAGI";
      infoKotakMeta = [
        { label: "NOMOR PESANAN", nilai: nomorPesanan },
        { label: "STATUS", nilai: "DIBATALKAN" },
      ];
      break;
  }

  const metaHtml =
    infoKotakMeta.length > 0
      ? `
      <div style="background-color: #0c0c0e; border: 1px solid #27272a; padding: 14px 16px; margin: 20px 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px;">
        ${infoKotakMeta
          .map(
            (item) => `
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #1c1c1f;">
            <span style="color: #71717a; text-transform: uppercase;">${item.label}</span>
            <span style="color: #ffffff; font-weight: bold;">${item.nilai}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `
      : "";

  const ctaHtml = tautan
    ? `
      <div style="margin: 28px 0 20px 0;">
        <a href="${tautan}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #ffffff; color: #000000; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border: 1px solid #ffffff; min-height: 44px; line-height: 16px; box-sizing: border-box;">
          [ ${teksTombol} ]
        </a>
      </div>
      <p style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #71717a; word-break: break-all; margin-top: 10px;">
        Atau buka tautan berikut: <br><a href="${tautan}" style="color: #a1a1aa; text-decoration: underline;">${tautan}</a>
      </p>
    `
    : "";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjek}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <div style="max-width: 580px; margin: 0 auto; padding: 36px 18px;">
    
    <!-- Header Brand Monospace -->
    <div style="border-bottom: 2px solid #27272a; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 15px; font-weight: 800; letter-spacing: 3px; color: #ffffff; text-transform: uppercase;">
        VOID SUPPLY
      </div>
      <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #71717a; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;">
        ${headerLabel}
      </div>
    </div>

    <!-- Konten Utama Card -->
    <div style="background-color: #141417; border: 1px solid #27272a; padding: 26px 22px;">
      <h1 style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 15px; font-weight: 800; letter-spacing: 1px; color: #ffffff; margin-top: 0; margin-bottom: 14px; text-transform: uppercase;">
        ${judulUtama}
      </h1>

      <p style="font-size: 13px; line-height: 1.6; color: #d4d4d8; margin: 0 0 14px 0;">
        Halo ${namaPelanggan},
      </p>

      <p style="font-size: 13px; line-height: 1.6; color: #a1a1aa; margin: 0 0 14px 0;">
        ${pesanDeskripsi}
      </p>

      ${metaHtml}
      ${ctaHtml}

      <div style="border-top: 1px solid #27272a; padding-top: 14px; margin-top: 24px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #71717a; line-height: 1.5;">
        Sistem pemrosesan pesanan otomatis VOID Supply. Pesan ini dikirim secara otomatis dan tidak memerlukan balasan langsung.
      </div>
    </div>

    <!-- Footer Studio -->
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1c1c1f; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #52525b; text-align: center; line-height: 1.6;">
      <div>VOID SUPPLY // ATELIER & STUDIO</div>
      <div>Johar Baru, Jakarta Pusat, DKI Jakarta 10560, Indonesia</div>
      <div style="margin-top: 6px; color: #3f3f46;">&copy; 2026 VOID Supply. Seluruh hak cipta dilindungi undang-undang.</div>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * Layanan terpusat pengiriman notifikasi email transaksi & autentikasi
 * Mendukung Gmail SMTP (Nodemailer), Resend API, dan Dev Console Mock.
 * Seluruh peristiwa dicatat secara permanen di database tabel log_email.
 */
export async function kirimEmailNotifikasi(
  params: ParameterKirimEmail
): Promise<HasilKirimEmail> {
  const emailTarget =
    params.emailPenerima || params.emailTujuan || "pelanggan@voidsupply.com";
  const tipeFinal: TipeEmail =
    params.tipe || params.jenis || "konfirmasi_pesanan";
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
  const htmlContent = buatHtmlEmail(tipeFinal, subjekFinal, payloadData);

  let driver = "console_mock";
  let statusPengiriman: "terkirim" | "gagal" | "simulasi" = "simulasi";
  let pesanHasil = "Email disimulasikan (console mock) dan dicatat di database log_email.";

  // 1. Opsi Utama: Nodemailer Gmail SMTP
  const gmailConfig = ambilTransporterGmail();
  if (gmailConfig) {
    try {
      driver = "nodemailer_gmail";
      await gmailConfig.transporter.sendMail({
        from: gmailConfig.pengirim,
        to: emailTarget,
        subject: subjekFinal,
        html: htmlContent,
      });

      statusPengiriman = "terkirim";
      pesanHasil = `Email berhasil terkirim melalui Nodemailer Gmail (${gmailConfig.pengirim}) ke ${emailTarget}.`;
      console.info(`[GMAIL SMTP] Sukses mengirim email ${tipeFinal} ke: ${emailTarget}`);
    } catch (gmailErr) {
      statusPengiriman = "gagal";
      pesanHasil =
        gmailErr instanceof Error
          ? `Gmail SMTP Error: ${gmailErr.message}`
          : "Gagal mengirim email via Gmail SMTP";
      console.error(`[GMAIL SMTP ERROR] Gagal mengirim ke ${emailTarget}:`, gmailErr);
    }
  } else {
    // 2. Opsi Sekunder: Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
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
            from: process.env.EMAIL_PENGIRIM || "VOID Supply <orders@voidsupply.com>",
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
        pesanHasil = err instanceof Error ? err.message : "Kesalahan pengiriman email via Resend";
      }
    } else {
      // 3. Fallback: Console Mock Logger
      console.log(
        `[EMAIL LOG // ${tipeFinal.toUpperCase()}] Penerima: ${emailTarget} | Subjek: ${subjekFinal}`
      );
    }
  }

  // Petakan ke tipe_email enum database
  const tipeDb: typeof tipeEmailEnum.enumValues[number] =
    tipeFinal === "atur_ulang_password"
      ? "lupa_password"
      : tipeFinal === "notifikasi_keamanan"
        ? "perubahan_keamanan"
        : (tipeFinal as typeof tipeEmailEnum.enumValues[number]);

  // Rekam riwayat ke tabel log_email
  try {
    const [inserted] = await db
      .insert(logEmail)
      .values({
        pesananId: pesananId || null,
        emailPenerima: emailTarget,
        tipeEmail: tipeDb,
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
