import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().uuid() });

export const createClientSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  pan: z.string().max(20).optional(),
  gstin: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  pan: z.string().max(20).optional(),
  gstin: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export const assignClientSchema = z.object({
  assignedToId: z.string().uuid().nullable(),
});

export const updateKycSchema = z.object({
  kycStatus: z.enum(["PENDING", "SUBMITTED", "VERIFIED", "REJECTED"]),
});

export const listClientsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const uploadDocumentSchema = z.object({
  docType: z.string().min(1).max(60),
});

export const createCommunicationSchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "NOTE"]),
  subject: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
});
