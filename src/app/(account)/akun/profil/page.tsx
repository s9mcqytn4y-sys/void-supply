import { redirect } from "next/navigation";
import { ambilProfilAkunAction } from "@/features/account/actions/profil-akun.action";
import { FormProfilAkun } from "@/features/account/components/FormProfilAkun";

export const dynamic = "force-dynamic";

export default async function HalamanProfilAkun() {
  const res = await ambilProfilAkunAction();
  if (!res.sukses || !res.profil) {
    redirect("/masuk?next=/akun/profil");
  }

  return (
    <div>
      <FormProfilAkun profil={res.profil} />
    </div>
  );
}
