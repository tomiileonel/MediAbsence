import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-muted/20 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">MediAbsence</p>
            <h1 className="text-3xl font-bold tracking-tight">Solicitar licencia</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/solicitudes">Ver historial</Link>
          </Button>
        </div>
        <AbsenceRequestForm />
        <AbsenceRequestList requests={requests} />
      </div>
    </main>
  );
}
