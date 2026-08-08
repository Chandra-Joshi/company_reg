import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  idParamSchema,
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  listTasksQuerySchema,
} from "./task.validation.js";
import {
  listTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  assignTaskHandler,
  deleteTaskHandler,
} from "./task.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("task.view"), validate({ query: listTasksQuerySchema }), listTasksHandler);
router.get("/:id", authorize("task.view"), validate({ params: idParamSchema }), getTaskHandler);
router.post("/", authorize("task.create"), validate({ body: createTaskSchema }), createTaskHandler);
router.patch("/:id", authorize("task.update"), validate({ params: idParamSchema, body: updateTaskSchema }), updateTaskHandler);
router.patch("/:id/assign", authorize("task.assign"), validate({ params: idParamSchema, body: assignTaskSchema }), assignTaskHandler);
router.delete("/:id", authorize("task.delete"), validate({ params: idParamSchema }), deleteTaskHandler);

export default router;
