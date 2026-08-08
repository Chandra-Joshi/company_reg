import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, RequirePermission } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import AuditLogPage from "./pages/AuditLogPage";

import ClientListPage from "./pages/clients/ClientListPage";
import ClientDetailPage from "./pages/clients/ClientDetailPage";

import EmployeeListPage from "./pages/employees/EmployeeListPage";
import EmployeeDetailPage from "./pages/employees/EmployeeDetailPage";

import TaskListPage from "./pages/tasks/TaskListPage";
import TaxFilingListPage from "./pages/tax/TaxFilingListPage";

import AccessLayout from "./pages/roles/AccessLayout";
import RolesPage from "./pages/roles/RolesPage";
import UsersPage from "./pages/roles/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />

              <Route element={<RequirePermission anyOf={["client.view"]} />}>
                <Route path="clients" element={<ClientListPage />} />
                <Route path="clients/:id" element={<ClientDetailPage />} />
              </Route>

              <Route element={<RequirePermission anyOf={["task.view"]} />}>
                <Route path="tasks" element={<TaskListPage />} />
              </Route>

              <Route element={<RequirePermission anyOf={["tax.view"]} />}>
                <Route path="tax-filings" element={<TaxFilingListPage />} />
              </Route>

              <Route element={<RequirePermission anyOf={["employee.view"]} />}>
                <Route path="employees" element={<EmployeeListPage />} />
                <Route path="employees/:id" element={<EmployeeDetailPage />} />
              </Route>

              <Route element={<RequirePermission anyOf={["role.view", "permission.assign"]} />}>
                <Route path="roles" element={<AccessLayout />}>
                  <Route index element={<RolesPage />} />
                  <Route path="users" element={<UsersPage />} />
                </Route>
              </Route>

              <Route element={<RequirePermission anyOf={["audit.view"]} />}>
                <Route path="audit-logs" element={<AuditLogPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
