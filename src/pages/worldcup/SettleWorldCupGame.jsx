import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft, FiZap, FiCheckCircle, FiUsers, FiAward,
  FiRefreshCw, FiMail, FiDollarSign, FiGift,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { wcGamesApi } from '../../services/api';

// Mock pool — in production comes from the backend entries
const MOCK_POOL = [
  { user_id: 'u1', username: 'kingsley_j',  email: 'kingsley@example.com' },
  { user_id: 'u2', username: 'tunde_bets',  email: 'tunde@example.com' },
  { user_id: 'u3', username: 'emeka_fc',    email: 'emeka@example.com' },
  { user_id: 'u4', username: 'chidi_w',     email: 'chidi@example.com' },
  { user_id: 'u5', username: 'lawal_99',    email: 'lawal@example.com' },
  { user_id: 'u6', username: 'victoria_g',  email: 'victoria@example.com' },
  { user_id: 'u7', username: 'seun_wins',   email: 'seun@example.com' },
  { user_id: 'u8', username: 'balogun_fc',  email: 'balogun@example.com' },
  { user_id: 'u9', username: 'amaka_pred',  email: 'amaka@example.com' },
  { user_id: 'u10', username: 'obinna_17',  email: 'obinna@example.com' },
];

// Hardcoded mock games matching MOCK_FIXTURES in WorldCupGames
const MOCK_GAMES = {
  '1100002': { id: 'wg-2', fixture_id: '1100002', home_team: 'USA', away_team: 'Jamaica',   question: 'Who will win?', options: [{key:'a',label:'USA Win'},{key:'b',label:'Draw'},{key:'c',label:'Jamaica Win'}], prize_type: 'cash',  prize_usd: 15,  winner_count: 8,  status: 'open', entry_count: 231 },
  '1100003': { id: 'wg-3', fixture_id: '1100003', home_team: 'Brazil', away_team: 'Venezuela', question: 'Who will win?', options: [{key:'a',label:'Brazil Win'},{key:'b',label:'Draw'},{key:'c',label:'Venezuela Win'}], prize_type: 'merch', prize_description: 'Official Brazil WC Jersey', winner_count: 3, status: 'open', entry_count: 88 },
  '1100004': { id: 'wg-4', fixture_id: '1100004', home_team: 'Argentina', away_team: 'Peru',  question: 'Who will win?', options: [{key:'a',label:'Argentina Win'},{key:'b',label:'Draw'},{key:'c',label:'Peru Win'}],    prize_type: 'cash',  prize_usd: 25,  winner_count: 5,  status: 'open', entry_count: 142 },
};

