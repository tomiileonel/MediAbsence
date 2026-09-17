import { describe, expect, it, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";
import {
  getTodayAttendance,
  checkIn,
  checkOut,
} from "@/app/actions/attendance";
import type { Attendance } from "@prisma/client";
import { ConflictError } from "@/lib/errors/domain-error";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/modules/attendance/application/attendance-service", () => ({
  getTodayAttendanceForUser: vi.fn(),
  checkInForUser: vi.fn(),
  checkOutForUser: vi.fn(),
}));

import { requireAuth } from "@/modules/auth/guards";
import {
  getTodayAttendanceForUser,
  checkInForUser,
  checkOutForUser,
} from "@/modules/attendance/application/attendance-service";

describe("attendance actions", () => {
  const fakeAttendance: Attendance = {
    id: "att-1",
    userId: "u-1",
    date: new Date("2026-08-23T00:00:00.000Z"),
    timeIn: new Date("2026-08-23T08:00:00.000Z"),
    timeOut: null,
    status: "PRESENT",
    location: "Consultorio 2",
    notes: null,
    createdAt: new Date("2026-08-23T08:00:00.000Z"),
    updatedAt: new Date("2026-08-23T08:00:00.000Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
      id: "u-1",
      role: "RESIDENTE",
      name: "Dr. Ana",
      email: "ana@hospital.org",
    });
  });

  it("retrieves today attendance for the authenticated user", async () => {
    vi.mocked(getTodayAttendanceForUser).mockResolvedValue(fakeAttendance);

    const result = await getTodayAttendance();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.id).toBe("att-1");
      expect(result.data?.location).toBe("Consultorio 2");
    }
  });

  it("checks in the user, revalidates paths, and returns actionOk", async () => {
    vi.mocked(checkInForUser).mockResolvedValue(fakeAttendance);

    const result = await checkIn("Consultorio 2");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("att-1");
    }
    expect(checkInForUser).toHaveBeenCalledWith("u-1", "Consultorio 2");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/residente");
    expect(revalidatePath).toHaveBeenCalledWith("/profesional");
  });

  it("returns actionFailed with domain error message on conflict", async () => {
    vi.mocked(checkInForUser).mockRejectedValue(
      new ConflictError("Ya registraste tu ingreso para el día de hoy."),
    );

    const result = await checkIn("Consultorio 2");
    expect(result).toEqual({
      ok: false,
      error: "Ya registraste tu ingreso para el día de hoy.",
    });
  });

  it("returns actionFailed with generic safe message on internal error", async () => {
    vi.mocked(checkInForUser).mockRejectedValue(new Error("Prisma connection failure"));

    const result = await checkIn("Consultorio 2");
    expect(result).toEqual({
      ok: false,
      error: "No se pudo completar la operación. Intenta nuevamente.",
    });
  });

  it("checks out the user, revalidates paths, and returns actionOk", async () => {
    const checkedOutRecord: Attendance = {
      ...fakeAttendance,
      timeOut: new Date("2026-08-23T16:00:00.000Z"),
    };
    vi.mocked(checkOutForUser).mockResolvedValue(checkedOutRecord);

    const result = await checkOut();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.timeOut).toBe("2026-08-23T16:00:00.000Z");
    }
    expect(checkOutForUser).toHaveBeenCalledWith("u-1");
    expect(revalidatePath).toHaveBeenCalledWith("/residente");
  });
});
