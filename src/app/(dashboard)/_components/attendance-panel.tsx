"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkIn, checkOut } from "@/app/actions/attendance";
import type { AttendanceSummary } from "@/modules/attendance/attendance-dto";

interface AttendancePanelProps {
  initialAttendance: AttendanceSummary | null;
}
function formatTime(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo actualizar la asistencia.";
}

export function AttendancePanel({ initialAttendance }: AttendancePanelProps) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [location, setLocation] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckIn(): void {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await checkIn(location || undefined);
        setAttendance(result);
        setFeedback("Ingreso registrado correctamente.");
      } catch (error: unknown) {
        setFeedback(getErrorMessage(error));
      }
    });
  }

  function handleCheckOut(): void {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await checkOut();
        setAttendance(result);
        setFeedback("Salida registrada correctamente.");
      } catch (error: unknown) {
        setFeedback(getErrorMessage(error));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistencia de hoy</CardTitle>
        <CardDescription>
          El día se calcula con la zona horaria de negocio configurada en el servidor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {attendance ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Fecha</dt>
              <dd className="font-medium">{attendance.date}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ingreso</dt>
              <dd className="font-medium">{formatTime(attendance.timeIn)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Salida</dt>
              <dd className="font-medium">{attendance.timeOut ? formatTime(attendance.timeOut) : "Pendiente"}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Todavía no registraste tu ingreso.</p>
        )}

        {!attendance ? (
          <div className="space-y-2">
            <Label htmlFor="attendance-location">Ubicación o referencia (opcional)</Label>
            <Input
              id="attendance-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={500}
              placeholder="Consultorio, guardia, etc."
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {!attendance ? (
            <Button type="button" onClick={handleCheckIn} disabled={isPending}>
              {isPending ? "Registrando…" : "Registrar ingreso"}
            </Button>
          ) : !attendance.timeOut ? (
            <Button type="button" variant="outline" onClick={handleCheckOut} disabled={isPending}>
              {isPending ? "Registrando…" : "Registrar salida"}
            </Button>
          ) : null}
        </div>

        {feedback ? (
          <p className="text-sm" role="status" aria-live="polite">{feedback}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
