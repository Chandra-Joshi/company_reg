import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card } from "../components/ui/Common";
import { PermissionGate } from "../components/PermissionGate";

const TILES = [
  { to: "/clients", label: "Clients", anyOf: ["client.view"] as const, description: "Manage client profiles, KYC and documents" },
  { to: "/tasks", label: "Tasks", anyOf: ["task.view"] as const, description: "Track work assigned across the firm" },
  { to: "/tax-filings", label: "Tax Filings", anyOf: ["tax.view"] as const, description: "ITR, GST, TDS, Advance Tax & Notices" },
  { to: "/employees", label: "Employees", anyOf: ["employee.view"] as const, description: "Staff, departments and designations" },
  { to: "/roles", label: "Roles & Permissions", anyOf: ["role.view", "permission.assign"] as const, description: "Configure PBAC access control" },
  { to: "/audit-logs", label: "Audit Logs", anyOf: ["audit.view"] as const, description: "Review who changed what, and when" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name ?? ""}`} description="Here's a quick overview of what you can access." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <PermissionGate key={tile.to} anyOf={[...tile.anyOf]}>
            <Link to={tile.to}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{tile.label}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tile.description}</p>
              </Card>
            </Link>
          </PermissionGate>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Your effective permissions</h3>
        <div className="flex flex-wrap gap-2">
          {user?.permissions.map((p) => (
            <span key={p} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {p}
            </span>
          ))}
          {user?.permissions.length === 0 && <p className="text-sm text-slate-500">No permissions granted yet - ask an administrator to assign you a role.</p>}
        </div>
      </Card>
    </div>
  );
}
