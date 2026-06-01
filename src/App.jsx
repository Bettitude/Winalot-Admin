import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { ToastProvider } from './context/ToastContext';
import { analyticsApi } from './services/api';

import AdminLayout       from './components/layout/AdminLayout';
import AdminLogin        from './pages/AdminLogin';
import Dashboard         from './pages/Dashboard';
import AllMatches        from './pages/matches/AllMatches';
import AddNewMatch       from './pages/matches/AddNewMatch';
import EditMatch         from './pages/matches/EditMatch';
import AllPredictions    from './pages/tickets/AllPredictions';
import SettlePredictions from './pages/tickets/SettlePredictions';
import AllGiveaways      from './pages/giveaways/AllGiveaways';
import AddNewGiveaway    from './pages/giveaways/AddNewGiveaway';
import SettleGiveaway    from './pages/giveaways/SettleGiveaway';
import Transactions      from './pages/Transactions';
import UserManagement    from './pages/users/UserManagement';
import Notifications     from './pages/notifications/Notifications';
import Analytics         from './pages/Analytics';
import BTPSettings       from './pages/BTPSettings';
import NotFound          from './pages/NotFound';

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    analyticsApi.pageView({ path: location.pathname }).catch(() => {});
  }, [location.pathname]);
  return null;
}

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
          <PageViewTracker />
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
              <Route path="matches"             element={<AllMatches />} />
              <Route path="matches/new"         element={<AddNewMatch />} />
              <Route path="matches/edit/:id"    element={<EditMatch />} />
              <Route path="tickets"         element={<AllPredictions />} />
              <Route path="tickets/settle"  element={<SettlePredictions />} />
              <Route path="giveaways"           element={<AllGiveaways />} />
              <Route path="giveaways/new"       element={<AddNewGiveaway />} />
              <Route path="giveaways/settle"    element={<SettleGiveaway />} />
              <Route path="transactions"        element={<Transactions />} />
              <Route path="users"           element={<UserManagement />} />
              <Route path="notifications"   element={<Notifications />} />
              <Route path="analytics"       element={<Analytics />} />
              <Route path="btp-settings"    element={<BTPSettings />} />
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
