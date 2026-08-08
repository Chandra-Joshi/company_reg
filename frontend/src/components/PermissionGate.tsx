import type { ReactNode } from "react";
import type { PermissionKey } from "../types";
import { useAuth } from "../context/AuthContext";

interface PermissionGateProps {
  anyOf: PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only if the current user holds at least one of the listed permission keys. */
export function PermissionGate({ anyOf, children, fallback = null }: PermissionGateProps) {
  const { can } = useAuth();
  return can(...anyOf) ? <>{children}</> : <>{fallback}</>;
}
