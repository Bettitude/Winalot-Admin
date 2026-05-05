import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

const MOCK_ADMIN = {
  id: 'admin-001',
  name: 'Williams Idowu',
  email: 'admin@winalott.com',
  role: 'admin',
  avatar: null,
};

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin_user');
    if (stored) setAdmin(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (email === 'admin@winalott.com' && password === 'admin123') {
      setAdmin(MOCK_ADMIN);
      localStorage.setItem('admin_user', JSON.stringify(MOCK_ADMIN));
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setAdmin(null);
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
