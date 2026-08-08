import { NavLink } from "react-router-dom";
import type { PermissionKey } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  anyOf: PermissionKey[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", anyOf: [] as PermissionKey[] },
  { to: "/clients", label: "Clients", anyOf: ["client.view"] },
  { to: "/tasks", label: "Tasks", anyOf: ["task.view"] },
  { to: "/tax-filings", label: "Tax Filings", anyOf: ["tax.view"] },
  { to: "/employees", label: "Employees", anyOf: ["employee.view"] },
  { to: "/roles", label: "Roles & Permissions", anyOf: ["role.view", "permission.assign"] },
  { to: "/audit-logs", label: "Audit Logs", anyOf: ["audit.view"] },
];

export function Sidebar() {
  const { can } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">CA</div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Firm Manager</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.filter((item) => item.anyOf.length === 0 || can(...item.anyOf)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
