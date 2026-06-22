import { useState, useEffect, useCallback } from 'react';
import {
  FiCheckSquare, FiClock, FiCheckCircle, FiXCircle,
  FiRefreshCw, FiUser, FiShieldOff,
} from 'react-icons/fi';
import { changeRequestsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';

const TYPE_LABELS = {
  market_price_change: 'Ticket Price Change',
  btp_rate_change:      'BTP / Dollar Settings',
  late_game_creation:   'Free Game (Match Started)',
};

const TABS = ['pending', 'approved', 'rejected', 'all'];

function StatusBadge({ status }) {
  if (status === 'pending')  return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><FiClock className="w-3 h-3" />Pending</span>;
  if (status === 'approved') return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><FiCheckCircle className="w-3 h-3" />Approved</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><FiXCircle className="w-3 h-3" />Rejected</span>;
}

export default function ApprovalRequests() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = !!admin?.is_super_admin;
  const { addToast } = useToast();

  const [tab, setTab]         = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab === 'all' ? {} : { status: tab };
      const d = await changeRequestsApi.list(params);
      setRequests(d.success ? d.data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    setActing(id);
    try {
      const fn = action === 'approve' ? changeRequestsApi.approve : changeRequestsApi.reject;
      const d  = await fn(id);
      if (d.success) {
        addToast(action === 'approve' ? 'Request approved and applied' : 'Request rejected', 'success');
        load();
      } else {
        addToast(d.error || 'Action failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Action failed', 'error');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <FiCheckSquare className="w-5 h-5 text-[#1A4D8F]" /> Approval Requests
          </h1>
          <p className="text-sm text-gray-500">Price changes, BTP settings, and late-started free games submitted by admins.</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Reload">
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!isSuperAdmin && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <FiShieldOff className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            You can view requests here, but only a <strong>super admin</strong> can approve or reject them.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${tab === t ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Summary</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Requested By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-16">
                <div className="w-6 h-6 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-gray-400">No {tab !== 'all' ? tab : ''} requests</td></tr>
            ) : (
              requests.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-[#1A4D8F]">{TYPE_LABELS[r.type] || r.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">{r.summary || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                    <span className="flex items-center gap-1"><FiUser className="w-3 h-3 text-gray-300" />{r.requested_by_username || '—'}</span>
                    <span className="text-[10px] text-gray-300">{new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'pending' && isSuperAdmin ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => act(r.id, 'approve')} disabled={acting === r.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50">
                          {acting === r.id ? '…' : 'Approve'}
                        </button>
                        <button onClick={() => act(r.id, 'reject')} disabled={acting === r.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                          {acting === r.id ? '…' : 'Reject'}
                        </button>
                      </div>
                    ) : r.status !== 'pending' ? (
                      <span className="text-[11px] text-gray-400">{r.reviewed_by_username || '—'}</span>
                    ) : (
                      <span className="text-[11px] text-gray-300 italic">Awaiting super admin</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
