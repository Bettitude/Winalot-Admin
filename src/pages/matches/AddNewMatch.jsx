import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiCalendar, FiStar, FiAward, FiZap } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { matchesApi, marketsApi } from '../../services/api';

const MARKET_TYPES = ['Corners', 'Total Cards', 'Goal Scorers', 'Shots', 'Penalty', 'Scores', 'Throw Ins', 'Fouls'];
const ALL_MARKETS   = ['All Categories', 'Most Used'];

const TIERS = [
  { key: 'silver',   label: 'Silver',   Icon: FiStar,  description: 'Entry 50–200 BTP · 10–50 winners · Simple RNG',       bg: 'bg-gray-50 border-gray-300',     activeBg: 'bg-gray-100 border-gray-500',     badge: 'bg-gray-500 text-white',          suggestedFee: 100, suggestedWinners: 15 },
  { key: 'gold',     label: 'Gold',     Icon: FiAward, description: 'Entry 200–2000 BTP · 3–10 winners · RNG + audit',       bg: 'bg-yellow-50 border-yellow-200', activeBg: 'bg-yellow-100 border-yellow-500', badge: 'bg-[#F5C518] text-[#1A1A2E]',   suggestedFee: 500, suggestedWinners: 5 },
  { key: 'platinum', label: 'Platinum', Icon: FiZap,   description: 'Entry 2000–20000 BTP · 1–3 winners · Provably Fair',  bg: 'bg-purple-50 border-purple-200', activeBg: 'bg-purple-100 border-purple-500', badge: 'bg-purple-600 text-white',        suggestedFee: 2500, suggestedWinners: 2 },
];

