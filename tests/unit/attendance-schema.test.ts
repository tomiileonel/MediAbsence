import { describe, expect, it } from "vitest";
import { attendanceLocationSchema } from "@/lib/validation/attendance.schema";

describe("attendance location schema", () => {
  it("accepts undefined or empty string as undefined/trimmed", () => {
    expect(attendanceLocationSchema.parse(undefined)).toBeUndefined();
    expect(attendanceLocationSchema.parse("")).toBeUndefined();
    expect(attendanceLocationSchema.parse("   ")).toBeUndefined();
  });

  it("trims and accepts valid location strings", () => {
    expect(attendanceLocationSchema.parse("  Sala de Guardia  ")).toBe("Sala de Guardia");
    expect(attendanceLocationSchema.parse("Consultorio 4")).toBe("Consultorio 4");
  });

  it("rejects locations exceeding maximum length", () => {
    const tooLong = "A".repeat(501);
    expect(() => attendanceLocationSchema.parse(tooLong)).toThrow();
  });
});
