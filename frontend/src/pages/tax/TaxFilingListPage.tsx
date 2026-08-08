import { useEffect, useState, type FormEvent } from "react";
import { listTaxFilings, createTaxFiling, updateTaxFiling, submitTaxFiling, decideTaxFiling, type TaxFilingInput } from "../../api/tax.api";
import { listClients } from "../../api/client.api";
import type { TaxFiling, TaxType, TaxStatus, Client } from "../../types";
import { extractErrorMessage } from "../../api/axios";
import { PageHeader, Card, Table, Th, Td, Spinner, EmptyState, ErrorBanner } from "../../components/ui/Common";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField, TextArea } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { PermissionGate } from "../../components/PermissionGate";
import { useAuth } from "../../context/AuthContext";

const TYPES: TaxType[] = ["ITR", "GST", "TDS", "ADVANCE_TAX", "TAX_NOTICE"];
const STATUSES: TaxStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

export default function TaxFilingListPage() {
  const { can } = useAuth();
  const [filings, setFilings] = useState<TaxFiling[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<TaxFiling | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaxStatus | "">("");

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const [filingData, clientData] = await Promise.all([
        listTaxFilings(statusFilter ? { status: statusFilter } : undefined),
        can("client.view") ? listClients() : Promise.resolve([]),
      ]);
      setFilings(filingData);
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

  async function handleSubmit(filing: TaxFiling) {
    try {
      await submitTaxFiling(filing.id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleDecide(filing: TaxFiling, approve: boolean) {
    if (!approve && !confirm(`Reject the ${filing.type} filing for "${filing.client.name}"?`)) return;
    try {
      await decideTaxFiling(filing.id, approve);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Tax Filings"
        description="ITR, GST, TDS, Advance Tax and Notices"
        actions={
          <PermissionGate anyOf={["tax.create"]}>
            <Button onClick={() => setShowCreate(true)}>+ New Filing</Button>
          </PermissionGate>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Card className="mb-4 p-4">
        <div className="max-w-xs">
          <SelectField label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaxStatus | "")}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : filings.length === 0 ? (
          <EmptyState message="No tax filings found." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Type</Th>
                <Th>Period</Th>
                <Th>Amount</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {filings.map((filing) => (
                <tr key={filing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td>{filing.client.name}</Td>
                  <Td>{filing.type.replace("_", " ")}</Td>
                  <Td>{filing.period}</Td>
                  <Td>{filing.amount ?? "-"}</Td>
                  <Td>{filing.dueDate ? new Date(filing.dueDate).toLocaleDateString() : "-"}</Td>
                  <Td>
                    <StatusBadge status={filing.status} />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      {filing.status !== "APPROVED" && (
                        <PermissionGate anyOf={["tax.update"]}>
                          <button onClick={() => setEditing(filing)} className="text-xs font-medium text-brand-600 hover:underline">
                            Edit
                          </button>
                        </PermissionGate>
                      )}
                      {filing.status === "DRAFT" && (
                        <PermissionGate anyOf={["tax.submit"]}>
                          <button onClick={() => handleSubmit(filing)} className="text-xs font-medium text-blue-600 hover:underline">
                            Submit
                          </button>
                        </PermissionGate>
                      )}
                      {filing.status === "SUBMITTED" && (
                        <PermissionGate anyOf={["tax.approve"]}>
                          <button onClick={() => handleDecide(filing, true)} className="text-xs font-medium text-emerald-600 hover:underline">
                            Approve
                          </button>
                          <button onClick={() => handleDecide(filing, false)} className="text-xs font-medium text-red-500 hover:underline">
                            Reject
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
        <FilingFormModal
          clients={clients}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {editing && (
        <FilingFormModal
          clients={clients}
          existing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function FilingFormModal({
  clients,
  existing,
  onClose,
  onSaved,
}: {
  clients: Client[];
  existing?: TaxFiling;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TaxFilingInput>({
    type: existing?.type ?? "ITR",
    clientId: existing?.client.id ?? "",
    period: existing?.period ?? "",
    amount: existing?.amount ? Number(existing.amount) : undefined,
    dueDate: existing?.dueDate?.slice(0, 10) ?? "",
    remarks: existing?.remarks ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (existing) {
        await updateTaxFiling(existing.id, {
          type: form.type,
          period: form.period,
          amount: form.amount,
          dueDate: form.dueDate,
          remarks: form.remarks,
        });
      } else {
        await createTaxFiling(form);
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={existing ? "Edit Tax Filing" : "New Tax Filing"} onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Type" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaxType })}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Client"
            required
            value={form.clientId}
            disabled={!!existing}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
        <TextField label="Period" required placeholder="e.g. FY 2025-26 Q1" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Amount"
            type="number"
            min={0}
            step="0.01"
            value={form.amount ?? ""}
            onChange={(e) => setForm({ ...form, amount: e.target.value ? Number(e.target.value) : undefined })}
          />
          <TextField label="Due Date" type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <TextArea label="Remarks" value={form.remarks ?? ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.clientId}>
            {isSubmitting ? "Saving..." : existing ? "Save Changes" : "Create Filing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
