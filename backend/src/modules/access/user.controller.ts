import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { recordAudit } from "../../utils/audit.js";
import * as userService from "./user.service.js";

export const directoryHandler = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await userService.listDirectory());
});

export const listUsersHandler = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await userService.listUsers());
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await userService.getUserDetail(req.params.id));
});

export const setUserRolesHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.setUserRoles(req.params.id, req.body.roleIds);
  await recordAudit(req, {
    action: "permission.assign",
    entityType: "User",
    entityId: user.id,
    metadata: { roleIds: req.body.roleIds },
  });
  return sendSuccess(res, user, "User roles updated");
});

export const setUserPermissionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.setUserPermissions(req.params.id, req.body.overrides);
  await recordAudit(req, {
    action: "permission.assign",
    entityType: "User",
    entityId: user.id,
    metadata: { overrides: req.body.overrides },
  });
  return sendSuccess(res, user, "User permission overrides updated");
});

export const setUserStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.setUserStatus(req.params.id, req.body.isActive);
  await recordAudit(req, {
    action: "permission.assign",
    entityType: "User",
    entityId: user.id,
    metadata: { isActive: req.body.isActive },
  });
  return sendSuccess(res, user, "User status updated");
});
