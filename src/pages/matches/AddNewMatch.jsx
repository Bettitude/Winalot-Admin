import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiCalendar, FiStar, FiAward, FiZap, FiSearch, FiGift,
  FiChevronRight, FiChevronLeft, FiCheck, FiEye, FiToggleLeft, FiToggleRight, FiCpu,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { matchesApi, marketsApi, footballSearchApi } from '../../services/api';
import { generateOptions } from '../../utils/marketOptions';

const MARKET_TYPES = [
  'Match Result', 'Corners', 'Total Goals', 'Total Cards', 'Shots',
  'BTTS', 'Goal Scorer', 'Penalty', 'Throw Ins', 'Fouls', 'Custom',
];

const DEFAULT_TIERS = [
  { tier: 'free',     label: 'Free',     Icon: FiGift,  active: false, entry_fee_points: 0,  winner_count: 10, badge: 'bg-green-500 text-white' },
  { tier: 'silver',   label: 'Silver',   Icon: FiStar,  active: true,  entry_fee_points: 1,  winner_count: 5,  badge: 'bg-gray-500 text-white' },
  { tier: 'gold',     label: 'Gold',     Icon: FiAward, active: true,  entry_fee_points: 2,  winner_count: 3,  badge: 'bg-[#F5C518] text-[#1A1A2E]' },
  { tier: 'platinum', label: 'Platinum', Icon: FiZap,   active: false, entry_fee_points: 5,  winner_count: 1,  badge: 'bg-purple-600 text-white' },
];

