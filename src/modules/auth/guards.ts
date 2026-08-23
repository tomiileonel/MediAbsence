import { auth } from "../../../auth";
import {
  UnauthorizedError,
} from "@/lib/errors/domain-error";
import { assertRole, isAppRole, type AppRole } from "./roles";

export interface AuthenticatedActor {
  id: string;
  role: AppRole;
  name: string | null;
  email: string | null;
}

export async function requireAuth(): Promise<AuthenticatedActor> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !isAppRole(user.role)) {
    throw new UnauthorizedError();
  }

  return {
    id: user.id,
    role: user.role,
    name: user.name ?? null,
    email: user.email ?? null,
  };
}

export async function requireRole(
  ...allowedRoles: readonly AppRole[]
): Promise<AuthenticatedActor> {
  const actor = await requireAuth();

  assertRole(actor.role, allowedRoles);

  return actor;
}
