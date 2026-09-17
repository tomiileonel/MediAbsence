import type { Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors/domain-error";
import { isPrismaConstraintViolationError } from "@/lib/errors/prisma-error";
import type { AbsenceRequestInput } from "@/lib/validation/absence.schema";
import { recordAudit } from "@/modules/audit/record-audit";
import { logger } from "@/lib/observability/logger";
import { calculateDeduction, type DeductionPolicy } from "@/modules/payroll/domain/deduction-service";
import { formatDateOnly } from "@/lib/dates/business-day";

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

const PAYROLL_POLICY: DeductionPolicy = {
  divisorDays: 30,
  includeWeekends: false,
  includeHolidays: false,
  rounding: "HALF_UP",
};

export async function createAbsenceRequestForUser(
  userId: string,
  input: AbsenceRequestInput,
): Promise<AbsenceRequestView> {
  try {
    const request = await prisma.$transaction(async (transaction) => {
      const overlapping = await transaction.absenceRequest.count({
        where: {
          userId,
          status: { in: ["PENDING", "APPROVED"] },
          startDate: { lte: input.endDate },
          endDate: { gte: input.startDate },
        },
      });

      if (overlapping > 0) {
        throw new ConflictError(
          "Ya tenés una solicitud activa que se superpone con esas fechas.",
        );
      }

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
  } catch (error: unknown) {
    if (isPrismaConstraintViolationError(error)) {
      throw new ConflictError(
        "Ya tenés una solicitud activa que se superpone con esas fechas.",
      );
    }
    throw error;
  }
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
    const target = await transaction.absenceRequest.findUnique({
      where: { id: input.requestId },
      select: { id: true, userId: true, status: true },
    });

    if (!target) {
      throw new NotFoundError("La solicitud de ausencia no existe.");
    }

    if (target.userId === reviewerId) {
      throw new ForbiddenError("No puedes dictaminar tu propia solicitud.");
    }

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
      throw new ConflictError("La solicitud ya fue revisada por otra persona.");
    }

    const request = await transaction.absenceRequest.findUnique({
      where: { id: input.requestId },
      select: absenceRequestSelect,
    });

    if (!request) {
      throw new Error("La solicitud no pudo recuperarse después de la revisión.");
    }

    let deductionMetadata: Record<string, unknown> | undefined;

    if (input.decision === "APPROVED") {
      const requester = await transaction.user.findUnique({
        where: { id: request.userId },
        select: { monthlySalaryMinor: true },
      });

      if (requester?.monthlySalaryMinor) {
        const deduction = calculateDeduction({
          monthlySalaryMinor: requester.monthlySalaryMinor,
          startDate: formatDateOnly(request.startDate),
          endDate: formatDateOnly(request.endDate),
          holidays: new Set<string>(),
          policy: PAYROLL_POLICY,
        });

        deductionMetadata = {
          absenceDays: deduction.absenceDays,
          deductionMinor: deduction.deductionMinor.toString(),
        };
      }
    }

    await recordAudit(transaction, {
      actorId: reviewerId,
      action: input.decision === "APPROVED" ? "ABSENCE_APPROVED" : "ABSENCE_REJECTED",
      entityType: "AbsenceRequest",
      entityId: request.id,
      metadata: {
        status: input.decision,
        ...deductionMetadata,
      },
    });
    return request;
  });

  logger.info("absence.reviewed", { actorId: reviewerId, requestId: request.id, decision: input.decision });
  return request;
}