const STEPS = ['Match', 'Prediction Type', 'Tiers', 'Staking Window', 'Publish'];

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
            i < step  ? 'bg-[#1A4D8F] text-white' :
            i === step ? 'bg-[#F5C518] text-[#1A1A2E]' :
            'bg-gray-100 text-gray-400'
          }`}>
            {i < step ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 rounded-full transition-all ${i < step ? 'bg-[#1A4D8F]' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
      <p className="text-xs text-gray-400 ml-2">{STEPS[step]}</p>
    </div>
  );
}

export default function AddNewMatch() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 0 — Match
  const [fixtureSearch, setFixtureSearch] = useState('');
  const [fixtureResults, setFixtureResults] = useState([]);
  const [fixtureLoading, setFixtureLoading] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const searchRef = useRef(null);
  // Manual entry fallback
  const [teamHome, setTeamHome] = useState('');
  const [teamAway, setTeamAway] = useState('');
  const [league, setLeague]     = useState('');
  const [stadium, setStadium]   = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [useManual, setUseManual] = useState(false);

  // Step 1 — Prediction Type
  const [predictionType, setPredictionType] = useState('market_pick');
  const [marketType, setMarketType]         = useState('');
  const [adminPick, setAdminPick]           = useState('');
  const [apiPickData, setApiPickData]       = useState(null);   // fetched from API-Football
  const [apiPickLoading, setApiPickLoading] = useState(false);

  // Step 2 — Tiers
  const [tiers, setTiers] = useState(DEFAULT_TIERS.map(t => ({ ...t })));

  // Step 3 — Staking Window
  const [stakingOpens,  setStakingOpens]  = useState('');
  const [stakingCloses, setStakingCloses] = useState('');

  const [errors, setErrors] = useState({});

  // API-Football search
  useEffect(() => {
    if (!fixtureSearch.trim() || fixtureSearch.length < 3) { setFixtureResults([]); return; }
    const t = setTimeout(async () => {
      setFixtureLoading(true);
      try {
        const res = await footballSearchApi.searchFixtures(fixtureSearch);
        setFixtureResults(res.data || []);
      } catch {
        setFixtureResults([]);
      } finally {
        setFixtureLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [fixtureSearch]);

  const selectFixture = async (f) => {
    setSelectedFixture(f);
    setTeamHome(f.teams?.home?.name || '');
    setTeamAway(f.teams?.away?.name || '');
    setLeague(f.league?.name || '');
    setStadium(f.fixture?.venue?.name || '');
    if (f.fixture?.date) {
      const d = new Date(f.fixture.date);
      setMatchDate(d.toISOString().slice(0, 16));
    }
    setFixtureSearch('');
    setFixtureResults([]);
    setApiPickData(null);

    // Auto-fetch API prediction for Mode 3 when fixture has an ID
    if (predictionType === 'api_pick' && f.fixture?.id) {
      setApiPickLoading(true);
      try {
        const res = await footballSearchApi.getPredictions(f.fixture.id);
        setApiPickData(res.data || null);
      } catch {
        setApiPickData(null);
      } finally {
        setApiPickLoading(false);
      }
    }
  };

  // Re-fetch prediction when mode switches to api_pick and fixture already selected
  useEffect(() => {
    if (predictionType !== 'api_pick' || !selectedFixture?.fixture?.id) return;
    if (apiPickData) return;
    let cancelled = false;
    setApiPickLoading(true);
    footballSearchApi.getPredictions(selectedFixture.fixture.id)
      .then(res => { if (!cancelled) setApiPickData(res.data || null); })
      .catch(() => { if (!cancelled) setApiPickData(null); })
      .finally(() => { if (!cancelled) setApiPickLoading(false); });
    return () => { cancelled = true; };
  }, [predictionType]);

  const updateTier = (idx, key, val) => {
    setTiers(prev => {
      const updated = prev.map((t, i) => i === idx ? { ...t, [key]: val } : t);
      // Mutual exclusion: Free and paid tiers cannot be active at the same time
      if (key === 'active' && val === true) {
        const toggled = updated[idx];
        if (toggled.tier === 'free') {
          return updated.map(t => t.tier === 'free' ? t : { ...t, active: false });
        } else {
          return updated.map(t => t.tier === 'free' ? { ...t, active: false } : t);
        }
      }
      return updated;
    });
  };

  const homeTeamName = teamHome;
  const awayTeamName = teamAway;

  const previewOptions = marketType
    ? generateOptions(marketType, homeTeamName, awayTeamName)
    : [];

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!teamHome.trim())  e.teamHome  = 'Home team required';
      if (!teamAway.trim())  e.teamAway  = 'Away team required';
      if (!matchDate)        e.matchDate = 'Match date required';
    }
    if (step === 1) {
      if (!marketType) e.marketType = 'Select a market type';
      if (predictionType === 'market_pick' && !adminPick.trim()) e.adminPick = 'Admin pick is required for Market Pick';
      if (predictionType === 'api_pick' && !apiPickData?.pick && !adminPick.trim()) {
        e.adminPick = 'No API prediction available — enter a manual pick or select a fixture with predictions';
      }
    }
    if (step === 2) {
      const anyActive = tiers.some(t => t.active);
      if (!anyActive) e.tiers = 'Enable at least one tier';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 4)); };
  const back = () => setStep(s => Math.max(s - 1, 0));

  const submit = async (publishStatus) => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const matchRes = await matchesApi.create({
        team_home:  teamHome.trim(),
        team_away:  teamAway.trim(),
        league:     league.trim() || null,
        stadium:    stadium.trim() || null,
        match_date: matchDate,
        status:     publishStatus,
        api_fixture_id: selectedFixture?.fixture?.id || null,
        home_logo:  selectedFixture?.teams?.home?.logo || null,
        away_logo:  selectedFixture?.teams?.away?.logo || null,
      });
      const matchId = matchRes.data?.match?.id;
      if (!matchId) throw new Error('Match creation failed');

      const activeTiers = tiers.filter(t => t.active).map(t => ({
        tier:              t.tier,
        entry_fee_points:  parseInt(t.entry_fee_points),
        winner_count:      parseInt(t.winner_count),
      }));

      // For api_pick: use auto-fetched pick, fall back to manual adminPick
      const resolvedPick =
        predictionType === 'market_pick' ? adminPick.trim() :
        predictionType === 'api_pick'    ? (apiPickData?.pick || adminPick.trim() || null) :
        null;

      await marketsApi.create({
        match_id:         matchId,
        market_type:      marketType,
        prediction_type:  predictionType,
        admin_pick:       resolvedPick,
        tiers:            activeTiers,
        staking_opens_at:  stakingOpens  || null,
        staking_closes_at: stakingCloses || null,
      });

      addToast(`Match ${publishStatus === 'active' ? 'published' : 'saved as draft'} successfully`, 'success');
      navigate('/admin/matches');
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Failed to save match', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-black text-[#1A1A2E]">Add New Match</h1>
        <p className="text-sm text-gray-500">Create a prediction market for users to enter</p>
      </div>

      <StepIndicator step={step} total={STEPS.length} />

      {/* ── STEP 0: Match ──────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4">Select Match from API-Football</h3>

            <div className="relative mb-4" ref={searchRef}>
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={fixtureSearch}
                onChange={e => setFixtureSearch(e.target.value)}
                placeholder="Search team name e.g. Arsenal, Barcelona…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300"
              />
              {fixtureLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
              )}
              {fixtureResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                  {fixtureResults.map((f, i) => (
                    <button key={i} onClick={() => selectFixture(f)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors">
                      <p className="text-sm font-semibold text-[#1A1A2E]">
                        {f.teams?.home?.name} vs {f.teams?.away?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {f.league?.name} · {f.fixture?.date ? new Date(f.fixture.date).toLocaleDateString() : '—'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedFixture && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2.5">
                <FiCheck className="w-4 h-4 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-700">
                    {selectedFixture.teams?.home?.name} vs {selectedFixture.teams?.away?.name}
                  </p>
                  <p className="text-xs text-green-600">{selectedFixture.league?.name}</p>
                </div>
                <button onClick={() => { setSelectedFixture(null); setTeamHome(''); setTeamAway(''); setLeague(''); setMatchDate(''); }}
                  className="ml-auto text-xs text-green-600 hover:underline">Clear</button>
              </div>
            )}

            <button onClick={() => setUseManual(v => !v)}
              className="text-xs text-[#1A4D8F] hover:underline mb-3 block">
              {useManual ? 'Hide manual entry' : 'Enter match manually instead'}
            </button>
          </div>

          {(useManual || !selectedFixture) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-[#1A1A2E]">Match Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Home Team *</label>
                  <input value={teamHome} onChange={e => setTeamHome(e.target.value)}
                    placeholder="e.g. Arsenal"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.teamHome ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.teamHome && <p className="text-red-500 text-xs mt-1">{errors.teamHome}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Away Team *</label>
                  <input value={teamAway} onChange={e => setTeamAway(e.target.value)}
                    placeholder="e.g. Chelsea"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.teamAway ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.teamAway && <p className="text-red-500 text-xs mt-1">{errors.teamAway}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">League</label>
                  <input value={league} onChange={e => setLeague(e.target.value)} placeholder="e.g. Premier League"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Stadium</label>
                  <input value={stadium} onChange={e => setStadium(e.target.value)} placeholder="e.g. Old Trafford"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Match Date &amp; Time *</label>
                <input type="datetime-local" value={matchDate} onChange={e => setMatchDate(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.matchDate ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.matchDate && <p className="text-red-500 text-xs mt-1">{errors.matchDate}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1: Prediction Type ──────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                key: 'market_pick',
                title: 'Mode 1 — Market Pick',
                desc: 'I define the prediction. User picks YES or NO.',
                detail: 'Analyst manually sets a specific prediction. Users agree or disagree.',
              },
              {
                key: 'market_type',
                title: 'Mode 2 — Market Type',
                desc: 'System shows standard betting options. User picks one.',
                detail: 'System auto-generates all standard outcomes from the selected market category.',
              },
              {
                key: 'api_pick',
                title: 'Mode 3 — API Pick',
                desc: 'API-Football provides the pick automatically. User votes YES or NO.',
                detail: 'Fastest to set up — the prediction is pulled from the API once you select a fixture.',
              },
            ].map(opt => (
              <button key={opt.key} type="button" onClick={() => { setPredictionType(opt.key); setApiPickData(null); }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  predictionType === opt.key
                    ? 'border-[#1A4D8F] bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    predictionType === opt.key ? 'border-[#1A4D8F]' : 'border-gray-300'
                  }`}>
                    {predictionType === opt.key && <div className="w-2 h-2 rounded-full bg-[#1A4D8F]" />}
                  </div>
                  <p className="font-black text-xs text-[#1A1A2E] leading-tight">{opt.title}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-1.5">{opt.desc}</p>
                <p className="text-[11px] text-gray-400 leading-snug">{opt.detail}</p>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Market Category</h3>
            {errors.marketType && <p className="text-red-500 text-xs mb-2">{errors.marketType}</p>}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MARKET_TYPES.map(m => (
                <button key={m} type="button" onClick={() => setMarketType(m)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-center transition-all border ${
                    marketType === m
                      ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {(predictionType === 'market_pick') && marketType && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-bold text-[#1A1A2E] mb-2">Admin Prediction</h3>
              <input value={adminPick} onChange={e => setAdminPick(e.target.value)}
                placeholder="e.g. Over 9.5 Corners"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.adminPick ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.adminPick && <p className="text-red-500 text-xs mt-1">{errors.adminPick}</p>}
              {adminPick && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-gray-400 mb-1">Preview — user will see:</p>
                  <div className="flex gap-2">
                    <div className="flex-1 py-2 bg-white border-2 border-gray-200 rounded-lg text-xs font-black text-center text-gray-600">YES</div>
                    <div className="flex-1 py-2 bg-white border-2 border-gray-200 rounded-lg text-xs font-black text-center text-gray-600">NO</div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">Agree or disagree: <strong>{adminPick}</strong></p>
                </div>
              )}
            </div>
          )}

          {predictionType === 'api_pick' && marketType && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiCpu className="w-4 h-4 text-[#1A4D8F]" />
                <h3 className="font-bold text-[#1A1A2E]">API-Football Prediction</h3>
              </div>

              {apiPickLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="w-4 h-4 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin shrink-0" />
                  Fetching API prediction…
                </div>
              )}

              {!apiPickLoading && apiPickData?.pick && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
                  <p className="text-[10px] text-gray-400 mb-1">API pick (auto-fetched)</p>
                  <p className="text-sm font-bold text-[#1A1A2E]">{apiPickData.pick}</p>
                  {apiPickData.percent && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      API confidence — Home: {apiPickData.percent.home} · Draw: {apiPickData.percent.draw} · Away: {apiPickData.percent.away}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-black text-center text-gray-600">YES</div>
                    <div className="flex-1 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-black text-center text-gray-600">NO</div>
                  </div>
                </div>
              )}

              {!apiPickLoading && !apiPickData?.pick && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  {selectedFixture
                    ? 'No prediction available from API for this fixture.'
                    : 'Select a fixture from API-Football (Step 1) to auto-fetch the prediction.'}
                </p>
              )}

              <p className="text-[11px] text-gray-400 mb-2">Override — manual pick (optional)</p>
              <input value={adminPick} onChange={e => setAdminPick(e.target.value)}
                placeholder="Leave blank to use API pick above"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.adminPick ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.adminPick && <p className="text-red-500 text-xs mt-1">{errors.adminPick}</p>}
            </div>
          )}

          {predictionType === 'market_type' && marketType && previewOptions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiEye className="w-4 h-4 text-[#1A4D8F]" />
                <h3 className="font-bold text-[#1A1A2E]">Preview — user will see</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewOptions.map(o => (
                  <span key={o.value} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">
                    {o.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Tiers ────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-[#1A1A2E]">Tier Settings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Configure entry fee and winner count per tier. Prize pool auto-calculates as entries come in.</p>
            <p className="text-[11px] text-amber-600 mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              Free tier is mutually exclusive with Silver / Gold / Platinum — enabling one group disables the other.
            </p>
          </div>
          {errors.tiers && <p className="text-red-500 text-xs px-5 pt-3">{errors.tiers}</p>}
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-semibold">
                <th className="text-left px-5 py-3">Tier</th>
                <th className="text-left py-3">Active</th>
                <th className="text-left py-3">Entry (BTP)</th>
                <th className="text-left py-3">Winners</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t, i) => (
                <tr key={t.tier} className={`border-t border-gray-100 ${!t.active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${t.badge}`}>
                      <t.Icon className="w-3 h-3" />{t.label}
                    </span>
                  </td>
                  <td className="py-4">
                    <button type="button" onClick={() => updateTier(i, 'active', !t.active)}
                      className={`w-10 h-5 rounded-full transition-all relative ${t.active ? 'bg-[#1A4D8F]' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${t.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="py-4">
                    {t.tier === 'free'
                      ? <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 inline-block">0 (Free)</span>
                      : <input type="number" min="1" value={t.entry_fee_points}
                          onChange={e => updateTier(i, 'entry_fee_points', e.target.value)}
                          disabled={!t.active}
                          className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1A4D8F] disabled:bg-gray-50 disabled:text-gray-400" />
                    }
                  </td>
                  <td className="py-4">
                    <input type="number" min="1" value={t.winner_count}
                      onChange={e => updateTier(i, 'winner_count', e.target.value)}
                      disabled={!t.active}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1A4D8F] disabled:bg-gray-50 disabled:text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── STEP 3: Staking Window ───────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-[#1A1A2E]">Staking Window</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Staking Opens</label>
              <input type="datetime-local" value={stakingOpens} onChange={e => setStakingOpens(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Staking Closes</label>
              <input type="datetime-local" value={stakingCloses} onChange={e => setStakingCloses(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Quick options</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: '5 mins before kickoff', mins: -5 },
                { label: '30 mins before kickoff', mins: -30 },
                { label: '1 hr before kickoff', mins: -60 },
              ].map(opt => (
                <button key={opt.label} type="button"
                  onClick={() => {
                    if (!matchDate) return addToast('Set match date first', 'error');
                    const kick = new Date(matchDate).getTime();
                    const close = new Date(kick + opt.mins * 60000).toISOString().slice(0, 16);
                    setStakingCloses(close);
                  }}
                  className="px-3 py-1.5 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:border-[#1A4D8F] hover:text-[#1A4D8F] transition-colors">
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Publish ─────────────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-[#1A1A2E]">Review &amp; Publish</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Match',       teamHome && teamAway ? `${teamHome} vs ${teamAway}` : '—'],
              ['League',      league || '—'],
              ['Date',        matchDate ? new Date(matchDate).toLocaleString() : '—'],
              ['Market',      marketType || '—'],
              ['Type',        predictionType === 'market_pick' ? 'Mode 1 — Market Pick' : predictionType === 'api_pick' ? 'Mode 3 — API Pick' : 'Mode 2 — Market Type'],
              ['Admin Pick',  predictionType === 'market_type' ? 'Auto-generated' : predictionType === 'api_pick' ? (apiPickData?.pick || adminPick || '(fetched on save)') : (adminPick || '—')],
              ['Active Tiers', tiers.filter(t => t.active).map(t => `${t.label} (${t.entry_fee_points} BTP)`).join(', ') || '—'],
              ['Staking Opens',  stakingOpens  ? new Date(stakingOpens).toLocaleString()  : 'Immediately'],
              ['Staking Closes', stakingCloses ? new Date(stakingCloses).toLocaleString() : '5 mins before kickoff'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-500 text-xs w-28 shrink-0">{k}</span>
                <span className="text-xs font-medium text-[#1A1A2E] text-right">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => submit('draft')} disabled={submitting}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60">
              {submitting ? 'Saving…' : 'Save Draft'}
            </button>
            <button onClick={() => submit('active')} disabled={submitting}
              className="flex-1 bg-[#1A4D8F] text-white font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-[#0D2B5E] disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : 'Publish Now'
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={step === 0 ? () => navigate('/admin/matches') : back}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <FiChevronLeft className="w-4 h-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < 4 && (
          <button onClick={next}
            className="flex items-center gap-2 bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#0D2B5E] transition-colors">
            Next <FiChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
