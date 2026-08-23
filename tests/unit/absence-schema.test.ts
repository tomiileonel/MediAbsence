import { describe, expect, it } from "vitest";
import { absenceRequestInputSchema } from "@/lib/validation/absence.schema";

describe("absence request validation", () => {
  it("parses a valid request into date-only UTC values", () => {
    const result = absenceRequestInputSchema.safeParse({
      type: "SICK_LEAVE",
      startDate: "2026-08-24",
      endDate: "2026-08-26",
      reason: "Certificado médico presentado.",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate.toISOString()).toBe("2026-08-24T00:00:00.000Z");
    }
  });

  it("rejects invalid enum values, date ranges and oversized reasons", () => {
    const result = absenceRequestInputSchema.safeParse({
      type: "UNKNOWN",
      startDate: "2026-08-27",
      endDate: "2026-08-26",
      reason: "x".repeat(2001),
    });

    expect(result.success).toBe(false);
  });

  it("rejects impossible dates at the boundary", () => {
    const result = absenceRequestInputSchema.safeParse({
      type: "VACATION",
      startDate: "2026-02-30",
      endDate: "2026-03-01",
      reason: "Planificación anual.",
    });

    expect(result.success).toBe(false);
  });
});
