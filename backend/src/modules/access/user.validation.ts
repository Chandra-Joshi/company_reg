import { z } from "zod";
import { PERMISSION_KEYS } from "../../constants/permissions.js";

export const idParamSchema = z.object({ id: z.string().uuid() });

export const setUserRolesSchema = z.object({
  roleIds: z.array(z.string().uuid()),
});

export const setUserPermissionsSchema = z.object({
  overrides: z.array(
    z.object({
      permissionKey: z.enum(PERMISSION_KEYS as [string, ...string[]]),
      effect: z.enum(["ALLOW", "DENY"]),
    })
  ),
});

export const setUserStatusSchema = z.object({
  isActive: z.boolean(),
});
