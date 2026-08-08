import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParamSchema, nameOnlySchema } from "./employee.validation.js";
import {
  listDepartmentsHandler,
  createDepartmentHandler,
  updateDepartmentHandler,
  deleteDepartmentHandler,
} from "./employee.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("employee.view"), listDepartmentsHandler);
router.post("/", authorize("employee.create"), validate({ body: nameOnlySchema }), createDepartmentHandler);
router.patch("/:id", authorize("employee.update"), validate({ params: idParamSchema, body: nameOnlySchema }), updateDepartmentHandler);
router.delete("/:id", authorize("employee.delete"), validate({ params: idParamSchema }), deleteDepartmentHandler);

export default router;
