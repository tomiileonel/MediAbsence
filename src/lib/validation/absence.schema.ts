import { z } from "zod";
import { parseDateOnly } from "@/lib/dates/business-day";

export const REQUEST_TYPES = [
  "SICK_LEAVE",
  "VACATION",
  "PERSONAL",
  "CONGRESS",
  "OTHER",
] as const;

const dateOnlyTextSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato AAAA-MM-DD.")
  .refine((value) => {
    try {
      parseDateOnly(value);
      return true;
    } catch {
      return false;
    }
  }, "La fecha indicada no es válida.")
  .transform(parseDateOnly);

export const absenceRequestInputSchema = z
  .object({
    type: z.enum(REQUEST_TYPES),
    startDate: dateOnlyTextSchema,
    endDate: dateOnlyTextSchema,
    reason: z
      .string()
      .trim()
      .min(1, "El motivo es obligatorio.")
      .max(2000, "El motivo no puede superar los 2000 caracteres."),
  })
  .superRefine((value, context) => {
    if (value.startDate > value.endDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha de fin debe ser igual o posterior a la fecha de inicio.",
      });
    }
  });

export type AbsenceRequestInput = z.output<typeof absenceRequestInputSchema>;

export function parseAbsenceRequestFormData(
  formData: FormData,
): AbsenceRequestInput {
  return absenceRequestInputSchema.parse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
  });
}

export const reviewAbsenceRequestInputSchema = z.object({
  requestId: z.string().trim().min(1, "La solicitud es obligatoria."),
  decision: z.enum(["APPROVED", "REJECTED"]),
  notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres.")
    .optional()
    .default(""),
});
