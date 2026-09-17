import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createAbsenceRequestForUser,
  listPendingAbsenceRequests,
  reviewAbsenceRequestForUser,
  type AbsenceRequestView,
} from "@/modules/absences/application/absence-service";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors/domain-error";
import { recordAudit } from "@/modules/audit/record-audit";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    absenceRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/modules/audit/record-audit", () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/observability/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

type TransactionCallback<T> = (tx: unknown) => Promise<T>;

describe("absence service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an absence request within a transaction when no overlap exists", async () => {
    const fakeCreated: AbsenceRequestView = {
      id: "req-1",
      userId: "u-1",
      type: "VACATION",
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-10"),
      reason: "Vacaciones de primavera",
      status: "PENDING",
      reviewedBy: null,
      reviewDttm: null,
      reviewNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: "u-1", name: "Dr. Ana", email: "ana@hospital.org" },
      reviewer: null,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        absenceRequest: {
          count: vi.fn().mockResolvedValue(0),
          create: vi.fn().mockResolvedValue(fakeCreated),
        },
      };
      return (callback as TransactionCallback<AbsenceRequestView>)(tx);
    });

    const result = await createAbsenceRequestForUser("u-1", {
      type: "VACATION",
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-10"),
      reason: "Vacaciones de primavera",
    });

    expect(result.id).toBe("req-1");
    expect(result.status).toBe("PENDING");
  });

  it("throws ConflictError when an overlapping active request exists for the user", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        absenceRequest: {
          count: vi.fn().mockResolvedValue(1),
          create: vi.fn(),
        },
      };
      return (callback as TransactionCallback<AbsenceRequestView>)(tx);
    });

    await expect(
      createAbsenceRequestForUser("u-1", {
        type: "VACATION",
        startDate: new Date("2026-10-05"),
        endDate: new Date("2026-10-12"),
        reason: "Solapada",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("lists pending requests ordered by startDate and createdAt", async () => {
    const fakeList: AbsenceRequestView[] = [
      {
        id: "r1",
        userId: "u1",
        type: "PERSONAL",
        startDate: new Date(),
        endDate: new Date(),
        reason: "Personal",
        status: "PENDING",
        reviewedBy: null,
        reviewDttm: null,
        reviewNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: "u1", name: null, email: null },
        reviewer: null,
      },
    ];
    vi.mocked(prisma.absenceRequest.findMany).mockResolvedValueOnce(fakeList);

    const pending = await listPendingAbsenceRequests();
    expect(pending).toHaveLength(1);
    expect(prisma.absenceRequest.findMany).toHaveBeenCalledWith({
      where: { status: "PENDING" },
      orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
      select: expect.any(Object),
    });
  });

  it("prohibits reviewer from self-reviewing their own absence request", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        absenceRequest: {
          findUnique: vi.fn().mockResolvedValue({ id: "req-self", userId: "chief-1", status: "PENDING" }),
          updateMany: vi.fn(),
        },
      };
      return (callback as TransactionCallback<unknown>)(tx);
    });

    await expect(
      reviewAbsenceRequestForUser("chief-1", {
        requestId: "req-self",
        decision: "APPROVED",
        notes: "Auto-aprobación",
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("reviews a pending request successfully to APPROVED and computes payroll deduction if salary is set", async () => {
    const fakeReviewed: AbsenceRequestView = {
      id: "req-1",
      userId: "u-1",
      type: "VACATION",
      startDate: new Date("2026-10-05T00:00:00.000Z"), // Monday
      endDate: new Date("2026-10-07T00:00:00.000Z"),   // Wednesday (3 business days)
      reason: "Vacaciones",
      status: "APPROVED",
      reviewedBy: "chief-1",
      reviewDttm: new Date(),
      reviewNotes: "Aprobado sin objeciones",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: "u-1", name: "Dr. Ana", email: "ana@hospital.org" },
      reviewer: { id: "chief-1", name: "Jefe", email: "jefe@hospital.org" },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        absenceRequest: {
          findUnique: vi
            .fn()
            .mockResolvedValueOnce({ id: "req-1", userId: "u-1", status: "PENDING" })
            .mockResolvedValueOnce(fakeReviewed),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({ monthlySalaryMinor: BigInt(3000000) }),
        },
      };
      return (callback as TransactionCallback<AbsenceRequestView>)(tx);
    });

    const result = await reviewAbsenceRequestForUser("chief-1", {
      requestId: "req-1",
      decision: "APPROVED",
      notes: "Aprobado sin objeciones",
    });

    expect(result.status).toBe("APPROVED");
    expect(result.reviewedBy).toBe("chief-1");
    // 3 days / 30 * 3,000,000 = 300,000
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "ABSENCE_APPROVED",
        metadata: expect.objectContaining({
          status: "APPROVED",
          absenceDays: 3,
          deductionMinor: "300000",
        }),
      }),
    );
  });

  it("throws ConflictError if the request was already reviewed", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        absenceRequest: {
          findUnique: vi.fn().mockResolvedValue({ id: "req-1", userId: "u-1", status: "PENDING" }),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      };
      return (callback as TransactionCallback<unknown>)(tx);
    });

    await expect(
      reviewAbsenceRequestForUser("chief-1", {
        requestId: "req-1",
        decision: "APPROVED",
        notes: "",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws NotFoundError if the request does not exist", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        absenceRequest: {
          findUnique: vi.fn().mockResolvedValue(null),
          updateMany: vi.fn(),
        },
      };
      return (callback as TransactionCallback<unknown>)(tx);
    });

    await expect(
      reviewAbsenceRequestForUser("chief-1", {
        requestId: "req-nonexistent",
        decision: "APPROVED",
        notes: "",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});

