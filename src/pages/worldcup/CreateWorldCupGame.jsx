import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiDollarSign, FiUsers, FiSave, FiArrowLeft, FiPlus, FiTrash2, FiCheck,
  FiTarget, FiFlag, FiAlertTriangle, FiSquare, FiUser, FiCrosshair, FiEdit2, FiBarChart2,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { wcGamesApi } from '../../services/api';

// ── Match-result stat categories ────────────────────────────────────────────
const RESULT_CATEGORIES = [
  {
    key: 'goals',
    label: 'Total Goals',
    Icon: FiTarget,
    question: 'How many total goals will be scored in this match?',
    options: [
      { key: 'a', label: '0–1 Goals' },
      { key: 'b', label: '2–3 Goals' },
      { key: 'c', label: '4–5 Goals' },
      { key: 'd', label: '6+ Goals' },
    ],
    ranges: [[0,1],[2,3],[4,5],[6,999]],
    placeholder: 'e.g. 2',
    unit: 'goals',
  },
  {
    key: 'corners',
    label: 'Total Corners',
    Icon: FiFlag,
    question: 'How many corners will there be in this match?',
    options: [
      { key: 'a', label: '0–5 Corners' },
      { key: 'b', label: '6–8 Corners' },
      { key: 'c', label: '9–11 Corners' },
      { key: 'd', label: '12+ Corners' },
    ],
    ranges: [[0,5],[6,8],[9,11],[12,999]],
    placeholder: 'e.g. 8',
    unit: 'corners',
  },
  {
    key: 'fouls',
    label: 'Total Fouls',
    Icon: FiAlertTriangle,
    question: 'How many fouls will be committed in this match?',
    options: [
      { key: 'a', label: '0–15 Fouls' },
      { key: 'b', label: '16–20 Fouls' },
      { key: 'c', label: '21–25 Fouls' },
      { key: 'd', label: '26+ Fouls' },
    ],
    ranges: [[0,15],[16,20],[21,25],[26,999]],
    placeholder: 'e.g. 18',
    unit: 'fouls',
  },
  {
    key: 'yellow_cards',
    label: 'Yellow Cards',
    Icon: FiSquare,
    iconColor: 'text-yellow-500',
    question: 'How many yellow cards will be shown in this match?',
    options: [
      { key: 'a', label: '0–2 Yellow Cards' },
      { key: 'b', label: '3–4 Yellow Cards' },
      { key: 'c', label: '5–6 Yellow Cards' },
      { key: 'd', label: '7+ Yellow Cards' },
    ],
    ranges: [[0,2],[3,4],[5,6],[7,999]],
    placeholder: 'e.g. 3',
    unit: 'yellow cards',
  },
  {
    key: 'red_cards',
    label: 'Red Cards',
    Icon: FiSquare,
    iconColor: 'text-red-500',
    question: 'How many red cards will be shown in this match?',
    options: [
      { key: 'a', label: '0 Red Cards' },
      { key: 'b', label: '1 Red Card' },
      { key: 'c', label: '2+ Red Cards' },
    ],
    ranges: [[0,0],[1,1],[2,999]],
    placeholder: 'e.g. 1',
    unit: 'red cards',
  },
  {
    key: 'offsides',
    label: 'Total Offsides',
    Icon: FiUser,
    question: 'How many offsides will be called in this match?',
    options: [
      { key: 'a', label: '0–3 Offsides' },
      { key: 'b', label: '4–6 Offsides' },
      { key: 'c', label: '7–9 Offsides' },
      { key: 'd', label: '10+ Offsides' },
    ],
    ranges: [[0,3],[4,6],[7,9],[10,999]],
    placeholder: 'e.g. 5',
    unit: 'offsides',
  },
  {
    key: 'shots_on_target',
    label: 'Shots on Target',
    Icon: FiCrosshair,
    question: 'How many shots on target will there be in this match?',
    options: [
      { key: 'a', label: '0–5 Shots' },
      { key: 'b', label: '6–9 Shots' },
      { key: 'c', label: '10–13 Shots' },
      { key: 'd', label: '14+ Shots' },
    ],
    ranges: [[0,5],[6,9],[10,13],[14,999]],
    placeholder: 'e.g. 8',
    unit: 'shots on target',
  },
];

function getOptionKeyFromValue(category, rawValue) {
  const v = parseInt(rawValue, 10);
  if (isNaN(v) || v < 0) return '';
  const idx = category.ranges.findIndex(([lo, hi]) => v >= lo && v <= hi);
  return idx >= 0 ? category.options[idx].key : '';
}

