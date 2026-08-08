import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseInputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

function Wrapper({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

export function TextField({ label, required, className = "", ...props }: { label: string; required?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper label={label} required={required}>
      <input className={`${baseInputClass} ${className}`} {...props} />
    </Wrapper>
  );
}

export function TextArea({ label, required, className = "", ...props }: { label: string; required?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label} required={required}>
      <textarea className={`${baseInputClass} ${className}`} rows={3} {...props} />
    </Wrapper>
  );
}

export function SelectField({
  label,
  required,
  className = "",
  children,
  ...props
}: { label: string; required?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label} required={required}>
      <select className={`${baseInputClass} ${className}`} {...props}>
        {children}
      </select>
    </Wrapper>
  );
}
