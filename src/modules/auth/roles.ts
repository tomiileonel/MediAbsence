import { ForbiddenError } from "@/lib/errors/domain-error";

export const APP_ROLES = [
  "ADMIN",
  "JEFE",
  "PROFESIONAL",
  "RESIDENTE",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

const ROLE_HOME_PATH: Record<AppRole, string> = {
  ADMIN: "/admin",
  JEFE: "/jefe",
  PROFESIONAL: "/profesional",
  RESIDENTE: "/residente",
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function assertRole(
  role: AppRole,
  allowedRoles: readonly AppRole[],
): void {
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenError();
  }
}

export function getRoleHomePath(role: AppRole): string {
  return ROLE_HOME_PATH[role];
}

export function getRoleForPath(pathname: string): AppRole | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!firstSegment) {
    return null;
  }

  const roleByPath: Record<string, AppRole> = {
    admin: "ADMIN",
    jefe: "JEFE",
    profesional: "PROFESIONAL",
    residente: "RESIDENTE",
  };

  return roleByPath[firstSegment] ?? null;
}
