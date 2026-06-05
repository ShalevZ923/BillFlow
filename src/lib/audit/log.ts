import { createDb } from "@/db/client";
import { auditLogs } from "@/db/schema";

export type AuditEventParams = {
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  changes?: Record<string, unknown>;
};

export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  const db = createDb();

  await db.insert(auditLogs).values({
    userId: params.userId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    changes: params.changes ?? null
  });
}
