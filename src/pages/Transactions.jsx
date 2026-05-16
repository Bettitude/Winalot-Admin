import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { transactionsApi } from '../services/api';

const TYPE_OPTIONS   = ['All Types', 'deposit', 'ticket_purchase', 'prize_payout', 'withdrawal', 'refund', 'manual_credit', 'manual_debit'];
const STATUS_OPTIONS = ['All Status', 'successful', 'pending', 'failed'];
const PER_PAGE = 10;

export default function Transactions() {
  const { addToast } = useToast();
  const [txns, setTxns]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [typeFilter, setTypeFilter]   = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PER_PAGE };
      if (typeFilter   !== 'All Types')   params.type   = typeFilter;
      if (statusFilter !== 'All Status')  params.status = statusFilter;
      if (search) params.search = search;
      const res = await transactionsApi.list(params);
      setTxns(res.data?.transactions || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, search]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const formatAmount = (amount) => {
    const btp = Math.abs(amount || 0);
    const sign = (amount || 0) < 0 ? '-' : '+';
    return `${sign}${btp.toLocaleString()} BTP`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Transactions</h1>
          <p className="text-sm text-gray-500">Review all wallet transactions</p>
        </div>
        <button onClick={fetchTxns} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]">
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>

          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]">
            {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
              placeholder="Reference or ticket number…"
              className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
            <button onClick={() => { setSearch(searchInput); setPage(1); }} className="bg-[#F5C518] text-gray-900 p-2 rounded">
              <FiSearch className="w-4 h-4" />
            </button>
          </div>

          <span className="text-gray-400 text-sm ml-auto">{total} items</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading transactions…</p>
          </div>
        ) : txns.length === 0 ? <EmptyState message="No transactions found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="text-left px-5 py-3">Reference</th>
                  <th className="text-left py-3">Type</th>
                  <th className="text-left py-3 hidden md:table-cell">User</th>
                  <th className="text-right py-3">Amount</th>
                  <th className="text-left py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-[#1A4D8F] text-sm font-medium">{t.reference || '—'}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{(t.type || '').replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-[#1A4D8F] text-sm">{t.username || t.user_id?.slice(0, 8) || '—'}</span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <span className={`text-sm font-bold ${(t.amount || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatAmount(t.amount)}
                      </span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</span>
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
    </div>
  );
}
