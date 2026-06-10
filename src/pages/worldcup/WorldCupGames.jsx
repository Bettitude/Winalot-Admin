import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus, FiRefreshCw, FiZap, FiGift, FiCheckCircle,
  FiClock, FiTrash2, FiEdit2, FiMapPin, FiSave, FiX,
  FiDollarSign, FiUsers,
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-800 text-base">Edit Free Game</h2>
            <p className="text-xs text-gray-400 mt-0.5">{fixtureLabel}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><FiX className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Status */}
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

          {/* Question */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Question</label>
            <input type="text" value={form.question} onChange={e => set('question', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
          </div>

          {/* Options */}
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

          {/* Prize type */}
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

          {/* Winner count */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Number of Winners</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" min="1" max="200" value={form.winner_count} onChange={e => set('winner_count', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
            </div>
          </div>

          {/* Buttons */}
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

// ── Main component ────────────────────────────────────────────────────────────
export default function WorldCupGames() {
  const [fixtures, setFixtures] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [editing,  setEditing]  = useState(null); // { game, fixtureLabel }
  const [deleting, setDeleting] = useState(null); // fixtureId being deleted
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const d = await wcGamesApi.fixtures();
      if (d.success) setFixtures(d.data);
      else setFixtures(MOCK_FIXTURES);
    } catch {
      setFixtures(MOCK_FIXTURES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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

  const filtered = fixtures.filter(f => {
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
            <h1 className="text-xl font-black text-gray-800">World Cup 2026 — Free Games</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage free prediction games for every WC fixture.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/admin/worldcup/new" className="flex items-center gap-2 bg-[#1A4D8F] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0D2B5E] transition-colors">
              <FiPlus className="w-4 h-4" /> Add Free Game
            </Link>
          </div>
        </div>

        {/* Stats */}
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

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-100">
          {[['all','All'],['no-game','No Game'],['open','Open'],['settled','Settled'],['live','Live']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${filter === v ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
          </div>
        ) : (
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
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400">No fixtures match this filter</td></tr>
                )}
                {filtered.map(item => {
                  const { fixture, teams, goals, freeGame } = item;
                  const d        = new Date(fixture.date);
                  const dateStr  = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                  const timeStr  = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) + ' UTC';
                  const finished = isFinished(fixture.status.short);
                  const live     = isLive(fixture.status.short);
                  const label    = `${teams.home.name} vs ${teams.away.name}`;

                  return (
                    <tr key={fixture.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Match */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <img src={teams.home.logo} alt={teams.home.name} className="w-6 h-6 object-contain" onError={e => { e.target.style.display='none'; }} />
                            <span className="font-semibold text-gray-800 text-xs">{teams.home.name}</span>
                          </div>
                          <span className="text-gray-300 font-bold text-xs">
                            {(live || finished) ? `${goals.home ?? 0}–${goals.away ?? 0}` : 'vs'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-800 text-xs">{teams.away.name}</span>
                            <img src={teams.away.logo} alt={teams.away.name} className="w-6 h-6 object-contain" onError={e => { e.target.style.display='none'; }} />
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-xs font-semibold text-gray-700">{dateStr} · {timeStr}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><FiMapPin className="w-3 h-3" />{fixture.venue?.city}</p>
                      </td>

                      {/* Match status */}
                      <td className="px-4 py-3"><StatusChip status={fixture.status.short} /></td>

                      {/* Free game badge */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <GameBadge game={freeGame} />
                          {freeGame && <p className="text-[10px] text-gray-400">{freeGame.entry_count ?? 0} entries</p>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!freeGame ? (
                            <Link
                              to={`/admin/worldcup/new?fixture=${fixture.id}&home=${encodeURIComponent(teams.home.name)}&away=${encodeURIComponent(teams.away.name)}&date=${fixture.date}`}
                              className="flex items-center gap-1 text-[#1A4D8F] text-xs font-semibold hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <FiPlus className="w-3.5 h-3.5" /> Add Game
                            </Link>
                          ) : (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => setEditing({ game: freeGame, label })}
                                className="flex items-center gap-1 text-gray-500 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Edit game"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Settle (only if open/closed) */}
                              {freeGame.status !== 'settled' && (
                                <Link
                                  to={`/admin/worldcup/settle?fixture=${fixture.id}`}
                                  className="flex items-center gap-1 text-purple-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                                >
                                  <FiZap className="w-3.5 h-3.5" /> Settle
                                </Link>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete free game for ${label}? This cannot be undone.`)) {
                                    handleDelete(fixture.id);
                                  }
                                }}
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
        )}
      </div>
    </>
  );
}
