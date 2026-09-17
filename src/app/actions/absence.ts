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
import {
  toAbsenceRequestSummaries,
  toAbsenceRequestSummary,
  type AbsenceRequestSummary,
} from "@/modules/absences/absence-dto";
import {
  actionOk,
  actionFailed,
  type ActionResult,
} from "@/lib/actions/result";

export async function createAbsenceRequest(
  formData: FormData,
): Promise<ActionResult<AbsenceRequestSummary>> {
  try {
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
    return actionOk(toAbsenceRequestSummary(request));
  } catch (error: unknown) {
    return actionFailed(error);
  }
}

export async function getMyRequests(): Promise<ActionResult<AbsenceRequestSummary[]>> {
  try {
    const actor = await requireAuth();
    const requests = await listAbsenceRequestsForUser(actor.id);
    return actionOk(toAbsenceRequestSummaries(requests));
  } catch (error: unknown) {
    return actionFailed(error);
  }
}

export async function getPendingRequests(): Promise<ActionResult<AbsenceRequestSummary[]>> {
  try {
    await requireRole("ADMIN", "JEFE");
    const requests = await listPendingAbsenceRequests();
    return actionOk(toAbsenceRequestSummaries(requests));
  } catch (error: unknown) {
    return actionFailed(error);
  }
}

export async function reviewAbsenceRequest(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string,
): Promise<ActionResult<AbsenceRequestSummary>> {
  try {
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
    return actionOk(toAbsenceRequestSummary(request));
  } catch (error: unknown) {
    return actionFailed(error);
  }
}
