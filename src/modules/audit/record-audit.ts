import type { AuditAction, Prisma } from "@prisma/client";

export interface AuditRecordInput {
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonObject;
}

export async function recordAudit(
  client: { auditLog: { create: (args: Prisma.AuditLogCreateArgs) => Promise<unknown> } },
  input: AuditRecordInput,
): Promise<void> {
  await client.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
