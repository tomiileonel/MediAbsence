import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAppRole, type AppRole } from "./roles";
import { recordAudit } from "@/modules/audit/record-audit";

export const DUMMY_BCRYPT_HASH =
  "$2a$12$e80yV8s76Z17qX/oKz767e7E2z8X3I/2Q13hNq60.e5K16v9jJkue";

export const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export async function authorizeUser(credentials: unknown) {
  const parsedCredentials = credentialsSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    return null;
  }

  const email = parsedCredentials.data.email;
  const password = parsedCredentials.data.password;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user?.password || !isAppRole(user.role)) {
    await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
    await recordAudit(prisma, {
      actorId: null,
      action: "LOGIN_FAILED",
      entityType: "Session",
      entityId: email,
      metadata: { reason: "unknown_user" },
    });
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  await recordAudit(prisma, {
    actorId: user.id,
    action: passwordMatches ? "LOGIN_SUCCEEDED" : "LOGIN_FAILED",
    entityType: "Session",
    entityId: user.id,
    metadata: {},
  });

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role as AppRole,
  };
}
