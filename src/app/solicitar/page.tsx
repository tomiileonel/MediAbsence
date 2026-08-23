import { redirect } from "next/navigation";
import { DashboardShell } from "@/app/(dashboard)/_components/dashboard-shell";
import { AbsenceRequestForm } from "./absence-request-form";
import { AbsenceRequestList } from "@/app/(dashboard)/_components/absence-request-list";
import { toAbsenceRequestSummaries } from "@/modules/absences/absence-dto";
import { listAbsenceRequestsForUser } from "@/modules/absences/application/absence-service";
import { requireAuth, type AuthenticatedActor } from "@/modules/auth/guards";
import { UnauthorizedError } from "@/lib/errors/domain-error";

export default async function RequestAbsencePage() {
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
      title="Gestión de Licencias y Ausencias"
      description="Registra una nueva solicitud y consulta el estado de tus trámites en curso."
    >
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-6 space-y-6">
          <AbsenceRequestForm />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <AbsenceRequestList
            requests={requests}
            title="Mis solicitudes recientes"
            description="Historial actualizado de tus trámites enviados."
          />
        </div>
      </div>
    </DashboardShell>
  );
}

