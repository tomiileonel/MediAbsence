import type { AuditAction, Prisma } from "@prisma/client";

export interface AuditRecordInput {
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonObject;
}

export async function recordAudit(
  transaction: Prisma.TransactionClient,
  input: AuditRecordInput,
): Promise<void> {
  await transaction.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
});
}
