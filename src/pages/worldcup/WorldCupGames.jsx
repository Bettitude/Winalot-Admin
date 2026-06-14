import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus, FiRefreshCw, FiZap, FiGift, FiCheckCircle,
  FiClock, FiTrash2, FiEdit2, FiMapPin, FiSave, FiX,
  FiDollarSign, FiUsers, FiWifi, FiAlertCircle, FiDatabase,
  FiChevronDown, FiChevronUp, FiAward, FiList, FiActivity,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { wcGamesApi } from '../../services/api';

const F = cc => `https://flagcdn.com/w80/${cc}.png`;
const MOCK_FIXTURES = [
  { fixture: { id: 1100001, date: '2026-06-11T19:00:00+00:00', status: { short: 'FT' }, venue: { city: 'Mexico City'   } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Mexico',      logo: F('mx')     }, away: { name: 'Poland',      logo: F('pl')     } }, goals: { home: 2, away: 0 }, freeGame: null },
  { fixture: { id: 1100002, date: '2026-06-11T22:00:00+00:00', status: { short: '2H', elapsed: 67 }, venue: { city: 'Los Angeles'   } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'USA',         logo: F('us')     }, away: { name: 'Jamaica',     logo: F('jm')     } }, goals: { home: 1, away: 0 }, freeGame: null },
  { fixture: { id: 1100003, date: '2026-06-12T16:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Guadalajara'   } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Brazil',      logo: F('br')     }, away: { name: 'Venezuela',   logo: F('ve')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100004, date: '2026-06-12T19:00:00+00:00', status: { short: 'NS' }, venue: { city: 'New York'      } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Argentina',   logo: F('ar')     }, away: { name: 'Peru',        logo: F('pe')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100005, date: '2026-06-12T22:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Dallas'        } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'England',     logo: F('gb-eng') }, away: { name: 'Serbia',      logo: F('rs')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100006, date: '2026-06-13T16:00:00+00:00', status: { short: 'NS' }, venue: { city: 'San Francisco' } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'France',      logo: F('fr')     }, away: { name: 'Morocco',     logo: F('ma')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100007, date: '2026-06-13T19:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Kansas City'   } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Spain',       logo: F('es')     }, away: { name: 'Croatia',     logo: F('hr')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100008, date: '2026-06-13T22:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Houston'       } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Germany',     logo: F('de')     }, away: { name: 'Scotland',    logo: F('gb-sct') } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100009, date: '2026-06-14T16:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Vancouver'     } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Portugal',    logo: F('pt')     }, away: { name: 'Czechia',     logo: F('cz')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100010, date: '2026-06-14T19:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Toronto'       } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Netherlands', logo: F('nl')     }, away: { name: 'Senegal',     logo: F('sn')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100011, date: '2026-06-14T22:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Monterrey'     } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Canada',      logo: F('ca')     }, away: { name: 'Colombia',    logo: F('co')     } }, goals: { home: null, away: null }, freeGame: null },
  { fixture: { id: 1100012, date: '2026-06-15T16:00:00+00:00', status: { short: 'NS' }, venue: { city: 'Philadelphia'  } }, league: { round: 'Group Stage - 1' }, teams: { home: { name: 'Belgium',     logo: F('be')     }, away: { name: 'Egypt',       logo: F('eg')     } }, goals: { home: null, away: null }, freeGame: null },
];

function isLive(s)     { return ['1H','HT','2H','ET','BT','P'].includes(s); }
function isFinished(s) { return ['FT','AET','PEN'].includes(s); }

function StatusChip({ status }) {
  if (isLive(status))     return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Live</span>;
  if (isFinished(status)) return <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wider">FT</span>;
  return <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Upcoming</span>;
}

function GameBadge({ game }) {
  if (!game) return <span className="text-[11px] text-gray-400 italic">No free game</span>;
  const colors = { open: 'text-[#F5C518] bg-yellow-50 border-yellow-200', settled: 'text-green-700 bg-green-50 border-green-200', closed: 'text-orange-600 bg-orange-50 border-orange-200', draft: 'text-gray-500 bg-gray-100 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${colors[game.status] || colors.draft}`}>
      <FiGift className="w-3 h-3" />
      {game.prize_type === 'cash' ? `$${game.prize_usd}` : 'Merch'} · {game.winner_count}W · {game.status}
    </span>
  );
}

