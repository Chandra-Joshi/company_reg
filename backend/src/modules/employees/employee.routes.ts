import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  idParamSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  addPerformanceNoteSchema,
} from "./employee.validation.js";
import {
  listEmployeesHandler,
  getEmployeeHandler,
  createEmployeeHandler,
  updateEmployeeHandler,
  deleteEmployeeHandler,
  addPerformanceNoteHandler,
} from "./employee.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("employee.view"), listEmployeesHandler);
router.get("/:id", authorize("employee.view"), validate({ params: idParamSchema }), getEmployeeHandler);
router.post("/", authorize("employee.create"), validate({ body: createEmployeeSchema }), createEmployeeHandler);
router.patch("/:id", authorize("employee.update"), validate({ params: idParamSchema, body: updateEmployeeSchema }), updateEmployeeHandler);
router.delete("/:id", authorize("employee.delete"), validate({ params: idParamSchema }), deleteEmployeeHandler);

router.post(
  "/:id/performance-notes",
  authorize("employee.update"),
  validate({ params: idParamSchema, body: addPerformanceNoteSchema }),
  addPerformanceNoteHandler
);

export default router;
