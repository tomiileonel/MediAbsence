import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AbsenceRequestSummary } from "@/modules/absences/absence-dto";
import {
  Calendar,
  CalendarDays,
  CalendarOff,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  MessageSquareQuote,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";

const statusConfig: Record<
  AbsenceRequestSummary["status"],
  { label: string; variant: "pending" | "approved" | "rejected"; icon: typeof Clock }
> = {
  PENDING: { label: "Pendiente", variant: "pending", icon: Clock },
  APPROVED: { label: "Aprobada", variant: "approved", icon: CheckCircle2 },
  REJECTED: { label: "Rechazada", variant: "rejected", icon: XCircle },
};

const typeConfig: Record<
  AbsenceRequestSummary["type"],
  { label: string; icon: typeof FileText }
> = {
  SICK_LEAVE: { label: "Licencia médica", icon: Stethoscope },
  VACATION: { label: "Vacaciones", icon: Calendar },
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

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

interface AbsenceRequestListProps {
  requests: AbsenceRequestSummary[];
  title?: string;
  description?: string;
}

export function AbsenceRequestList({
  requests,
  title = "Mis solicitudes",
  description = "Historial de solicitudes enviadas y su estado actual.",
}: AbsenceRequestListProps) {
  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          {requests.length > 0 && (
            <Badge variant="secondary" className="font-medium">
              {requests.length} {requests.length === 1 ? "solicitud" : "solicitudes"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground mb-3 ring-1 ring-border">
              <CalendarOff className="size-8" />
            </div>
            <p className="font-semibold text-foreground">No hay solicitudes para mostrar</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Las solicitudes de licencias, vacaciones o ausencias que generes aparecerán aquí.
            </p>
          </div>
        ) : (
          <ul className="space-y-3.5">
            {requests.map((request) => {
              const status = statusConfig[request.status] ?? {
                label: request.status,
                variant: "outline" as const,
                icon: Clock,
              };
              const type = typeConfig[request.type] ?? {
                label: request.type,
                icon: FileText,
              };
              const StatusIcon = status.icon;
              const TypeIcon = type.icon;
              const daysCount = calculateDays(request.startDate, request.endDate);

              return (
                <li
                  key={request.id}
                  className="rounded-xl border bg-card p-4.5 transition-all hover:border-primary/30 hover:shadow-xs"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-primary/10 text-primary">
                          <TypeIcon className="size-4" />
                        </span>
                        <h4 className="font-semibold text-foreground">{type.label}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1 font-medium text-foreground/80">
                          <CalendarDays className="size-3.5 text-muted-foreground" />
                          {formatDate(request.startDate)} — {formatDate(request.endDate)}
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span>
                          {daysCount} {daysCount === 1 ? "día corrido" : "días corridos"}
                        </span>
                      </div>
                    </div>
                    <Badge variant={status.variant} className="self-start sm:self-center font-semibold">
                      <StatusIcon className="size-3.5" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="mt-3.5 rounded-lg bg-muted/40 p-3 text-sm text-foreground/90 border border-border/40">
                    <p className="line-clamp-3 text-sm whitespace-pre-wrap">{request.reason}</p>
                  </div>

                  {request.reviewNotes ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/5 p-3 text-xs text-muted-foreground border border-amber-500/20 dark:bg-amber-500/10">
                      <MessageSquareQuote className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">Nota de revisión: </span>
                        <span>{request.reviewNotes}</span>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

