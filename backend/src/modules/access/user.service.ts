import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { getEffectivePermissions } from "../../utils/permission.service.js";

export async function listDirectory() {
  return prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    include: {
      roles: { include: { role: true } },
      employee: { include: { department: true, designation: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isActive: u.isActive,
    roles: u.roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
    department: u.employee?.department?.name ?? null,
    designation: u.employee?.designation?.title ?? null,
  }));
}

export async function getUserDetail(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: { include: { role: true } },
      permissions: { include: { permission: true } },
    },
  });
  if (!user) throw ApiError.notFound("User not found");

  const effective = await getEffectivePermissions(id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    roles: user.roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
    directPermissions: user.permissions.map((up) => ({
      permissionKey: up.permission.key,
      effect: up.effect,
    })),
    effectivePermissions: Array.from(effective),
  };
}

export async function setUserRoles(id: string, roleIds: string[]) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId: id } }),
    prisma.userRole.createMany({ data: roleIds.map((roleId) => ({ userId: id, roleId })) }),
  ]);

  return getUserDetail(id);
}

export async function setUserPermissions(id: string, overrides: { permissionKey: string; effect: "ALLOW" | "DENY" }[]) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");

  const permissions = await prisma.permission.findMany({
    where: { key: { in: overrides.map((o) => o.permissionKey) } },
  });
  const keyToId = new Map(permissions.map((p) => [p.key, p.id]));

  await prisma.$transaction([
    prisma.userPermission.deleteMany({ where: { userId: id } }),
    prisma.userPermission.createMany({
      data: overrides.map((o) => ({
        userId: id,
        permissionId: keyToId.get(o.permissionKey)!,
        effect: o.effect,
      })),
    }),
  ]);

  return getUserDetail(id);
}

export async function setUserStatus(id: string, isActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");

  await prisma.user.update({ where: { id }, data: { isActive } });
  return getUserDetail(id);
}
