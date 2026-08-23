export type DomainErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "CONFLICT"
  | "NOT_FOUND"
  | "INTERNAL";

export class DomainError extends Error {
  public readonly code: DomainErrorCode;

  public constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

export class UnauthorizedError extends DomainError {
  public constructor(message = "Tu sesión no es válida o ha expirado.") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends DomainError {
  public constructor(message = "No tienes permisos para realizar esta operación.") {
    super("FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends DomainError {
  public constructor(message: string) {
    super("VALIDATION", message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends DomainError {
  public constructor(message: string) {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}

export class NotFoundError extends DomainError {
  public constructor(message: string) {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export function getActionErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }

  if (error instanceof Error) {
    return "No se pudo completar la operación. Intenta nuevamente.";
  }

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
