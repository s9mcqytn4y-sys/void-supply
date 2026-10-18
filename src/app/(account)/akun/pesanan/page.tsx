import { ambilDaftarPesananAkunAction } from "@/features/account/actions/pesanan-akun.action";
import { DaftarPesananAkun } from "@/features/account/components/DaftarPesananAkun";

export const dynamic = "force-dynamic";

export default async function HalamanPesananAkun() {
  const res = await ambilDaftarPesananAkunAction();

  return (
    <div>
      <DaftarPesananAkun pesananAwal={res.pesanan} />
    </div>
  );
}
