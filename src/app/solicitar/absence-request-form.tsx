"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAbsenceRequest } from "@/app/actions/absence";
import { REQUEST_TYPES } from "@/lib/validation/absence.schema";
import {
  Calendar,
  CalendarDays,
  FilePlus,
  Loader2,
  Send,
} from "lucide-react";

const clientAbsenceSchema = z
  .object({
    type: z.enum(REQUEST_TYPES, {
      message: "Seleccioná una categoría válida.",
    }),
    startDate: z.string().trim().min(1, "La fecha de inicio es obligatoria."),
    endDate: z.string().trim().min(1, "La fecha de fin es obligatoria."),
    reason: z
      .string()
      .trim()
      .min(1, "El motivo es obligatorio.")
      .max(2000, "El motivo no puede superar los 2000 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      });
    }
  });

type ClientAbsenceFormData = z.infer<typeof clientAbsenceSchema>;

export function AbsenceRequestForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClientAbsenceFormData>({
    resolver: zodResolver(clientAbsenceSchema),
    defaultValues: {
      type: "" as unknown as (typeof REQUEST_TYPES)[number],
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });

  // Dynamic day count
  let calculatedDays: number | null = null;
  if (startDate && endDate && startDate <= endDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
    const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
    calculatedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  function onSubmit(data: ClientAbsenceFormData): void {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("type", data.type);
      formData.set("startDate", data.startDate);
      formData.set("endDate", data.endDate);
      formData.set("reason", data.reason.trim());

      const result = await createAbsenceRequest(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      reset();
      toast.success("Solicitud creada con éxito", {
        description: "Tu solicitud ha sido enviada y quedó en la bandeja de revisión.",
      });
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tipo de ausencia o licencia
            </Label>
            <select
              id="type"
              {...register("type")}
              aria-invalid={Boolean(errors.type)}
              aria-describedby={errors.type ? "type-error" : undefined}
              className="border-input h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              disabled={isPending}
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
            {errors.type && (
              <p id="type-error" role="alert" className="text-xs text-destructive font-medium">
                {errors.type.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Fecha de inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                aria-invalid={Boolean(errors.startDate)}
                aria-describedby={errors.startDate ? "startDate-error" : undefined}
                disabled={isPending}
                className="bg-background/50"
              />
              {errors.startDate && (
                <p id="startDate-error" role="alert" className="text-xs text-destructive font-medium">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Fecha de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                min={startDate || undefined}
                {...register("endDate")}
                aria-invalid={Boolean(errors.endDate)}
                aria-describedby={errors.endDate ? "endDate-error" : undefined}
                disabled={isPending}
                className="bg-background/50"
              />
              {errors.endDate && (
                <p id="endDate-error" role="alert" className="text-xs text-destructive font-medium">
                  {errors.endDate.message}
                </p>
              )}
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
              {...register("reason")}
              aria-invalid={Boolean(errors.reason)}
              aria-describedby={errors.reason ? "reason-error" : "reason-help"}
              placeholder="Indica el motivo de la solicitud, servicio afectado, o antecedentes relevantes..."
              className="min-h-28 w-full rounded-md border bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              maxLength={2000}
              disabled={isPending}
            />
            {errors.reason ? (
              <p id="reason-error" role="alert" className="text-xs text-destructive font-medium">
                {errors.reason.message}
              </p>
            ) : (
              <p id="reason-help" className="text-xs text-muted-foreground">
                Máximo 2000 caracteres. Esta información será evaluada por el jefe de servicio o administrador.
              </p>
            )}
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

