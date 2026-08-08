import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import roleRoutes from "../modules/access/role.routes.js";
import permissionRoutes from "../modules/access/permission.routes.js";
import userRoutes from "../modules/access/user.routes.js";
import auditRoutes from "../modules/access/audit.routes.js";
import clientRoutes from "../modules/clients/client.routes.js";
import employeeRoutes from "../modules/employees/employee.routes.js";
import departmentRoutes from "../modules/employees/department.routes.js";
import designationRoutes from "../modules/employees/designation.routes.js";
import taskRoutes from "../modules/tasks/task.routes.js";
import taxRoutes from "../modules/tax/tax.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/users", userRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/clients", clientRoutes);
router.use("/employees", employeeRoutes);
router.use("/departments", departmentRoutes);
router.use("/designations", designationRoutes);
router.use("/tasks", taskRoutes);
router.use("/tax-filings", taxRoutes);

export default router;
