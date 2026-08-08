import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listClients, createClient, type ClientInput } from "../../api/client.api";
import { listUserDirectory } from "../../api/access.api";
import type { Client, UserSummary } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { PageHeader, Card, Table, Th, Td, Spinner, EmptyState, ErrorBanner } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { PermissionGate } from "../../components/PermissionGate";

export default function ClientListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [clientData, userData] = await Promise.all([listClients(), listUserDirectory()]);
      setClients(clientData);
      setUsers(userData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.pan?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage client profiles, assignments and KYC status"
        actions={
          <PermissionGate anyOf={["client.create"]}>
            <Button onClick={() => setShowCreate(true)}>+ New Client</Button>
          </PermissionGate>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Card className="mb-4 p-4">
        <TextField label="Search" placeholder="Search by name, email or PAN" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState message="No clients found." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>PAN / GSTIN</Th>
                <Th>Status</Th>
                <Th>KYC</Th>
                <Th>Assigned To</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td>
                    <Link to={`/clients/${c.id}`} className="font-medium text-brand-600 hover:underline">
                      {c.name}
                    </Link>
                  </Td>
                  <Td>
                    <div>{c.email ?? "-"}</div>
                    <div className="text-xs text-slate-400">{c.phone ?? ""}</div>
                  </Td>
                  <Td>
                    <div>{c.pan ?? "-"}</div>
                    <div className="text-xs text-slate-400">{c.gstin ?? ""}</div>
                  </Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td>
                    <StatusBadge status={c.kycStatus} />
                  </Td>
                  <Td>{c.assignedTo?.name ?? <span className="text-slate-400">Unassigned</span>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {showCreate && (
        <CreateClientModal
          users={users}
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

function CreateClientModal({ users, onClose, onCreated }: { users: UserSummary[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<ClientInput>({ name: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createClient(form);
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="New Client" onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Email" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="PAN" value={form.pan ?? ""} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
          <TextField label="GSTIN" value={form.gstin ?? ""} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
        </div>
        <TextField label="Address" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <SelectField label="Assign To" value={form.assignedToId ?? ""} onChange={(e) => setForm({ ...form, assignedToId: e.target.value || undefined })}>
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </SelectField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
