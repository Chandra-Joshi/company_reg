import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { getEffectivePermissions } from "../utils/permission.service.js";

/** Verifies the bearer JWT, loads the user, and attaches their live effective permission set to the request. */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized();
  }

  const token = header.slice("Bearer ".length);
  let userId: string;
  try {
    userId = verifyAccessToken(token).sub;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account not found or deactivated");
  }

  req.user = { id: user.id, name: user.name, email: user.email };
  req.permissions = await getEffectivePermissions(user.id);
  next();
});
