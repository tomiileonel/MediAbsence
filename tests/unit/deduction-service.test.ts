import { describe, expect, it } from "vitest";
import { calculateDeduction } from "@/modules/payroll/domain/deduction-service";

const calendarDaysPolicy = {
  divisorDays: 30,
  includeWeekends: true,
  includeHolidays: true,
  rounding: "HALF_UP" as const,
};

describe("policy-driven payroll deduction", () => {
  it("calculates inclusive calendar days with integer minor units", () => {
    const result = calculateDeduction({
      monthlySalaryMinor: BigInt(3_000_000),
      startDate: "2026-08-01",
      endDate: "2026-08-03",
      holidays: new Set(),
      policy: calendarDaysPolicy,
    });

    expect(result.absenceDays).toBe(3);
    expect(result.deductionMinor).toBe(BigInt(300_000));
  });

  it("can exclude weekends and holidays only when the policy says so", () => {
    const result = calculateDeduction({
      monthlySalaryMinor: BigInt(3_000_000),
      startDate: "2026-08-14",
      endDate: "2026-08-17",
      holidays: new Set(["2026-08-17"]),
      policy: {
        ...calendarDaysPolicy,
        includeWeekends: false,
        includeHolidays: false,
      },
    });

    expect(result.eligibleDates).toEqual(["2026-08-14"]);
  });

  it("handles month boundaries without relying on month length", () => {
    const february = calculateDeduction({
      monthlySalaryMinor: BigInt(2_800_000),
      startDate: "2026-02-27",
      endDate: "2026-03-01",
      holidays: new Set(),
      policy: calendarDaysPolicy,
    });
    const march = calculateDeduction({
      monthlySalaryMinor: BigInt(3_100_000),
      startDate: "2026-03-30",
      endDate: "2026-04-01",
      holidays: new Set(),
      policy: calendarDaysPolicy,
    });

    expect(february.absenceDays).toBe(3);
    expect(march.absenceDays).toBe(3);
  });

  it("rejects an invalid date range or policy", () => {
    expect(() => calculateDeduction({
      monthlySalaryMinor: BigInt(1),
      startDate: "2026-08-03",
      endDate: "2026-08-02",
      holidays: new Set(),
      policy: calendarDaysPolicy,
    })).toThrow();

    expect(() => calculateDeduction({
      monthlySalaryMinor: BigInt(1),
      startDate: "2026-08-01",
      endDate: "2026-08-01",
      holidays: new Set(),
      policy: { ...calendarDaysPolicy, divisorDays: 0 },
    })).toThrow();
  });
});
