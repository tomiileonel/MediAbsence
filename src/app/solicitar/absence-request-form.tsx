"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAbsenceRequest } from "@/app/actions/absence";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo crear la solicitud.";
}

export function AbsenceRequestForm() {
  const formReference = useRef<HTMLFormElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFeedback(null);

    startTransition(async () => {
      try {
        await createAbsenceRequest(formData);
        formReference.current?.reset();
        setFeedback("Solicitud enviada. Quedará pendiente de revisión.");
      } catch (error: unknown) {
        setFeedback(getErrorMessage(error));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva solicitud</CardTitle>
        <CardDescription>Completa los datos; las fechas se guardan como días de calendario.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formReference} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de solicitud</Label>
            <select
              id="type"
              name="type"
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              defaultValue=""
              required
            >
              <option value="" disabled>Seleccioná una opción</option>
              <option value="SICK_LEAVE">Licencia médica</option>
              <option value="VACATION">Vacaciones</option>
              <option value="PERSONAL">Personal</option>
              <option value="CONGRESS">Congreso</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <textarea
              id="reason"
              name="reason"
              className="min-h-32 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              maxLength={2000}
              required
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Enviando…" : "Enviar solicitud"}
          </Button>

          {feedback ? (
            <p className="text-sm" role="status" aria-live="polite">{feedback}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
