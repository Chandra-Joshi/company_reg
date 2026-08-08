import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { prisma } from "../../config/prisma.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("permission.view", "role.view", "permission.assign"),
  asyncHandler(async (_req, res) => {
    const permissions = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] });
    return sendSuccess(res, permissions);
  })
);

export default router;
