import { describe, expect, it } from "vitest";
import {
  formatDateOnly,
  getBusinessDate,
  parseDateOnly,
} from "@/lib/dates/business-day";

const BUENOS_AIRES = "America/Argentina/Buenos_Aires";

describe("business dates", () => {
  it("uses the configured business timezone around midnight", () => {
    const beforeMidnight = new Date("2026-08-23T02:30:00.000Z");
    const afterMidnight = new Date("2026-08-23T03:30:00.000Z");

    expect(formatDateOnly(getBusinessDate(beforeMidnight, BUENOS_AIRES))).toBe("2026-08-22");
    expect(formatDateOnly(getBusinessDate(afterMidnight, BUENOS_AIRES))).toBe("2026-08-23");
  });

  it("rejects impossible calendar dates", () => {
    expect(() => parseDateOnly("2026-02-30")).toThrow();
  });
});
