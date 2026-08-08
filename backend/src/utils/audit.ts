import type { Request } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

interface AuditParams {
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/** Fire-and-forget audit trail write for the Role & Permission Management module's "view audit logs" feature. */
export async function recordAudit(req: Request, params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: req.ip,
    },
  });
}
