import { prisma } from "../config/prisma.js";

/**
 * Computes a user's effective permission set from scratch on every request:
 *   effective = (permissions from all assigned roles) + (direct ALLOW grants) - (direct DENY grants)
 * A direct DENY always wins over a role-granted ALLOW, so access can be
 * revoked for one person without touching their role. Recomputing per
 * request (instead of caching in the JWT) means role/permission changes
 * take effect immediately, without requiring the user to log in again.
 */
export async function getEffectivePermissions(userId: string): Promise<Set<string>> {
  const [roleGrants, directGrants] = await Promise.all([
    prisma.userRole.findMany({
      where: { userId },
      select: { role: { select: { permissions: { select: { permission: { select: { key: true } } } } } } },
    }),
    prisma.userPermission.findMany({
      where: { userId },
      select: { effect: true, permission: { select: { key: true } } },
    }),
  ]);

  const effective = new Set<string>();
  for (const { role } of roleGrants) {
    for (const rp of role.permissions) {
      effective.add(rp.permission.key);
    }
  }
  for (const grant of directGrants) {
    if (grant.effect === "ALLOW") effective.add(grant.permission.key);
  }
  for (const grant of directGrants) {
    if (grant.effect === "DENY") effective.delete(grant.permission.key);
  }

  return effective;
}
