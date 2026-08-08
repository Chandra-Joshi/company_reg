import { z } from "zod";
import { PERMISSION_KEYS } from "../../constants/permissions.js";

const permissionKey = z.enum(PERMISSION_KEYS as [string, ...string[]]);

export const createRoleSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(255).optional(),
  permissionKeys: z.array(permissionKey).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(255).optional(),
});

export const setRolePermissionsSchema = z.object({
  permissionKeys: z.array(permissionKey),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
