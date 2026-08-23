import { describe, expect, it } from "vitest";
import { toAttendanceSummary } from "@/modules/attendance/attendance-dto";
import type { Attendance } from "@prisma/client";

describe("attendance dto transformers", () => {
  it("returns null when attendance record is null", () => {
    expect(toAttendanceSummary(null)).toBeNull();
  });

  it("converts Attendance model to serializable AttendanceSummary", () => {
    const record: Attendance = {
      id: "att-1",
      userId: "user-1",
      date: new Date("2026-08-23T00:00:00.000Z"),
      timeIn: new Date("2026-08-23T08:00:00.000Z"),
      timeOut: new Date("2026-08-23T16:00:00.000Z"),
      status: "PRESENT",
      location: "Guardia Central",
      notes: null,
      createdAt: new Date("2026-08-23T08:00:00.000Z"),
      updatedAt: new Date("2026-08-23T16:00:00.000Z"),
    };

    const summary = toAttendanceSummary(record);
    expect(summary).not.toBeNull();
    expect(summary?.id).toBe("att-1");
    expect(summary?.date).toBe("2026-08-23");
    expect(summary?.timeIn).toBe("2026-08-23T08:00:00.000Z");
    expect(summary?.timeOut).toBe("2026-08-23T16:00:00.000Z");
    expect(summary?.status).toBe("PRESENT");
    expect(summary?.location).toBe("Guardia Central");
  });
});
