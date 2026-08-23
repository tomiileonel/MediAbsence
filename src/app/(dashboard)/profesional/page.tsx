import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AttendancePanel } from "@/app/(dashboard)/_components/attendance-panel";
import { DashboardShell } from "@/app/(dashboard)/_components/dashboard-shell";
import { toAttendanceSummary } from "@/modules/attendance/attendance-dto";
import { getTodayAttendanceForUser } from "@/modules/attendance/application/attendance-service";
import { requireRole } from "@/modules/auth/guards";

export default async function ProfessionalDashboardPage() {
  const actor = await requireRole("PROFESIONAL");
  const attendance = toAttendanceSummary(await getTodayAttendanceForUser(actor.id));

  return (
    <DashboardShell
      actor={actor}
      title="Panel profesional"
      description="Registra tu jornada y gestiona tus solicitudes personales."
    >
      <AttendancePanel initialAttendance={attendance} />
      <Button asChild variant="outline">
        <Link href="/solicitar">Crear una solicitud de ausencia</Link>
      </Button>
    </DashboardShell>
  );
}
