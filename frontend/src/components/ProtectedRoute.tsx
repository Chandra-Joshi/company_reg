import { Navigate, Outlet } from "react-router-dom";
import type { PermissionKey } from "../types";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function RequirePermission({ anyOf }: { anyOf: PermissionKey[] }) {
  const { can } = useAuth();
  if (!can(...anyOf)) return <Navigate to="/403" replace />;
  return <Outlet />;
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
    </div>
  );
}
