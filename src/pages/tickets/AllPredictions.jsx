import { useState, useEffect, useCallback } from 'react';
import { FiTrash2, FiEye, FiSearch, FiRefreshCw } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { ticketsApi } from '../../services/api';

const PER_PAGE = 10;

export default function AllPredictions() {
  const { addToast } = useToast();
  const [tickets, setTickets]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]       = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [page, setPage]           = useState(1);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PER_PAGE };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await ticketsApi.list(params);
      setTickets(res.data?.tickets || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const handleVoid = async (id) => {
    setConfirmId(null);
    try {
      await ticketsApi.void(id);
      addToast('Ticket voided and refunded', 'success');
      fetchTickets();
    } catch (err) {
      addToast(err.response?.data?.error || 'Void failed', 'error');
    }
  };

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  const STATUS_OPTIONS = ['All Status', 'pending', 'won', 'incorrect', 'correct', 'refunded'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Prediction Management</h1>
          <p className="text-sm text-gray-500">All user ticket predictions</p>
        </div>
        <button onClick={fetchTickets} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value === 'All Status' ? '' : e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]">
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ticket number…"
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
            <p className="text-sm text-gray-400">Loading tickets…</p>
          </div>
        ) : tickets.length === 0 ? <EmptyState message="No predictions found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="text-left px-5 py-3">Match</th>
                  <th className="text-left py-3">Market</th>
                  <th className="text-left py-3">Prediction</th>
                  <th className="text-left py-3">Ticket #</th>
                  <th className="text-left py-3 hidden md:table-cell">User</th>
                  <th className="text-right py-3 hidden md:table-cell">BTP Paid</th>
                  <th className="text-left py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 pr-4">
                      <p className="text-[#1A4D8F] font-medium text-sm">{t.team_home && t.team_away ? `${t.team_home} vs ${t.team_away}` : '—'}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <button onClick={() => setConfirmId(t.id)} className="text-red-500 hover:underline flex items-center gap-1"><FiTrash2 className="w-3 h-3" /> Void</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-blue-600 hover:underline flex items-center gap-1"><FiEye className="w-3 h-3" /> View</button>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-[#1A4D8F] text-sm">{t.market_type || '—'}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-semibold text-[#1A1A2E]">{t.user_prediction}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-[#1A4D8F] text-xs font-mono">{t.ticket_number}</span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-[#1A4D8F] text-sm">{t.username || t.user_id?.slice(0, 8) || '—'}</span>
                    </td>
                    <td className="py-4 text-right pr-4 hidden md:table-cell">
                      <span className="text-sm font-semibold">{(t.amount_paid || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">{t.purchased_at ? new Date(t.purchased_at).toLocaleDateString() : '—'}</span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => handleVoid(confirmId)}
        message="Void this ticket and refund the user's BTP? This cannot be undone."
      />
    </div>
  );
}
