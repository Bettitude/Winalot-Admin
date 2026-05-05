import { useState } from 'react';
import { FiTrash2, FiEye, FiSearch, FiInfo, FiUsers, FiStar, FiAward, FiZap } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { mockSettleRows } from '../../data/adminMockData';

const MARKETS = ['All Markets', 'Corners', 'Total Goals', 'BTTS', 'Total Cards', 'Shots', 'Fouls', 'Penalty', 'Throw Ins'];
const TIER_FILTERS = ['All Tiers', 'silver', 'gold', 'platinum'];
const PER_PAGE = 10;

const TIER_META = {
  silver:   { Icon: FiStar,  badge: 'bg-gray-100 text-gray-600 border border-gray-300',   label: 'Silver' },
  gold:     { Icon: FiAward, badge: 'bg-yellow-50 text-yellow-700 border border-yellow-300', label: 'Gold' },
  platinum: { Icon: FiZap,   badge: 'bg-purple-50 text-purple-700 border border-purple-300', label: 'Platinum' },
};

function TierBadge({ tier }) {
  const meta = TIER_META[tier];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}`}>
      <meta.Icon className="w-2.5 h-2.5" />
      {meta.label}
    </span>
  );
}

export default function SettlePredictions() {
  const { addToast } = useToast();
  const [rows, setRows]                 = useState(mockSettleRows);
  const [market, setMarket]             = useState('All Markets');
  const [tierFilter, setTierFilter]     = useState('All Tiers');
  const [ticketSearch, setTicketSearch] = useState('');
  const [selected, setSelected]         = useState([]);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [randomizing, setRandomizing]   = useState(null);
  const [page, setPage]                 = useState(1);

  const filtered = rows.filter(r => {
    const mkt  = market === 'All Markets' ? true : r.market === market;
    const tier = tierFilter === 'All Tiers' ? true : r.tier === tierFilter;
    const tks  = !ticketSearch || r.winningTickets.some(t => t.includes(ticketSearch));
    return mkt && tier && tks;
  });

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(r => r.id));

  const handleDelete = (ids = selected) => {
    setRows(prev => prev.filter(r => !ids.includes(r.id)));
    setSelected([]);
    addToast(`${ids.length} row${ids.length > 1 ? 's' : ''} deleted`, 'success');
  };

  const handleCorrectChange = (id, val) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, correctPrediction: val } : r));
  };

  const handleRandomize = async (id) => {
    setRandomizing(id);
    await new Promise(r => setTimeout(r, 1500));
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const pool = ['WAL-20240418-00001','WAL-20240418-00002','WAL-20240418-00016','WAL-20240419-00003','WAL-20240420-00005'];
      const shuffled = pool.sort(() => Math.random() - 0.5);
      const winners = shuffled.slice(0, Math.min(r.winners, pool.length));
      return { ...r, winningTickets: winners };
    }));
    setRandomizing(null);
    addToast('Draw complete — winners selected!', 'success');
  };

  const handlePublish = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'published' } : r));
    addToast('Results published. Winners notified.', 'success');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[#1A1A2E]">Prediction Management</h1>
        <p className="text-sm text-gray-500">Settle prediction markets and run draws</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select
            value={market}
            onChange={e => setMarket(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]"
          >
            {MARKETS.map(m => <option key={m}>{m}</option>)}
          </select>

          {/* Tier filter pills */}
          <div className="flex gap-1">
            {TIER_FILTERS.map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors capitalize ${
                  tierFilter === t
                    ? 'bg-[#1A4D8F] text-white'
                    : 'border border-gray-200 text-gray-500 hover:border-[#1A4D8F] hover:text-[#1A4D8F] bg-white'
                }`}
              >
                {t === 'All Tiers' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <input
            value={ticketSearch}
            onChange={e => setTicketSearch(e.target.value)}
            placeholder="Ticket number…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-36 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300"
          />

          {selected.length > 0 && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50"
            >
              <FiTrash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}

          <button className="bg-[#F5C518] text-gray-900 px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5">
            <FiSearch className="w-4 h-4" /> Search
          </button>

          <span className="text-gray-400 text-sm ml-auto">{filtered.length} items</span>
        </div>

        {/* Table */}
        {paginated.length === 0 ? <EmptyState message="No settle rows found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-3">Match</th>
                  <th className="text-left py-3">Market</th>
                  <th className="text-left py-3">Tier</th>
                  <th className="text-left py-3">Winners</th>
                  <th className="text-left py-3">
                    <div className="flex items-center gap-1">
                      Correct Prediction
                      <div className="group relative">
                        <FiInfo className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 top-5 w-56 bg-gray-800 text-white text-xs rounded-lg p-2.5 z-20 hidden group-hover:block leading-relaxed">
                          Select the correct outcome, then Randomize to run the draw. Publish to notify winners.
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-left py-3">Tickets</th>
                  <th className="text-left py-3">Winning Tickets</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => {
                  const isRandomizing = randomizing === r.id;
                  return (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-[#1A4D8F] font-medium text-sm hover:underline cursor-pointer">{r.match}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <button
                            onClick={() => handleDelete([r.id])}
                            className="text-red-500 hover:underline flex items-center gap-1"
                          >
                            <FiTrash2 className="w-3 h-3" /> Trash
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-blue-600 hover:underline flex items-center gap-1">
                            <FiEye className="w-3 h-3" /> View
                          </button>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-[#1A4D8F] text-sm">{r.market}</span>
                      </td>
                      <td className="py-4">
                        <TierBadge tier={r.tier} />
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-bold text-[#1A1A2E]">{r.winners}</span>
                      </td>
                      <td className="py-4">
                        <select
                          value={r.correctPrediction}
                          onChange={e => handleCorrectChange(r.id, e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white"
                        >
                          {r.correctOptions.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <FiUsers className="w-3.5 h-3.5 text-gray-400" />
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {r.tickets}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        {r.winningTickets.length > 0 ? (
                          <div className="space-y-0.5">
                            {r.winningTickets.map(tk => (
                              <p key={tk} className="text-[#1A4D8F] text-xs hover:underline cursor-pointer">{tk}</p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 pr-5">
                        {r.status === 'published' ? (
                          <StatusBadge status="published" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRandomize(r.id)}
                              disabled={isRandomizing}
                              className="flex items-center gap-1.5 bg-[#F5C518] text-gray-900 font-semibold rounded px-3 py-1.5 text-xs hover:brightness-95 disabled:opacity-60 whitespace-nowrap"
                            >
                              {isRandomizing ? (
                                <><span className="w-3.5 h-3.5 border-2 border-gray-600/30 border-t-gray-700 rounded-full spinner" /> Drawing…</>
                              ) : 'Randomize'}
                            </button>
                            <button
                              onClick={() => handlePublish(r.id)}
                              disabled={r.winningTickets.length === 0}
                              className="bg-[#1A4D8F] text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-[#0D2B5E] disabled:opacity-40 whitespace-nowrap"
                            >
                              Publish
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