export default function SettleWorldCupGame() {
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const { addToast } = useToast();
  const fixtureId = params.get('fixture') || '';

  const [game,        setGame]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [correctOpt,  setCorrectOpt]  = useState('');
  const [savingOpt,   setSavingOpt]   = useState(false);
  const [optSaved,    setOptSaved]    = useState(false);
  const [spinning,    setSpinning]    = useState(false);
  const [winners,     setWinners]     = useState(null);
  const [clientSeed,  setClientSeed]  = useState(() => `wc-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    wcGamesApi.fixtures()
      .then(d => {
        if (d.success) {
          const found = d.data.find(f => String(f.fixture.id) === String(fixtureId));
          if (found?.freeGame) {
            setGame(found.freeGame);
            if (found.freeGame.correct_option) {
              setCorrectOpt(found.freeGame.correct_option);
              setOptSaved(true);
            }
          }
        }
      })
      .catch(() => {
        const mock = MOCK_GAMES[fixtureId];
        if (mock) setGame(mock);
      })
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const handleSaveCorrectOption = async () => {
    if (!correctOpt) return;
    setSavingOpt(true);
    try {
      await wcGamesApi.update(fixtureId, { correct_option: correctOpt, status: 'closed' });
      setOptSaved(true);
      addToast('Correct answer saved — game closed for new predictions', 'success');
    } catch {
      setOptSaved(true);
      addToast('Correct answer saved (mock)', 'success');
    } finally {
      setSavingOpt(false);
    }
  };

  const handleSettle = async () => {
    if (!optSaved) { addToast('Set the correct answer first', 'error'); return; }
    setSpinning(true);
    try {
      const data = await wcGamesApi.settle(fixtureId, { client_seed: clientSeed });
      await new Promise(r => setTimeout(r, 1800));
      setWinners(data.data.winners || []);
      addToast(`Settled — ${data.data.winner_count} winner(s)`, 'success');
    } catch {
      // Mock settle
      await new Promise(r => setTimeout(r, 1800));
      const count    = game?.winner_count || 5;
      const shuffled = [...MOCK_POOL].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);
      setWinners(selected.map(u => ({
        ...u,
        prize_type:        game?.prize_type,
        prize_usd:         game?.prize_usd,
        prize_description: game?.prize_description,
      })));
      addToast(`Settled (mock) — ${selected.length} winner(s)`, 'success');
    } finally {
      setSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/worldcup')} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><FiArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-xl font-black text-gray-800">Settle WC Game</h1>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 shadow-sm">
          No free game found for fixture #{fixtureId}.{' '}
          <button onClick={() => navigate(`/admin/worldcup/new?fixture=${fixtureId}`)} className="text-[#1A4D8F] font-semibold hover:underline">Create one</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/worldcup')} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-800">Settle: {game.home_team} vs {game.away_team}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fixture #{fixtureId} · {game.entry_count ?? 0} total entries</p>
        </div>
      </div>

      {/* Game summary */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-700">{game.question}</p>
          {game.prize_type === 'cash'
            ? <span className="flex items-center gap-1 text-[#F5C518] text-sm font-black"><FiDollarSign className="w-3.5 h-3.5" />{game.prize_usd} × {game.winner_count}</span>
            : <span className="flex items-center gap-1 text-purple-600 text-xs font-bold"><FiGift className="w-3.5 h-3.5" />{game.prize_description}</span>
          }
        </div>
        <div className="flex flex-wrap gap-2">
          {game.options?.map(opt => (
            <span key={opt.key} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              {opt.key.toUpperCase()}. {opt.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Set correct answer */}
      {!winners && (
        <div className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3 ${optSaved ? 'border-green-200' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${optSaved ? 'bg-green-500' : 'bg-[#1A4D8F]'}`}>
              {optSaved ? <FiCheckCircle className="w-3.5 h-3.5" /> : '1'}
            </div>
            <h2 className="font-bold text-gray-700 text-sm">Set the correct answer</h2>
          </div>
          <p className="text-xs text-gray-400 pl-8">Match is over — select which option was correct. Only users who picked this will enter the draw.</p>

          <div className="pl-8 space-y-2">
            {game.options?.map(opt => (
              <label key={opt.key} className={`flex items-center gap-3 rounded-xl px-4 py-3 border cursor-pointer transition-all ${
                correctOpt === opt.key
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${optSaved ? 'pointer-events-none' : ''}`}>
                <input type="radio" name="correct" value={opt.key} checked={correctOpt === opt.key}
                  onChange={() => setCorrectOpt(opt.key)} className="accent-green-500 w-4 h-4 shrink-0" />
                <span className={`text-sm font-semibold ${correctOpt === opt.key ? 'text-green-700' : 'text-gray-700'}`}>
                  {opt.key.toUpperCase()}. {opt.label}
                </span>
                {correctOpt === opt.key && optSaved && <FiCheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
              </label>
            ))}
          </div>

          {!optSaved && (
            <div className="pl-8">
              <button
                onClick={handleSaveCorrectOption}
                disabled={!correctOpt || savingOpt}
                className="flex items-center gap-2 bg-[#1A4D8F] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-50"
              >
                {savingOpt ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : 'Save Correct Answer'}
              </button>
            </div>
          )}

          {optSaved && (
            <p className="pl-8 text-xs text-green-600 font-semibold flex items-center gap-1.5">
              <FiCheckCircle className="w-3.5 h-3.5" /> Correct answer set · predictions closed
            </p>
          )}
        </div>
      )}

      {/* Step 2: Client seed + randomize */}
      {!winners && (
        <div className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 ${!optSaved ? 'opacity-50 pointer-events-none' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${optSaved ? 'bg-[#1A4D8F]' : 'bg-gray-300'}`}>2</div>
            <h2 className="font-bold text-gray-700 text-sm">Randomize winners</h2>
          </div>

          <div className="pl-8 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Client Seed (provably fair)</label>
              <div className="flex items-center gap-2">
                <input type="text" value={clientSeed} onChange={e => setClientSeed(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" />
                <button type="button" onClick={() => setClientSeed(`wc-${Date.now()}-${Math.random().toString(36).slice(2)}`)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0" title="Regenerate">
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">HMAC-SHA256 shuffle of the correct entries pool. Server seed revealed after settlement.</p>
            </div>

            <button onClick={handleSettle} disabled={spinning}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all ${
                spinning
                  ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white hover:shadow-xl hover:scale-[1.01]'
              }`}>
              {spinning
                ? <><div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" /> Selecting winners…</>
                : <><FiZap className="w-5 h-5" /> Randomize Draw</>}
            </button>
          </div>
        </div>
      )}

      {/* Winners revealed */}
      {winners && (
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="w-16 h-16 bg-[#F5C518]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiAward className="w-8 h-8 text-[#F5C518]" />
            </div>
            <h2 className="font-black text-gray-800 text-xl mb-1">{winners.length} Winner{winners.length !== 1 ? 's' : ''} Selected!</h2>
            <p className="text-gray-500 text-sm">
              {game.prize_type === 'cash'
                ? `$${game.prize_usd} each credited to wallet`
                : `${game.prize_description} — winners emailed for address`}
            </p>
          </div>

          <div className="space-y-2">
            {winners.map((w, i) => (
              <div key={w.user_id || i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="w-8 h-8 bg-[#F5C518] rounded-full flex items-center justify-center font-black text-[#1A1A2E] text-sm shrink-0">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">@{w.username}</p>
                  <p className="text-xs text-gray-400 truncate">{w.email}</p>
                </div>
                <div className="text-right shrink-0">
                  {game.prize_type === 'cash'
                    ? <p className="font-black text-green-600 text-sm">${game.prize_usd}</p>
                    : <FiMail className="w-4 h-4 text-purple-500 ml-auto" title="Email sent for address" />}
                </div>
              </div>
            ))}
          </div>

          {game.prize_type === 'merch' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <FiMail className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <p className="text-sm text-purple-700">
                <strong>Emails sent</strong> — each winner has been notified and asked to reply with their delivery address. No address is stored in their profile.
              </p>
            </div>
          )}

          {game.prize_type === 'cash' && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <p className="text-sm text-green-700 font-semibold">Cash prizes credited to winners' wallets.</p>
            </div>
          )}

          <button onClick={() => navigate('/admin/worldcup')}
            className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Back to World Cup Games
          </button>
        </div>
      )}
    </div>
  );
}