export default function AddNewMatch() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [teamHome, setTeamHome]   = useState('');
  const [teamAway, setTeamAway]   = useState('');
  const [league, setLeague]       = useState('');
  const [stadium, setStadium]     = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [markets, setMarkets]     = useState([]);
  const [marketTab, setMarketTab] = useState('All Categories');
  const [tier, setTier]           = useState('silver');
  const [entryFee, setEntryFee]   = useState(100);
  const [winners, setWinners]     = useState(15);
  const [adminPick, setAdminPick] = useState('');
  const [status, setStatus]       = useState('draft');
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  const selectedTier = TIERS.find(t => t.key === tier);

  const handleTierChange = (key) => {
    setTier(key);
    const t = TIERS.find(x => x.key === key);
    setEntryFee(t.suggestedFee);
    setWinners(t.suggestedWinners);
  };

  const toggleMarket = (m) =>
    setMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const validate = () => {
    const e = {};
    if (!teamHome.trim())  e.teamHome  = 'Home team is required';
    if (!teamAway.trim())  e.teamAway  = 'Away team is required';
    if (!matchDate)        e.matchDate = 'Match date is required';
    if (markets.length === 0) e.markets = 'Select at least one market type';
    if (!adminPick.trim()) e.adminPick = 'Admin pick is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (publishStatus) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1. Create the match
      const matchRes = await matchesApi.create({
        team_home:  teamHome.trim(),
        team_away:  teamAway.trim(),
        league:     league.trim() || null,
        stadium:    stadium.trim() || null,
        match_date: matchDate,
        status:     publishStatus,
      });
      const matchId = matchRes.data?.match?.id;
      if (!matchId) throw new Error('Match creation failed');

      // 2. Create a market for each selected market type
      await Promise.all(markets.map(marketType =>
        marketsApi.create({
          match_id:     matchId,
          market_type:  marketType,
          admin_pick:   adminPick.trim(),
          tier,
          entry_fee:    parseInt(entryFee),
          winner_count: parseInt(winners),
        })
      ));

      addToast(`Match ${publishStatus === 'active' ? 'published' : 'saved as draft'} successfully`, 'success');
      navigate('/admin/matches');
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Failed to save match', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[#1A1A2E]">Add New Match</h1>
        <p className="text-sm text-gray-500">Create a new prediction market for users to enter</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Left column ─────────────────────────────────── */}
        <div className="flex-1 space-y-5">

          {/* Teams */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-[#1A1A2E]">Teams</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input value={teamHome} onChange={e => setTeamHome(e.target.value)}
                  placeholder="Home team (e.g. Arsenal)"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${errors.teamHome ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.teamHome && <p className="text-red-500 text-xs mt-1">{errors.teamHome}</p>}
              </div>
              <div>
                <input value={teamAway} onChange={e => setTeamAway(e.target.value)}
                  placeholder="Away team (e.g. Chelsea)"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${errors.teamAway ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.teamAway && <p className="text-red-500 text-xs mt-1">{errors.teamAway}</p>}
              </div>
            </div>
          </div>

          {/* Tier Selection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4">Tier</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIERS.map(t => {
                const active = tier === t.key;
                return (
                  <button key={t.key} type="button" onClick={() => handleTierChange(t.key)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${active ? t.activeBg : t.bg} hover:brightness-95`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black ${t.badge}`}>
                        <t.Icon className="w-3 h-3" />{t.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                    {active && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-[#1A4D8F] rounded-full flex items-center justify-center">
                        <span className="w-2 h-2 bg-white rounded-full" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Markets */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4">Market Types</h3>
            <div className="flex gap-0 border-b border-gray-100 mb-4">
              {ALL_MARKETS.map(t => (
                <button key={t} onClick={() => setMarketTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${marketTab === t ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {t}
                </button>
              ))}
            </div>
            {errors.markets && <p className="text-red-500 text-xs mb-3">{errors.markets}</p>}
            <div className="grid grid-cols-2 gap-2">
              {MARKET_TYPES.map(m => (
                <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={markets.includes(m)} onChange={() => toggleMarket(m)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1A4D8F] cursor-pointer" />
                  <span className="text-sm text-gray-700 group-hover:text-[#1A4D8F] transition-colors">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Admin Pick */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Admin Pick</h3>
            <input value={adminPick} onChange={e => setAdminPick(e.target.value)}
              placeholder="e.g. Over 9.5 Corners"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${errors.adminPick ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.adminPick && <p className="text-red-500 text-xs mt-1">{errors.adminPick}</p>}
          </div>

          {/* Stadium / League */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2"><FiCalendar className="w-4 h-4 text-[#1A4D8F]" /> Match Details</h3>
            <div className="grid grid-cols-2 gap-3">
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
              <label className="text-xs text-gray-500 font-medium mb-1 block">Match Date & Time *</label>
              <input type="datetime-local" value={matchDate} onChange={e => setMatchDate(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.matchDate ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.matchDate && <p className="text-red-500 text-xs mt-1">{errors.matchDate}</p>}
            </div>
          </div>

          {/* Entry Fee + Winners */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4">Entry Fee (BTP) &amp; Winners</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Entry Fee (BTP)</label>
                <input type="number" min="1" value={entryFee} onChange={e => setEntryFee(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
                <p className="text-[10px] text-gray-400 mt-1">{selectedTier?.label} suggested: {selectedTier?.suggestedFee} BTP</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Number of Winners</label>
                <input type="number" min="1" value={winners} onChange={e => setWinners(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
                <p className="text-[10px] text-gray-400 mt-1">{selectedTier?.label} suggested: {selectedTier?.suggestedWinners}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column (Publish panel) ────────────────── */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-6 space-y-4">
            <h3 className="font-bold text-[#1A1A2E]">Publish</h3>

            <div className={`rounded-lg p-3 border-2 ${selectedTier?.activeBg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black ${selectedTier?.badge}`}>
                  {selectedTier && <selectedTier.Icon className="w-3 h-3" />}
                  {selectedTier?.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">{selectedTier?.description}</p>
            </div>

            <button onClick={() => submit('draft')} disabled={submitting}
              className="w-full border border-gray-300 text-gray-700 rounded px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60">
              Save Draft
            </button>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiEdit2 className="w-3.5 h-3.5 text-gray-400" />
                  Status: <span className="font-medium text-[#1A1A2E] capitalize">{status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                Markets: <span className="font-medium text-[#1A1A2E]">{markets.length} selected</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <button onClick={() => submit('active')} disabled={submitting}
                className="w-full bg-[#1A4D8F] text-white font-semibold rounded px-4 py-2.5 text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Saving…</> : 'Publish'}
              </button>
              <button onClick={() => navigate('/admin/matches')}
                className="w-full text-xs text-red-400 hover:text-red-500 hover:underline text-center">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
