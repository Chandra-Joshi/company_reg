import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().uuid() });

export const createEmployeeSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8),
  employeeCode: z.string().min(1).max(30),
  phone: z.string().max(20).optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  joiningDate: z.coerce.date().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  designationId: z.string().uuid().nullable().optional(),
  joiningDate: z.coerce.date().optional(),
});

export const addPerformanceNoteSchema = z.object({
  rating: z.number().int().min(1).max(5),
  remarks: z.string().max(2000).optional(),
});

export const nameOnlySchema = z.object({
  name: z.string().min(2).max(100),
});

export const titleOnlySchema = z.object({
  title: z.string().min(2).max(100),
});
