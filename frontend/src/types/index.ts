export type PermissionKey =
  | "client.create" | "client.view" | "client.update" | "client.delete" | "client.assign"
  | "employee.create" | "employee.view" | "employee.update" | "employee.delete"
  | "role.create" | "role.view" | "role.update" | "role.delete"
  | "permission.assign" | "permission.view" | "audit.view"
  | "task.create" | "task.view" | "task.assign" | "task.update" | "task.delete"
  | "tax.create" | "tax.view" | "tax.update" | "tax.submit" | "tax.approve";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
  employee: { id: string; employeeCode: string; department: string | null; designation: string | null } | null;
  permissions: PermissionKey[];
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface UserListItem extends UserSummary {
  isActive: boolean;
  roles: { id: string; name: string }[];
  department: string | null;
  designation: string | null;
}

export interface UserDetail extends UserSummary {
  isActive: boolean;
  roles: { id: string; name: string }[];
  directPermissions: { permissionKey: PermissionKey; effect: "ALLOW" | "DENY" }[];
  effectivePermissions: PermissionKey[];
}

export interface Permission {
  id: string;
  key: PermissionKey;
  module: string;
  action: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: PermissionKey[];
}

export type ClientStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type KycStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
export type CommunicationType = "CALL" | "EMAIL" | "MEETING" | "NOTE";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  pan: string | null;
  gstin: string | null;
  address: string | null;
  status: ClientStatus;
  kycStatus: KycStatus;
  assignedToId: string | null;
  assignedTo: UserSummary | null;
  createdBy: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocument {
  id: string;
  docType: string;
  fileName: string;
  filePath: string;
  uploadedBy: UserSummary;
  createdAt: string;
}

export interface ClientCommunication {
  id: string;
  type: CommunicationType;
  subject: string;
  notes: string | null;
  communicatedBy: UserSummary;
  createdAt: string;
}

export interface ClientDetail extends Client {
  documents: ClientDocument[];
  communications: ClientCommunication[];
}

export interface Department {
  id: string;
  name: string;
}

export interface Designation {
  id: string;
  title: string;
}

export interface PerformanceNote {
  id: string;
  rating: number;
  remarks: string | null;
  reviewedBy: { id: string; name: string };
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  employeeCode: string;
  phone: string | null;
  joiningDate: string | null;
  user: { id: string; name: string; email: string; isActive: boolean };
  department: Department | null;
  designation: Designation | null;
  createdAt: string;
}

export interface EmployeeDetail extends Employee {
  performanceNotes: PerformanceNote[];
}

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  client: { id: string; name: string } | null;
  assignedTo: UserSummary | null;
  createdBy: UserSummary;
  createdAt: string;
}

export type TaxType = "ITR" | "GST" | "TDS" | "ADVANCE_TAX" | "TAX_NOTICE";
export type TaxStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface TaxFiling {
  id: string;
  type: TaxType;
  period: string;
  status: TaxStatus;
  amount: string | null;
  dueDate: string | null;
  remarks: string | null;
  client: { id: string; name: string };
  filedBy: UserSummary | null;
  approvedBy: UserSummary | null;
  submittedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}
