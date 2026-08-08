import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { Prisma } from "@prisma/client";

const clientListInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ClientDefaultArgs["include"];

const clientDetailInclude = {
  ...clientListInclude,
  documents: { include: { uploadedBy: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
  communications: { include: { communicatedBy: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
} satisfies Prisma.ClientDefaultArgs["include"];

interface ListFilters {
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  assignedToId?: string;
  search?: string;
}

export async function listClients(filters: ListFilters) {
  return prisma.client.findMany({
    where: {
      status: filters.status,
      assignedToId: filters.assignedToId,
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
          { pan: { contains: filters.search, mode: "insensitive" } },
          { gstin: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    include: clientListInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({ where: { id }, include: clientDetailInclude });
  if (!client) throw ApiError.notFound("Client not found");
  return client;
}

export async function createClient(input: Prisma.ClientUncheckedCreateInput, createdById: string) {
  return prisma.client.create({
    data: { ...input, createdById },
    include: clientListInclude,
  });
}

export async function updateClient(id: string, input: Prisma.ClientUpdateInput) {
  await ensureExists(id);
  return prisma.client.update({ where: { id }, data: input, include: clientListInclude });
}

export async function deleteClient(id: string) {
  await ensureExists(id);
  await prisma.client.delete({ where: { id } });
}

export async function assignClient(id: string, assignedToId: string | null) {
  await ensureExists(id);
  return prisma.client.update({ where: { id }, data: { assignedToId }, include: clientListInclude });
}

export async function updateKyc(id: string, kycStatus: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED") {
  await ensureExists(id);
  return prisma.client.update({ where: { id }, data: { kycStatus }, include: clientListInclude });
}

export async function addDocument(
  clientId: string,
  input: { docType: string; fileName: string; filePath: string; uploadedById: string }
) {
  await ensureExists(clientId);
  return prisma.clientDocument.create({ data: { clientId, ...input } });
}

export async function removeDocument(clientId: string, documentId: string) {
  const doc = await prisma.clientDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.clientId !== clientId) throw ApiError.notFound("Document not found");
  await prisma.clientDocument.delete({ where: { id: documentId } });
  return doc;
}

export async function addCommunication(
  clientId: string,
  input: { type: "CALL" | "EMAIL" | "MEETING" | "NOTE"; subject: string; notes?: string; communicatedById: string }
) {
  await ensureExists(clientId);
  return prisma.clientCommunication.create({ data: { clientId, ...input } });
}

async function ensureExists(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw ApiError.notFound("Client not found");
  return client;
}
