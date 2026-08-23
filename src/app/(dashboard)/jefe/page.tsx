import { DashboardShell } from "@/app/(dashboard)/_components/dashboard-shell";
import { ReviewQueue } from "@/app/(dashboard)/_components/review-queue";
import { toAbsenceRequestSummaries } from "@/modules/absences/absence-dto";
import { listPendingAbsenceRequests } from "@/modules/absences/application/absence-service";
import { requireRole } from "@/modules/auth/guards";

export default async function ChiefDashboardPage() {
  const actor = await requireRole("JEFE");
  const pendingRequests = toAbsenceRequestSummaries(await listPendingAbsenceRequests());

  return (
    <DashboardShell
      actor={actor}
      title="Panel de Jefatura de Servicio"
      description="Revisión técnica y dictamen de licencias, vacaciones y permisos extraordinarios."
    >
      <div className="space-y-6">
        <ReviewQueue initialRequests={pendingRequests} />
      </div>
    </DashboardShell>
  );
}

