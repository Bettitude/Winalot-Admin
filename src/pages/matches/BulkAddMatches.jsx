import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiPlus, FiX, FiCheck, FiZap, FiStar, FiAward,
  FiChevronRight, FiCpu, FiGrid, FiAlertCircle,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { marketsApi, footballSearchApi } from '../../services/api';
import { generateOptions } from '../../utils/marketOptions';

const MARKET_TYPES = [
  'Match Result', 'Corners', 'Total Goals', 'Total Cards', 'Yellow Cards',
  'Red Cards', 'Shots', 'Offsides', 'BTTS', 'Penalty', 'Throw Ins', 'Fouls',
];

// Entry-fee bounds per tier, in BTP (1 BTP = $1 USD)
const TIER_PRICE_RANGE = {
  silver:   { min: 0.10, max: 49  },
  gold:     { min: 49,   max: 249 },
  platinum: { min: 250,  max: 499 },
};

const DEFAULT_TIERS = [
  { tier: 'silver',   label: 'Silver',   Icon: FiStar,  badge: 'bg-gray-500 text-white',           active: true,  entry_fee_points: 1,   winner_count: 5, min_entries: '', max_entries: '' },
  { tier: 'gold',     label: 'Gold',     Icon: FiAward, badge: 'bg-[#F5C518] text-[#1A1A2E]',      active: false, entry_fee_points: 49,  winner_count: 3, min_entries: '', max_entries: '' },
  { tier: 'platinum', label: 'Platinum', Icon: FiZap,   badge: 'bg-purple-600 text-white',          active: false, entry_fee_points: 250, winner_count: 1, min_entries: '', max_entries: '' },
];

const MODE_OPTIONS = [
  {
    key: 'market_type',
    title: 'Mode 2 — Market Type',
    desc: 'System auto-generates all standard outcome options. No manual pick needed.',
    Icon: FiGrid,
  },
  {
    key: 'api_pick',
    title: 'Mode 3 — API Pick',
    desc: 'API-Football suggests the prediction automatically. Users vote YES or NO.',
    Icon: FiCpu,
  },
];

