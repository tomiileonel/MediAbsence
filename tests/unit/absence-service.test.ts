import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createAbsenceRequestForUser,
  listPendingAbsenceRequests,
  reviewAbsenceRequestForUser,
  type AbsenceRequestView,
} from "@/modules/absences/application/absence-service";
import { ConflictError, NotFoundError } from "@/lib/errors/domain-error";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    absenceRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
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

  it("creates an absence request within a transaction and logs audit", async () => {
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

  it("reviews a pending request successfully to APPROVED", async () => {
    const fakeReviewed: AbsenceRequestView = {
      id: "req-1",
      userId: "u-1",
      type: "SICK_LEAVE",
      startDate: new Date(),
      endDate: new Date(),
      reason: "Gripe",
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
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          findUnique: vi.fn().mockResolvedValue(fakeReviewed),
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
  });

  it("throws ConflictError if the request was already reviewed", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        absenceRequest: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          findUnique: vi.fn().mockResolvedValue({ id: "req-1", status: "REJECTED" }),
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
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          findUnique: vi.fn().mockResolvedValue(null),
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

