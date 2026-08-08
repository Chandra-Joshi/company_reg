import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { Prisma } from "@prisma/client";

const taskInclude = {
  client: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TaskDefaultArgs["include"];

interface ListFilters {
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedToId?: string;
  clientId?: string;
}

export async function listTasks(filters: ListFilters) {
  return prisma.task.findMany({
    where: filters,
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
  if (!task) throw ApiError.notFound("Task not found");
  return task;
}

interface CreateTaskInput {
  title: string;
  description?: string;
  clientId?: string;
  assignedToId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date;
}

export async function createTask(input: CreateTaskInput, createdById: string) {
  return prisma.task.create({ data: { ...input, createdById }, include: taskInclude });
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate?: Date;
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw ApiError.notFound("Task not found");

  const completedAt = input.status
    ? input.status === "COMPLETED"
      ? new Date()
      : null
    : undefined;

  return prisma.task.update({
    where: { id },
    data: { ...input, ...(completedAt !== undefined && { completedAt }) },
    include: taskInclude,
  });
}

export async function assignTask(id: string, assignedToId: string | null) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw ApiError.notFound("Task not found");
  return prisma.task.update({ where: { id }, data: { assignedToId }, include: taskInclude });
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw ApiError.notFound("Task not found");
  await prisma.task.delete({ where: { id } });
}
