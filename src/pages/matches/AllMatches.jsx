import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiSearch, FiUsers, FiStar, FiAward, FiZap } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';

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
      <meta.Icon className="w-2.5 h-2.5" />
      {meta.label}
    </span>
  );
}
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { mockMatches } from '../../data/adminMockData';

const TABS         = ['All', 'Mine', 'Published'];
const TIER_FILTERS = ['All', 'silver', 'gold', 'platinum'];
const MARKETS      = ['All Markets', 'Corners', 'Total Goals', 'BTTS', 'Total Cards', 'Shots', 'Fouls', 'Penalty', 'Throw Ins'];
const PER_PAGE = 10;

export default function AllMatches() {
  const { addToast } = useToast();
  const [matches, setMatches] = useState(mockMatches);
  const [tab, setTab]               = useState('All');
  const [market, setMarket]         = useState('All Markets');
  const [tierFilter, setTierFilter] = useState('All');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage]             = useState(1);

  const filtered = matches.filter(m => {
    const matchesTab    = tab === 'All' ? true : tab === 'Published' ? m.status === 'active' : true;
    const matchesMkt    = market === 'All Markets' ? true : m.market === market;
    const matchesTier   = tierFilter === 'All' ? true : m.tier === tierFilter;
    const matchesSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesMkt && matchesTier && matchesSearch;
  });

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(m => m.id));

  const handleDelete = (ids = selected) => {
    setMatches(prev => prev.filter(m => !ids.includes(m.id)));
    setSelected([]);
    addToast(`${ids.length} match${ids.length > 1 ? 'es' : ''} deleted`, 'success');
  };

  const handleStatusChange = (id, status) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    addToast('Status updated', 'success');
  };

  const tabCounts = {
    All:       matches.length,
    Mine:      matches.filter(m => m.author === 'Williams Idowu').length,
    Published: matches.filter(m => m.status === 'active').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Match Management</h1>
          <p className="text-sm text-gray-500">{matches.length} total matches</p>
        </div>
        <Link to="/admin/matches/new"
          className="flex items-center gap-2 border border-[#1A4D8F] text-[#1A4D8F] rounded px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors">
          <FiPlus className="w-4 h-4" /> Add New Match
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-100 px-5">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(1); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t} <span className="ml-1 text-xs text-gray-400">({tabCounts[t]})</span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={market} onChange={e => setMarket(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:border-[#1A4D8F]">
            {MARKETS.map(m => <option key={m}>{m}</option>)}
          </select>

          <div className="flex gap-1">
            {TIER_FILTERS.map(t => (
              <button key={t}
                onClick={() => { setTierFilter(t); setPage(1); }}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                  tierFilter === t
                    ? 'bg-[#1A4D8F] text-white'
                    : 'border border-gray-200 text-gray-500 hover:border-[#1A4D8F] hover:text-[#1A4D8F] bg-white'
                }`}
              >
                {t === 'All' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search matches…"
              className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
            <button className="bg-[#F5C518] text-gray-900 p-2 rounded">
              <FiSearch className="w-4 h-4" />
            </button>
          </div>

          {selected.length > 0 && (
            <button onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50 transition-colors">
              <FiTrash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}

          <span className="text-gray-400 text-sm ml-auto">{filtered.length} items</span>
        </div>

        {/* Table */}
        {paginated.length === 0 ? (
          <EmptyState message="No matches found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 cursor-pointer" />
                  </th>
                  <th className="text-left py-3">Title</th>
                  <th className="text-left py-3 hidden md:table-cell">Author</th>
                  <th className="text-left py-3">Market</th>
                  <th className="text-left py-3">Tickets</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(m => (
                  <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggleSelect(m.id)}
                        className="rounded border-gray-300 cursor-pointer" />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[#1A4D8F] font-semibold text-sm hover:underline cursor-pointer">{m.title}</p>
                        <TierBadge tier={m.tier} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <Link to={`/admin/matches/edit/${m.id}`} className="text-blue-600 hover:underline flex items-center gap-1"><FiEdit2 className="w-3 h-3" /> Edit</Link>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => handleDelete([m.id])} className="text-red-500 hover:underline flex items-center gap-1"><FiTrash2 className="w-3 h-3" /> Trash</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-blue-600 hover:underline flex items-center gap-1"><FiEye className="w-3 h-3" /> View</button>
                      </div>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-[#1A4D8F] text-sm hover:underline cursor-pointer">{m.author}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-[#1A4D8F] text-sm">{m.market}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        <FiUsers className="w-3.5 h-3.5 text-gray-400" />
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {m.tickets}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={m.status} withChevron onChange={(s) => handleStatusChange(m.id, s)} />
                    </td>
                    <td className="py-4 pr-5 hidden lg:table-cell">
                      <p className="text-xs text-gray-500">Published</p>
                      <p className="text-xs text-gray-400">{m.createdAt}</p>
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
