"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reviewAbsenceRequest } from "@/app/actions/absence";
import type { AbsenceRequestSummary } from "@/modules/absences/absence-dto";
import {
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  Stethoscope,
  User,
  X,
} from "lucide-react";

interface ReviewQueueProps {
  initialRequests: AbsenceRequestSummary[];
}

const typeConfig: Record<
  AbsenceRequestSummary["type"],
  { label: string; icon: typeof FileText }
> = {
  SICK_LEAVE: { label: "Licencia médica", icon: Stethoscope },
  VACATION: { label: "Vacaciones", icon: CalendarDays },
  PERSONAL: { label: "Asunto personal", icon: User },
  CONGRESS: { label: "Congreso médico", icon: GraduationCap },
  OTHER: { label: "Otro", icon: HelpCircle },
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo procesar la solicitud.";
}

export function ReviewQueue({ initialRequests }: ReviewQueueProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDecision(
    requestId: string,
    decision: "APPROVED" | "REJECTED",
  ): void {
    setActiveRequestId(requestId);
    const noteText = notes[requestId]?.trim();

    startTransition(async () => {
      try {
        const reviewedRequest = await reviewAbsenceRequest(requestId, decision, noteText);
        setRequests((current) => current.filter((request) => request.id !== reviewedRequest.id));
        setNotes((current) => {
          const next = { ...current };
          delete next[requestId];
          return next;
        });

        if (decision === "APPROVED") {
          toast.success("Solicitud aprobada con éxito");
        } else {
          toast.info("Solicitud rechazada");
        }
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        toast.error(msg);
      } finally {
        setActiveRequestId(null);
      }
    });
  }

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Bandeja de revisión</CardTitle>
            <CardDescription className="text-sm">
              Revisa y dictamina las solicitudes de ausencia pendientes del personal médico.
            </CardDescription>
          </div>
          <Badge variant={requests.length > 0 ? "pending" : "secondary"} className="font-semibold">
            <Clock className="size-3.5" />
            {requests.length} {requests.length === 1 ? "pendiente" : "pendientes"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 ring-1 ring-emerald-500/20">
              <CheckCheck className="size-8" />
            </div>
            <p className="font-semibold text-foreground">Bandeja al día</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              No hay solicitudes pendientes de revisión en este momento.
            </p>
          </div>
        ) : (
          requests.map((request) => {
            const isProcessing = isPending && activeRequestId === request.id;
            const type = typeConfig[request.type] ?? {
              label: request.type,
              icon: FileText,
            };
            const TypeIcon = type.icon;

            return (
              <article
                key={request.id}
                className="space-y-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-xs"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        {(request.user.name ?? request.user.email ?? "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base">
                          {request.user.name ?? "Usuario"}
                        </h3>
                        <p className="text-xs text-muted-foreground">{request.user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Badge variant="outline" className="gap-1 font-medium bg-muted/30">
                        <TypeIcon className="size-3 text-primary" />
                        {type.label}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs font-medium text-foreground/80">
                        <CalendarDays className="size-3.5 text-muted-foreground" />
                        {formatDate(request.startDate)} — {formatDate(request.endDate)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="pending" className="self-start sm:self-center font-medium">
                    Pendiente
                  </Badge>
                </div>

                <div className="rounded-lg bg-muted/40 p-3.5 text-sm text-foreground/90 border border-border/40">
                  <span className="font-medium text-xs text-muted-foreground block mb-1">Motivo declarado:</span>
                  <p className="whitespace-pre-wrap">{request.reason}</p>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    htmlFor={`review-notes-${request.id}`}
                  >
                    Notas de dictamen (opcional)
                  </label>
                  <textarea
                    id={`review-notes-${request.id}`}
                    placeholder="Agrega observaciones o condiciones sobre el dictamen..."
                    className="min-h-20 w-full rounded-md border bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                    value={notes[request.id] ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({ ...current, [request.id]: event.target.value }))
                    }
                    disabled={isProcessing}
                    maxLength={2000}
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Button
                    type="button"
                    onClick={() => handleDecision(request.id, "APPROVED")}
                    disabled={isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    size="sm"
                  >
                    {isProcessing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Aprobar solicitud
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDecision(request.id, "REJECTED")}
                    disabled={isProcessing}
                    size="sm"
                    className="font-medium"
                  >
                    {isProcessing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <X className="size-4" />
                    )}
                    Rechazar
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