export default function BulkAddMatches() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [query, setQuery]                 = useState('');
  const [results, setResults]             = useState([]);
  const [searching, setSearching]         = useState(false);
  const [selected, setSelected]           = useState([]);   // [{fixture, displayDate}]
  const [predictionType, setPredictionType] = useState('market_type');
  const [marketType, setMarketType]       = useState('Match Result');
  const [tiers, setTiers]                 = useState(DEFAULT_TIERS.map(t => ({ ...t })));
  const [stakingCloses, setStakingCloses] = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.length < 3) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await footballSearchApi.searchFixtures(query);
        setResults(res.data || []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const toggleFixture = (f) => {
    const id = f.fixture?.id;
    if (!id) return;
    setSelected(prev =>
      prev.some(s => s.fixture?.fixture?.id === id)
        ? prev.filter(s => s.fixture?.fixture?.id !== id)
        : [...prev, { fixture: f }]
    );
  };

  const removeSelected = (id) =>
    setSelected(prev => prev.filter(s => s.fixture?.fixture?.id !== id));

  const updateTier = (idx, key, val) => {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [key]: val } : t));
  };

  const activeTiers = tiers.filter(t => t.active).map(t => ({
    tier: t.tier,
    entry_fee_points: parseFloat(t.entry_fee_points),
    winner_count: parseInt(t.winner_count),
    min_entries: t.min_entries !== '' ? parseInt(t.min_entries) : null,
    max_entries: t.max_entries !== '' ? parseInt(t.max_entries) : null,
  }));

  const previewOptions = generateOptions(marketType, 'Home', 'Away');

  const handleSubmit = async () => {
    if (!selected.length) return addToast('Select at least one fixture', 'error');
    if (!activeTiers.length) return addToast('Enable at least one tier', 'error');

    setSubmitting(true);
    try {
      const fixtures = selected.map(s => ({
        fixture_id:  s.fixture?.fixture?.id,
        team_home:   s.fixture?.teams?.home?.name,
        team_away:   s.fixture?.teams?.away?.name,
        league:      s.fixture?.league?.name,
        match_date:  s.fixture?.fixture?.date,
        home_logo:   s.fixture?.teams?.home?.logo,
        away_logo:   s.fixture?.teams?.away?.logo,
      }));

      const res = await marketsApi.bulkCreate({
        fixtures,
        market_type:      marketType,
        prediction_type:  predictionType,
        tiers:            activeTiers,
        staking_closes_at: stakingCloses || null,
      });

      const { created = 0, skipped = 0, errors = [] } = res.data || {};
      addToast(
        `${created} match${created !== 1 ? 'es' : ''} published` +
        (skipped ? `, ${skipped} skipped` : '') +
        (errors.length ? ` (${errors.length} error${errors.length > 1 ? 's' : ''})` : ''),
        errors.length ? 'warning' : 'success'
      );
      navigate('/admin/matches');
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Bulk create failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Bulk Add Matches</h1>
          <p className="text-sm text-gray-500">Search and select multiple fixtures — publish them all in one click</p>
        </div>
        <button onClick={() => navigate('/admin/matches')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <FiX className="w-4 h-4" /> Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT: search + fixture list */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Search Fixtures</h3>
            <div className="relative" ref={searchRef}>
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type team name — e.g. Arsenal, Real Madrid…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                {results.map((f, i) => {
                  const id = f.fixture?.id;
                  const isChosen = selected.some(s => s.fixture?.fixture?.id === id);
                  return (
                    <button key={i} onClick={() => toggleFixture(f)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${
                        isChosen ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isChosen ? 'border-[#1A4D8F] bg-[#1A4D8F]' : 'border-gray-300'
                      }`}>
                        {isChosen && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                          {f.teams?.home?.name} vs {f.teams?.away?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {f.league?.name} · {f.fixture?.date ? new Date(f.fixture.date).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <FiPlus className={`w-4 h-4 shrink-0 transition-transform ${isChosen ? 'rotate-45 text-red-400' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected fixtures */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#1A1A2E]">Selected Fixtures</h3>
              {selected.length > 0 && (
                <span className="text-xs bg-[#1A4D8F] text-white px-2 py-0.5 rounded-full font-bold">
                  {selected.length}
                </span>
              )}
            </div>
            {selected.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No fixtures selected yet</p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {selected.map(s => {
                  const f  = s.fixture;
                  const id = f?.fixture?.id;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1A2E] truncate">
                          {f?.teams?.home?.name} vs {f?.teams?.away?.name}
                        </p>
                        <p className="text-[10px] text-gray-400">{f?.league?.name}</p>
                      </div>
                      <button onClick={() => removeSelected(id)}
                        className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 hover:bg-red-200 transition-colors">
                        <FiX className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: mode + market + tiers */}
        <div className="space-y-4">
          {/* Mode selection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Prediction Mode</h3>
            <div className="space-y-2">
              {MODE_OPTIONS.map(opt => (
                <button key={opt.key} type="button"
                  onClick={() => setPredictionType(opt.key)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                    predictionType === opt.key
                      ? 'border-[#1A4D8F] bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    predictionType === opt.key ? 'border-[#1A4D8F]' : 'border-gray-300'
                  }`}>
                    {predictionType === opt.key && <div className="w-2 h-2 rounded-full bg-[#1A4D8F]" />}
                  </div>
                  <div>
                    <p className="font-black text-xs text-[#1A1A2E]">{opt.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {predictionType === 'api_pick' && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <FiAlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700">
                  Mode 3 fetches one API prediction per fixture. Fixtures without API predictions will still be created but with no pick set.
                </p>
              </div>
            )}
          </div>

          {/* Market category */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Market Category</h3>
            <div className="grid grid-cols-3 gap-2">
              {MARKET_TYPES.map(m => (
                <button key={m} type="button" onClick={() => setMarketType(m)}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold text-center transition-all border ${
                    marketType === m
                      ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                  }`}>
                  {m}
                </button>
              ))}
            </div>

            {predictionType === 'market_type' && marketType && previewOptions.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-gray-400 mb-1.5">Users will pick from:</p>
                <div className="flex flex-wrap gap-1.5">
                  {previewOptions.map(o => (
                    <span key={o.value} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-semibold text-gray-600">
                      {o.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tiers */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-1">Tiers</h3>
            <p className="text-xs text-gray-400 mb-3">Applied to all selected fixtures</p>
            <div className="space-y-2">
              {tiers.map((t, i) => (
                <div key={t.tier} className={`flex items-center gap-3 p-3 rounded-lg border ${t.active ? 'border-gray-200 bg-gray-50' : 'border-gray-100 opacity-50'}`}>
                  <button type="button" onClick={() => updateTier(i, 'active', !t.active)}
                    className={`w-8 h-4 rounded-full transition-all relative shrink-0 ${t.active ? 'bg-[#1A4D8F]' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${t.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${t.badge}`}>
                    <t.Icon className="w-2.5 h-2.5" />{t.label}
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                    <input type="number" min={TIER_PRICE_RANGE[t.tier]?.min} max={TIER_PRICE_RANGE[t.tier]?.max} step="0.01" value={t.entry_fee_points}
                      onChange={e => updateTier(i, 'entry_fee_points', e.target.value)}
                      disabled={!t.active}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1A4D8F] disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="Entry" />
                    <span className="text-[10px] text-gray-400">pts</span>
                    <input type="number" min="1" value={t.winner_count}
                      onChange={e => updateTier(i, 'winner_count', e.target.value)}
                      disabled={!t.active}
                      className="w-14 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1A4D8F] disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="Winners" />
                    <span className="text-[10px] text-gray-400">winners</span>
                    <input type="number" min="0" value={t.min_entries}
                      onChange={e => updateTier(i, 'min_entries', e.target.value)}
                      disabled={!t.active}
                      className="w-14 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1A4D8F] disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="Min" />
                    <span className="text-[10px] text-gray-400">min</span>
                    <input type="number" min="1" value={t.max_entries}
                      onChange={e => updateTier(i, 'max_entries', e.target.value)}
                      disabled={!t.active}
                      className="w-14 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1A4D8F] disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="Max" />
                    <span className="text-[10px] text-gray-400">max</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staking window */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Staking Closes</h3>
            <input type="datetime-local" value={stakingCloses} onChange={e => setStakingCloses(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
            <p className="text-[10px] text-gray-400 mt-1.5">Leave blank to default to 5 mins before kickoff (per fixture)</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !selected.length || !activeTiers.length}
            className={`w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${
              submitting || !selected.length || !activeTiers.length
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#F5C518] hover:brightness-105 text-[#1A1A2E]'
            }`}>
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-[#1A1A2E]/20 border-t-[#1A1A2E] rounded-full animate-spin" /> Publishing…</>
            ) : (
              <><FiChevronRight className="w-4 h-4" /> Publish {selected.length > 0 ? `${selected.length} Match${selected.length > 1 ? 'es' : ''}` : 'Matches'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
