import { PrismaClient } from "@prisma/client";
import { PERMISSIONS, DEFAULT_ROLES, PERMISSION_KEYS } from "../src/constants/permissions.js";
import { hashPassword } from "../src/utils/password.js";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding permission catalog...");
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { module: permission.module, action: permission.action, description: permission.description },
      create: permission,
    });
  }

  console.log("Seeding default roles...");
  for (const [roleName, keys] of Object.entries(DEFAULT_ROLES)) {
    const permissionKeys = keys === "*" ? PERMISSION_KEYS : keys;
    const permissions = await prisma.permission.findMany({ where: { key: { in: permissionKeys } } });

    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: { isSystem: roleName === "Super Admin" },
      create: { name: roleName, isSystem: roleName === "Super Admin", description: `${roleName} role` },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
    });
  }

  console.log("Seeding departments and designations...");
  const departments = ["Audit", "Taxation", "Compliance", "Administration"];
  for (const name of departments) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }

  const designations = ["Partner", "Manager", "Senior Associate", "Associate", "Intern"];
  for (const title of designations) {
    await prisma.designation.upsert({ where: { title }, update: {}, create: { title } });
  }

  console.log("Seeding admin user...");
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Super Admin" } });
  const existingAdmin = await prisma.user.findUnique({ where: { email: env.adminEmail } });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: "System Administrator",
        email: env.adminEmail,
        password: await hashPassword(env.adminPassword),
      },
    });
    await prisma.userRole.create({ data: { userId: admin.id, roleId: superAdminRole.id } });
    console.log(`Created admin user: ${env.adminEmail} / ${env.adminPassword}`);
  } else {
    console.log(`Admin user ${env.adminEmail} already exists, skipping.`);
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
