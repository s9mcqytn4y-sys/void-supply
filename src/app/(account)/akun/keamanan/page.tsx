import {
  ambilDaftarSesiAction,
  ambilLogKeamananAction,
} from "@/features/account/actions/keamanan-akun.action";
import { PusatKeamananAkun } from "@/features/account/components/PusatKeamananAkun";

export const dynamic = "force-dynamic";

export default async function HalamanKeamananAkun() {
  const [resSesi, resLog] = await Promise.all([
    ambilDaftarSesiAction(),
    ambilLogKeamananAction(),
  ]);

  return (
    <div>
      <PusatKeamananAkun
        daftarSesiAwal={resSesi.sesi}
        daftarLogAwal={resLog.log}
      />
    </div>
  );
}
