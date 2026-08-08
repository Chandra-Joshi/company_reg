import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployee, updateEmployee, deleteEmployee, addPerformanceNote, listDepartments, listDesignations } from "../../api/employee.api";
import type { EmployeeDetail, Department, Designation } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { Card, Spinner, ErrorBanner, EmptyState } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField, TextArea } from "../../components/ui/Field";
import { PermissionGate } from "../../components/PermissionGate";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function load() {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [emp, dept, desig] = await Promise.all([getEmployee(id), listDepartments(), listDesignations()]);
      setEmployee(emp);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!employee || !id) return <EmptyState message="Employee not found." />;

  async function handleDelete() {
    if (!confirm(`Remove employee "${employee!.user.name}"? Their login account will remain but can be deactivated separately.`)) return;
    try {
      await deleteEmployee(id!);
      navigate("/employees");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{employee.user.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{employee.user.email}</p>
        </div>
        <PermissionGate anyOf={["employee.delete"]}>
          <Button variant="danger" onClick={handleDelete}>
            Remove Employee
          </Button>
        </PermissionGate>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Details</h2>
          {can("employee.update") && !editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        {editing ? (
          <EmployeeEditForm
            employee={employee}
            departments={departments}
            designations={designations}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              load();
            }}
          />
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Employee Code" value={employee.employeeCode} />
            <Detail label="Phone" value={employee.phone} />
            <Detail label="Department" value={employee.department?.name ?? null} />
            <Detail label="Designation" value={employee.designation?.title ?? null} />
            <Detail label="Joining Date" value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : null} />
          </dl>
        )}
      </Card>

      <PerformanceCard employee={employee} onChanged={load} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-400">{label}</dt>
      <dd className="text-slate-700 dark:text-slate-200">{value || "-"}</dd>
    </div>
  );
}

function EmployeeEditForm({
  employee,
  departments,
  designations,
  onCancel,
  onSaved,
}: {
  employee: EmployeeDetail;
  departments: Department[];
  designations: Designation[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: employee.user.name,
    email: employee.user.email,
    phone: employee.phone ?? "",
    departmentId: employee.department?.id ?? "",
    designationId: employee.designation?.id ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await updateEmployee(employee.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        departmentId: form.departmentId || null,
        designationId: form.designationId || null,
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error && <ErrorBanner message={error} />}
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Department" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
          <option value="">-</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Designation" value={form.designationId} onChange={(e) => setForm({ ...form, designationId: e.target.value })}>
          <option value="">-</option>
          {designations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}

function PerformanceCard({ employee, onChanged }: { employee: EmployeeDetail; onChanged: () => void }) {
  const { can } = useAuth();
  const [rating, setRating] = useState(3);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await addPerformanceNote(employee.id, { rating, remarks: remarks || undefined });
      setRemarks("");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Performance Notes</h2>
      {error && <ErrorBanner message={error} />}
      {employee.performanceNotes.length === 0 ? (
        <EmptyState message="No performance notes recorded yet." />
      ) : (
        <ul className="mb-4 space-y-3">
          {employee.performanceNotes.map((note) => (
            <li key={note.id} className="rounded-md border border-slate-100 p-3 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-100">{"★".repeat(note.rating)}{"☆".repeat(5 - note.rating)}</span>
                <span className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              {note.remarks && <p className="mt-1 text-slate-500 dark:text-slate-400">{note.remarks}</p>}
              <p className="mt-1 text-xs text-slate-400">Reviewed by {note.reviewedBy.name}</p>
            </li>
          ))}
        </ul>
      )}
      {can("employee.update") && (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <SelectField label="Rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </SelectField>
          <TextArea label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <Button type="submit" disabled={isSaving}>
            Add Note
          </Button>
        </form>
      )}
    </Card>
  );
}
