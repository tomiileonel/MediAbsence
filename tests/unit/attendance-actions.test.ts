import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getTodayAttendance,
  checkIn,
  checkOut,
} from "@/app/actions/attendance";
import type { Attendance } from "@prisma/client";

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

    const summary = await getTodayAttendance();
    expect(summary?.id).toBe("att-1");
    expect(summary?.location).toBe("Consultorio 2");
  });

  it("checks in the user and transforms summary", async () => {
    vi.mocked(checkInForUser).mockResolvedValue(fakeAttendance);

    const summary = await checkIn("Consultorio 2");
    expect(summary?.id).toBe("att-1");
    expect(checkInForUser).toHaveBeenCalledWith("u-1", "Consultorio 2");
  });

  it("checks out the user and transforms summary", async () => {
    const checkedOutRecord: Attendance = {
      ...fakeAttendance,
      timeOut: new Date("2026-08-23T16:00:00.000Z"),
    };
    vi.mocked(checkOutForUser).mockResolvedValue(checkedOutRecord);

    const summary = await checkOut();
    expect(summary?.timeOut).toBe("2026-08-23T16:00:00.000Z");
    expect(checkOutForUser).toHaveBeenCalledWith("u-1");
  });
});
