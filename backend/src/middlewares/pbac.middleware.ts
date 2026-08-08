import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import type { PermissionKey } from "../constants/permissions.js";

/**
 * PBAC gate: requires `authenticate` to have run first. Pass one permission
 * key to require it, or several to require ANY one of them (e.g. a filing
 * "update" endpoint reused by both `tax.update` and `tax.approve` holders).
 */
export function authorize(...permissionKeys: PermissionKey[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !req.permissions) {
      throw ApiError.unauthorized();
    }

    const hasAccess = permissionKeys.some((key) => req.permissions!.has(key));
    if (!hasAccess) {
      throw ApiError.forbidden(
        `Missing required permission: ${permissionKeys.join(" or ")}`
      );
    }

    next();
  };
}
