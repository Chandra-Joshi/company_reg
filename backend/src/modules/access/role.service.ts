import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

const roleWithPermissions = {
  include: {
    permissions: { include: { permission: true } },
    _count: { select: { users: true } },
  },
} satisfies Prisma.RoleDefaultArgs;

type RoleWithPermissions = Prisma.RoleGetPayload<typeof roleWithPermissions>;

function serializeRole(role: RoleWithPermissions) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role._count.users,
    permissions: role.permissions.map((rp) => rp.permission.key),
  };
}

export async function listRoles() {
  const roles = await prisma.role.findMany({ ...roleWithPermissions, orderBy: { createdAt: "asc" } });
  return roles.map(serializeRole);
}

export async function getRole(id: string) {
  const role = await prisma.role.findUnique({ where: { id }, ...roleWithPermissions });
  if (!role) throw ApiError.notFound("Role not found");
  return serializeRole(role);
}

export async function createRole(input: { name: string; description?: string; permissionKeys: string[] }) {
  const existing = await prisma.role.findUnique({ where: { name: input.name } });
  if (existing) throw ApiError.conflict(`Role "${input.name}" already exists`);

  const role = await prisma.role.create({
    data: {
      name: input.name,
      description: input.description,
      permissions: {
        create: input.permissionKeys.map((key) => ({ permission: { connect: { key } } })),
      },
    },
    ...roleWithPermissions,
  });

  return serializeRole(role);
}

export async function updateRole(id: string, input: { name?: string; description?: string }) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw ApiError.notFound("Role not found");
  if (role.isSystem) throw ApiError.forbidden("System roles cannot be renamed");

  const updated = await prisma.role.update({
    where: { id },
    data: input,
    ...roleWithPermissions,
  });

  return serializeRole(updated);
}

export async function deleteRole(id: string) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw ApiError.notFound("Role not found");
  if (role.isSystem) throw ApiError.forbidden("System roles cannot be deleted");

  await prisma.role.delete({ where: { id } });
}

export async function setRolePermissions(id: string, permissionKeys: string[]) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw ApiError.notFound("Role not found");

  const permissions = await prisma.permission.findMany({ where: { key: { in: permissionKeys } } });

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: id, permissionId: p.id })),
    }),
  ]);

  return getRole(id);
}
