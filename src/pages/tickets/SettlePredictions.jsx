import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiInfo, FiUsers, FiStar, FiAward, FiZap, FiRefreshCw, FiCheck, FiX, FiDatabase } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { marketsApi, drawsApi } from '../../services/api';
import { identifyCorrectOption } from '../../utils/marketOptions';

const TIER_FILTERS = ['All Tiers', 'silver', 'gold', 'platinum'];
const PER_PAGE = 10;

const TIER_META = {
  silver:   { Icon: FiStar,  badge: 'bg-gray-100 text-gray-600 border border-gray-300',      label: 'Silver',   dot: 'bg-gray-400' },
  gold:     { Icon: FiAward, badge: 'bg-yellow-50 text-yellow-700 border border-yellow-300', label: 'Gold',     dot: 'bg-[#F5C518]' },
  platinum: { Icon: FiZap,   badge: 'bg-purple-50 text-purple-700 border border-purple-300', label: 'Platinum', dot: 'bg-purple-500' },
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

function TierPool({ tier, pool, drawResult, isRandomizing, isPublishing, onRandomize, onPublish, isSettled, clientSeed, onClientSeedChange }) {
  const meta = TIER_META[tier];
  if (!meta) return null;
  const result = drawResult?.[tier];

  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${meta.badge}`}>
          <meta.Icon className="w-3 h-3" /> {meta.label} Pool
        </span>
        {pool && (
          <span className="ml-auto text-xs text-gray-400">
            Correct: <strong className="text-[#1A1A2E]">{pool.correct_pool_size || 0}</strong> · Winners: <strong className="text-[#1A1A2E]">{pool.winner_count}</strong>
          </span>
        )}
      </div>

      {pool && pool.entry_fee_points > 0 && (
        <div className="text-xs text-gray-500 mb-3">
          Entry: <strong>{pool.entry_fee_points} BTP</strong>
          {pool.correct_pool_size > 0 && pool.winner_count > 0 && (
            <> · Est. prize each: <strong className="text-green-600">
              {Math.floor((pool.correct_pool_size * pool.entry_fee_points * 0.9) / pool.winner_count)} BTP
            </strong></>
          )}
        </div>
      )}

      {tier === 'platinum' && !isSettled && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 font-medium mb-1 block">Client Seed (required for Platinum)</label>
          <input value={clientSeed || ''} onChange={e => onClientSeedChange(e.target.value)}
            placeholder="User-provided seed for provably fair"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4D8F]" />
        </div>
      )}

      {result ? (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
          <p className="text-xs font-bold text-green-700 mb-1">{result.winners?.length || 0} winner(s) selected</p>
          <div className="space-y-0.5 max-h-24 overflow-y-auto">
            {(result.winners || []).map((w, i) => (
              <p key={i} className="text-xs text-gray-600 font-mono">{w.username || w.ticket_number}</p>
            ))}
          </div>
        </div>
      ) : null}

      {isSettled ? (
        <StatusBadge status="settled" />
      ) : (
        <div className="flex gap-2">
          <button onClick={onRandomize} disabled={isRandomizing}
            className="flex items-center gap-1.5 bg-[#F5C518] text-gray-900 font-semibold rounded-lg px-3 py-2 text-xs hover:brightness-95 disabled:opacity-60">
            {isRandomizing
              ? <><span className="w-3.5 h-3.5 border-2 border-gray-600/30 border-t-gray-700 rounded-full animate-spin" /> Drawing…</>
              : 'Randomize'
            }
          </button>
          <button onClick={onPublish} disabled={isPublishing || !result}
            className="flex items-center gap-1.5 bg-[#1A4D8F] text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[#0D2B5E] disabled:opacity-40">
            {isPublishing ? 'Saving…' : 'Publish'}
          </button>
        </div>
      )}
    </div>
  );
}

function MarketPickSettle({ market, onConfirmCorrect }) {
  const [choice, setChoice] = useState(null);
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">Admin predicted:</p>
        <p className="text-sm font-bold text-[#1A4D8F]">{market.admin_pick || '—'}</p>
      </div>
      <p className="text-sm font-semibold text-[#1A1A2E]">Was admin prediction correct?</p>
      <div className="flex gap-3">
        <button onClick={() => { setChoice('yes'); onConfirmCorrect(market.admin_pick); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
            choice === 'yes' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'
          }`}>
          <FiCheck className="w-4 h-4" /> YES — Correct
        </button>
        <button onClick={() => { setChoice('no'); onConfirmCorrect('NO'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
            choice === 'no' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-300'
          }`}>
          <FiX className="w-4 h-4" /> NO — Wrong
        </button>
      </div>
    </div>
  );
}

function MarketTypeSettle({ market, onCorrectOption }) {
  const [actualResult, setActualResult]     = useState('');
  const [suggestedOption, setSuggestedOption] = useState('');
  const [confirmed, setConfirmed]           = useState(false);

  const identify = () => {
    if (!actualResult.trim()) return;
    const opt = identifyCorrectOption(
      market.market_type, actualResult,
      market.team_home, market.team_away
    );
    if (opt) { setSuggestedOption(opt); }
  };

  const confirm = () => {
    if (!suggestedOption) return;
    setConfirmed(true);
    onCorrectOption(actualResult, suggestedOption);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 font-medium mb-1 block">
          Actual result for {market.market_type}
        </label>
        <div className="flex gap-2">
          <input value={actualResult} onChange={e => { setActualResult(e.target.value); setSuggestedOption(''); setConfirmed(false); }}
            placeholder={market.market_type?.toLowerCase().includes('result') ? 'home / draw / away' : 'e.g. 8'}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F]" />
          <button onClick={identify}
            className="flex items-center gap-1.5 bg-[#F5C518] text-gray-900 font-semibold rounded-lg px-3 py-2 text-sm hover:brightness-95">
            Identify
          </button>
        </div>
      </div>

      {suggestedOption && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border-2 ${confirmed ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
          <FiCheck className={`w-4 h-4 shrink-0 ${confirmed ? 'text-green-500' : 'text-[#1A4D8F]'}`} />
          <div>
            <p className="text-xs text-gray-500">System identifies:</p>
            <p className="text-sm font-black text-[#1A1A2E]">{suggestedOption}</p>
          </div>
          {!confirmed && (
            <button onClick={confirm}
              className="ml-auto px-3 py-1.5 bg-[#1A4D8F] text-white text-xs font-bold rounded-lg hover:bg-[#0D2B5E]">
              Confirm
            </button>
          )}
          {confirmed && <span className="ml-auto text-xs font-bold text-green-600">Confirmed</span>}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <button className="flex items-center gap-2 text-xs text-[#1A4D8F] border border-[#1A4D8F]/30 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors">
        <FiDatabase className="w-3.5 h-3.5" /> Fetch from API-Football
      </button>
    </div>
  );
}

export default function SettlePredictions() {
  const { addToast } = useToast();
  const [markets, setMarkets]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [tierFilter, setTierFilter]   = useState('All Tiers');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);

  // Per-market state
  const [correctOptions, setCorrectOptions] = useState({});  // marketId -> correct_option
  const [actualResults,  setActualResults]  = useState({});  // marketId -> actual_result
  const [clientSeeds,    setClientSeeds]    = useState({});  // marketId+tier -> seed
  const [drawResults,    setDrawResults]    = useState({});  // marketId -> {silver:{}, gold:{}, platinum:{}}
  const [randomizing,    setRandomizing]    = useState(null); // "marketId:tier"
  const [publishing,     setPublishing]     = useState(null);
  const [expanded,       setExpanded]       = useState({});  // marketId -> bool

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PER_PAGE, status: 'open' };
      if (tierFilter !== 'All Tiers') params.tier = tierFilter;
      const res = await marketsApi.list(params);
      const rows = res.data?.markets || [];
      setMarkets(rows);
      setTotal(res.data?.total || 0);
      const initOpts = {};
      rows.forEach(m => { initOpts[m.id] = m.correct_outcome || ''; });
      setCorrectOptions(prev => ({ ...initOpts, ...prev }));
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load markets', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, tierFilter]);

  useEffect(() => { fetchMarkets(); }, [fetchMarkets]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const handleSetCorrect = (marketId, actualResult, correctOption) => {
    setActualResults(prev => ({ ...prev, [marketId]: actualResult }));
    setCorrectOptions(prev => ({ ...prev, [marketId]: correctOption }));
  };

  const handleSettleMarket = async (market) => {
    const correctOption = correctOptions[market.id];
    if (!correctOption) { addToast('Set a correct outcome first', 'error'); return; }
    try {
      await marketsApi.settle(market.id, {
        actual_result:  actualResults[market.id] || correctOption,
        correct_option: correctOption,
      });
      addToast('Market settled — ready to draw per tier', 'success');
      fetchMarkets();
    } catch (err) {
      addToast(err.response?.data?.error || 'Settle failed', 'error');
    }
  };

  const handleRandomize = async (market, tier) => {
    const key = `${market.id}:${tier}`;
    setRandomizing(key);
    try {
      const correctOption = correctOptions[market.id] || market.correct_outcome;
      if (!correctOption) { addToast('Set correct outcome first', 'error'); setRandomizing(null); return; }

      await drawsApi.prepare(market.id);
      const clientSeed = clientSeeds[key] || `admin-${Date.now()}`;
      const res = await drawsApi.run(market.id, clientSeed);

      setDrawResults(prev => ({
        ...prev,
        [market.id]: { ...prev[market.id], [tier]: res.data },
      }));
      addToast(`${tier.charAt(0).toUpperCase() + tier.slice(1)} draw complete — ${res.data?.winners?.length || 0} winner(s)`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Draw failed', 'error');
    } finally {
      setRandomizing(null);
    }
  };

  const handlePublish = async (market, tier) => {
    const key = `${market.id}:${tier}`;
    setPublishing(key);
    try {
      await marketsApi.update(market.id, { status: 'settled' });
      setMarkets(prev => prev.map(m => m.id === market.id ? { ...m, status: 'settled' } : m));
      addToast('Market settled. Winners notified.', 'success');
      fetchMarkets();
    } catch (err) {
      addToast(err.response?.data?.error || 'Publish failed', 'error');
    } finally {
      setPublishing(null);
    }
  };

  const handleRandomizeAll = async (market) => {
    const pools = market.tier_pools || [];
    for (const pool of pools) {
      await handleRandomize(market, pool.tier);
    }
  };

  const handlePublishAll = async (market) => {
    await marketsApi.update(market.id, { status: 'settled' });
    setMarkets(prev => prev.map(m => m.id === market.id ? { ...m, status: 'settled' } : m));
    addToast('All tiers published. Winners notified.', 'success');
    fetchMarkets();
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
            <div className="w-8 h-8 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading markets…</p>
          </div>
        ) : markets.length === 0 ? (
          <EmptyState message="No open markets to settle" />
        ) : (
          <div className="divide-y divide-gray-100">
            {markets.map(m => {
              const isSettled    = m.status === 'settled';
              const predType     = m.prediction_type || 'market_pick';
              const isMarketPick = predType === 'market_pick' || predType === 'api_pick';
              const isApiPick    = predType === 'api_pick';
              const hasCorrect   = !!(correctOptions[m.id] || m.correct_outcome);
              const tierPools    = m.tier_pools || [];
              const marketDrawResults = drawResults[m.id] || {};
              const isOpen       = expanded[m.id] !== false; // expanded by default

              return (
                <div key={m.id} className="p-5">
                  {/* Market header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold text-[#1A1A2E]">
                          {m.team_home} vs {m.team_away}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isApiPick    ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                          isMarketPick ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {isApiPick ? 'API Pick' : isMarketPick ? 'Market Pick' : 'Market Type'}
                        </span>
                        {isSettled && <StatusBadge status="settled" />}
                      </div>
                      <p className="text-xs text-gray-400">{m.market_type} · {tierPools.length} tier{tierPools.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setExpanded(prev => ({ ...prev, [m.id]: !isOpen }))}
                      className="text-xs text-gray-400 hover:text-gray-600 shrink-0">
                      {isOpen ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {isOpen && (
                    <>
                      {/* Correct outcome section */}
                      {!isSettled && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                          {isMarketPick ? (
                            <MarketPickSettle market={m}
                              onConfirmCorrect={(opt) => setCorrectOptions(prev => ({ ...prev, [m.id]: opt }))}
                            />
                          ) : (
                            <MarketTypeSettle market={m}
                              onCorrectOption={(actual, opt) => handleSetCorrect(m.id, actual, opt)}
                            />
                          )}
                          {hasCorrect && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  Correct outcome: <strong className="text-[#1A1A2E]">{correctOptions[m.id] || m.correct_outcome}</strong>
                                </p>
                                {m.status !== 'closed' && (
                                  <button onClick={() => handleSettleMarket(m)}
                                    className="flex items-center gap-1.5 bg-[#1A4D8F] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#0D2B5E]">
                                    <FiCheck className="w-3.5 h-3.5" /> Lock & Settle
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tier pool draws */}
                      {tierPools.length > 0 ? (
                        <div className="space-y-3">
                          {tierPools.map(pool => {
                            const tierKey = `${m.id}:${pool.tier}`;
                            return (
                              <TierPool key={pool.tier}
                                tier={pool.tier}
                                pool={pool}
                                drawResult={marketDrawResults}
                                isRandomizing={randomizing === tierKey}
                                isPublishing={publishing === tierKey}
                                isSettled={isSettled}
                                clientSeed={clientSeeds[tierKey]}
                                onClientSeedChange={v => setClientSeeds(prev => ({ ...prev, [tierKey]: v }))}
                                onRandomize={() => handleRandomize(m, pool.tier)}
                                onPublish={() => handlePublish(m, pool.tier)}
                              />
                            );
                          })}
                          {!isSettled && tierPools.length > 1 && (
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleRandomizeAll(m)}
                                className="flex items-center gap-1.5 border border-[#F5C518] text-gray-800 text-xs font-bold px-3 py-2 rounded-lg hover:bg-yellow-50">
                                Randomize ALL
                              </button>
                              <button onClick={() => handlePublishAll(m)}
                                className="flex items-center gap-1.5 bg-[#1A4D8F] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#0D2B5E]">
                                Publish ALL
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Fallback: legacy single-tier market
                        <div className="border border-gray-100 rounded-xl p-4">
                          <TierBadge tier={m.tier} />
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => handleRandomize(m, m.tier || 'silver')}
                              disabled={!!randomizing || !hasCorrect}
                              className="flex items-center gap-1.5 bg-[#F5C518] text-gray-900 font-semibold rounded-lg px-3 py-2 text-xs hover:brightness-95 disabled:opacity-60">
                              {randomizing === `${m.id}:${m.tier}`
                                ? <><span className="w-3.5 h-3.5 border-2 border-gray-600/30 border-t-gray-700 rounded-full animate-spin" />Drawing…</>
                                : 'Randomize'}
                            </button>
                            <button onClick={() => handlePublish(m, m.tier || 'silver')}
                              disabled={!!publishing || !marketDrawResults[m.tier || 'silver']}
                              className="flex items-center gap-1.5 bg-[#1A4D8F] text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[#0D2B5E] disabled:opacity-40">
                              {publishing === `${m.id}:${m.tier}` ? 'Saving…' : 'Publish'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
