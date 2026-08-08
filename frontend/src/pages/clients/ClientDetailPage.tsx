import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClient,
  updateClient,
  deleteClient,
  assignClient,
  updateKyc,
  uploadDocument,
  removeDocument,
  addCommunication,
} from "../../api/client.api";
import { listUserDirectory } from "../../api/access.api";
import { documentUrl } from "../../api/config";
import type { ClientDetail, UserSummary, CommunicationType } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { Card, Spinner, ErrorBanner, EmptyState } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField, TextArea } from "../../components/ui/Field";
import { StatusBadge } from "../../components/ui/Badge";
import { PermissionGate } from "../../components/PermissionGate";
import { useAuth } from "../../context/AuthContext";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [clientData, userData] = await Promise.all([getClient(id), listUserDirectory()]);
      setClient(clientData);
      setUsers(userData);
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
  if (!client || !id) return <EmptyState message="Client not found." />;

  async function handleDelete() {
    if (!confirm(`Delete client "${client!.name}"? This cannot be undone.`)) return;
    try {
      await deleteClient(id!);
      navigate("/clients");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{client.name}</h1>
          <div className="mt-1 flex gap-2">
            <StatusBadge status={client.status} />
            <StatusBadge status={client.kycStatus} />
          </div>
        </div>
        <PermissionGate anyOf={["client.delete"]}>
          <Button variant="danger" onClick={handleDelete}>
            Delete Client
          </Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileCard client={client} onSaved={load} />
          <DocumentsCard client={client} onChanged={load} />
          <CommunicationsCard client={client} onChanged={load} />
        </div>
        <div className="space-y-6">
          <AssignmentCard client={client} users={users} onSaved={load} canAssign={can("client.assign")} />
          <KycCard client={client} onSaved={load} canUpdate={can("client.update")} />
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ client, onSaved }: { client: ClientDetail; onSaved: () => void }) {
  const { can } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: client.name,
    email: client.email ?? "",
    phone: client.phone ?? "",
    pan: client.pan ?? "",
    gstin: client.gstin ?? "",
    address: client.address ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await updateClient(client.id, form);
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
        {can("client.update") && !editing && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>
      {error && <ErrorBanner message={error} />}
      {editing ? (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="PAN" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
            <TextField label="GSTIN" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
          </div>
          <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Detail label="Email" value={client.email} />
          <Detail label="Phone" value={client.phone} />
          <Detail label="PAN" value={client.pan} />
          <Detail label="GSTIN" value={client.gstin} />
          <Detail label="Address" value={client.address} full />
        </dl>
      )}
    </Card>
  );
}

function Detail({ label, value, full }: { label: string; value: string | null; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="text-xs font-medium uppercase text-slate-400">{label}</dt>
      <dd className="text-slate-700 dark:text-slate-200">{value || "-"}</dd>
    </div>
  );
}

function AssignmentCard({
  client,
  users,
  onSaved,
  canAssign,
}: {
  client: ClientDetail;
  users: UserSummary[];
  onSaved: () => void;
  canAssign: boolean;
}) {
  const [assignedToId, setAssignedToId] = useState(client.assignedToId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      await assignClient(client.id, assignedToId || null);
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Assignment</h2>
      {error && <ErrorBanner message={error} />}
      <SelectField label="Assigned To" value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} disabled={!canAssign}>
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </SelectField>
      {canAssign && (
        <Button className="mt-3 w-full" onClick={handleSave} disabled={isSaving || assignedToId === (client.assignedToId ?? "")}>
          Save Assignment
        </Button>
      )}
    </Card>
  );
}

function KycCard({ client, onSaved, canUpdate }: { client: ClientDetail; onSaved: () => void; canUpdate: boolean }) {
  const [kycStatus, setKycStatus] = useState(client.kycStatus);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      await updateKyc(client.id, kycStatus);
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">KYC Status</h2>
      {error && <ErrorBanner message={error} />}
      <SelectField label="Status" value={kycStatus} onChange={(e) => setKycStatus(e.target.value as typeof kycStatus)} disabled={!canUpdate}>
        <option value="PENDING">Pending</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="VERIFIED">Verified</option>
        <option value="REJECTED">Rejected</option>
      </SelectField>
      {canUpdate && (
        <Button className="mt-3 w-full" onClick={handleSave} disabled={isSaving || kycStatus === client.kycStatus}>
          Save KYC Status
        </Button>
      )}
    </Card>
  );
}

function DocumentsCard({ client, onChanged }: { client: ClientDetail; onChanged: () => void }) {
  const { can } = useAuth();
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file || !docType) return;
    setError(null);
    setIsUploading(true);
    try {
      await uploadDocument(client.id, docType, file);
      setDocType("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove(documentId: string) {
    if (!confirm("Remove this document?")) return;
    try {
      await removeDocument(client.id, documentId);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Documents</h2>
      {error && <ErrorBanner message={error} />}
      {client.documents.length === 0 ? (
        <EmptyState message="No documents uploaded yet." />
      ) : (
        <ul className="mb-4 divide-y divide-slate-100 dark:divide-slate-800">
          {client.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <a href={documentUrl(doc.filePath)} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                  {doc.fileName}
                </a>
                <div className="text-xs text-slate-400">
                  {doc.docType} &middot; uploaded by {doc.uploadedBy.name}
                </div>
              </div>
              <PermissionGate anyOf={["client.update"]}>
                <button onClick={() => handleRemove(doc.id)} className="text-xs font-medium text-red-500 hover:underline">
                  Remove
                </button>
              </PermissionGate>
            </li>
          ))}
        </ul>
      )}
      {can("client.update") && (
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleUpload}>
          <div className="w-40">
            <TextField label="Document Type" placeholder="e.g. PAN Card" value={docType} onChange={(e) => setDocType(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">File</label>
            <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
          </div>
          <Button type="submit" disabled={isUploading || !file || !docType}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      )}
    </Card>
  );
}

const COMMUNICATION_TYPES: CommunicationType[] = ["CALL", "EMAIL", "MEETING", "NOTE"];

function CommunicationsCard({ client, onChanged }: { client: ClientDetail; onChanged: () => void }) {
  const { can } = useAuth();
  const [type, setType] = useState<CommunicationType>("NOTE");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await addCommunication(client.id, { type, subject, notes: notes || undefined });
      setSubject("");
      setNotes("");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Communication History</h2>
      {error && <ErrorBanner message={error} />}
      {client.communications.length === 0 ? (
        <EmptyState message="No communication logged yet." />
      ) : (
        <ul className="mb-4 space-y-3">
          {client.communications.map((c) => (
            <li key={c.id} className="rounded-md border border-slate-100 p-3 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-100">{c.subject}</span>
                <StatusBadge status={c.type} />
              </div>
              {c.notes && <p className="mt-1 text-slate-500 dark:text-slate-400">{c.notes}</p>}
              <p className="mt-1 text-xs text-slate-400">
                {c.communicatedBy.name} &middot; {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
      {can("client.update") && (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value as CommunicationType)}>
              {COMMUNICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectField>
            <TextField label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <TextArea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button type="submit" disabled={isSaving || !subject}>
            Log Communication
          </Button>
        </form>
      )}
    </Card>
  );
}
