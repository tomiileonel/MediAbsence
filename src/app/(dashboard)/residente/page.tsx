import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AttendancePanel } from "@/app/(dashboard)/_components/attendance-panel";
import { AbsenceRequestList } from "@/app/(dashboard)/_components/absence-request-list";
import { DashboardShell } from "@/app/(dashboard)/_components/dashboard-shell";
import { toAttendanceSummary } from "@/modules/attendance/attendance-dto";
import { getTodayAttendanceForUser } from "@/modules/attendance/application/attendance-service";
import { toAbsenceRequestSummaries } from "@/modules/absences/absence-dto";
import { listAbsenceRequestsForUser } from "@/modules/absences/application/absence-service";
import { requireRole } from "@/modules/auth/guards";
import { FilePlus2 } from "lucide-react";

export default async function ResidentDashboardPage() {
  const actor = await requireRole("RESIDENTE");
  const [attendanceRecord, userRequests] = await Promise.all([
    getTodayAttendanceForUser(actor.id),
    listAbsenceRequestsForUser(actor.id),
  ]);

  const attendance = toAttendanceSummary(attendanceRecord);
  const requests = toAbsenceRequestSummaries(userRequests);

  return (
    <DashboardShell
      actor={actor}
      title="Panel de Médico Residente"
      description="Registra tu jornada de guardia/residencia y consulta tus solicitudes de ausencia."
    >
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-6 space-y-6">
          <AttendancePanel initialAttendance={attendance} />
          <div className="flex justify-end">
            <Button asChild className="gap-2 font-semibold">
              <Link href="/solicitar">
                <FilePlus2 className="size-4" />
                Nueva Solicitud de Licencia
              </Link>
            </Button>
          </div>
        </div>
        <div className="lg:col-span-6 space-y-6">
          <AbsenceRequestList
            requests={requests.slice(0, 5)}
            title="Mis solicitudes recientes"
            description="Últimos trámites de ausencia registrados."
          />
        </div>
      </div>
    </DashboardShell>
  );
}

