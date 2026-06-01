import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiTrash2, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { matchesApi, marketsApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';

const STATUS_OPTIONS = ['draft', 'active', 'live', 'finished'];

export default function EditMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [match,      setMatch]      = useState(null);
  const [markets,    setMarkets]    = useState([]);

  // Editable fields
  const [teamHome,   setTeamHome]   = useState('');
  const [teamAway,   setTeamAway]   = useState('');
  const [league,     setLeague]     = useState('');
  const [stadium,    setStadium]    = useState('');
  const [matchDate,  setMatchDate]  = useState('');
  const [status,     setStatus]     = useState('draft');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await matchesApi.get(id);
        const m   = res.data?.match || res.match;
        if (!m) throw new Error('Match not found');
        setMatch(m);
        setTeamHome(m.team_home  || '');
        setTeamAway(m.team_away  || '');
        setLeague(m.league       || '');
        setStadium(m.stadium     || '');
        setStatus(m.status       || 'draft');
        if (m.match_date) {
          setMatchDate(new Date(m.match_date).toISOString().slice(0, 16));
        }
        setMarkets(m.markets || []);
      } catch (err) {
        addToast(err.response?.data?.error || err.message || 'Failed to load match', 'error');
        navigate('/admin/matches');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await matchesApi.update(id, {
        team_home:  teamHome.trim(),
        team_away:  teamAway.trim(),
        league:     league.trim()  || null,
        stadium:    stadium.trim() || null,
        match_date: matchDate      || null,
        status,
      });
      addToast('Match updated', 'success');
      navigate('/admin/matches');
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMarketStatusChange = async (marketId, newStatus) => {
    try {
      await marketsApi.update(marketId, { status: newStatus });
      setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, status: newStatus } : m));
      addToast('Market updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/matches"
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#1A1A2E]">Edit Match</h1>
            <p className="text-sm text-gray-400">{match?.team_home} vs {match?.team_away}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#0D2B5E] disabled:opacity-60 transition-colors">
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : <><FiSave className="w-4 h-4" /> Save Changes</>
          }
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Teams */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-[#1A1A2E]">Teams</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Home Team</label>
                <input value={teamHome} onChange={e => setTeamHome(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Away Team</label>
                <input value={teamAway} onChange={e => setTeamAway(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#1A4D8F]" /> Match Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">League</label>
                <input value={league} onChange={e => setLeague(e.target.value)}
                  placeholder="e.g. Premier League"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Stadium</label>
                <input value={stadium} onChange={e => setStadium(e.target.value)}
                  placeholder="e.g. Old Trafford"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Match Date &amp; Time</label>
              <input type="datetime-local" value={matchDate} onChange={e => setMatchDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
            </div>
          </div>

          {/* Markets */}
          {markets.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#1A1A2E]">Markets ({markets.length})</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {markets.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{m.market_type || m.name}</p>
                      <p className="text-xs text-gray-400">
                        {m.tier} · {m.entry_fee || m.ticket_price} BTP · {m.winner_count} winner{m.winner_count > 1 ? 's' : ''}
                        {m.prediction_type && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            m.prediction_type === 'market_type'
                              ? 'bg-purple-50 text-purple-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {m.prediction_type === 'market_type' ? 'Market Type' : 'Market Pick'}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={m.status} onChange={e => handleMarketStatusChange(m.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1A4D8F] bg-white text-gray-700">
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="settled">Settled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Match Status</h3>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    status === s
                      ? 'bg-[#1A4D8F] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Meta info */}
          {match && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-bold text-[#1A1A2E] mb-3">Info</h3>
              <div className="space-y-2 text-xs text-gray-500">
                {[
                  ['ID',      match.id],
                  ['Created', match.created_at ? new Date(match.created_at).toLocaleDateString() : '—'],
                  ['API ID',  match.api_fixture_id || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span>{k}</span>
                    <span className="font-medium text-gray-700 truncate max-w-[140px] text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#1A4D8F] text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-[#0D2B5E] disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link to="/admin/matches"
            className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 hover:underline py-1">
            Cancel — back to list
          </Link>
        </div>
      </div>
    </div>
  );
}