// ── Component ────────────────────────────────────────────────────────────────
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
    min_entries:       '',
    max_entries:       '',
  });

  // Custom question mode
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

  // Prediction mode
  const [predictionMode,  setPredictionMode]  = useState('custom'); // 'custom' | 'match_result'
  const [resultCategory,  setResultCategory]  = useState(null);     // RESULT_CATEGORIES entry
  const [adminPickValue,  setAdminPickValue]  = useState('');       // raw number string (match_result mode)
  const [adminPick,       setAdminPick]       = useState('');       // option key (custom mode)

  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Custom mode option helpers
  const addOption = () => {
    if (options.length >= 6) return;
    setOptions(o => [...o, { key: String.fromCharCode(97 + o.length), label: '' }]);
  };
  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(o => o.filter((_, idx) => idx !== i).map((opt, idx) => ({ ...opt, key: String.fromCharCode(97 + idx) })));
  };
  const updateOption = (i, label) => setOptions(o => o.map((opt, idx) => idx === i ? { ...opt, label } : opt));

  // Derived values for match_result mode
  const resolvedOptions  = predictionMode === 'match_result' && resultCategory ? resultCategory.options : options;
  const resolvedQuestion = predictionMode === 'match_result' && resultCategory ? resultCategory.question : form.question;
  const resolvedPick     = predictionMode === 'match_result' && resultCategory
    ? getOptionKeyFromValue(resultCategory, adminPickValue)
    : adminPick;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fixture_id) { addToast('Fixture ID is required', 'error'); return; }

    if (predictionMode === 'match_result') {
      if (!resultCategory) { addToast('Select a match result category', 'error'); return; }
    } else {
      if (!form.question) { addToast('Question is required', 'error'); return; }
      if (options.some(o => !o.label.trim())) { addToast('All option labels are required', 'error'); return; }
    }

    if (form.prize_type === 'cash' && (!form.prize_usd || Number(form.prize_usd) <= 0)) {
      addToast('Prize amount is required', 'error'); return;
    }
    if (form.prize_type === 'merch' && !form.prize_description.trim()) {
      addToast('Prize description is required for merch', 'error'); return;
    }

    setSaving(true);
    try {
      const body = {
        fixture_id:          form.fixture_id,
        home_team:           form.home_team,
        away_team:           form.away_team,
        match_date:          form.match_date,
        question:            resolvedQuestion,
        options:             resolvedOptions,
        prediction_category: predictionMode === 'match_result' ? resultCategory?.key || null : null,
        admin_pick:          resolvedPick || null,
        admin_pick_value:    predictionMode === 'match_result' && adminPickValue ? adminPickValue : null,
        prize_type:          form.prize_type,
        prize_usd:           form.prize_type === 'cash' ? Number(form.prize_usd) : null,
        prize_description:   form.prize_type === 'merch' ? form.prize_description : null,
        winner_count:        Number(form.winner_count),
        min_entries:         form.min_entries ? Number(form.min_entries) : null,
        max_entries:         form.max_entries ? Number(form.max_entries) : null,
      };

      const d = await wcGamesApi.create(body);
      if (d.pending) {
        addToast('Match already started — submitted for super admin approval', 'info');
      } else {
        addToast('Free game created!', 'success');
      }
      navigate('/admin/worldcup');
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const matchLabel = form.home_team && form.away_team
    ? `${form.home_team} vs ${form.away_team}`
    : `Fixture #${form.fixture_id}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/worldcup')}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
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

        {/* Prediction mode toggle */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Prediction Question</h2>
          <p className="text-xs text-gray-400">Users pick one option. Those who match the correct answer enter the prize draw.</p>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { mode: 'custom',       Icon: FiEdit2,     label: 'Custom Question', desc: 'Write your own question and options' },
              { mode: 'match_result', Icon: FiBarChart2, label: 'Match Result',    desc: 'Predict a match stat (corners, fouls…)' },
            ].map(({ mode, Icon, label, desc }) => (
              <button key={mode} type="button"
                onClick={() => { setPredictionMode(mode); setResultCategory(null); setAdminPickValue(''); setAdminPick(''); }}
                className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left ${
                  predictionMode === mode
                    ? 'border-[#1A4D8F] bg-[#1A4D8F]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${predictionMode === mode ? 'text-[#1A4D8F]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-bold ${predictionMode === mode ? 'text-[#1A4D8F]' : 'text-gray-700'}`}>{label}</span>
                </div>
                <span className="text-[11px] text-gray-400 leading-tight">{desc}</span>
              </button>
            ))}
          </div>

          {/* ── Custom mode ── */}
          {predictionMode === 'custom' && (
            <div className="space-y-4">
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
                    <button type="button" onClick={addOption}
                      className="text-xs text-[#1A4D8F] font-semibold flex items-center gap-1 hover:underline">
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
                      <button type="button" onClick={() => removeOption(i)}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Match Result mode ── */}
          {predictionMode === 'match_result' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Select a stat category</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RESULT_CATEGORIES.map(cat => {
                    const selected = resultCategory?.key === cat.key;
                    return (
                      <button key={cat.key} type="button"
                        onClick={() => { setResultCategory(cat); setAdminPickValue(''); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                          selected
                            ? 'border-[#1A4D8F] bg-[#1A4D8F]/5 text-[#1A4D8F]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        <cat.Icon className={`w-4 h-4 shrink-0 ${selected ? 'text-[#1A4D8F]' : (cat.iconColor || 'text-gray-400')}`} />
                        <span className="text-xs leading-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {resultCategory && (
                <div className="space-y-3 pt-1">
                  {/* Auto-generated question preview */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Question (auto-generated)</p>
                    <div className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700">
                      {resultCategory.question}
                    </div>
                  </div>

                  {/* Auto-generated options preview */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Options (auto-generated)</p>
                    <div className="flex flex-wrap gap-2">
                      {resultCategory.options.map(opt => {
                        const autoPickKey = getOptionKeyFromValue(resultCategory, adminPickValue);
                        const isHighlighted = autoPickKey === opt.key && adminPickValue !== '';
                        return (
                          <span key={opt.key}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                              isHighlighted
                                ? 'bg-[#1A4D8F] border-[#1A4D8F] text-white'
                                : 'bg-gray-100 border-gray-200 text-gray-600'
                            }`}>
                            {opt.key.toUpperCase()}. {opt.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin's predicted value */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Your predicted value — how many {resultCategory.unit}?
                    </label>
                    <input type="number" min="0" max="999" value={adminPickValue}
                      onChange={e => setAdminPickValue(e.target.value)}
                      placeholder={resultCategory.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" />
                    {adminPickValue !== '' && (
                      <p className="text-[11px] mt-1">
                        {getOptionKeyFromValue(resultCategory, adminPickValue)
                          ? <span className="text-[#1A4D8F] font-semibold">
                              Admin predicts: {resultCategory.options.find(o => o.key === getOptionKeyFromValue(resultCategory, adminPickValue))?.label}
                              {' '}<span className="text-gray-400 font-normal">(your pick: {adminPickValue} {resultCategory.unit})</span>
                            </span>
                          : <span className="text-red-500">Value out of range</span>
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            The correct answer is set <strong>after the match ends</strong> from the Settle page — not here.
          </div>
        </div>

        {/* Admin Pick (custom mode only — match_result auto-sets it from value) */}
        {predictionMode === 'custom' && options.some(o => o.label.trim()) && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div>
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Admin Pick</h2>
              <p className="text-xs text-gray-400 mt-0.5">Which outcome do you predict? Optional — shown as a tip to users.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.filter(o => o.label.trim()).map(opt => {
                const picked = adminPick === opt.key;
                return (
                  <button key={opt.key} type="button"
                    onClick={() => setAdminPick(picked ? '' : opt.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      picked
                        ? 'bg-[#1A4D8F] border-[#1A4D8F] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#1A4D8F]/40 hover:bg-gray-50'
                    }`}>
                    <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                      picked ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {picked ? <FiCheck className="w-3 h-3" /> : opt.key.toUpperCase()}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {adminPick && (
              <div className="bg-[#1A4D8F]/5 border border-[#1A4D8F]/20 rounded-xl px-4 py-2.5 text-xs text-[#1A4D8F] font-medium">
                Admin predicts: <strong>{options.find(o => o.key === adminPick)?.label}</strong>
              </div>
            )}
          </div>
        )}

        {/* Prize */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Prize</h2>

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
              <p className="text-[11px] text-gray-400 mt-1">Winners emailed for delivery address — not stored in profile</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Min Entries</label>
              <input type="number" min="0" value={form.min_entries}
                onChange={e => set('min_entries', e.target.value)}
                placeholder="No minimum"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" />
              <p className="text-[11px] text-gray-400 mt-1">Target entry count for this pool to be worth running</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Max Entries</label>
              <input type="number" min="1" value={form.max_entries}
                onChange={e => set('max_entries', e.target.value)}
                placeholder="Infinite"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" />
              <p className="text-[11px] text-gray-400 mt-1">Leave empty for unlimited entries</p>
            </div>
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
