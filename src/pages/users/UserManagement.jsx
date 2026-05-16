import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEye, FiRefreshCw } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { usersApi } from '../../services/api';

const STATUSES = ['All Status', 'enabled', 'suspended', 'disabled'];
const PER_PAGE = 10;

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
const initials = (name) => (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function UserManagement() {
  const { addToast } = useToast();
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('All Status');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PER_PAGE };
      if (status !== 'All Status') params.status = status;
      if (search) params.search = search;
      const res = await usersApi.list(params);
      setUsers(res.data?.users || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await usersApi.update(id, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      addToast('User status updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">User Management</h1>
          <p className="text-sm text-gray-500">{total} registered users</p>
        </div>
        <button onClick={fetchUsers} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]">
            {STATUSES.map(s => <option key={s} value={s === 'All Status' ? '' : s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search email, username…"
              className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
            <button onClick={handleSearch} className="bg-[#F5C518] text-gray-900 p-2 rounded">
              <FiSearch className="w-4 h-4" />
            </button>
          </div>

          <span className="text-gray-400 text-sm ml-auto">{total} items</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading users…</p>
          </div>
        ) : users.length === 0 ? <EmptyState message="No users found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="text-left px-5 py-3">Username</th>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3 hidden md:table-cell">Email</th>
                  <th className="text-left py-3 hidden lg:table-cell">Phone</th>
                  <th className="text-right py-3 hidden lg:table-cell">Wallet (BTP)</th>
                  <th className="text-left py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {initials(u.full_name || u.username)}
                        </div>
                        <div>
                          <p className="text-[#1A4D8F] font-semibold text-sm hover:underline cursor-pointer">{u.username}</p>
                          <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                            <FiEye className="w-3 h-3" /> View
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-700">{u.full_name || '—'}</span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-[#1A4D8F] text-sm">{u.email}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-600">{u.phone || '—'}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell text-right pr-4">
                      <span className="text-xs font-semibold text-[#1A1A2E]">{(u.wallet_balance || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={u.status} withChevron onChange={(s) => handleStatusChange(u.id, s)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
