import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiTrash2, FiGift, FiCalendar, FiDollarSign, FiHelpCircle,
  FiSearch, FiCheck, FiX,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { footballSearchApi } from '../../services/api';

const OPTION_KEYS   = ['a', 'b', 'c', 'd'];
const OPTION_LABELS = { a: 'A', b: 'B', c: 'C', d: 'D' };

function emptyQuestion(order) {
  return {
    id: `q_${Date.now()}_${order}`,
    question_text: '',
    option_a: '', option_b: '', option_c: '', option_d: '',
    correct_option: 'a',
    time_limit_seconds: 30,
  };
}

function MatchPicker({ selected, onSelect, onClear }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!query.trim() || query.length < 3) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await footballSearchApi.searchFixtures(query);
        setResults(res.data || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setResults([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (selected) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <FiCheck className="w-4 h-4 text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1A2E] truncate">
            {selected.teams?.home?.name} vs {selected.teams?.away?.name}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {selected.league?.name}
            {selected.fixture?.date
              ? ` · ${new Date(selected.fixture.date).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}`
              : ''}
          </p>
        </div>
        <button onClick={onClear}
          className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors shrink-0">
          <FiX className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search team name — e.g. Arsenal, Barcelona…"
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-64 overflow-y-auto">
          {results.map((f, i) => (
            <button key={i} onClick={() => { onSelect(f); setQuery(''); setResults([]); }}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
              <p className="text-sm font-semibold text-[#1A1A2E]">
                {f.teams?.home?.name} vs {f.teams?.away?.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {f.league?.name}
                {f.fixture?.date
                  ? ` · ${new Date(f.fixture.date).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}`
                  : ''}
              </p>
            </button>
          ))}
        </div>
      )}

      {query.length >= 3 && !loading && results.length === 0 && (
        <p className="text-xs text-gray-400 mt-2 px-1">No upcoming fixtures found. Try a different team name.</p>
      )}
    </div>
  );
}

