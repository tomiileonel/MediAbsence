import { DashboardShell } from "@/app/(dashboard)/_components/dashboard-shell";
import { ReviewQueue } from "@/app/(dashboard)/_components/review-queue";
import { toAbsenceRequestSummaries } from "@/modules/absences/absence-dto";
import { listPendingAbsenceRequests } from "@/modules/absences/application/absence-service";
import { requireRole } from "@/modules/auth/guards";

export default async function AdminDashboardPage() {
  const actor = await requireRole("ADMIN");
  const pendingRequests = toAbsenceRequestSummaries(await listPendingAbsenceRequests());

  return (
    <DashboardShell
      actor={actor}
      title="Centro de Control de Administración"
      description="Supervisión global del sistema, gestión de personal y dictamen de licencias pendientes."
    >
      <div className="space-y-6">
        <ReviewQueue initialRequests={pendingRequests} />
      </div>
    </DashboardShell>
  );
}

