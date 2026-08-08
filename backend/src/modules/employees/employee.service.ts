import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/password.js";
import type { Prisma } from "@prisma/client";

const employeeInclude = {
  user: { select: { id: true, name: true, email: true, isActive: true } },
  department: true,
  designation: true,
} satisfies Prisma.EmployeeDefaultArgs["include"];

export async function listEmployees() {
  return prisma.employee.findMany({ include: employeeInclude, orderBy: { createdAt: "desc" } });
}

export async function getEmployee(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { ...employeeInclude, performanceNotes: { include: { reviewedBy: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!employee) throw ApiError.notFound("Employee not found");
  return employee;
}

interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  employeeCode: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  joiningDate?: Date;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) throw ApiError.conflict(`A user with email "${input.email}" already exists`);

  const hashedPassword = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: input.name, email: input.email, password: hashedPassword },
    });

    return tx.employee.create({
      data: {
        userId: user.id,
        employeeCode: input.employeeCode,
        phone: input.phone,
        departmentId: input.departmentId,
        designationId: input.designationId,
        joiningDate: input.joiningDate,
      },
      include: employeeInclude,
    });
  });
}

interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  phone?: string;
  departmentId?: string | null;
  designationId?: string | null;
  joiningDate?: Date;
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw ApiError.notFound("Employee not found");

  const { name, email, ...employeeFields } = input;

  return prisma.$transaction(async (tx) => {
    if (name !== undefined || email !== undefined) {
      await tx.user.update({
        where: { id: employee.userId },
        data: { ...(name !== undefined && { name }), ...(email !== undefined && { email }) },
      });
    }
    return tx.employee.update({ where: { id }, data: employeeFields, include: employeeInclude });
  });
}

/** Removes the Employee record only; the underlying User account (and its login/audit history) is left intact - deactivate it separately via PATCH /api/users/:id/status. */
export async function deleteEmployee(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw ApiError.notFound("Employee not found");
  await prisma.employee.delete({ where: { id } });
}

export async function addPerformanceNote(employeeId: string, input: { rating: number; remarks?: string; reviewedById: string }) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw ApiError.notFound("Employee not found");
  return prisma.performanceNote.create({ data: { employeeId, ...input } });
}

// -- Departments -------------------------------------------------------

export async function listDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function createDepartment(name: string) {
  const existing = await prisma.department.findUnique({ where: { name } });
  if (existing) throw ApiError.conflict(`Department "${name}" already exists`);
  return prisma.department.create({ data: { name } });
}

export async function updateDepartment(id: string, name: string) {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) throw ApiError.notFound("Department not found");
  return prisma.department.update({ where: { id }, data: { name } });
}

export async function deleteDepartment(id: string) {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) throw ApiError.notFound("Department not found");
  await prisma.department.delete({ where: { id } });
}

// -- Designations --------------------------------------------------------

export async function listDesignations() {
  return prisma.designation.findMany({ orderBy: { title: "asc" } });
}

export async function createDesignation(title: string) {
  const existing = await prisma.designation.findUnique({ where: { title } });
  if (existing) throw ApiError.conflict(`Designation "${title}" already exists`);
  return prisma.designation.create({ data: { title } });
}

export async function updateDesignation(id: string, title: string) {
  const designation = await prisma.designation.findUnique({ where: { id } });
  if (!designation) throw ApiError.notFound("Designation not found");
  return prisma.designation.update({ where: { id }, data: { title } });
}

export async function deleteDesignation(id: string) {
  const designation = await prisma.designation.findUnique({ where: { id } });
  if (!designation) throw ApiError.notFound("Designation not found");
  await prisma.designation.delete({ where: { id } });
}
