const DEFAULT_BUSINESS_TIMEZONE = "America/Argentina/Buenos_Aires";

function resolveBusinessTimezone(): string {
  const configuredTimezone = process.env.BUSINESS_TIMEZONE?.trim();

  if (!configuredTimezone) {
    return DEFAULT_BUSINESS_TIMEZONE;
  }

  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: configuredTimezone }).format();
  } catch {
    throw new Error(
      `BUSINESS_TIMEZONE no es válida: ${configuredTimezone}. Usa un identificador IANA.`,
    );
  }

  return configuredTimezone;
}

export const BUSINESS_TIMEZONE = resolveBusinessTimezone();

function getDateParts(date: Date, timeZone: string): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
}

export function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Fecha de calendario inválida: ${value}`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Fecha de calendario inválida: ${value}`);
  }

  return date;
}

export function getBusinessDate(
  now = new Date(),
  timeZone = BUSINESS_TIMEZONE,
): Date {
  const parts = getDateParts(now, timeZone);
  return parseDateOnly(`${parts.year}-${parts.month}-${parts.day}`);
}

export function formatDateOnly(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("No se puede formatear una fecha inválida.");
  }

  // Prisma representa PostgreSQL DATE como un Date en medianoche UTC.
  return date.toISOString().slice(0, 10);
}
