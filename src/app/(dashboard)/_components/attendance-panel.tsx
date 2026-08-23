"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { checkIn, checkOut } from "@/app/actions/attendance";
import type { AttendanceSummary } from "@/modules/attendance/attendance-dto";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
} from "lucide-react";

interface AttendancePanelProps {
  initialAttendance: AttendanceSummary | null;
}

function formatTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo actualizar la asistencia.";
}

export function AttendancePanel({ initialAttendance }: AttendancePanelProps) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [location, setLocation] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCheckIn(): void {
    startTransition(async () => {
      try {
        const result = await checkIn(location.trim() || undefined);
        setAttendance(result);
        setLocation("");
        if (result) {
          toast.success("Ingreso registrado correctamente", {
            description: `Hora de ingreso: ${formatTime(result.timeIn)}`,
          });
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  function handleCheckOut(): void {
    startTransition(async () => {
      try {
        const result = await checkOut();
        setAttendance(result);
        if (result) {
          toast.success("Salida registrada correctamente", {
            description: result.timeOut ? `Hora de egreso: ${formatTime(result.timeOut)}` : undefined,
          });
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  const isCheckedIn = !!attendance;
  const isCompleted = isCheckedIn && !!attendance.timeOut;

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Registro de Asistencia</CardTitle>
            <CardDescription className="text-sm">
              Control diario de jornada en tiempo real (zona horaria oficial).
            </CardDescription>
          </div>
          <Badge
            variant={isCompleted ? "approved" : isCheckedIn ? "info" : "outline"}
            className="font-semibold"
          >
            {isCompleted ? "Jornada completada" : isCheckedIn ? "En servicio" : "Pendiente de ingreso"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {attendance ? (
          <div className="rounded-xl border bg-muted/25 p-4 sm:p-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</dt>
                  <dd className="text-sm font-semibold text-foreground mt-0.5">{attendance.date}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <LogIn className="size-4" />
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ingreso</dt>
                  <dd className="text-sm font-semibold text-foreground mt-0.5">
                    {formatTime(attendance.timeIn)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                  <LogOut className="size-4" />
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salida</dt>
                  <dd className="text-sm font-semibold text-foreground mt-0.5">
                    {attendance.timeOut ? formatTime(attendance.timeOut) : "En curso"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center bg-muted/10">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <Clock className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">Aún no has registrado tu ingreso de hoy</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registra tu entrada para marcar el inicio formal de tu turno.
            </p>
          </div>
        )}

        {!attendance && (
          <div className="space-y-2">
            <Label htmlFor="attendance-location" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="size-3.5" /> Ubicación o servicio de guardia (opcional)
            </Label>
            <Input
              id="attendance-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={500}
              placeholder="Ej: Sala de Guardia, Terapia Intensiva, Consultorio 3..."
              disabled={isPending}
              className="bg-background/50"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          {!attendance ? (
            <Button
              type="button"
              onClick={handleCheckIn}
              disabled={isPending}
              className="font-medium gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {isPending ? "Registrando ingreso…" : "Marcar ingreso"}
            </Button>
          ) : !attendance.timeOut ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCheckOut}
              disabled={isPending}
              className="font-medium gap-2 border-primary/30 hover:bg-primary/5"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {isPending ? "Registrando salida…" : "Marcar salida de turno"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-2 px-3 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="size-4" />
              Jornada completada para la fecha actual.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


