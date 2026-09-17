import { Prisma } from "@prisma/client";
import { ConflictError } from "./domain-error";

export function isPrismaUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function isPrismaConstraintViolationError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    // P2002 = unique; P2004 = raw constraint violation (e.g. 23P01 exclusion_violation)
    (error.code === "P2002" || error.code === "P2004")
  );
}

export function translatePrismaConflict(
  error: unknown,
  message: string,
): never {
  if (isPrismaConstraintViolationError(error)) {
    throw new ConflictError(message);
  }

  throw error;
}
