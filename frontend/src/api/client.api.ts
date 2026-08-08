import { api } from "./axios";
import type { Client, ClientDetail, ClientStatus, KycStatus, CommunicationType } from "../types";

export async function listClients(params?: { status?: ClientStatus; assignedToId?: string; search?: string }) {
  const { data } = await api.get<{ data: Client[] }>("/clients", { params });
  return data.data;
}

export async function getClient(id: string) {
  const { data } = await api.get<{ data: ClientDetail }>(`/clients/${id}`);
  return data.data;
}

export interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
  pan?: string;
  gstin?: string;
  address?: string;
  assignedToId?: string;
}

export async function createClient(input: ClientInput) {
  const { data } = await api.post<{ data: Client }>("/clients", input);
  return data.data;
}

export async function updateClient(id: string, input: Partial<ClientInput> & { status?: ClientStatus }) {
  const { data } = await api.patch<{ data: Client }>(`/clients/${id}`, input);
  return data.data;
}

export async function deleteClient(id: string) {
  await api.delete(`/clients/${id}`);
}

export async function assignClient(id: string, assignedToId: string | null) {
  const { data } = await api.patch<{ data: Client }>(`/clients/${id}/assign`, { assignedToId });
  return data.data;
}

export async function updateKyc(id: string, kycStatus: KycStatus) {
  const { data } = await api.patch<{ data: Client }>(`/clients/${id}/kyc`, { kycStatus });
  return data.data;
}

export async function uploadDocument(id: string, docType: string, file: File) {
  const form = new FormData();
  form.append("docType", docType);
  form.append("file", file);
  const { data } = await api.post(`/clients/${id}/documents`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function removeDocument(clientId: string, documentId: string) {
  await api.delete(`/clients/${clientId}/documents/${documentId}`);
}

export async function addCommunication(id: string, input: { type: CommunicationType; subject: string; notes?: string }) {
  const { data } = await api.post(`/clients/${id}/communications`, input);
  return data.data;
}
