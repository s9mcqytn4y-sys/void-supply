"use server";

import { db } from "@/lib/db";
import { auditAktivitasAdmin } from "@/lib/db/admin.schema";
import { pengguna } from "@/lib/db/auth.schema";
import { eq, desc } from "drizzle-orm";
import { verifikasiStafAdmin } from "./auth-guard";

export interface LogAktivitasAdmin {
  id: string;
  adminNama: string;
  adminEmail: string;
  tindakan: string;
  targetId: string | null;
  ipAddress: string | null;
  payloadAman: Record<string, unknown> | null;
  dibuatPada: string;
}

/**
 * Server Action: Mengambil log riwayat audit aktivitas staf admin
 */
export async function ambilDaftarAktivitasAdminAction(): Promise<{
  sukses: boolean;
  log: LogAktivitasAdmin[];
  pesan?: string;
}> {
  try {
    const cek = await verifikasiStafAdmin();
    if (!cek.sah) {
      return { sukses: false, log: [], pesan: cek.pesan };
    }

    const rows = await db
      .select({
        id: auditAktivitasAdmin.id,
        adminNama: pengguna.name,
        adminEmail: pengguna.email,
        tindakan: auditAktivitasAdmin.tindakan,
        targetId: auditAktivitasAdmin.targetId,
        ipAddress: auditAktivitasAdmin.ipAddress,
        payloadAman: auditAktivitasAdmin.payloadAman,
        dibuatPada: auditAktivitasAdmin.dibuatPada,
      })
      .from(auditAktivitasAdmin)
      .leftJoin(pengguna, eq(auditAktivitasAdmin.adminId, pengguna.id))
      .orderBy(desc(auditAktivitasAdmin.dibuatPada))
      .limit(100);

    const hasil: LogAktivitasAdmin[] = rows.map((r) => ({
      id: r.id,
      adminNama: r.adminNama || "Sistem / Operator",
      adminEmail: r.adminEmail || "internal@voidsupply.local",
      tindakan: r.tindakan,
      targetId: r.targetId,
      ipAddress: r.ipAddress,
      payloadAman: (r.payloadAman as Record<string, unknown>) || null,
      dibuatPada: r.dibuatPada.toISOString(),
    }));

    return { sukses: true, log: hasil };
  } catch (error) {
    console.error("[AUDIT LOG] Gagal memuat log aktivitas:", error);
    return {
      sukses: false,
      log: [],
      pesan: "Gagal memuat log audit aktivitas.",
    };
  }
}
