type LogContextValue = string | number | boolean | null;
export type LogContext = Readonly<Record<string, LogContextValue>>;
export type LogLevel = "info" | "warn" | "error";

function writeLog(level: LogLevel, event: string, context: LogContext = {}): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  };

  const serializedPayload = JSON.stringify(payload);

  if (level === "error") {
    console.error(serializedPayload);
    return;
  }

  if (level === "warn") {
    console.warn(serializedPayload);
    return;
  }

  console.info(serializedPayload);
}

export const logger = {
  info(event: string, context?: LogContext): void {
    writeLog("info", event, context);
  },
  warn(event: string, context?: LogContext): void {
    writeLog("warn", event, context);
  },
  error(event: string, context?: LogContext): void {
    writeLog("error", event, context);
  },
};
