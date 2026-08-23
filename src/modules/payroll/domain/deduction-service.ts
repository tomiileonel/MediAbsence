import { parseDateOnly } from "@/lib/dates/business-day";

export type DeductionRounding = "DOWN" | "HALF_UP" | "UP";

export interface DeductionPolicy {
  divisorDays: number;
  includeWeekends: boolean;
  includeHolidays: boolean;
  rounding: DeductionRounding;
}

export interface DeductionCalculationInput {
  monthlySalaryMinor: bigint;
  startDate: string;
  endDate: string;
  holidays: ReadonlySet<string>;
  policy: DeductionPolicy;
}

export interface DeductionCalculationResult {
  monthlySalaryMinor: bigint;
  absenceDays: number;
  divisorDays: number;
  deductionMinor: bigint;
  eligibleDates: string[];
}

function validatePolicy(policy: DeductionPolicy): void {
  if (!Number.isSafeInteger(policy.divisorDays) || policy.divisorDays <= 0) {
    throw new Error("La política de deducción debe definir un divisor entero positivo.");
  }

  if (!["DOWN", "HALF_UP", "UP"].includes(policy.rounding)) {
    throw new Error("La política de deducción define un redondeo desconocido.");
  }
}

function roundFraction(
  numerator: bigint,
  denominator: bigint,
  rounding: DeductionRounding,
): bigint {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  if (remainder === BigInt(0) || rounding === "DOWN") {
    return quotient;
  }

  if (rounding === "UP" || remainder * BigInt(2) >= denominator) {
    return quotient + BigInt(1);
  }

  return quotient;
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function calculateDeduction(
  input: DeductionCalculationInput,
): DeductionCalculationResult {
  if (typeof input.monthlySalaryMinor !== "bigint") {
    throw new Error("El salario mensual debe expresarse en unidades menores enteras.");
  }

  if (input.monthlySalaryMinor < BigInt(0)) {
    throw new Error("El salario mensual no puede ser negativo.");
  }

  validatePolicy(input.policy);
  const startDate = parseDateOnly(input.startDate);
  const endDate = parseDateOnly(input.endDate);

  if (startDate > endDate) {
    throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
  }

  for (const holiday of input.holidays) {
    parseDateOnly(holiday);
  }

  const eligibleDates: string[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const dateKey = cursor.toISOString().slice(0, 10);
    const excludedWeekend = !input.policy.includeWeekends && isWeekend(cursor);
    const excludedHoliday = !input.policy.includeHolidays && input.holidays.has(dateKey);

    if (!excludedWeekend && !excludedHoliday) {
      eligibleDates.push(dateKey);
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const deductionMinor = roundFraction(
    input.monthlySalaryMinor * BigInt(eligibleDates.length),
    BigInt(input.policy.divisorDays),
    input.policy.rounding,
  );

  return {
    monthlySalaryMinor: input.monthlySalaryMinor,
    absenceDays: eligibleDates.length,
    divisorDays: input.policy.divisorDays,
    deductionMinor,
    eligibleDates,
  };
}
