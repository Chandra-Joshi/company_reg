import { api } from "./axios";
import type { TaxFiling, TaxType, TaxStatus } from "../types";

export async function listTaxFilings(params?: { type?: TaxType; status?: TaxStatus; clientId?: string }) {
  const { data } = await api.get<{ data: TaxFiling[] }>("/tax-filings", { params });
  return data.data;
}

export interface TaxFilingInput {
  type: TaxType;
  clientId: string;
  period: string;
  amount?: number;
  dueDate?: string;
  remarks?: string;
}

export async function createTaxFiling(input: TaxFilingInput) {
  const { data } = await api.post<{ data: TaxFiling }>("/tax-filings", input);
  return data.data;
}

export async function updateTaxFiling(id: string, input: Partial<Omit<TaxFilingInput, "clientId">>) {
  const { data } = await api.patch<{ data: TaxFiling }>(`/tax-filings/${id}`, input);
  return data.data;
}

export async function submitTaxFiling(id: string) {
  const { data } = await api.post<{ data: TaxFiling }>(`/tax-filings/${id}/submit`);
  return data.data;
}

export async function decideTaxFiling(id: string, approve: boolean, remarks?: string) {
  const { data } = await api.post<{ data: TaxFiling }>(`/tax-filings/${id}/approve`, { approve, remarks });
  return data.data;
}
