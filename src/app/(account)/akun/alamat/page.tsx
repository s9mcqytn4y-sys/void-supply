import { ambilBukuAlamatAction } from "@/features/account/actions/alamat-akun.action";
import { BukuAlamatAkun } from "@/features/account/components/BukuAlamatAkun";

export const dynamic = "force-dynamic";

export default async function HalamanAlamatAkun() {
  const res = await ambilBukuAlamatAction();

  return (
    <div>
      <BukuAlamatAkun daftarAlamatAwal={res.alamat} />
    </div>
  );
}