function QuestionCard({ question, index, onChange, onRemove, canRemove, errors }) {
  const qErrors = errors[question.id] || {};
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-[#1A1A2E] text-sm flex items-center gap-2">
          <span className="w-6 h-6 bg-[#1A4D8F] text-white rounded-full flex items-center justify-center text-xs font-black">{index + 1}</span>
          Question {index + 1}
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">Timer (s)</label>
            <input type="number" min="10" max="120"
              value={question.time_limit_seconds}
              onChange={e => onChange(question.id, 'time_limit_seconds', parseInt(e.target.value) || 30)}
              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1A4D8F] text-center" />
          </div>
          {canRemove && (
            <button onClick={() => onRemove(question.id)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium mb-1 block">Question Text *</label>
        <input value={question.question_text}
          onChange={e => onChange(question.id, 'question_text', e.target.value)}
          placeholder="e.g. How many Premier League titles has Arsenal won?"
          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${qErrors.question_text ? 'border-red-400' : 'border-gray-200'}`} />
        {qErrors.question_text && <p className="text-red-500 text-xs mt-1">{qErrors.question_text}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OPTION_KEYS.map(key => (
          <div key={key}>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Option {OPTION_LABELS[key]} *</label>
            <input value={question[`option_${key}`]}
              onChange={e => onChange(question.id, `option_${key}`, e.target.value)}
              placeholder={`Option ${OPTION_LABELS[key]}`}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${qErrors[`option_${key}`] ? 'border-red-400' : 'border-gray-200'}`} />
            {qErrors[`option_${key}`] && <p className="text-red-500 text-xs mt-1">{qErrors[`option_${key}`]}</p>}
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium mb-1 block">Correct Answer *</label>
        <div className="flex gap-2">
          {OPTION_KEYS.map(key => (
            <button key={key} type="button"
              onClick={() => onChange(question.id, 'correct_option', key)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                question.correct_option === key
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
              }`}>
              {OPTION_LABELS[key]}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
          <FiHelpCircle className="w-3 h-3" />
          Users must answer ALL questions correctly to enter the draw pool.
        </p>
      </div>
    </div>
  );
}

export default function AddNewGiveaway() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Match selection
  const [selectedMatch,  setSelectedMatch]  = useState(null);
  const [customTitle,    setCustomTitle]     = useState('');

  // Prize
  const [prizeType,          setPrizeType]          = useState('walp');
  const [prizeWalpEach,      setPrizeWalpEach]      = useState('');
  const [prizeDescription,   setPrizeDescription]   = useState('');
  const [winnerCount,        setWinnerCount]         = useState(10);

  // Schedule
  const [opensAt,            setOpensAt]            = useState('');
  const [closesAt,           setClosesAt]           = useState('');
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(30);

  // Questions
  const [questions, setQuestions] = useState([emptyQuestion(0)]);

  const [errors,     setErrors]    = useState({});
  const [qErrors,    setQErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill closes time from selected match kickoff
  useEffect(() => {
    if (selectedMatch?.fixture?.date && !closesAt) {
      const kick = new Date(selectedMatch.fixture.date);
      // Default: close 5 mins before kickoff
      kick.setMinutes(kick.getMinutes() - 5);
      setClosesAt(kick.toISOString().slice(0, 16));
    }
  }, [selectedMatch]);

  const derivedTitle = selectedMatch
    ? `${selectedMatch.teams?.home?.name} vs ${selectedMatch.teams?.away?.name}`
    : customTitle;

  const handleMatchSelect = (fixture) => {
    setSelectedMatch(fixture);
    setCustomTitle(`${fixture.teams?.home?.name} vs ${fixture.teams?.away?.name}`);
  };

  const handleMatchClear = () => {
    setSelectedMatch(null);
    setCustomTitle('');
    setClosesAt('');
  };

  const addQuestion    = () => {
    if (questions.length >= 10) { addToast('Maximum 10 questions per giveaway', 'error'); return; }
    setQuestions(prev => [...prev, emptyQuestion(prev.length)]);
  };
  const removeQuestion = (id) => setQuestions(prev => prev.filter(q => q.id !== id));
  const updateQuestion = (id, field, value) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));

  const validate = () => {
    const e = {};
    if (!derivedTitle.trim())   e.title        = 'Select a match or enter a title';
    if (!opensAt)               e.opensAt      = 'Open date is required';
    if (!closesAt)              e.closesAt     = 'Close date is required';
    if (prizeType === 'walp' && (!prizeWalpEach || parseFloat(prizeWalpEach) <= 0))
      e.prizeWalpEach = 'Prize amount is required';
    if (prizeType === 'physical' && !prizeDescription.trim())
      e.prizeDescription = 'Prize description is required';
    if (parseInt(winnerCount) < 1) e.winnerCount = 'At least 1 winner required';

    const qe = {};
    questions.forEach(q => {
      const errs = {};
      if (!q.question_text.trim()) errs.question_text = 'Required';
      OPTION_KEYS.forEach(k => { if (!q[`option_${k}`].trim()) errs[`option_${k}`] = 'Required'; });
      if (Object.keys(errs).length) qe[q.id] = errs;
    });

    setErrors(e);
    setQErrors(qe);
    return Object.keys(e).length === 0 && Object.keys(qe).length === 0;
  };

  const submit = async (status) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      addToast(`Giveaway ${status === 'open' ? 'published' : 'saved as draft'} successfully`, 'success');
      navigate('/admin/giveaways');
    } catch (err) {
      addToast(err.message || 'Failed to save giveaway', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="text-xs text-gray-500 font-medium mb-1 block">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[#1A1A2E]">Add New Giveaway</h1>
        <p className="text-sm text-gray-500">Create a WAL Giveaway quiz with admin-set questions and prizes</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 space-y-5">

          {/* Match picker */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
              <FiGift className="w-4 h-4 text-[#F5C518]" /> Giveaway Details
            </h3>

            <Field label="Link to Match (search upcoming fixtures)" error={errors.title}>
              <MatchPicker
                selected={selectedMatch}
                onSelect={handleMatchSelect}
                onClear={handleMatchClear}
              />
            </Field>

            {/* Manual title override if no match selected */}
            {!selectedMatch && (
              <Field label="Or enter title manually">
                <input value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g. Arsenal vs Chelsea — WAL Giveaway"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300" />
              </Field>
            )}

            {/* Title preview */}
            {derivedTitle && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                <p className="text-[10px] text-gray-400 mb-0.5">Giveaway title</p>
                <p className="text-sm font-bold text-[#1A1A2E]">{derivedTitle}</p>
                {selectedMatch?.league?.name && (
                  <p className="text-xs text-gray-400 mt-0.5">{selectedMatch.league.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Prize */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-[#1A4D8F]" /> Prize
            </h3>
            <div className="flex gap-2">
              {[['walp', 'WALP (Cash)'], ['physical', 'Physical Prize']].map(([k, lbl]) => (
                <button key={k} type="button" onClick={() => setPrizeType(k)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    prizeType === k ? 'bg-[#1A4D8F] border-[#1A4D8F] text-white' : 'border-gray-200 text-gray-600 hover:border-[#1A4D8F] bg-white'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>

            {prizeType === 'walp' ? (
              <Field label="Prize per Winner (WALP) *" error={errors.prizeWalpEach}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">WALP</span>
                  <input type="number" min="0.01" step="0.01"
                    value={prizeWalpEach} onChange={e => setPrizeWalpEach(e.target.value)}
                    placeholder="5000.00"
                    className={`w-full border rounded-lg pl-14 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${errors.prizeWalpEach ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Each winner receives this exact amount. 1 WALP = $1.00 USD.</p>
              </Field>
            ) : (
              <Field label="Prize Description *" error={errors.prizeDescription}>
                <input value={prizeDescription} onChange={e => setPrizeDescription(e.target.value)}
                  placeholder="e.g. Official Match Ball + Jersey (Size M)"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300 ${errors.prizeDescription ? 'border-red-400' : 'border-gray-200'}`} />
              </Field>
            )}

            <Field label="Number of Winners *" error={errors.winnerCount}>
              <input type="number" min="1" max="100"
                value={winnerCount} onChange={e => setWinnerCount(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.winnerCount ? 'border-red-400' : 'border-gray-200'}`} />
              <p className="text-[10px] text-gray-400 mt-1">Randomly selected from users who answered all questions correctly.</p>
            </Field>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#1A4D8F]" /> Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opens At *" error={errors.opensAt}>
                <input type="datetime-local" value={opensAt} onChange={e => setOpensAt(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.opensAt ? 'border-red-400' : 'border-gray-200'}`} />
              </Field>
              <Field label="Closes At *" error={errors.closesAt}>
                <input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] ${errors.closesAt ? 'border-red-400' : 'border-gray-200'}`} />
                {selectedMatch && !closesAt && (
                  <p className="text-[10px] text-[#1A4D8F] mt-1">Auto-set to 5 mins before kickoff</p>
                )}
              </Field>
            </div>
            {selectedMatch && (
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: '5 mins before kickoff', mins: -5 },
                  { label: '30 mins before', mins: -30 },
                  { label: 'At kickoff', mins: 0 },
                ].map(opt => (
                  <button key={opt.label} type="button"
                    onClick={() => {
                      const kick = new Date(selectedMatch.fixture.date);
                      kick.setMinutes(kick.getMinutes() + opt.mins);
                      setClosesAt(kick.toISOString().slice(0, 16));
                    }}
                    className="px-3 py-1.5 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:border-[#1A4D8F] hover:text-[#1A4D8F] transition-colors">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            <Field label="Default Seconds Per Question">
              <input type="number" min="10" max="120"
                value={secondsPerQuestion} onChange={e => setSecondsPerQuestion(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]" />
              <p className="text-[10px] text-gray-400 mt-1">Each question can override this below.</p>
            </Field>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1A1A2E]">
                Quiz Questions
                <span className="ml-2 text-xs font-normal text-gray-400">({questions.length}/10)</span>
              </h3>
              <button onClick={addQuestion} disabled={questions.length >= 10}
                className="flex items-center gap-1.5 border border-[#1A4D8F] text-[#1A4D8F] rounded px-3 py-1.5 text-sm font-semibold hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <FiPlus className="w-4 h-4" /> Add Question
              </button>
            </div>
            {questions.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i}
                onChange={updateQuestion} onRemove={removeQuestion}
                canRemove={questions.length > 1} errors={qErrors} />
            ))}
          </div>
        </div>

        {/* Publish sidebar */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-6 space-y-4">
            <h3 className="font-bold text-[#1A1A2E]">Publish</h3>

            <div className="bg-[#F5C518]/10 border border-[#F5C518]/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FiGift className="w-4 h-4 text-[#F5C518]" />
                <span className="text-sm font-bold text-[#1A1A2E]">WAL Giveaway</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Free entry. Answer all questions correctly to enter the draw pool.
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-500">
              {[
                ['Match',     derivedTitle || '—'],
                ['Questions', questions.length],
                ['Winners',   winnerCount || '—'],
                ['Prize',     prizeType === 'walp'
                  ? (prizeWalpEach ? `${parseFloat(prizeWalpEach).toLocaleString()} WALP` : '—')
                  : (prizeDescription || '—')],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span>{k}:</span>
                  <span className="font-bold text-[#1A1A2E] text-right truncate max-w-[140px]">{v}</span>
                </div>
              ))}
            </div>

            <button onClick={() => submit('draft')} disabled={submitting}
              className="w-full border border-gray-300 text-gray-700 rounded px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60">
              Save Draft
            </button>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <button onClick={() => submit('open')} disabled={submitting}
                className="w-full bg-[#1A4D8F] text-white font-semibold rounded px-4 py-2.5 text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : 'Publish Giveaway'}
              </button>
              <button onClick={() => navigate('/admin/giveaways')}
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
