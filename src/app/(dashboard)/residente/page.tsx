import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AttendancePanel } from "@/app/(dashboard)/_components/attendance-panel";
import { DashboardShell } from "@/app/(dashboard)/_components/dashboard-shell";
import { toAttendanceSummary } from "@/modules/attendance/attendance-dto";
import { getTodayAttendanceForUser } from "@/modules/attendance/application/attendance-service";
import { requireRole } from "@/modules/auth/guards";

export default async function ResidentDashboardPage() {
  const actor = await requireRole("RESIDENTE");
  const attendance = toAttendanceSummary(await getTodayAttendanceForUser(actor.id));

  return (
    <DashboardShell
      actor={actor}
      title="Panel de residente"
      description="Registra tu jornada y consulta tus solicitudes de ausencia."
    >
      <AttendancePanel initialAttendance={attendance} />
      <Button asChild variant="outline">
        <Link href="/solicitar">Crear una solicitud de ausencia</Link>
      </Button>
    </DashboardShell>
  );
}
