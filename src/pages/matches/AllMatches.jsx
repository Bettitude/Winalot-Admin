import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiSearch, FiUsers, FiStar, FiAward, FiZap, FiRefreshCw } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { matchesApi } from '../../services/api';

const TIER_META = {
  silver:   { Icon: FiStar,  cls: 'bg-gray-100 text-gray-600 border border-gray-300',       label: 'Silver' },
  gold:     { Icon: FiAward, cls: 'bg-yellow-50 text-yellow-700 border border-yellow-300',  label: 'Gold' },
  platinum: { Icon: FiZap,   cls: 'bg-purple-50 text-purple-700 border border-purple-300',  label: 'Platinum' },
};

function TierBadge({ tier }) {
  const meta = TIER_META[tier];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${meta.cls}`}>
      <meta.Icon className="w-2.5 h-2.5" />{meta.label}
    </span>
  );
}

const TIER_FILTERS = ['All', 'silver', 'gold', 'platinum'];
const PER_PAGE = 10;

export default function AllMatches() {
  const { addToast } = useToast();
  const [matches, setMatches]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [tierFilter, setTierFilter] = useState('All');
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected]   = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [page, setPage]           = useState(1);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PER_PAGE };
      if (tierFilter !== 'All') params.tier = tierFilter;
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await matchesApi.list(params);
      setMatches(res.data?.matches || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load matches', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, tierFilter, search, statusFilter]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === matches.length ? [] : matches.map(m => m.id));

  const handleDelete = async (ids = deletingIds) => {
    setConfirmOpen(false);
    try {
      await Promise.all(ids.map(id => matchesApi.remove(id)));
      addToast(`${ids.length} match${ids.length > 1 ? 'es' : ''} deleted`, 'success');
      setSelected([]);
      fetchMatches();
    } catch (err) {
      addToast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await matchesApi.update(id, { status });
      setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      addToast('Status updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  const openDeleteConfirm = (ids) => { setDeletingIds(ids); setConfirmOpen(true); };

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Match Management</h1>
          <p className="text-sm text-gray-500">{total} total matches</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchMatches} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <Link to="/admin/matches/new"
            className="flex items-center gap-2 border border-[#1A4D8F] text-[#1A4D8F] rounded px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors">
            <FiPlus className="w-4 h-4" /> Add New Match
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:border-[#1A4D8F]">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="live">Live</option>
            <option value="finished">Finished</option>
          </select>

          <div className="flex gap-1">
            {TIER_FILTERS.map(t => (
              <button key={t} onClick={() => { setTierFilter(t); setPage(1); }}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                  tierFilter === t ? 'bg-[#1A4D8F] text-white' : 'border border-gray-200 text-gray-500 hover:border-[#1A4D8F] hover:text-[#1A4D8F] bg-white'
                }`}>
                {t === 'All' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search matches…"
              className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
            <button onClick={handleSearch} className="bg-[#F5C518] text-gray-900 p-2 rounded">
              <FiSearch className="w-4 h-4" />
            </button>
          </div>

          {selected.length > 0 && (
            <button onClick={() => openDeleteConfirm(selected)}
              className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50">
              <FiTrash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}
          <span className="text-gray-400 text-sm ml-auto">{total} items</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading matches…</p>
          </div>
        ) : matches.length === 0 ? (
          <EmptyState message="No matches found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input type="checkbox" checked={selected.length === matches.length && matches.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 cursor-pointer" />
                  </th>
                  <th className="text-left py-3">Match</th>
                  <th className="text-left py-3 hidden md:table-cell">League</th>
                  <th className="text-left py-3">Tickets</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(m => (
                  <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggleSelect(m.id)}
                        className="rounded border-gray-300 cursor-pointer" />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[#1A4D8F] font-semibold text-sm">{m.team_home} vs {m.team_away}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <Link to={`/admin/matches/edit/${m.id}`} className="text-blue-600 hover:underline flex items-center gap-1"><FiEdit2 className="w-3 h-3" /> Edit</Link>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => openDeleteConfirm([m.id])} className="text-red-500 hover:underline flex items-center gap-1"><FiTrash2 className="w-3 h-3" /> Trash</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-blue-600 hover:underline flex items-center gap-1"><FiEye className="w-3 h-3" /> View</button>
                      </div>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{m.league || '—'}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        <FiUsers className="w-3.5 h-3.5 text-gray-400" />
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {m.total_entries || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={m.status} withChevron onChange={(s) => handleStatusChange(m.id, s)} />
                    </td>
                    <td className="py-4 pr-5 hidden lg:table-cell">
                      <p className="text-xs text-gray-400">{m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => handleDelete(deletingIds)} />
    </div>
  );
}
