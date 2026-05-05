import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { ToastProvider } from './context/ToastContext';

import AdminLayout       from './components/layout/AdminLayout';
import AdminLogin        from './pages/AdminLogin';
import Dashboard         from './pages/Dashboard';
import AllMatches        from './pages/matches/AllMatches';
import AddNewMatch       from './pages/matches/AddNewMatch';
import AllPredictions    from './pages/tickets/AllPredictions';
import SettlePredictions from './pages/tickets/SettlePredictions';
import Transactions      from './pages/Transactions';
import UserManagement    from './pages/users/UserManagement';
import Notifications     from './pages/notifications/Notifications';
import NotFound          from './pages/NotFound';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin layout */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="matches"         element={<AllMatches />} />
              <Route path="matches/new"     element={<AddNewMatch />} />
              <Route path="tickets"         element={<AllPredictions />} />
              <Route path="tickets/settle"  element={<SettlePredictions />} />
              <Route path="transactions"    element={<Transactions />} />
              <Route path="users"           element={<UserManagement />} />
              <Route path="notifications"   element={<Notifications />} />
              <Route path="*"               element={<NotFound />} />
            </Route>

            {/* Root redirect */}
            <Route path="/"  element={<Navigate to="/admin" replace />} />
            <Route path="*"  element={<Navigate to="/admin" replace />} />
          </Routes>
        </ToastProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