function SourceBadge({ source }) {
  if (!source) return null;
  if (source === 'api') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      <FiWifi className="w-3 h-3" /> Live API-Football
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <FiDatabase className="w-3 h-3" /> Mock Data
    </span>
  );
}

// ── Edit Game Modal ───────────────────────────────────────────────────────────
function EditGameModal({ game, fixtureLabel, onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    question:          game.question || '',
    prize_type:        game.prize_type || 'cash',
    prize_usd:         game.prize_usd  || '',
    prize_description: game.prize_description || '',
    winner_count:      game.winner_count || 5,
    status:            game.status || 'open',
  });
  const [options, setOptions] = useState(
    Array.isArray(game.options) ? game.options : [{ key: 'a', label: '' }, { key: 'b', label: '' }]
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions(o => [...o, { key: String.fromCharCode(97 + o.length), label: '' }]);
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(o => o.filter((_, idx) => idx !== i).map((opt, idx) => ({ ...opt, key: String.fromCharCode(97 + idx) })));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (options.some(o => !o.label.trim())) { addToast('All option labels are required', 'error'); return; }
    setSaving(true);
    try {
      const body = {
        question:          form.question,
        prize_type:        form.prize_type,
        prize_usd:         form.prize_type === 'cash' ? Number(form.prize_usd) : null,
        prize_description: form.prize_type === 'merch' ? form.prize_description : null,
        winner_count:      Number(form.winner_count),
        status:            form.status,
        options,
      };
      const data = await wcGamesApi.update(game.fixture_id, body);
      addToast('Game updated', 'success');
      onSaved(data.data || { ...game, ...body });
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-800 text-base">Edit Free Game</h2>
            <p className="text-xs text-gray-400 mt-0.5">{fixtureLabel}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><FiX className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Game Status</label>
            <div className="flex gap-2">
              {[['open','Open'],['closed','Closed'],['settled','Settled']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => set('status', v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.status === v ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]' : 'border-gray-200 text-gray-500 hover:border-[#1A4D8F]/40'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Question</label>
            <input type="text" value={form.question} onChange={e => set('question', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500">Options</label>
              {options.length < 6 && (
                <button type="button" onClick={addOption} className="text-xs text-[#1A4D8F] font-semibold flex items-center gap-1 hover:underline">
                  <FiPlus className="w-3 h-3" /> Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={opt.key} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0">{opt.key.toUpperCase()}</span>
                  <input type="text" value={opt.label} onChange={e => setOptions(o => o.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 shrink-0"><FiTrash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Prize Type</label>
            <div className="flex gap-2">
              {[['cash','Cash (Wallet)'],['merch','Merch']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => set('prize_type', v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.prize_type === v ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]' : 'border-gray-200 text-gray-500 hover:border-[#1A4D8F]/40'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {form.prize_type === 'cash' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prize Per Winner (USD)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" min="0.5" step="0.5" value={form.prize_usd} onChange={e => set('prize_usd', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prize Description</label>
              <input type="text" value={form.prize_description} onChange={e => set('prize_description', e.target.value)}
                placeholder="e.g. Official Brazil WC Jersey"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required={form.prize_type === 'merch'} />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Number of Winners</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" min="1" max="200" value={form.winner_count} onChange={e => set('winner_count', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1A4D8F] text-white font-bold py-2.5 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 text-sm">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><FiSave className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── History Card — one finished fixture ───────────────────────────────────────
function HistoryCard({ item, onEdit, onDelete, deleting }) {
  const { fixture, teams, goals, freeGame, league } = item;
  const [expanded,     setExpanded]     = useState(false);
  const [winners,      setWinners]      = useState(null);
  const [loadingWins,  setLoadingWins]  = useState(false);

  const d       = new Date(fixture.date);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) + ' UTC';
  const label   = `${teams.home.name} vs ${teams.away.name}`;

  const toggleExpand = async () => {
    if (!expanded && freeGame && winners === null) {
      setLoadingWins(true);
      try {
        const d = await wcGamesApi.winners(String(fixture.id));
        setWinners(d.data || []);
      } catch {
        setWinners([]);
      } finally {
        setLoadingWins(false);
      }
    }
    setExpanded(e => !e);
  };

  const correctOption = freeGame?.options?.find(o => o.key === freeGame?.correct_option);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Match header */}
      <div className="bg-gradient-to-r from-[#0D2B5E]/95 to-[#1A1A2E]/95 px-5 py-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50">{league?.round || 'Group Stage'}</span>
          <span className="text-[10px] text-white/40">{dateStr} · {timeStr}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <img src={teams.home.logo} alt={teams.home.name} className="w-8 h-8 object-contain" onError={e => { e.target.style.display='none'; }} />
            <span className="font-black text-sm">{teams.home.name}</span>
          </div>
          <div className="text-center shrink-0">
            <span className="text-2xl font-black tabular-nums text-[#F5C518]">
              {goals.home ?? 0} – {goals.away ?? 0}
            </span>
            <p className="text-[10px] text-white/40 font-bold mt-0.5">FT</p>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-black text-sm">{teams.away.name}</span>
            <img src={teams.away.logo} alt={teams.away.name} className="w-8 h-8 object-contain" onError={e => { e.target.style.display='none'; }} />
          </div>
        </div>
        {fixture.venue?.city && (
          <p className="text-[10px] text-white/30 text-center mt-2 flex items-center justify-center gap-1">
            <FiMapPin className="w-3 h-3" />{fixture.venue.city}
          </p>
        )}
      </div>

      {/* Game info */}
      <div className="px-5 py-4">
        {!freeGame ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 italic">No free game was created for this match</span>
            <Link
              to={`/admin/worldcup/new?fixture=${fixture.id}&home=${encodeURIComponent(teams.home.name)}&away=${encodeURIComponent(teams.away.name)}&date=${encodeURIComponent(fixture.date)}`}
              className="flex items-center gap-1 text-[#1A4D8F] text-xs font-semibold hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FiPlus className="w-3.5 h-3.5" /> Add Game
            </Link>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-gray-50 rounded-xl py-2.5">
                <p className="text-lg font-black text-[#1A4D8F]">{freeGame.entry_count ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-medium">Total Entries</p>
              </div>
              <div className="text-center bg-gray-50 rounded-xl py-2.5">
                <p className="text-lg font-black text-green-600">{freeGame.correct_count ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-medium">Correct Picks</p>
              </div>
              <div className="text-center bg-gray-50 rounded-xl py-2.5">
                <p className="text-lg font-black text-purple-600">{freeGame.winner_count ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-medium">Winners</p>
              </div>
            </div>

            {/* Question + answer */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-1">Question</p>
              <p className="text-sm font-semibold text-gray-800">{freeGame.question || '—'}</p>
              {correctOption && (
                <div className="flex items-center gap-1.5 mt-2">
                  <FiCheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="text-xs font-bold text-green-700">Correct: {correctOption.label}</span>
                </div>
              )}
              {!freeGame.correct_option && (
                <p className="text-xs text-amber-600 font-medium mt-1.5">Correct answer not set yet</p>
              )}
            </div>

            {/* Prize */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GameBadge game={freeGame} />
                {freeGame.prize_type === 'cash' && (
                  <span className="text-xs text-gray-400">
                    Total paid: <strong className="text-gray-700">
                      ${((freeGame.prize_usd || 0) * (freeGame.winner_count || 0)).toFixed(2)}
                    </strong>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit({ game: freeGame, label })}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#1A4D8F] hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { if (window.confirm(`Delete free game for ${label}?`)) onDelete(fixture.id); }}
                  disabled={deleting === fixture.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  {deleting === fixture.id
                    ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <FiTrash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Expand / collapse winners */}
            <button
              onClick={toggleExpand}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-[#1A4D8F] py-2 border-t border-gray-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FiAward className="w-3.5 h-3.5" />
                {freeGame.status === 'settled' ? 'View Winners & Entries' : 'View Entries'}
              </span>
              {expanded ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expanded && (
              <div className="pt-3 space-y-3">
                {/* Winners */}
                {freeGame.status === 'settled' && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      <FiAward className="w-3 h-3 text-[#F5C518]" /> Winners
                    </p>
                    {loadingWins ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
                      </div>
                    ) : winners && winners.length > 0 ? (
                      <div className="space-y-1.5">
                        {winners.map((w, i) => (
                          <div key={i} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-[9px] font-black text-green-700">{i + 1}</span>
                              <div>
                                <p className="text-xs font-bold text-gray-800">{w.username}</p>
                                <p className="text-[10px] text-gray-400">{w.email}</p>
                              </div>
                            </div>
                            {w.prize_type === 'cash'
                              ? <span className="text-xs font-black text-green-700">${Number(w.prize_usd || 0).toFixed(2)}</span>
                              : <span className="text-xs font-bold text-purple-600">{w.prize_description || 'Merch'}</span>
                            }
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-2">No winners recorded yet</p>
                    )}
                  </div>
                )}

                {/* All options breakdown */}
                {Array.isArray(freeGame.options) && freeGame.options.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      <FiList className="w-3 h-3" /> Options Breakdown
                    </p>
                    <div className="space-y-1">
                      {freeGame.options.map(opt => {
                        const isCorrect = opt.key === freeGame.correct_option;
                        return (
                          <div key={opt.key} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${isCorrect ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {opt.key.toUpperCase()}
                              </span>
                              <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-gray-600'}`}>{opt.label}</span>
                            </div>
                            {isCorrect && <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WorldCupGames() {
  const [fixtures,    setFixtures]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [mainTab,     setMainTab]     = useState('active');
  const [filter,      setFilter]      = useState('all');
  const [editing,     setEditing]     = useState(null);
  const [deleting,    setDeleting]    = useState(null);
  const [source,      setSource]      = useState(null);
  const [apiError,    setApiError]    = useState(null);
  const [syncing,     setSyncing]     = useState(false);
  const [syncResult,  setSyncResult]  = useState(null);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await wcGamesApi.fixtures();
      if (d.success) {
        setFixtures(d.data);
        setSource(d.source || null);
        setApiError(d.apiError || null);
      } else {
        setFixtures(MOCK_FIXTURES);
        setSource('mock_fallback');
      }
    } catch {
      setFixtures(MOCK_FIXTURES);
      setSource('mock_offline');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const d = await wcGamesApi.sync();
      setSyncResult(d);
      if (d.results > 0) {
        addToast(`API-Football returned ${d.results} WC 2026 fixtures — reloading…`, 'success');
        load();
      } else {
        addToast(d.message || 'API returned 0 fixtures — check plan/key', 'error');
      }
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error || err.message });
      addToast(err.response?.data?.error || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (fixtureId) => {
    setDeleting(fixtureId);
    try {
      await wcGamesApi.remove(String(fixtureId));
      addToast('Free game deleted', 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (updatedGame) => {
    setFixtures(prev => prev.map(item =>
      String(item.fixture.id) === String(updatedGame.fixture_id)
        ? { ...item, freeGame: updatedGame }
        : item
    ));
    setEditing(null);
  };

  // Split fixtures into active (upcoming/live) and history (finished)
  const activeFixtures  = fixtures.filter(f => !isFinished(f.fixture.status.short));
  const historyFixtures = fixtures.filter(f =>  isFinished(f.fixture.status.short));

  const filteredActive = activeFixtures.filter(f => {
    if (filter === 'no-game') return !f.freeGame;
    if (filter === 'live')    return isLive(f.fixture.status.short);
    if (filter === 'open')    return f.freeGame?.status === 'open';
    if (filter === 'settled') return f.freeGame?.status === 'settled';
    return true;
  });

  const stats = {
    total:    fixtures.length,
    withGame: fixtures.filter(f => f.freeGame).length,
    open:     fixtures.filter(f => f.freeGame?.status === 'open').length,
    settled:  fixtures.filter(f => f.freeGame?.status === 'settled').length,
  };

  return (
    <>
      {editing && (
        <EditGameModal
          game={editing.game}
          fixtureLabel={editing.label}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-xl font-black text-gray-800">World Cup 2026 — Free Games</h1>
              <SourceBadge source={source} />
            </div>
            <p className="text-sm text-gray-500">Manage free prediction games for every WC fixture.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Reload">
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Test & sync from API-Football">
              <FiWifi className={`w-4 h-4 ${syncing ? 'animate-pulse text-green-500' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync API'}
            </button>
            <Link to="/admin/worldcup/new" className="flex items-center gap-2 bg-[#1A4D8F] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0D2B5E] transition-colors">
              <FiPlus className="w-4 h-4" /> Add Free Game
            </Link>
          </div>
        </div>

        {/* API warning */}
        {source && source !== 'api' && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <FiAlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-amber-700">
                {source === 'mock_no_key' ? 'No API-Football key — using placeholder fixtures.' : 'Could not reach API-Football — showing placeholder fixtures.'}
              </p>
              {apiError && <p className="text-[11px] text-amber-600 mt-0.5 truncate">Error: {apiError}</p>}
              <p className="text-[11px] text-amber-600 mt-0.5">Click <strong>Sync API</strong> to test the connection.</p>
              {syncResult && (
                <pre className="mt-2 text-[10px] bg-amber-100 rounded p-2 overflow-x-auto whitespace-pre-wrap text-amber-900">
                  {JSON.stringify(syncResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
        {syncResult && source === 'api' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <FiCheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-xs font-semibold text-green-700">{syncResult.message}</p>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Fixtures', value: stats.total,    icon: FiZap,         color: 'text-blue-600' },
            { label: 'With Free Game', value: stats.withGame, icon: FiGift,        color: 'text-yellow-600' },
            { label: 'Open Games',     value: stats.open,     icon: FiClock,       color: 'text-green-600' },
            { label: 'Settled',        value: stats.settled,  icon: FiCheckCircle, color: 'text-gray-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-medium text-gray-500">{label}</span>
              </div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Main tabs: Active / History */}
        <div className="flex gap-1 border-b border-gray-200">
          {[
            { key: 'active',  label: 'Active & Upcoming', icon: FiActivity, count: activeFixtures.length },
            { key: 'history', label: 'History',           icon: FiList,    count: historyFixtures.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setMainTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
                mainTab === key ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${mainTab === key ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
          </div>
        ) : mainTab === 'active' ? (
          <>
            {/* Sub-filters for active tab */}
            <div className="flex gap-2">
              {[['all','All'],['no-game','No Game'],['open','Open'],['settled','Settled'],['live','Live']].map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === v ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Match</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date / Venue</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Free Game</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActive.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400">No fixtures match this filter</td></tr>
                  )}
                  {filteredActive.map(item => {
                    const { fixture, teams, goals, freeGame } = item;
                    const d       = new Date(fixture.date);
                    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) + ' UTC';
                    const live    = isLive(fixture.status.short);
                    const label   = `${teams.home.name} vs ${teams.away.name}`;

                    return (
                      <tr key={fixture.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <img src={teams.home.logo} alt={teams.home.name} className="w-6 h-6 object-contain" onError={e => { e.target.style.display='none'; }} />
                              <span className="font-semibold text-gray-800 text-xs">{teams.home.name}</span>
                            </div>
                            <span className="text-gray-300 font-bold text-xs">
                              {live ? `${goals.home ?? 0}–${goals.away ?? 0}` : 'vs'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-800 text-xs">{teams.away.name}</span>
                              <img src={teams.away.logo} alt={teams.away.name} className="w-6 h-6 object-contain" onError={e => { e.target.style.display='none'; }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-xs font-semibold text-gray-700">{dateStr} · {timeStr}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><FiMapPin className="w-3 h-3" />{fixture.venue?.city}</p>
                        </td>
                        <td className="px-4 py-3"><StatusChip status={fixture.status.short} /></td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <GameBadge game={freeGame} />
                            {freeGame && <p className="text-[10px] text-gray-400">{freeGame.entry_count ?? 0} entries</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!freeGame ? (
                              <Link
                                to={`/admin/worldcup/new?fixture=${fixture.id}&home=${encodeURIComponent(teams.home.name)}&away=${encodeURIComponent(teams.away.name)}&date=${encodeURIComponent(fixture.date)}`}
                                className="flex items-center gap-1 text-[#1A4D8F] text-xs font-semibold hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <FiPlus className="w-3.5 h-3.5" /> Add Game
                              </Link>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditing({ game: freeGame, label })}
                                  className="flex items-center gap-1 text-gray-500 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                  title="Edit game"
                                >
                                  <FiEdit2 className="w-3.5 h-3.5" />
                                </button>
                                {freeGame.status !== 'settled' && (
                                  <Link
                                    to={`/admin/worldcup/settle?fixture=${fixture.id}`}
                                    className="flex items-center gap-1 text-purple-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                                  >
                                    <FiZap className="w-3.5 h-3.5" /> Settle
                                  </Link>
                                )}
                                <button
                                  onClick={() => { if (window.confirm(`Delete free game for ${label}? This cannot be undone.`)) handleDelete(fixture.id); }}
                                  disabled={deleting === fixture.id}
                                  className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                                  title="Delete game"
                                >
                                  {deleting === fixture.id
                                    ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                    : <FiTrash2 className="w-3.5 h-3.5" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* History tab */
          <div>
            {historyFixtures.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <FiList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No finished matches yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {historyFixtures.map(item => (
                  <HistoryCard
                    key={item.fixture.id}
                    item={item}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
