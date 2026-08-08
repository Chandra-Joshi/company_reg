import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { Prisma } from "@prisma/client";

const taxFilingInclude = {
  client: { select: { id: true, name: true } },
  filedBy: { select: { id: true, name: true, email: true } },
  approvedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TaxFilingDefaultArgs["include"];

interface ListFilters {
  type?: "ITR" | "GST" | "TDS" | "ADVANCE_TAX" | "TAX_NOTICE";
  status?: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  clientId?: string;
}

export async function listTaxFilings(filters: ListFilters) {
  return prisma.taxFiling.findMany({
    where: filters,
    include: taxFilingInclude,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTaxFiling(id: string) {
  const filing = await prisma.taxFiling.findUnique({ where: { id }, include: taxFilingInclude });
  if (!filing) throw ApiError.notFound("Tax filing not found");
  return filing;
}

interface CreateTaxFilingInput {
  type: "ITR" | "GST" | "TDS" | "ADVANCE_TAX" | "TAX_NOTICE";
  clientId: string;
  period: string;
  amount?: number;
  dueDate?: Date;
  remarks?: string;
}

export async function createTaxFiling(input: CreateTaxFilingInput) {
  return prisma.taxFiling.create({ data: input, include: taxFilingInclude });
}

interface UpdateTaxFilingInput {
  type?: "ITR" | "GST" | "TDS" | "ADVANCE_TAX" | "TAX_NOTICE";
  period?: string;
  amount?: number;
  dueDate?: Date;
  remarks?: string;
}

export async function updateTaxFiling(id: string, input: UpdateTaxFilingInput) {
  const filing = await mustFindFiling(id);
  if (filing.status === "APPROVED") {
    throw ApiError.forbidden("An approved tax filing cannot be edited");
  }
  return prisma.taxFiling.update({ where: { id }, data: input, include: taxFilingInclude });
}

export async function submitTaxFiling(id: string, filedById: string) {
  const filing = await mustFindFiling(id);
  if (filing.status !== "DRAFT") {
    throw ApiError.badRequest(`Only DRAFT filings can be submitted (current status: ${filing.status})`);
  }
  return prisma.taxFiling.update({
    where: { id },
    data: { status: "SUBMITTED", filedById, submittedAt: new Date() },
    include: taxFilingInclude,
  });
}

export async function decideTaxFiling(id: string, approve: boolean, approvedById: string, remarks?: string) {
  const filing = await mustFindFiling(id);
  if (filing.status !== "SUBMITTED") {
    throw ApiError.badRequest(`Only SUBMITTED filings can be approved or rejected (current status: ${filing.status})`);
  }
  return prisma.taxFiling.update({
    where: { id },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      approvedById,
      approvedAt: new Date(),
      ...(remarks !== undefined && { remarks }),
    },
    include: taxFilingInclude,
  });
}

async function mustFindFiling(id: string) {
  const filing = await prisma.taxFiling.findUnique({ where: { id } });
  if (!filing) throw ApiError.notFound("Tax filing not found");
  return filing;
}
