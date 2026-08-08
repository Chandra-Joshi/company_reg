import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { recordAudit } from "../../utils/audit.js";
import * as employeeService from "./employee.service.js";

export const listEmployeesHandler = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await employeeService.listEmployees());
});

export const getEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await employeeService.getEmployee(req.params.id));
});

export const createEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.createEmployee(req.body);
  await recordAudit(req, { action: "employee.create", entityType: "Employee", entityId: employee.id, metadata: { employeeCode: employee.employeeCode } });
  return sendSuccess(res, employee, "Employee created", 201);
});

export const updateEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  await recordAudit(req, { action: "employee.update", entityType: "Employee", entityId: employee.id, metadata: req.body });
  return sendSuccess(res, employee, "Employee updated");
});

export const deleteEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  await employeeService.deleteEmployee(req.params.id);
  await recordAudit(req, { action: "employee.delete", entityType: "Employee", entityId: req.params.id });
  return sendSuccess(res, null, "Employee removed");
});

export const addPerformanceNoteHandler = asyncHandler(async (req: Request, res: Response) => {
  const note = await employeeService.addPerformanceNote(req.params.id, { ...req.body, reviewedById: req.user!.id });
  await recordAudit(req, { action: "employee.update", entityType: "PerformanceNote", entityId: note.id, metadata: { employeeId: req.params.id, rating: note.rating } });
  return sendSuccess(res, note, "Performance note recorded", 201);
});

// -- Departments -------------------------------------------------------

export const listDepartmentsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await employeeService.listDepartments());
});

export const createDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const department = await employeeService.createDepartment(req.body.name);
  await recordAudit(req, { action: "employee.create", entityType: "Department", entityId: department.id });
  return sendSuccess(res, department, "Department created", 201);
});

export const updateDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const department = await employeeService.updateDepartment(req.params.id, req.body.name);
  await recordAudit(req, { action: "employee.update", entityType: "Department", entityId: department.id });
  return sendSuccess(res, department, "Department updated");
});

export const deleteDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  await employeeService.deleteDepartment(req.params.id);
  await recordAudit(req, { action: "employee.delete", entityType: "Department", entityId: req.params.id });
  return sendSuccess(res, null, "Department deleted");
});

// -- Designations --------------------------------------------------------

export const listDesignationsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await employeeService.listDesignations());
});

export const createDesignationHandler = asyncHandler(async (req: Request, res: Response) => {
  const designation = await employeeService.createDesignation(req.body.title);
  await recordAudit(req, { action: "employee.create", entityType: "Designation", entityId: designation.id });
  return sendSuccess(res, designation, "Designation created", 201);
});

export const updateDesignationHandler = asyncHandler(async (req: Request, res: Response) => {
  const designation = await employeeService.updateDesignation(req.params.id, req.body.title);
  await recordAudit(req, { action: "employee.update", entityType: "Designation", entityId: designation.id });
  return sendSuccess(res, designation, "Designation updated");
});

export const deleteDesignationHandler = asyncHandler(async (req: Request, res: Response) => {
  await employeeService.deleteDesignation(req.params.id);
  await recordAudit(req, { action: "employee.delete", entityType: "Designation", entityId: req.params.id });
  return sendSuccess(res, null, "Designation deleted");
});
