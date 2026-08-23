import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AbsenceRequestSummary } from "@/modules/absences/absence-dto";

const statusLabels: Record<AbsenceRequestSummary["status"], string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

const typeLabels: Record<AbsenceRequestSummary["type"], string> = {
  SICK_LEAVE: "Licencia médica",
  VACATION: "Vacaciones",
  PERSONAL: "Personal",
  CONGRESS: "Congreso",
  OTHER: "Otro",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay solicitudes para mostrar.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((request) => (
              <li key={request.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{typeLabels[request.type]}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(request.startDate)} — {formatDate(request.endDate)}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {statusLabels[request.status]}
                  </span>
                </div>
                <p className="mt-3 text-sm">{request.reason}</p>
                {request.reviewNotes ? (
                  <p className="mt-3 border-l-2 pl-3 text-sm text-muted-foreground">
                    Nota de revisión: {request.reviewNotes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
