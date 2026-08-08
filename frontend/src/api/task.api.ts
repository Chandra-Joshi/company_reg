import { api } from "./axios";
import type { Task, TaskStatus, TaskPriority } from "../types";

export async function listTasks(params?: { status?: TaskStatus; priority?: TaskPriority; assignedToId?: string; clientId?: string }) {
  const { data } = await api.get<{ data: Task[] }>("/tasks", { params });
  return data.data;
}

export interface TaskInput {
  title: string;
  description?: string;
  clientId?: string;
  assignedToId?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export async function createTask(input: TaskInput) {
  const { data } = await api.post<{ data: Task }>("/tasks", input);
  return data.data;
}

export async function updateTask(id: string, input: Partial<TaskInput> & { status?: TaskStatus }) {
  const { data } = await api.patch<{ data: Task }>(`/tasks/${id}`, input);
  return data.data;
}

export async function assignTask(id: string, assignedToId: string | null) {
  const { data } = await api.patch<{ data: Task }>(`/tasks/${id}/assign`, { assignedToId });
  return data.data;
}

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`);
}
