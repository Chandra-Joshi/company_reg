import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createRoleSchema,
  updateRoleSchema,
  setRolePermissionsSchema,
  idParamSchema,
} from "./role.validation.js";
import {
  listRolesHandler,
  getRoleHandler,
  createRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
  setRolePermissionsHandler,
} from "./role.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("role.view"), listRolesHandler);
router.get("/:id", authorize("role.view"), validate({ params: idParamSchema }), getRoleHandler);
router.post("/", authorize("role.create"), validate({ body: createRoleSchema }), createRoleHandler);
router.patch("/:id", authorize("role.update"), validate({ params: idParamSchema, body: updateRoleSchema }), updateRoleHandler);
router.delete("/:id", authorize("role.delete"), validate({ params: idParamSchema }), deleteRoleHandler);
router.put(
  "/:id/permissions",
  authorize("permission.assign"),
  validate({ params: idParamSchema, body: setRolePermissionsSchema }),
  setRolePermissionsHandler
);

export default router;
