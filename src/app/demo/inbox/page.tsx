import { redirect } from "next/navigation";

/**
 * Halaman Demo Mailbox dinonaktifkan secara kanonikal.
 * Seluruh email transaksi dikirimkan 100% murni ke Google SMTP (Gmail) asli via Nodemailer.
 */
export default function HalamanDemoInbox() {
  redirect("/");
}
