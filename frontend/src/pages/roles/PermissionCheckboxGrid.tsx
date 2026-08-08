import type { Permission, PermissionKey } from "../../types";

interface Props {
  permissions: Permission[];
  selected: Set<PermissionKey>;
  onToggle: (key: PermissionKey) => void;
}

export function PermissionCheckboxGrid({ permissions, selected, onToggle }: Props) {
  const grouped = new Map<string, Permission[]>();
  for (const p of permissions) {
    if (!grouped.has(p.module)) grouped.set(p.module, []);
    grouped.get(p.module)!.push(p);
  }

  return (
    <div className="max-h-80 space-y-4 overflow-y-auto rounded-md border border-slate-200 p-3 dark:border-slate-700">
      {Array.from(grouped.entries()).map(([module, perms]) => (
        <div key={module}>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{module}</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {perms.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={selected.has(p.key)} onChange={() => onToggle(p.key)} className="rounded border-slate-300" />
                <span title={p.description ?? ""}>{p.key}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
