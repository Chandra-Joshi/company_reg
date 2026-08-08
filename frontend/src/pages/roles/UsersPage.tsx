import { useEffect, useState } from "react";
import { listUsers, listRoles, getUser, listPermissions, setUserRoles, setUserPermissions, setUserStatus } from "../../api/access.api";
import type { UserListItem, Role, Permission, UserDetail, PermissionKey } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { PageHeader, Card, Table, Th, Td, Spinner, EmptyState, ErrorBanner } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { PermissionGate } from "../../components/PermissionGate";

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managingUserId, setManagingUserId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [userData, roleData, permData] = await Promise.all([listUsers(), listRoles(), listPermissions()]);
      setUsers(userData);
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

  return (
    <div>
      <PageHeader title="User Access" description="Assign roles and fine-tune individual permission overrides" />
      {error && <ErrorBanner message={error} />}

      <Card>
        {isLoading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Roles</Th>
                <Th>Department</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{u.name}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 ? <span className="text-slate-400">No role</span> : u.roles.map((r) => <Badge key={r.id}>{r.name}</Badge>)}
                    </div>
                  </Td>
                  <Td>{u.department ?? "-"}</Td>
                  <Td>
                    <Badge tone={u.isActive ? "green" : "red"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                  </Td>
                  <Td>
                    <PermissionGate anyOf={["permission.assign"]}>
                      <button onClick={() => setManagingUserId(u.id)} className="text-xs font-medium text-brand-600 hover:underline">
                        Manage Access
                      </button>
                    </PermissionGate>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {managingUserId && (
        <ManageAccessModal
          userId={managingUserId}
          roles={roles}
          permissions={permissions}
          onClose={() => setManagingUserId(null)}
          onSaved={() => {
            setManagingUserId(null);
            load();
          }}
        />
      )}
    </div>
  );
}

type OverrideState = "INHERIT" | "ALLOW" | "DENY";

function ManageAccessModal({
  userId,
  roles,
  permissions,
  onClose,
  onSaved,
}: {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Map<PermissionKey, OverrideState>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getUser(userId)
      .then((d) => {
        setDetail(d);
        setSelectedRoles(new Set(d.roles.map((r) => r.id)));
        const map = new Map<PermissionKey, OverrideState>();
        for (const o of d.directPermissions) map.set(o.permissionKey, o.effect);
        setOverrides(map);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [userId]);

  function toggleRole(roleId: string) {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      next.has(roleId) ? next.delete(roleId) : next.add(roleId);
      return next;
    });
  }

  function setOverride(key: PermissionKey, state: OverrideState) {
    setOverrides((prev) => {
      const next = new Map(prev);
      if (state === "INHERIT") next.delete(key);
      else next.set(key, state);
      return next;
    });
  }

  async function handleSave() {
    if (!detail) return;
    setError(null);
    setIsSaving(true);
    try {
      await setUserRoles(userId, Array.from(selectedRoles));
      await setUserPermissions(
        userId,
        Array.from(overrides.entries()).map(([permissionKey, effect]) => ({ permissionKey, effect: effect as "ALLOW" | "DENY" }))
      );
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (!detail) return;
    setError(null);
    try {
      await setUserStatus(userId, !detail.isActive);
      setDetail({ ...detail, isActive: !detail.isActive });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <Modal title={detail ? `Manage Access - ${detail.name}` : "Manage Access"} onClose={onClose} widthClassName="max-w-3xl">
      {error && <ErrorBanner message={error} />}
      {isLoading || !detail ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{detail.email}</p>
              <p className="text-xs text-slate-400">Account status</p>
            </div>
            <Button variant={detail.isActive ? "danger" : "primary"} onClick={handleToggleStatus}>
              {detail.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Roles</h3>
            <div className="flex flex-wrap gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-700">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input type="checkbox" checked={selectedRoles.has(role.id)} onChange={() => toggleRole(role.id)} className="rounded border-slate-300" />
                  {role.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Direct Permission Overrides</h3>
            <p className="mb-2 text-xs text-slate-400">Overrides beyond the roles above. A Deny always wins over a role-granted Allow.</p>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-3 dark:border-slate-700">
              {permissions.map((p) => {
                const state = overrides.get(p.key) ?? "INHERIT";
                return (
                  <div key={p.key} className="flex items-center justify-between gap-3 py-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300" title={p.description ?? ""}>
                      {p.key}
                    </span>
                    <div className="flex gap-1 text-xs">
                      {(["INHERIT", "ALLOW", "DENY"] as OverrideState[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setOverride(p.key, opt)}
                          className={`rounded-md px-2 py-1 font-medium ${
                            state === opt
                              ? opt === "ALLOW"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : opt === "DENY"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                              : "bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                          }`}
                        >
                          {opt === "INHERIT" ? "Inherit" : opt === "ALLOW" ? "Allow" : "Deny"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Access"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
