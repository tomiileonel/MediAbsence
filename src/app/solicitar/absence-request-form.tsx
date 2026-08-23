"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAbsenceRequest } from "@/app/actions/absence";
import {
  Calendar,
  CalendarDays,
  FilePlus,
  Loader2,
  Send,
} from "lucide-react";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo registrar la solicitud de ausencia.";
}

export function AbsenceRequestForm() {
  const formReference = useRef<HTMLFormElement>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [isPending, startTransition] = useTransition();

  // Dynamic day count
  let calculatedDays: number | null = null;
  if (startDate && endDate && startDate <= endDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
    const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
    calculatedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (startDate && endDate && startDate > endDate) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    startTransition(async () => {
      try {
        await createAbsenceRequest(formData);
        formReference.current?.reset();
        setStartDate("");
        setEndDate("");
        setType("");
        toast.success("Solicitud creada con éxito", {
          description: "Tu solicitud ha sido enviada y quedó en la bandeja de revisión.",
        });
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FilePlus className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Crear nueva solicitud</CardTitle>
            <CardDescription className="text-sm">
              Especifica el tipo de licencia, las fechas solicitadas y la fundamentación correspondiente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formReference} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tipo de ausencia o licencia
            </Label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border-input h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              required
            >
              <option value="" disabled>
                -- Seleccioná una categoría --
              </option>
              <option value="SICK_LEAVE">Licencia médica por enfermedad / intervención</option>
              <option value="VACATION">Vacaciones anuales reglamentarias</option>
              <option value="PERSONAL">Asuntos particulares / trámite personal</option>
              <option value="CONGRESS">Congreso, jornada científica o capacitación</option>
              <option value="OTHER">Otro motivo justificado</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Fecha de inicio
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                required
                disabled={isPending}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Fecha de fin
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                disabled={isPending}
                className="bg-background/50"
              />
            </div>
          </div>

          {calculatedDays !== null && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-xs text-foreground font-medium border border-primary/15">
              <CalendarDays className="size-4 text-primary" />
              <span>
                Duración solicitada: <strong className="text-primary font-bold">{calculatedDays}</strong>{" "}
                {calculatedDays === 1 ? "día corrido" : "días corridos"}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Motivo o justificación detallada
            </Label>
            <textarea
              id="reason"
              name="reason"
              placeholder="Indica el motivo de la solicitud, servicio afectado, o antecedentes relevantes..."
              className="min-h-28 w-full rounded-md border bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              maxLength={2000}
              required
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Máximo 2000 caracteres. Esta información será evaluada por el jefe de servicio o administrador.
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isPending} className="font-semibold gap-2">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isPending ? "Enviando solicitud…" : "Enviar solicitud"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

