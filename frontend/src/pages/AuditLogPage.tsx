import { useEffect, useState } from "react";
import { listAuditLogs } from "../api/access.api";
import type { AuditLog } from "../types";
import { extractErrorMessage } from "../api/axios";
import { PageHeader, Card, Table, Th, Td, Spinner, EmptyState, ErrorBanner } from "../components/ui/Common";
import { Button } from "../components/ui/Button";

const PAGE_SIZE = 25;

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listAuditLogs({ page, pageSize: PAGE_SIZE });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Audit Logs" description="Who changed what, and when" />
      {error && <ErrorBanner message={error} />}

      <Card>
        {isLoading ? (
          <Spinner />
        ) : logs.length === 0 ? (
          <EmptyState message="No audit activity recorded yet." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Metadata</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td className="whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</Td>
                  <Td>{log.user ? `${log.user.name}` : "System"}</Td>
                  <Td>
                    <code className="text-xs">{log.action}</code>
                  </Td>
                  <Td>
                    {log.entityType}
                    {log.entityId && <span className="text-xs text-slate-400"> #{log.entityId.slice(0, 8)}</span>}
                  </Td>
                  <Td className="max-w-xs truncate text-xs text-slate-400">{log.metadata ? JSON.stringify(log.metadata) : "-"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} ({total} entries)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
