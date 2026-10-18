import { ambilSesiPengguna } from "@/lib/auth/session";
import { ambilDaftarPesananAkunAction } from "@/features/account/actions/pesanan-akun.action";
import { ambilBukuAlamatAction } from "@/features/account/actions/alamat-akun.action";
import { KartuRingkasanAkun } from "@/features/account/components/KartuRingkasanAkun";

export const dynamic = "force-dynamic";

export default async function HalamanRingkasanAkun() {
  const sesi = await ambilSesiPengguna();
  const [resPesanan, resAlamat] = await Promise.all([
    ambilDaftarPesananAkunAction(),
    ambilBukuAlamatAction(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="font-mono text-lg font-bold text-white uppercase tracking-wider">
          RINGKASAN DASBOR AKUN
        </h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">
          Ikhtisar pesanan, status verifikasi identitas, dan buku alamat pengiriman
        </p>
      </div>

      <KartuRingkasanAkun
        daftarPesanan={resPesanan.pesanan}
        daftarAlamat={resAlamat.alamat}
        nama={sesi?.pengguna?.nama || "Pelanggan"}
        email={sesi?.pengguna?.email || ""}
        emailVerified={Boolean(sesi?.pengguna?.emailDiverifikasi)}
      />
    </div>
  );
}
