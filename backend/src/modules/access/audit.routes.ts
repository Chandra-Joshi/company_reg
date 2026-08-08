import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { prisma } from "../../config/prisma.js";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  userId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
});

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("audit.view"),
  validate({ query: querySchema }),
  asyncHandler(async (req, res) => {
    const { page, pageSize, userId, entityType, action } = req.query as unknown as z.infer<typeof querySchema>;
    const where = {
      ...(userId && { userId }),
      ...(entityType && { entityType }),
      ...(action && { action }),
    };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return sendSuccess(res, { logs, total, page, pageSize });
  })
);

export default router;
