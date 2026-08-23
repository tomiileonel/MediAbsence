import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getTodayAttendanceForUser,
  checkInForUser,
  checkOutForUser,
} from "@/modules/attendance/application/attendance-service";
import type { Attendance } from "@prisma/client";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/domain-error";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    attendance: {
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

describe("attendance service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches today attendance for user", async () => {
    const fakeAttendance: Attendance = {
      id: "att-1",
      userId: "u-1",
      date: new Date("2026-08-23T00:00:00.000Z"),
      timeIn: new Date("2026-08-23T08:00:00.000Z"),
      timeOut: null,
      status: "PRESENT",
      location: "Guardia",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.attendance.findUnique).mockResolvedValueOnce(fakeAttendance);

    const result = await getTodayAttendanceForUser("u-1", new Date("2026-08-23T10:00:00Z"));
    expect(result?.id).toBe("att-1");
    expect(result?.location).toBe("Guardia");
  });

  it("checks in user successfully and registers audit", async () => {
    const fakeCreated: Attendance = {
      id: "att-1",
      userId: "u-1",
      date: new Date("2026-08-23T00:00:00.000Z"),
      timeIn: new Date("2026-08-23T08:00:00.000Z"),
      timeOut: null,
      status: "PRESENT",
      location: "Consultorio 1",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        attendance: {
          create: vi.fn().mockResolvedValue(fakeCreated),
        },
      };
      return (callback as TransactionCallback<Attendance>)(tx);
    });

    const result = await checkInForUser("u-1", "Consultorio 1", new Date("2026-08-23T08:00:00Z"));
    expect(result.id).toBe("att-1");
    expect(result.location).toBe("Consultorio 1");
  });

  it("rejects check in with invalid location payload", async () => {
    const invalidLocation = "A".repeat(501);
    await expect(checkInForUser("u-1", invalidLocation)).rejects.toThrow(ValidationError);
  });

  it("checks out user successfully", async () => {
    const existing: Attendance = {
      id: "att-1",
      userId: "u-1",
      date: new Date("2026-08-23T00:00:00.000Z"),
      timeIn: new Date("2026-08-23T08:00:00.000Z"),
      timeOut: null,
      status: "PRESENT",
      location: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated: Attendance = {
      ...existing,
      timeOut: new Date("2026-08-23T16:00:00.000Z"),
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        attendance: {
          findUnique: vi.fn().mockResolvedValueOnce(existing).mockResolvedValueOnce(updated),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };
      return (callback as TransactionCallback<Attendance>)(tx);
    });

    const result = await checkOutForUser("u-1", new Date("2026-08-23T16:00:00Z"));
    expect(result.timeOut).toEqual(new Date("2026-08-23T16:00:00.000Z"));
  });

  it("throws NotFoundError on check out if no check-in exists for today", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        attendance: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };
      return (callback as TransactionCallback<unknown>)(tx);
    });

    await expect(checkOutForUser("u-1", new Date("2026-08-23T16:00:00Z"))).rejects.toThrow(
      NotFoundError,
    );
  });

  it("throws ConflictError on check out if already checked out", async () => {
    const alreadyCheckedOut: Attendance = {
      id: "att-1",
      userId: "u-1",
      date: new Date("2026-08-23T00:00:00.000Z"),
      timeIn: new Date("2026-08-23T08:00:00.000Z"),
      timeOut: new Date("2026-08-23T16:00:00.000Z"),
      status: "PRESENT",
      location: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        attendance: {
          findUnique: vi.fn().mockResolvedValue(alreadyCheckedOut),
        },
      };
      return (callback as TransactionCallback<unknown>)(tx);
    });

    await expect(checkOutForUser("u-1", new Date("2026-08-23T17:00:00Z"))).rejects.toThrow(
      ConflictError,
    );
  });
});

