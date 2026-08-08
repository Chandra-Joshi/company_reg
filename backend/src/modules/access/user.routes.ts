import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParamSchema, setUserRolesSchema, setUserPermissionsSchema, setUserStatusSchema } from "./user.validation.js";
import {
  directoryHandler,
  listUsersHandler,
  getUserHandler,
  setUserRolesHandler,
  setUserPermissionsHandler,
  setUserStatusHandler,
} from "./user.controller.js";

const router = Router();

router.use(authenticate);

// Minimal directory (id/name/email) any authenticated staff member can read - needed to
// populate "assign to" pickers across the client/task modules without granting role.view/employee.view.
router.get("/directory", directoryHandler);

router.get("/", authorize("role.view", "employee.view"), listUsersHandler);
router.get("/:id", authorize("role.view", "employee.view"), validate({ params: idParamSchema }), getUserHandler);
router.put("/:id/roles", authorize("permission.assign"), validate({ params: idParamSchema, body: setUserRolesSchema }), setUserRolesHandler);
router.put(
  "/:id/permissions",
  authorize("permission.assign"),
  validate({ params: idParamSchema, body: setUserPermissionsSchema }),
  setUserPermissionsHandler
);
router.patch(
  "/:id/status",
  authorize("permission.assign"),
  validate({ params: idParamSchema, body: setUserStatusSchema }),
  setUserStatusHandler
);

export default router;
