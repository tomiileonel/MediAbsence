import { redirect } from "next/navigation";
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
    <main className="min-h-screen bg-muted/20 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <AbsenceRequestList requests={requests} />
      </div>
    </main>
  );
}
