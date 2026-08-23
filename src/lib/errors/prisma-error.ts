import { Prisma } from "@prisma/client";
import { ConflictError } from "./domain-error";

export function isPrismaUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function translatePrismaConflict(
  error: unknown,
  message: string,
): never {
  if (isPrismaUniqueConstraintError(error)) {
    throw new ConflictError(message);
  }

  throw error;
}
