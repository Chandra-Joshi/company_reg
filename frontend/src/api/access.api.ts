import { api } from "./axios";
import type { Role, Permission, UserListItem, UserDetail, UserSummary, AuditLog, PermissionKey } from "../types";

export async function listRoles() {
  const { data } = await api.get<{ data: Role[] }>("/roles");
  return data.data;
}

export async function createRole(input: { name: string; description?: string; permissionKeys: PermissionKey[] }) {
  const { data } = await api.post<{ data: Role }>("/roles", input);
  return data.data;
}

export async function updateRole(id: string, input: { name?: string; description?: string }) {
  const { data } = await api.patch<{ data: Role }>(`/roles/${id}`, input);
  return data.data;
}

export async function deleteRole(id: string) {
  await api.delete(`/roles/${id}`);
}

export async function setRolePermissions(id: string, permissionKeys: PermissionKey[]) {
  const { data } = await api.put<{ data: Role }>(`/roles/${id}/permissions`, { permissionKeys });
  return data.data;
}

export async function listPermissions() {
  const { data } = await api.get<{ data: Permission[] }>("/permissions");
  return data.data;
}

export async function listUserDirectory() {
  const { data } = await api.get<{ data: UserSummary[] }>("/users/directory");
  return data.data;
}

export async function listUsers() {
  const { data } = await api.get<{ data: UserListItem[] }>("/users");
  return data.data;
}

export async function getUser(id: string) {
  const { data } = await api.get<{ data: UserDetail }>(`/users/${id}`);
  return data.data;
}

export async function setUserRoles(id: string, roleIds: string[]) {
  const { data } = await api.put<{ data: UserDetail }>(`/users/${id}/roles`, { roleIds });
  return data.data;
}

export async function setUserPermissions(id: string, overrides: { permissionKey: PermissionKey; effect: "ALLOW" | "DENY" }[]) {
  const { data } = await api.put<{ data: UserDetail }>(`/users/${id}/permissions`, { overrides });
  return data.data;
}

export async function setUserStatus(id: string, isActive: boolean) {
  const { data } = await api.patch<{ data: UserDetail }>(`/users/${id}/status`, { isActive });
  return data.data;
}

export async function listAuditLogs(params?: { page?: number; pageSize?: number; userId?: string; entityType?: string; action?: string }) {
  const { data } = await api.get<{ data: { logs: AuditLog[]; total: number; page: number; pageSize: number } }>("/audit-logs", { params });
  return data.data;
}
