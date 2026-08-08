import { api } from "./axios";
import type { CurrentUser, PermissionKey } from "../types";

export interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; roles: string[] };
  permissions: PermissionKey[];
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ data: LoginResponse }>("/auth/login", { email, password });
  return data.data;
}

export async function fetchMe() {
  const { data } = await api.get<{ data: CurrentUser }>("/auth/me");
  return data.data;
}
