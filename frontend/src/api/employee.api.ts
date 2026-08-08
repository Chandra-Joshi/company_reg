import { api } from "./axios";
import type { Employee, EmployeeDetail, Department, Designation } from "../types";

export async function listEmployees() {
  const { data } = await api.get<{ data: Employee[] }>("/employees");
  return data.data;
}

export async function getEmployee(id: string) {
  const { data } = await api.get<{ data: EmployeeDetail }>(`/employees/${id}`);
  return data.data;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  employeeCode: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  joiningDate?: string;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const { data } = await api.post<{ data: Employee }>("/employees", input);
  return data.data;
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  phone?: string;
  departmentId?: string | null;
  designationId?: string | null;
  joiningDate?: string;
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const { data } = await api.patch<{ data: Employee }>(`/employees/${id}`, input);
  return data.data;
}

export async function deleteEmployee(id: string) {
  await api.delete(`/employees/${id}`);
}

export async function addPerformanceNote(id: string, input: { rating: number; remarks?: string }) {
  const { data } = await api.post(`/employees/${id}/performance-notes`, input);
  return data.data;
}

export async function listDepartments() {
  const { data } = await api.get<{ data: Department[] }>("/departments");
  return data.data;
}

export async function createDepartment(name: string) {
  const { data } = await api.post<{ data: Department }>("/departments", { name });
  return data.data;
}

export async function deleteDepartment(id: string) {
  await api.delete(`/departments/${id}`);
}

export async function listDesignations() {
  const { data } = await api.get<{ data: Designation[] }>("/designations");
  return data.data;
}

export async function createDesignation(title: string) {
  const { data } = await api.post<{ data: Designation }>("/designations", { title });
  return data.data;
}

export async function deleteDesignation(id: string) {
  await api.delete(`/designations/${id}`);
}
