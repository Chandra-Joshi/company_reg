import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { recordAudit } from "../../utils/audit.js";
import * as taskService from "./task.service.js";

export const listTasksHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await taskService.listTasks(req.query as never));
});

export const getTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await taskService.getTask(req.params.id));
});

export const createTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.body, req.user!.id);
  await recordAudit(req, { action: "task.create", entityType: "Task", entityId: task.id, metadata: { title: task.title } });
  return sendSuccess(res, task, "Task created", 201);
});

export const updateTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  await recordAudit(req, { action: "task.update", entityType: "Task", entityId: task.id, metadata: req.body });
  return sendSuccess(res, task, "Task updated");
});

export const assignTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.assignTask(req.params.id, req.body.assignedToId);
  await recordAudit(req, { action: "task.assign", entityType: "Task", entityId: task.id, metadata: { assignedToId: req.body.assignedToId } });
  return sendSuccess(res, task, "Task assigned");
});

export const deleteTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.id);
  await recordAudit(req, { action: "task.delete", entityType: "Task", entityId: req.params.id });
  return sendSuccess(res, null, "Task deleted");
});
