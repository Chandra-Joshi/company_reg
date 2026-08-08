import { useEffect, useState, type FormEvent } from "react";
import { listRoles, listPermissions, createRole, updateRole, deleteRole, setRolePermissions } from "../../api/access.api";
import type { Role, Permission, PermissionKey } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { PageHeader, Card, Table, Th, Td, Spinner, EmptyState, ErrorBanner } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { PermissionGate } from "../../components/PermissionGate";
import { useAuth } from "../../context/AuthContext";
import { PermissionCheckboxGrid } from "./PermissionCheckboxGrid";

export default function RolesPage() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPermissionsFor, setEditingPermissionsFor] = useState<Role | null>(null);
  const [renaming, setRenaming] = useState<Role | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [roleData, permData] = await Promise.all([listRoles(), listPermissions()]);
      setRoles(roleData);
      setPermissions(permData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(role: Role) {
    if (!confirm(`Delete role "${role.name}"? Users holding only this role will lose its permissions.`)) return;
    try {
      await deleteRole(role.id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Create roles and control which permissions each one grants"
        actions={
          <PermissionGate anyOf={["role.create"]}>
            <Button onClick={() => setShowCreate(true)}>+ New Role</Button>
          </PermissionGate>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Card>
        {isLoading ? (
          <Spinner />
        ) : roles.length === 0 ? (
          <EmptyState message="No roles found." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Role</Th>
                <Th>Permissions</Th>
                <Th>Users</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="align-top hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td>
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                      {role.name}
                      {role.isSystem && <Badge tone="purple">System</Badge>}
                    </div>
                    <div className="text-xs text-slate-400">{role.description}</div>
                  </Td>
                  <Td className="max-w-md">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length === 0 ? (
                        <span className="text-slate-400">No permissions</span>
                      ) : (
                        role.permissions.map((p) => (
                          <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </Td>
                  <Td>{role.userCount}</Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      <PermissionGate anyOf={["permission.assign"]}>
                        <button onClick={() => setEditingPermissionsFor(role)} className="text-xs font-medium text-brand-600 hover:underline">
                          Edit permissions
                        </button>
                      </PermissionGate>
                      {!role.isSystem && can("role.update") && (
                        <button onClick={() => setRenaming(role)} className="text-xs font-medium text-slate-500 hover:underline">
                          Rename
                        </button>
                      )}
                      {!role.isSystem && (
                        <PermissionGate anyOf={["role.delete"]}>
                          <button onClick={() => handleDelete(role)} className="text-xs font-medium text-red-500 hover:underline">
                            Delete
                          </button>
                        </PermissionGate>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {showCreate && (
        <CreateRoleModal permissions={permissions} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}

      {editingPermissionsFor && (
        <EditPermissionsModal
          role={editingPermissionsFor}
          permissions={permissions}
          onClose={() => setEditingPermissionsFor(null)}
          onSaved={() => { setEditingPermissionsFor(null); load(); }}
        />
      )}

      {renaming && (
        <RenameRoleModal role={renaming} onClose={() => setRenaming(null)} onSaved={() => { setRenaming(null); load(); }} />
      )}
    </div>
  );
}

function CreateRoleModal({ permissions, onClose, onCreated }: { permissions: Permission[]; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<PermissionKey>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggle(key: PermissionKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createRole({ name, description: description || undefined, permissionKeys: Array.from(selected) });
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="New Role" onClose={onClose} widthClassName="max-w-2xl">
      {error && <ErrorBanner message={error} />}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField label="Role Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Permissions</span>
          <PermissionCheckboxGrid permissions={permissions} selected={selected} onToggle={toggle} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !name}>
            {isSubmitting ? "Creating..." : "Create Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditPermissionsModal({
  role,
  permissions,
  onClose,
  onSaved,
}: {
  role: Role;
  permissions: Permission[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<Set<PermissionKey>>(new Set(role.permissions));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggle(key: PermissionKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleSave() {
    setError(null);
    setIsSubmitting(true);
    try {
      await setRolePermissions(role.id, Array.from(selected));
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={`Edit Permissions - ${role.name}`} onClose={onClose} widthClassName="max-w-2xl">
      {error && <ErrorBanner message={error} />}
      <PermissionCheckboxGrid permissions={permissions} selected={selected} onToggle={toggle} />
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Permissions"}
        </Button>
      </div>
    </Modal>
  );
}

function RenameRoleModal({ role, onClose, onSaved }: { role: Role; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await updateRole(role.id, { name, description });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Rename Role" onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField label="Role Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
