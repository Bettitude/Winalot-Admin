import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiInfo, FiUsers, FiStar, FiAward, FiZap, FiRefreshCw } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { marketsApi, drawsApi } from '../../services/api';

const TIER_FILTERS = ['All Tiers', 'silver', 'gold', 'platinum'];
const PER_PAGE = 10;

const TIER_META = {
  silver:   { Icon: FiStar,  badge: 'bg-gray-100 text-gray-600 border border-gray-300',      label: 'Silver' },
  gold:     { Icon: FiAward, badge: 'bg-yellow-50 text-yellow-700 border border-yellow-300', label: 'Gold' },
  platinum: { Icon: FiZap,   badge: 'bg-purple-50 text-purple-700 border border-purple-300', label: 'Platinum' },
};

function TierBadge({ tier }) {
  const meta = TIER_META[tier];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}`}>
      <meta.Icon className="w-2.5 h-2.5" />{meta.label}
    </span>
  );
}

export default function SettlePredictions() {
  const { addToast } = useToast();
  const [markets, setMarkets]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  // Per-row state: correct outcome selection + draw actions
  const [correctOutcomes, setCorrectOutcomes] = useState({});
  const [clientSeeds, setClientSeeds]         = useState({});
  const [drawResults, setDrawResults]         = useState({});
  const [randomizing, setRandomizing]         = useState(null);
  const [publishing, setPublishing]           = useState(null);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PER_PAGE, status: 'open' };
      if (tierFilter !== 'All Tiers') params.tier = tierFilter;
      const res = await marketsApi.list(params);
      const rows = res.data?.markets || [];
      setMarkets(rows);
      setTotal(res.data?.total || 0);
      // Seed correct outcome dropdowns from existing data
      const init = {};
      rows.forEach(m => { init[m.id] = m.correct_outcome || ''; });
      setCorrectOutcomes(prev => ({ ...init, ...prev }));
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load markets', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, tierFilter]);

  useEffect(() => { fetchMarkets(); }, [fetchMarkets]);

  const totalPages = Math.ceil(total / PER_PAGE);

  // Save correct outcome to the market before running draw
  const saveCorrectOutcome = async (marketId) => {
    const outcome = correctOutcomes[marketId];
    if (!outcome) { addToast('Set a correct outcome first', 'error'); return false; }
    try {
      await marketsApi.update(marketId, { correct_outcome: outcome });
      return true;
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save outcome', 'error');
      return false;
    }
  };

  const handlePrepareAndRun = async (market) => {
    setRandomizing(market.id);
    try {
      // Save the correct outcome to the market first
      const ok = await saveCorrectOutcome(market.id);
      if (!ok) { setRandomizing(null); return; }

      // Prepare the draw (generates provably-fair server seed for platinum)
      await drawsApi.prepare(market.id);

      // Run the draw
      const clientSeed = clientSeeds[market.id] || `admin-${Date.now()}`;
      const res = await drawsApi.run(market.id, clientSeed);

      setDrawResults(prev => ({ ...prev, [market.id]: res.data }));
      addToast(`Draw complete — ${res.data?.winners?.length || 0} winner(s) selected!`, 'success');
      // Reload to pick up updated market status
      fetchMarkets();
    } catch (err) {
      addToast(err.response?.data?.error || 'Draw failed', 'error');
    } finally {
      setRandomizing(null);
    }
  };

  const handlePublish = async (market) => {
    setPublishing(market.id);
    try {
      await marketsApi.update(market.id, { status: 'settled' });
      setMarkets(prev => prev.map(m => m.id === market.id ? { ...m, status: 'settled' } : m));
      addToast('Market settled. Winners have been notified.', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Publish failed', 'error');
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Settle Predictions</h1>
          <p className="text-sm text-gray-500">Set correct outcomes and run draws for open markets</p>
        </div>
        <button onClick={fetchMarkets} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1">
            {TIER_FILTERS.map(t => (
              <button key={t} onClick={() => { setTierFilter(t); setPage(1); }}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                  tierFilter === t ? 'bg-[#1A4D8F] text-white' : 'border border-gray-200 text-gray-500 hover:border-[#1A4D8F] hover:text-[#1A4D8F] bg-white'
                }`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
              placeholder="Search markets…"
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
            <p className="text-sm text-gray-400">Loading markets…</p>
          </div>
        ) : markets.length === 0 ? <EmptyState message="No open markets to settle" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="text-left px-5 py-3">Market</th>
                  <th className="text-left py-3">Tier</th>
                  <th className="text-left py-3">Winners</th>
                  <th className="text-left py-3">
                    <div className="flex items-center gap-1">
                      Correct Outcome
                      <div className="group relative">
                        <FiInfo className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 top-5 w-56 bg-gray-800 text-white text-xs rounded-lg p-2.5 z-20 hidden group-hover:block leading-relaxed">
                          Set the correct outcome, then Randomize to run the draw. Publish to notify winners.
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-left py-3">
                    <div className="flex items-center gap-1">
                      Client Seed
                      <div className="group relative">
                        <FiInfo className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-xs rounded-lg p-2.5 z-20 hidden group-hover:block">
                          Platinum: users provide this for provably fair verification
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-left py-3">
                    <div className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> Entries</div>
                  </th>
                  <th className="text-left py-3">Winners Selected</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {markets.map(m => {
                  const isRandomizing = randomizing === m.id;
                  const isPublishing  = publishing === m.id;
                  const result        = drawResults[m.id];
                  const isSettled     = m.status === 'settled';

                  return (
                    <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 pr-4">
                        <p className="text-[#1A4D8F] font-medium text-sm">{m.market_type}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Prize pool: {(m.prize_pool || 0).toLocaleString()} BTP</p>
                      </td>
                      <td className="py-4"><TierBadge tier={m.tier} /></td>
                      <td className="py-4">
                        <span className="text-sm font-bold text-[#1A1A2E]">{m.winner_count || 1}</span>
                      </td>
                      <td className="py-4">
                        <input
                          value={correctOutcomes[m.id] || ''}
                          onChange={e => setCorrectOutcomes(prev => ({ ...prev, [m.id]: e.target.value }))}
                          disabled={isSettled}
                          placeholder="e.g. Over 9.5"
                          className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white w-32 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          value={clientSeeds[m.id] || ''}
                          onChange={e => setClientSeeds(prev => ({ ...prev, [m.id]: e.target.value }))}
                          disabled={isSettled || m.tier !== 'platinum'}
                          placeholder={m.tier === 'platinum' ? 'Required' : 'Auto'}
                          className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white w-28 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {m.total_entries || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        {result ? (
                          <div className="space-y-0.5 max-w-[140px]">
                            {result.winners?.slice(0, 3).map(w => (
                              <p key={w.ticket_number} className="text-[#1A4D8F] text-xs truncate">{w.ticket_number}</p>
                            ))}
                            {result.winners?.length > 3 && (
                              <p className="text-xs text-gray-400">+{result.winners.length - 3} more</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 pr-5">
                        {isSettled ? (
                          <StatusBadge status="settled" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handlePrepareAndRun(m)} disabled={isRandomizing || !correctOutcomes[m.id]}
                              className="flex items-center gap-1.5 bg-[#F5C518] text-gray-900 font-semibold rounded px-3 py-1.5 text-xs hover:brightness-95 disabled:opacity-60 whitespace-nowrap">
                              {isRandomizing
                                ? <><span className="w-3.5 h-3.5 border-2 border-gray-600/30 border-t-gray-700 rounded-full spinner" /> Drawing…</>
                                : 'Randomize'}
                            </button>
                            <button onClick={() => handlePublish(m)} disabled={isPublishing || !result}
                              className="bg-[#1A4D8F] text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-[#0D2B5E] disabled:opacity-40 whitespace-nowrap">
                              {isPublishing ? 'Saving…' : 'Publish'}
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
    </div>
  );
}
