import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  listEmployees,
  createEmployee,
  listDepartments,
  listDesignations,
  createDepartment,
  createDesignation,
  deleteDepartment,
  deleteDesignation,
  type CreateEmployeeInput,
} from "../../api/employee.api";
import type { Employee, Department, Designation } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { PageHeader, Card, Table, Th, Td, Spinner, EmptyState, ErrorBanner } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { PermissionGate } from "../../components/PermissionGate";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showLookups, setShowLookups] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [emp, dept, desig] = await Promise.all([listEmployees(), listDepartments(), listDesignations()]);
      setEmployees(emp);
      setDepartments(dept);
      setDesignations(desig);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage staff, departments and designations"
        actions={
          <>
            <PermissionGate anyOf={["employee.create"]}>
              <Button variant="secondary" onClick={() => setShowLookups(true)}>
                Departments & Designations
              </Button>
            </PermissionGate>
            <PermissionGate anyOf={["employee.create"]}>
              <Button onClick={() => setShowCreate(true)}>+ New Employee</Button>
            </PermissionGate>
          </>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Card>
        {isLoading ? (
          <Spinner />
        ) : employees.length === 0 ? (
          <EmptyState message="No employees found." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Code</Th>
                <Th>Department</Th>
                <Th>Designation</Th>
                <Th>Phone</Th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td>
                    <Link to={`/employees/${emp.id}`} className="font-medium text-brand-600 hover:underline">
                      {emp.user.name}
                    </Link>
                    <div className="text-xs text-slate-400">{emp.user.email}</div>
                  </Td>
                  <Td>{emp.employeeCode}</Td>
                  <Td>{emp.department?.name ?? "-"}</Td>
                  <Td>{emp.designation?.title ?? "-"}</Td>
                  <Td>{emp.phone ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {showCreate && (
        <CreateEmployeeModal
          departments={departments}
          designations={designations}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {showLookups && (
        <LookupsModal
          departments={departments}
          designations={designations}
          onClose={() => setShowLookups(false)}
          onChanged={load}
        />
      )}
    </div>
  );
}

function CreateEmployeeModal({
  departments,
  designations,
  onClose,
  onCreated,
}: {
  departments: Department[];
  designations: Designation[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateEmployeeInput>({ name: "", email: "", password: "", employeeCode: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createEmployee(form);
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="New Employee" onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Employee Code" required value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
        </div>
        <TextField label="Email (login)" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextField
          label="Temporary Password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <TextField label="Phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Department" value={form.departmentId ?? ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value || undefined })}>
            <option value="">-</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Designation" value={form.designationId ?? ""} onChange={(e) => setForm({ ...form, designationId: e.target.value || undefined })}>
            <option value="">-</option>
            {designations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </SelectField>
        </div>
        <TextField label="Joining Date" type="date" value={form.joiningDate ?? ""} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function LookupsModal({
  departments,
  designations,
  onClose,
  onChanged,
}: {
  departments: Department[];
  designations: Designation[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [newDept, setNewDept] = useState("");
  const [newDesig, setNewDesig] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAddDept(e: FormEvent) {
    e.preventDefault();
    if (!newDept) return;
    try {
      await createDepartment(newDept);
      setNewDept("");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleAddDesig(e: FormEvent) {
    e.preventDefault();
    if (!newDesig) return;
    try {
      await createDesignation(newDesig);
      setNewDesig("");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleRemoveDept(id: string) {
    try {
      await deleteDepartment(id);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleRemoveDesig(id: string) {
    try {
      await deleteDesignation(id);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <Modal title="Departments & Designations" onClose={onClose} widthClassName="max-w-2xl">
      {error && <ErrorBanner message={error} />}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Departments</h3>
          <ul className="mb-3 space-y-1">
            {departments.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-sm dark:bg-slate-800">
                {d.name}
                <button onClick={() => handleRemoveDept(d.id)} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form className="flex gap-2" onSubmit={handleAddDept}>
            <input
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              placeholder="New department"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Designations</h3>
          <ul className="mb-3 space-y-1">
            {designations.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-sm dark:bg-slate-800">
                {d.title}
                <button onClick={() => handleRemoveDesig(d.id)} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form className="flex gap-2" onSubmit={handleAddDesig}>
            <input
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              placeholder="New designation"
              value={newDesig}
              onChange={(e) => setNewDesig(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
