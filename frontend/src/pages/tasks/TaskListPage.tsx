import { useEffect, useState, type FormEvent } from "react";
import { listTasks, createTask, updateTask, assignTask, deleteTask, type TaskInput } from "../../api/task.api";
import { listClients } from "../../api/client.api";
import { listUserDirectory } from "../../api/access.api";
import type { Task, TaskStatus, TaskPriority, UserSummary, Client } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { PageHeader, Card, Table, Th, Td, Spinner, EmptyState, ErrorBanner } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField, TextArea } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { PermissionGate } from "../../components/PermissionGate";
import { useAuth } from "../../context/AuthContext";

const STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TaskListPage() {
  const { can } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [taskData, userData, clientData] = await Promise.all([
        listTasks(statusFilter ? { status: statusFilter } : undefined),
        listUserDirectory(),
        can("client.view") ? listClients() : Promise.resolve([]),
      ]);
      setTasks(taskData);
      setUsers(userData);
      setClients(clientData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleStatusChange(task: Task, status: TaskStatus) {
    try {
      await updateTask(task.id, { status });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleAssignChange(task: Task, assignedToId: string) {
    try {
      await assignTask(task.id, assignedToId || null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Create, assign and track work across the firm"
        actions={
          <PermissionGate anyOf={["task.create"]}>
            <Button onClick={() => setShowCreate(true)}>+ New Task</Button>
          </PermissionGate>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Card className="mb-4 p-4">
        <div className="max-w-xs">
          <SelectField label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : tasks.length === 0 ? (
          <EmptyState message="No tasks found." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Task</Th>
                <Th>Client</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Assigned To</Th>
                <Th>Due Date</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{task.title}</div>
                    {task.description && <div className="max-w-xs truncate text-xs text-slate-400">{task.description}</div>}
                  </Td>
                  <Td>{task.client?.name ?? "-"}</Td>
                  <Td>
                    <StatusBadge status={task.priority} />
                  </Td>
                  <Td>
                    {can("task.update") ? (
                      <select
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </Td>
                  <Td>
                    {can("task.assign") ? (
                      <select
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                        value={task.assignedTo?.id ?? ""}
                        onChange={(e) => handleAssignChange(task, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      task.assignedTo?.name ?? <span className="text-slate-400">Unassigned</span>
                    )}
                  </Td>
                  <Td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</Td>
                  <Td>
                    <PermissionGate anyOf={["task.delete"]}>
                      <button onClick={() => handleDelete(task)} className="text-xs font-medium text-red-500 hover:underline">
                        Delete
                      </button>
                    </PermissionGate>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {showCreate && (
        <CreateTaskModal
          users={users}
          clients={clients}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateTaskModal({
  users,
  clients,
  onClose,
  onCreated,
}: {
  users: UserSummary[];
  clients: Client[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<TaskInput>({ title: "", priority: "MEDIUM" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createTask(form);
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="New Task" onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextArea label="Description" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Client" value={form.clientId ?? ""} onChange={(e) => setForm({ ...form, clientId: e.target.value || undefined })}>
            <option value="">-</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Assign To" value={form.assignedToId ?? ""} onChange={(e) => setForm({ ...form, assignedToId: e.target.value || undefined })}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </SelectField>
          <TextField label="Due Date" type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
