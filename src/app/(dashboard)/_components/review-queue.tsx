"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewAbsenceRequest } from "@/app/actions/absence";
import type { AbsenceRequestSummary } from "@/modules/absences/absence-dto";

interface ReviewQueueProps {
  initialRequests: AbsenceRequestSummary[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo revisar la solicitud.";
}

export function ReviewQueue({ initialRequests }: ReviewQueueProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDecision(
    requestId: string,
    decision: "APPROVED" | "REJECTED",
  ): void {
    setFeedback(null);
    startTransition(async () => {
      try {
        const reviewedRequest = await reviewAbsenceRequest(requestId, decision, notes[requestId]);
        setRequests((current) => current.filter((request) => request.id !== reviewedRequest.id));
        setFeedback("La solicitud fue actualizada.");
      } catch (error: unknown) {
        setFeedback(getErrorMessage(error));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes pendientes</CardTitle>
        <CardDescription>
          Revisá cada solicitud con criterio de negocio y deja una nota cuando sea necesario.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay solicitudes pendientes.</p>
        ) : (
          requests.map((request) => (
            <article key={request.id} className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="font-medium">{request.user.name ?? request.user.email ?? "Usuario"}</h3>
                <p className="text-sm text-muted-foreground">
                  {request.type} · {request.startDate} — {request.endDate}
                </p>
                <p className="mt-2 text-sm">{request.reason}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={`review-notes-${request.id}`}>
                  Notas de revisión (opcional)
                </label>
                <textarea
                  id={`review-notes-${request.id}`}
                  className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  value={notes[request.id] ?? ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                  maxLength={2000}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => handleDecision(request.id, "APPROVED")} disabled={isPending}>
                  Aprobar
                </Button>
                <Button type="button" variant="destructive" onClick={() => handleDecision(request.id, "REJECTED")} disabled={isPending}>
                  Rechazar
                </Button>
              </div>
            </article>
          ))
        )}
        {feedback ? <p role="status" aria-live="polite" className="text-sm">{feedback}</p> : null}
      </CardContent>
    </Card>
  );
}
