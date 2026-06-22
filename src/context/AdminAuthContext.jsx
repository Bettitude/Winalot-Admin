import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = localStorage.getItem('admin_token');
    const stored = localStorage.getItem('admin_user');
    if (token && stored) {
      try { setAdmin(JSON.parse(stored)); } catch {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);

    // ── Dummy admin accounts (no backend required) ────────────────────────────
    const DUMMY_ADMINS = [
      { email: 'admin@winalott.com', password: 'admin123', user: {
          id: 'dummy-admin-001', name: 'WinALOT Admin', email: 'admin@winalott.com', role: 'admin', is_super_admin: false,
        },
      },
      { email: 'superadmin@winalott.com', password: 'Admin1234', user: {
          id: 'dummy-admin-002', name: 'Super Admin', email: 'superadmin@winalott.com', role: 'admin', is_super_admin: true,
        },
      },
    ];
    const dummy = DUMMY_ADMINS.find(a => a.email === email && a.password === password);
    if (dummy) {
      localStorage.setItem('admin_token', 'dummy_admin_token_' + dummy.user.id);
      localStorage.setItem('admin_user', JSON.stringify(dummy.user));
      setAdmin(dummy.user);
      setLoading(false);
      return { success: true };
    }

    // ── Real API login (Node.js backend) ────────────────────────────────────────
    try {
      // api.js helpers unwrap r.data already, so res = { success, data: { user, token } }
      const res   = await authApi.login(email, password);
      const user  = res?.data?.user  || res?.user;
      const token = res?.data?.token || res?.token;

      if (!user || !token) throw new Error('Invalid response from server');
      if (user.role !== 'admin') throw new Error('Access denied — admin accounts only.');

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      setAdmin(user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || err.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore network errors */ }
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
