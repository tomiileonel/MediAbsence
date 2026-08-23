import type { Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ConflictError,
  NotFoundError,
} from "@/lib/errors/domain-error";
import type { AbsenceRequestInput } from "@/lib/validation/absence.schema";
import { recordAudit } from "@/modules/audit/record-audit";
import { logger } from "@/lib/observability/logger";

const absenceRequestSelect = {
  id: true,
  userId: true,
  type: true,
  startDate: true,
  endDate: true,
  reason: true,
  status: true,
  reviewedBy: true,
  reviewDttm: true,
  reviewNotes: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  reviewer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.AbsenceRequestSelect;

export type AbsenceRequestView = Prisma.AbsenceRequestGetPayload<{
  select: typeof absenceRequestSelect;
}>;

export async function createAbsenceRequestForUser(
  userId: string,
  input: AbsenceRequestInput,
): Promise<AbsenceRequestView> {
  const request = await prisma.$transaction(async (transaction) => {
    const request = await transaction.absenceRequest.create({
      data: {
        userId,
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
        status: "PENDING",
      },
      select: absenceRequestSelect,
    });

    await recordAudit(transaction, {
      actorId: userId,
      action: "ABSENCE_CREATED",
      entityType: "AbsenceRequest",
      entityId: request.id,
      metadata: { type: input.type },
    });
    return request;
  });

  logger.info("absence.created", { actorId: userId, requestId: request.id });
  return request;
}

export async function listAbsenceRequestsForUser(
  userId: string,
): Promise<AbsenceRequestView[]> {
  return prisma.absenceRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: absenceRequestSelect,
  });
}

export async function listPendingAbsenceRequests(): Promise<AbsenceRequestView[]> {
  return prisma.absenceRequest.findMany({
    where: { status: "PENDING" },
    orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
    select: absenceRequestSelect,
  });
}

export async function reviewAbsenceRequestForUser(
  reviewerId: string,
  input: {
    requestId: string;
    decision: Extract<RequestStatus, "APPROVED" | "REJECTED">;
    notes: string;
  },
): Promise<AbsenceRequestView> {
  const request = await prisma.$transaction(async (transaction) => {
    const updateResult = await transaction.absenceRequest.updateMany({
      where: {
        id: input.requestId,
        status: "PENDING",
      },
      data: {
        status: input.decision,
        reviewedBy: reviewerId,
        reviewDttm: new Date(),
        reviewNotes: input.notes || null,
      },
    });

    if (updateResult.count !== 1) {
      const request = await transaction.absenceRequest.findUnique({
        where: { id: input.requestId },
        select: { id: true, status: true },
      });

      if (!request) {
        throw new NotFoundError("La solicitud de ausencia no existe.");
      }

      throw new ConflictError("La solicitud ya fue revisada por otra persona.");
    }

    const request = await transaction.absenceRequest.findUnique({
      where: { id: input.requestId },
      select: absenceRequestSelect,
    });

    if (!request) {
      throw new Error("La solicitud no pudo recuperarse después de la revisión.");
    }

    await recordAudit(transaction, {
      actorId: reviewerId,
      action: input.decision === "APPROVED" ? "ABSENCE_APPROVED" : "ABSENCE_REJECTED",
      entityType: "AbsenceRequest",
      entityId: request.id,
      metadata: { status: input.decision },
    });
    return request;
  });

  logger.info("absence.reviewed", { actorId: reviewerId, requestId: request.id, decision: input.decision });
  return request;
}
