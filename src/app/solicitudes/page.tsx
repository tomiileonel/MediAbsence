import { redirect } from "next/navigation";
import { DashboardShell } from "@/app/(dashboard)/_components/dashboard-shell";
import { AbsenceRequestList } from "@/app/(dashboard)/_components/absence-request-list";
import { toAbsenceRequestSummaries } from "@/modules/absences/absence-dto";
import { listAbsenceRequestsForUser } from "@/modules/absences/application/absence-service";
import { requireAuth, type AuthenticatedActor } from "@/modules/auth/guards";
import { UnauthorizedError } from "@/lib/errors/domain-error";

export default async function AbsenceRequestsPage() {
  let actor: AuthenticatedActor;

  try {
    actor = await requireAuth();
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }

    throw error;
  }

  const requests = toAbsenceRequestSummaries(await listAbsenceRequestsForUser(actor.id));

  return (
    <DashboardShell
      actor={actor}
      title="Historial de Solicitudes"
      description="Consulta todas tus licencias, vacaciones y ausencias tramitadas."
    >
      <div className="max-w-4xl mx-auto">
        <AbsenceRequestList
          requests={requests}
          title="Todas mis solicitudes"
          description="Historial cronológico completo de solicitudes y sus dictámenes."
        />
      </div>
    </DashboardShell>
  );
}

