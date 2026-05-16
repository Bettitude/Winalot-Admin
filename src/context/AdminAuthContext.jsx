import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

// Bettitude admin login hits POST /login (not /website/login)
// Only accounts with user_type === 'dashboard' are allowed
const BETTITUDE_API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function bettitudeAdminLogin(email, password) {
  const res = await axios.post(`${BETTITUDE_API}/login`, { email, password });
  return res.data; // { message, user, token }
}

async function bettitudeLogout(token) {
  await axios.post(`${BETTITUDE_API}/logout`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

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

    // ── Dummy admin accounts (no backend required) ──────────────────────────
    const DUMMY_ADMINS = [
      { email: 'admin@winalott.com', password: 'admin123', user: {
          id: 'dummy-admin-001', name: 'WinALOT Admin', email: 'admin@winalott.com',
          user_type: 'dashboard', role: 'admin',
        },
      },
      { email: 'superadmin@winalott.com', password: 'Admin1234', user: {
          id: 'dummy-admin-002', name: 'Super Admin', email: 'superadmin@winalott.com',
          user_type: 'dashboard', role: 'admin',
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

    // ── Real API login ────────────────────────────────────────────────────────
    try {
      const data = await bettitudeAdminLogin(email, password);
      const { user, token } = data;

      if (!user || !token) throw new Error('Invalid response from server');

      // Only dashboard users can access the admin panel
      if (user.user_type !== 'dashboard') {
        throw new Error('Access denied. This account is not authorized for dashboard access.');
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      setAdmin(user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('admin_token');
    try { if (token) await bettitudeLogout(token); } catch { /* ignore */ }
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
