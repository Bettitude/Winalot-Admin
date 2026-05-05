import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const { admin, login, loading } = useAdminAuth();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('All fields required'); return; }
    setError(''); setSubmitting(true);
    const res = await login(form.email, form.password);
    setSubmitting(false);
    if (!res.success) setError(res.error);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-black">
            <span className="text-[#F5C518]">b</span>
            <span className="text-[#0D2B5E]">WinAL</span>
            <span className="text-[#F5C518]">OTT</span>
          </span>
          <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-widest">Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">Access restricted to administrators only.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@winalott.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm mt-2">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Demo: <span className="font-mono">admin@winalott.com</span> / <span className="font-mono">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
