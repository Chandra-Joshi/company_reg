import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { recordAudit } from "../../utils/audit.js";
import * as roleService from "./role.service.js";

export const listRolesHandler = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await roleService.listRoles());
});

export const getRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await roleService.getRole(req.params.id));
});

export const createRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.createRole(req.body);
  await recordAudit(req, { action: "role.create", entityType: "Role", entityId: role.id, metadata: { name: role.name } });
  return sendSuccess(res, role, "Role created", 201);
});

export const updateRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  await recordAudit(req, { action: "role.update", entityType: "Role", entityId: role.id, metadata: req.body });
  return sendSuccess(res, role, "Role updated");
});

export const deleteRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  await roleService.deleteRole(req.params.id);
  await recordAudit(req, { action: "role.delete", entityType: "Role", entityId: req.params.id });
  return sendSuccess(res, null, "Role deleted");
});

export const setRolePermissionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.setRolePermissions(req.params.id, req.body.permissionKeys);
  await recordAudit(req, {
    action: "permission.assign",
    entityType: "Role",
    entityId: role.id,
    metadata: { permissionKeys: req.body.permissionKeys },
  });
  return sendSuccess(res, role, "Role permissions updated");
});
