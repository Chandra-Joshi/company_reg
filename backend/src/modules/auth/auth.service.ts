import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { comparePassword } from "../../utils/password.js";
import { signAccessToken } from "../../utils/jwt.js";
import { getEffectivePermissions } from "../../utils/permission.service.js";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const permissions = await getEffectivePermissions(user.id);
  const token = signAccessToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.name),
    },
    permissions: Array.from(permissions),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      employee: { include: { department: true, designation: true } },
    },
  });

  const permissions = await getEffectivePermissions(userId);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
    employee: user.employee
      ? {
          id: user.employee.id,
          employeeCode: user.employee.employeeCode,
          department: user.employee.department?.name ?? null,
          designation: user.employee.designation?.title ?? null,
        }
      : null,
    permissions: Array.from(permissions),
  };
}
