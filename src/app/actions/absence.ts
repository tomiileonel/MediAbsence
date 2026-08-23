"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ValidationError } from "@/lib/errors/domain-error";
import {
  parseAbsenceRequestFormData,
  reviewAbsenceRequestInputSchema,
} from "@/lib/validation/absence.schema";
import type { AbsenceRequestInput } from "@/lib/validation/absence.schema";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import {
  createAbsenceRequestForUser,
  listAbsenceRequestsForUser,
  listPendingAbsenceRequests,
  reviewAbsenceRequestForUser,
} from "@/modules/absences/application/absence-service";
import { toAbsenceRequestSummaries, toAbsenceRequestSummary } from "@/modules/absences/absence-dto";

export async function createAbsenceRequest(formData: FormData) {
  const actor = await requireAuth();
  let input: AbsenceRequestInput;

  try {
    input = parseAbsenceRequestFormData(formData);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Revisa el tipo, las fechas y el motivo de la solicitud.");
    }

    throw error;
  }

  const request = await createAbsenceRequestForUser(actor.id, input);
  revalidatePath("/solicitar");
  revalidatePath("/solicitudes");
  revalidatePath("/jefe");
  revalidatePath("/admin");
  return toAbsenceRequestSummary(request);
}
export async function getMyRequests() {
  const actor = await requireAuth();
  return toAbsenceRequestSummaries(await listAbsenceRequestsForUser(actor.id));
}

export async function getPendingRequests() {
  await requireRole("ADMIN", "JEFE");
  return toAbsenceRequestSummaries(await listPendingAbsenceRequests());
}

export async function reviewAbsenceRequest(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string,
) {
  const actor = await requireRole("ADMIN", "JEFE");
  const parsedInput = reviewAbsenceRequestInputSchema.safeParse({
    requestId,
    decision,
    notes,
  });

  if (!parsedInput.success) {
    throw new ValidationError("Revisa la decisión, el identificador y las notas.");
  }

  const request = await reviewAbsenceRequestForUser(actor.id, parsedInput.data);
  revalidatePath("/jefe");
  revalidatePath("/admin");
  revalidatePath("/solicitudes");
  return toAbsenceRequestSummary(request);
}
