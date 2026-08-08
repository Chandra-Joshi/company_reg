import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().uuid() });

const taxType = z.enum(["ITR", "GST", "TDS", "ADVANCE_TAX", "TAX_NOTICE"]);

export const createTaxFilingSchema = z.object({
  type: taxType,
  clientId: z.string().uuid(),
  period: z.string().min(1).max(60),
  amount: z.number().nonnegative().optional(),
  dueDate: z.coerce.date().optional(),
  remarks: z.string().max(2000).optional(),
});

export const updateTaxFilingSchema = z.object({
  type: taxType.optional(),
  period: z.string().min(1).max(60).optional(),
  amount: z.number().nonnegative().optional(),
  dueDate: z.coerce.date().optional(),
  remarks: z.string().max(2000).optional(),
});

export const approveTaxFilingSchema = z.object({
  approve: z.boolean(),
  remarks: z.string().max(2000).optional(),
});

export const listTaxFilingsQuerySchema = z.object({
  type: taxType.optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  clientId: z.string().uuid().optional(),
});
