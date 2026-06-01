import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSearch, FiUsers, FiRefreshCw, FiGift, FiCheckCircle } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';

const PER_PAGE = 10;

const STATUS_FILTERS = ['All', 'draft', 'open', 'closed', 'settled'];

const STATUS_COLORS = {
  draft:   'bg-gray-100 text-gray-600 border border-gray-300',
  open:    'bg-green-50 text-green-700 border border-green-300',
  closed:  'bg-yellow-50 text-yellow-700 border border-yellow-300',
  settled: 'bg-blue-50 text-blue-700 border border-blue-300',
};

const MOCK_GIVEAWAYS = [
  {
    id: 'g1',
    title: 'Arsenal vs Chelsea — WAL Giveaway',
    prize_type: 'walp',
    prize_walp_each: 500000,
    winner_count: 10,
    status: 'open',
    total_entries: 142,
    correct_pool_size: 37,
    questions_count: 5,
    opens_at: '2026-05-25T10:00:00Z',
    closes_at: '2026-05-28T20:00:00Z',
    created_at: '2026-05-24T09:00:00Z',
  },
  {
    id: 'g2',
    title: 'Man City vs Liverpool — Weekly Quiz',
    prize_type: 'physical',
    prize_description: 'Official Match Ball + Jersey',
    winner_count: 3,
    status: 'closed',
    total_entries: 89,
    correct_pool_size: 21,
    questions_count: 4,
    opens_at: '2026-05-20T08:00:00Z',
    closes_at: '2026-05-26T18:00:00Z',
    created_at: '2026-05-19T12:00:00Z',
  },
  {
    id: 'g3',
    title: 'Real Madrid vs Barcelona — El Clasico Special',
    prize_type: 'walp',
    prize_walp_each: 2000000,
    winner_count: 5,
    status: 'settled',
    total_entries: 310,
    correct_pool_size: 68,
    questions_count: 6,
    opens_at: '2026-05-10T10:00:00Z',
    closes_at: '2026-05-15T22:00:00Z',
    created_at: '2026-05-08T15:00:00Z',
  },
  {
    id: 'g4',
    title: 'Bayern vs Dortmund — Bundesliga Pick',
    prize_type: 'walp',
    prize_walp_each: 300000,
    winner_count: 8,
    status: 'draft',
    total_entries: 0,
    correct_pool_size: 0,
    questions_count: 5,
    opens_at: '2026-06-01T10:00:00Z',
    closes_at: '2026-06-03T20:00:00Z',
    created_at: '2026-05-27T10:00:00Z',
  },
];

function PrizeBadge({ giveaway }) {
  if (giveaway.prize_type === 'walp') {
    return (
      <span className="text-sm font-bold text-[#1A4D8F]">
        {(giveaway.prize_walp_each / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} WALP
        <span className="text-xs text-gray-400 font-normal ml-1">/ winner</span>
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-gray-700">{giveaway.prize_description || 'Physical prize'}</span>
  );
}

export default function AllGiveaways() {
  const { addToast } = useToast();
  const [giveaways, setGiveaways] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [selected, setSelected]         = useState([]);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [deletingIds, setDeletingIds]   = useState([]);

  const fetchGiveaways = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      let rows = [...MOCK_GIVEAWAYS];
      if (statusFilter !== 'All') rows = rows.filter(g => g.status === statusFilter);
      if (search) rows = rows.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));
      setTotal(rows.length);
      const start = (page - 1) * PER_PAGE;
      setGiveaways(rows.slice(start, start + PER_PAGE));
      setLoading(false);
    }, 300);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchGiveaways(); }, [fetchGiveaways]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === giveaways.length ? [] : giveaways.map(g => g.id));

  const handleDelete = () => {
    setConfirmOpen(false);
    addToast(`${deletingIds.length} giveaway${deletingIds.length > 1 ? 's' : ''} deleted`, 'success');
    setSelected([]);
    fetchGiveaways();
  };

  const openDeleteConfirm = (ids) => { setDeletingIds(ids); setConfirmOpen(true); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">All Giveaways</h1>
          <p className="text-sm text-gray-500">{total} total WAL Giveaways</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchGiveaways} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <Link to="/admin/giveaways/new"
            className="flex items-center gap-2 border border-[#1A4D8F] text-[#1A4D8F] rounded px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors">
            <FiPlus className="w-4 h-4" /> Add New Giveaway
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                  statusFilter === s ? 'bg-[#1A4D8F] text-white' : 'border border-gray-200 text-gray-500 hover:border-[#1A4D8F] hover:text-[#1A4D8F] bg-white'
                }`}>
                {s === 'All' ? 'All Status' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
              placeholder="Search giveaways…"
              className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
            <button onClick={() => { setSearch(searchInput); setPage(1); }} className="bg-[#F5C518] text-gray-900 p-2 rounded">
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
            <p className="text-sm text-gray-400">Loading giveaways…</p>
          </div>
        ) : giveaways.length === 0 ? (
          <EmptyState message="No giveaways found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input type="checkbox" checked={selected.length === giveaways.length && giveaways.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 cursor-pointer" />
                  </th>
                  <th className="text-left py-3">Giveaway</th>
                  <th className="text-left py-3">Prize</th>
                  <th className="text-left py-3">Winners</th>
                  <th className="text-left py-3">
                    <div className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> Entries</div>
                  </th>
                  <th className="text-left py-3">Correct Pool</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Closes</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {giveaways.map(g => (
                  <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selected.includes(g.id)} onChange={() => toggleSelect(g.id)}
                        className="rounded border-gray-300 cursor-pointer" />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <FiGift className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
                        <p className="text-[#1A4D8F] font-semibold text-sm">{g.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        {g.questions_count} questions
                        <span className="text-gray-200">|</span>
                        <button onClick={() => openDeleteConfirm([g.id])} className="text-red-500 hover:underline flex items-center gap-1">
                          <FiTrash2 className="w-3 h-3" /> Trash
                        </button>
                      </div>
                    </td>
                    <td className="py-4 pr-4"><PrizeBadge giveaway={g} /></td>
                    <td className="py-4">
                      <span className="text-sm font-bold text-[#1A1A2E]">{g.winner_count}</span>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-red-500 text-white text-[11px] font-bold rounded-full">
                        {g.total_entries}
                      </span>
                    </td>
                    <td className="py-4">
                      {g.correct_pool_size > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <FiCheckCircle className="w-3 h-3" /> {g.correct_pool_size}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_COLORS[g.status]}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="text-xs text-gray-400">
                        {g.closes_at ? new Date(g.closes_at).toLocaleDateString() : '—'}
                      </p>
                    </td>
                    <td className="py-4 pr-5">
                      {g.status === 'closed' ? (
                        <Link to="/admin/giveaways/settle"
                          className="bg-[#F5C518] text-gray-900 font-semibold rounded px-3 py-1.5 text-xs hover:brightness-95 whitespace-nowrap">
                          Settle
                        </Link>
                      ) : g.status === 'settled' ? (
                        <StatusBadge status="settled" />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}
