import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950">
      <p className="text-4xl font-bold text-slate-300 dark:text-slate-700">404</p>
      <p className="text-slate-600 dark:text-slate-300">Page not found</p>
      <Link to="/" className="mt-2 text-sm font-medium text-brand-600 hover:underline">
        Go back home
      </Link>
    </div>
  );
}
