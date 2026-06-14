import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiDollarSign, FiUsers, FiSave, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { wcGamesApi } from '../../services/api';

export default function CreateWorldCupGame() {
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const { addToast } = useToast();

  const fixtureId = params.get('fixture') || '';
  const homeTeam  = params.get('home')    || '';
  const awayTeam  = params.get('away')    || '';
  const matchDate = (params.get('date') || '').replace(' ', '+');

  const [form, setForm] = useState({
    fixture_id:        fixtureId,
    home_team:         homeTeam,
    away_team:         awayTeam,
    match_date:        matchDate,
    question:          homeTeam && awayTeam ? `Who will win — ${homeTeam} vs ${awayTeam}?` : 'Who will win?',
    prize_type:        'cash',
    prize_usd:         '10',
    prize_description: '',
    winner_count:      '5',
  });

  // Options: admin configures the prediction choices
  const [options, setOptions] = useState(() => {
    if (homeTeam && awayTeam) {
      return [
        { key: 'a', label: `${homeTeam} Win` },
        { key: 'b', label: 'Draw' },
        { key: 'c', label: `${awayTeam} Win` },
      ];
    }
    return [
      { key: 'a', label: 'Home Win' },
      { key: 'b', label: 'Draw' },
      { key: 'c', label: 'Away Win' },
    ];
  });

  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addOption = () => {
    if (options.length >= 6) return;
    const key = String.fromCharCode(97 + options.length); // a, b, c, d, e, f
    setOptions(o => [...o, { key, label: '' }]);
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(o => {
      const next = o.filter((_, idx) => idx !== i);
      return next.map((opt, idx) => ({ ...opt, key: String.fromCharCode(97 + idx) }));
    });
  };

  const updateOption = (i, label) => setOptions(o => o.map((opt, idx) => idx === i ? { ...opt, label } : opt));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fixture_id)  { addToast('Fixture ID is required', 'error'); return; }
    if (!form.question)    { addToast('Question is required', 'error'); return; }
    if (options.some(o => !o.label.trim())) { addToast('All option labels are required', 'error'); return; }
    if (form.prize_type === 'cash' && (!form.prize_usd || Number(form.prize_usd) <= 0)) { addToast('Prize amount is required', 'error'); return; }
    if (form.prize_type === 'merch' && !form.prize_description.trim()) { addToast('Prize description is required for merch', 'error'); return; }

    setSaving(true);
    try {
      const body = {
        fixture_id:        form.fixture_id,
        home_team:         form.home_team,
        away_team:         form.away_team,
        match_date:        form.match_date,
        question:          form.question,
        options,
        prize_type:        form.prize_type,
        prize_usd:         form.prize_type === 'cash' ? Number(form.prize_usd) : null,
        prize_description: form.prize_type === 'merch' ? form.prize_description : null,
        winner_count:      Number(form.winner_count),
      };

      await wcGamesApi.create(body);
      addToast('Free game created!', 'success');
      navigate('/admin/worldcup');
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const matchLabel = form.home_team && form.away_team ? `${form.home_team} vs ${form.away_team}` : `Fixture #${form.fixture_id}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/worldcup')} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-800">Create Free Prediction Game</h1>
          <p className="text-sm text-gray-500 mt-0.5">{matchLabel}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Match info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Match</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fixture ID *</label>
              <input type="text" value={form.fixture_id} onChange={e => set('fixture_id', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
                placeholder="1100003" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Match Date (UTC)</label>
              <input type="datetime-local" value={form.match_date ? form.match_date.slice(0,16) : ''}
                onChange={e => set('match_date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Home Team</label>
              <input type="text" value={form.home_team} onChange={e => set('home_team', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
                placeholder="Brazil" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Away Team</label>
              <input type="text" value={form.away_team} onChange={e => set('away_team', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
                placeholder="Argentina" />
            </div>
          </div>
        </div>

        {/* Prediction question + options */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Prediction Question</h2>
          <p className="text-xs text-gray-400">Users pick one option. Those who match the correct answer enter the prize draw.</p>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Question *</label>
            <input type="text" value={form.question} onChange={e => set('question', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
              placeholder="Who will win?" required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-500">Options (2–6)</label>
              {options.length < 6 && (
                <button type="button" onClick={addOption} className="text-xs text-[#1A4D8F] font-semibold flex items-center gap-1 hover:underline">
                  <FiPlus className="w-3.5 h-3.5" /> Add Option
                </button>
              )}
            </div>
            {options.map((opt, i) => (
              <div key={opt.key} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-black text-gray-500 shrink-0">
                  {opt.key.toUpperCase()}
                </span>
                <input type="text" value={opt.label} onChange={e => updateOption(i, e.target.value)}
                  placeholder={`Option ${opt.key.toUpperCase()} — e.g. Brazil Win`}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
                  required />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            The correct answer is set <strong>after the match ends</strong> from the Settle page — not here.
          </div>
        </div>

        {/* Prize */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Prize</h2>

          {/* Prize type toggle */}
          <div className="flex gap-3">
            {[['cash','Cash (Wallet)'],['merch','Merch / Physical']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set('prize_type', v)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  form.prize_type === v ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]' : 'border-gray-200 text-gray-500 hover:border-[#1A4D8F]/40'
                }`}>
                {l}
              </button>
            ))}
          </div>

          {form.prize_type === 'cash' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prize Per Winner (USD) *</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" min="1" step="0.5" value={form.prize_usd}
                  onChange={e => set('prize_usd', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
                  required />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Credited directly to winner's wallet</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prize Description *</label>
              <input type="text" value={form.prize_description}
                onChange={e => set('prize_description', e.target.value)}
                placeholder="e.g. Official Brazil WC Jersey, Signed Match Ball…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
                required={form.prize_type === 'merch'} />
              <p className="text-[11px] text-gray-400 mt-1">Winners will be emailed asking for their delivery address — no address stored in profile</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Number of Winners *</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" min="1" max="200" value={form.winner_count}
                onChange={e => set('winner_count', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
                required />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Randomly selected from users who predicted correctly</p>
          </div>

          {form.prize_type === 'cash' && form.prize_usd && form.winner_count && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-sm text-blue-700 font-semibold">
                Total payout: <span className="font-black">${(Number(form.prize_usd) * Number(form.winner_count)).toFixed(2)}</span>
                <span className="text-xs font-normal text-blue-500 ml-2">({form.winner_count} × ${Number(form.prize_usd)})</span>
              </p>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#1A4D8F] text-white font-black py-3.5 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 text-sm">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
            : <><FiSave className="w-4 h-4" /> Create Free Prediction Game</>}
        </button>
      </form>
    </div>
  );
}
