import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/roles", label: "Roles" },
  { to: "/roles/users", label: "User Access" },
];

export default function AccessLayout() {
  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `border-b-2 px-4 py-2 text-sm font-medium ${
                isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
