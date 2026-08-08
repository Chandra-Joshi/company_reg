import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParamSchema, titleOnlySchema } from "./employee.validation.js";
import {
  listDesignationsHandler,
  createDesignationHandler,
  updateDesignationHandler,
  deleteDesignationHandler,
} from "./employee.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("employee.view"), listDesignationsHandler);
router.post("/", authorize("employee.create"), validate({ body: titleOnlySchema }), createDesignationHandler);
router.patch("/:id", authorize("employee.update"), validate({ params: idParamSchema, body: titleOnlySchema }), updateDesignationHandler);
router.delete("/:id", authorize("employee.delete"), validate({ params: idParamSchema }), deleteDesignationHandler);

export default router;
