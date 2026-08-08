/**
 * Single source of truth for the PBAC permission catalog. `prisma/seed.ts`
 * upserts exactly these rows into the `permissions` table, and every route
 * gates access with one of these keys via the `authorize()` middleware.
 *
 * `role.view` and `audit.view` are the only two keys not explicitly listed
 * in the original spec - they're added because "manage user access" and
 * "view audit logs" need a read permission distinct from `permission.view`
 * to list roles / audit entries. Document upload, KYC updates and
 * communication logging (client module features without their own keys)
 * are gated by `client.update` / `client.view`.
 */
export const PERMISSIONS = [
  // Client Management
  { key: "client.create", module: "client", action: "create", description: "Add new clients" },
  { key: "client.view", module: "client", action: "view", description: "View client profiles, documents, KYC and communication history" },
  { key: "client.update", module: "client", action: "update", description: "Edit clients, upload documents, update KYC, log communications" },
  { key: "client.delete", module: "client", action: "delete", description: "Delete clients" },
  { key: "client.assign", module: "client", action: "assign", description: "Assign a client to a staff member" },

  // Employee Management
  { key: "employee.create", module: "employee", action: "create", description: "Add new employees, departments and designations" },
  { key: "employee.view", module: "employee", action: "view", description: "View employees and performance records" },
  { key: "employee.update", module: "employee", action: "update", description: "Edit employees, assign departments/designations, record performance" },
  { key: "employee.delete", module: "employee", action: "delete", description: "Remove employees" },

  // Role & Permission Management (PBAC)
  { key: "role.create", module: "role", action: "create", description: "Create roles" },
  { key: "role.view", module: "role", action: "view", description: "View roles and their permissions" },
  { key: "role.update", module: "role", action: "update", description: "Update roles" },
  { key: "role.delete", module: "role", action: "delete", description: "Delete roles" },
  { key: "permission.assign", module: "permission", action: "assign", description: "Assign permissions to roles/users, assign users to roles, grant/deny direct user permissions" },
  { key: "permission.view", module: "permission", action: "view", description: "View the permission catalog" },
  { key: "audit.view", module: "audit", action: "view", description: "View audit logs" },

  // Task Management
  { key: "task.create", module: "task", action: "create", description: "Create tasks" },
  { key: "task.view", module: "task", action: "view", description: "View tasks and track progress" },
  { key: "task.assign", module: "task", action: "assign", description: "Assign tasks to staff" },
  { key: "task.update", module: "task", action: "update", description: "Update tasks, set deadlines, mark completed" },
  { key: "task.delete", module: "task", action: "delete", description: "Delete tasks" },

  // Tax Filing Module
  { key: "tax.create", module: "tax", action: "create", description: "Create tax filings (ITR, GST, TDS, Advance Tax, Notices)" },
  { key: "tax.view", module: "tax", action: "view", description: "View tax filings" },
  { key: "tax.update", module: "tax", action: "update", description: "Update tax filings" },
  { key: "tax.submit", module: "tax", action: "submit", description: "Submit a tax filing" },
  { key: "tax.approve", module: "tax", action: "approve", description: "Approve or reject a submitted tax filing" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

/** Default role -> permission-key mapping used by the seed script. */
export const DEFAULT_ROLES: Record<string, PermissionKey[] | "*"> = {
  "Super Admin": "*",
  Partner: [
    "client.create", "client.view", "client.update", "client.delete", "client.assign",
    "employee.create", "employee.view", "employee.update", "employee.delete",
    "role.view", "permission.view", "audit.view",
    "task.create", "task.view", "task.assign", "task.update", "task.delete",
    "tax.create", "tax.view", "tax.update", "tax.submit", "tax.approve",
  ],
  Manager: [
    "client.create", "client.view", "client.update", "client.assign",
    "employee.view",
    "task.create", "task.view", "task.assign", "task.update",
    "tax.create", "tax.view", "tax.update", "tax.submit",
  ],
  Accountant: [
    "client.view", "client.update",
    "task.view", "task.update",
    "tax.create", "tax.view", "tax.update", "tax.submit",
  ],
  Staff: [
    "client.view",
    "task.view", "task.update",
    "tax.view",
  ],
};
