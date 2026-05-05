import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiCalendar, FiStar, FiAward, FiZap, FiDollarSign } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const MARKETS = ['Corners', 'Total Cards', 'Goal Scorers', 'Shots', 'Penalty', 'Scores', 'Throw Ins', 'Fouls'];
const ALL_MARKETS = ['All Categories', 'Most Used'];
const CLOSE_OPTIONS = ['Immediately before the match', '1 hour before', '30 minutes before', '15 minutes before'];
const DRAFT_OPTIONS = ['Immediately after the match', '30 minutes after', '1 hour after', '2 hours after'];
const AUTHORS = ['Williams Idowu', 'Admin Super'];

const TIERS = [
  {
    key: 'silver',
    label: 'Silver',
    Icon: FiStar,
    description: 'Entry $0.50–$2 · 10–50 winners · Simple RNG draw',
    bg: 'bg-gray-50 border-gray-300',
    activeBg: 'bg-gray-100 border-gray-500',
    badge: 'bg-gray-500 text-white',
    suggestedPrice: 0.99,
    suggestedWinners: 15,
  },
  {
    key: 'gold',
    label: 'Gold',
    Icon: FiAward,
    description: 'Entry $2–$20 · 3–10 winners · RNG + audit trail',
    bg: 'bg-yellow-50 border-yellow-200',
    activeBg: 'bg-yellow-100 border-yellow-500',
    badge: 'bg-[#F5C518] text-[#1A1A2E]',
    suggestedPrice: 4.99,
    suggestedWinners: 5,
  },
  {
    key: 'platinum',
    label: 'Platinum',
    Icon: FiZap,
    description: 'Entry $20–$200 · 1–3 winners · Provably Fair HMAC',
    bg: 'bg-purple-50 border-purple-200',
    activeBg: 'bg-purple-100 border-purple-500',
    badge: 'bg-purple-600 text-white',
    suggestedPrice: 24.99,
    suggestedWinners: 2,
  },
];

export default function AddNewMatch() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle]         = useState('');
  const [markets, setMarkets]     = useState([]);
  const [marketTab, setMarketTab] = useState('All Categories');
  const [stadium, setStadium]     = useState('');
  const [closeAt, setCloseAt]     = useState(CLOSE_OPTIONS[0]);
  const [draftAt, setDraftAt]     = useState(DRAFT_OPTIONS[0]);
  const [tier, setTier]           = useState('silver');
  const [ticketPrice, setTicketPrice] = useState('0.99');
  const [winners, setWinners]     = useState(15);
  const [adminPick, setAdminPick] = useState('');
  const [author, setAuthor]       = useState(AUTHORS[0]);
  const [status, setStatus]       = useState('Draft');
  const [errors, setErrors]       = useState({});

  const selectedTier = TIERS.find(t => t.key === tier);

  const handleTierChange = (key) => {
    setTier(key);
    const t = TIERS.find(x => x.key === key);
    setTicketPrice(String(t.suggestedPrice));
    setWinners(t.suggestedWinners);
  };

  const toggleMarket = (m) =>
    setMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const validate = () => {
    const e = {};
    if (!title.trim())    e.title   = 'Match title is required';
    if (markets.length === 0) e.markets = 'Select at least one market';
    if (!stadium.trim())  e.stadium  = 'Stadium/League/Date is required';
    if (!adminPick.trim()) e.adminPick = 'Admin pick is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) return;
    addToast('Match published successfully', 'success');
    navigate('/admin/matches');
  };

  const handleDraft = () => {
    if (!title.trim()) { setErrors({ title: 'Title is required' }); return; }
    setStatus('Draft');
    addToast('Match saved as draft', 'info');
    navigate('/admin/matches');
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

          {/* Match Title */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Man United vs Arsenal"
              className={`w-full border rounded-lg px-4 py-3 text-base font-semibold placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Tier Selection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4">Tier</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIERS.map(t => {
                const active = tier === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleTierChange(t.key)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${active ? t.activeBg : t.bg} hover:brightness-95`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black ${t.badge}`}>
                        <t.Icon className="w-3 h-3" />
                        {t.label}
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
            <h3 className="font-bold text-[#1A1A2E] mb-4">Markets</h3>
            <div className="flex gap-0 border-b border-gray-100 mb-4">
              {ALL_MARKETS.map(t => (
                <button
                  key={t}
                  onClick={() => setMarketTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    marketTab === t
                      ? 'border-[#1A4D8F] text-[#1A4D8F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.markets && <p className="text-red-500 text-xs mb-3">{errors.markets}</p>}
            <div className="grid grid-cols-2 gap-2">
              {MARKETS.map(m => (
                <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={markets.includes(m)}
                    onChange={() => toggleMarket(m)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1A4D8F] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-[#1A4D8F] transition-colors">{m}</span>
                </label>
              ))}
            </div>
            <button className="mt-4 text-sm text-[#1A4D8F] hover:underline flex items-center gap-1">
              <FiPlus className="w-4 h-4" /> Add New Market
            </button>
          </div>

          {/* Admin Pick */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Admin Pick</h3>
            <input
              value={adminPick}
              onChange={e => setAdminPick(e.target.value)}
              placeholder="e.g. Over 9.5 Corners"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${errors.adminPick ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.adminPick && <p className="text-red-500 text-xs mt-1">{errors.adminPick}</p>}
          </div>

          {/* Stadium / League / Date / Time */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#1A4D8F]" /> Stadium / League / Date / Time
            </h3>
            <input
              value={stadium}
              onChange={e => setStadium(e.target.value)}
              placeholder="e.g. The Emirates Stadium / EPL / 08-24 / 17:30"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] placeholder-gray-300 ${errors.stadium ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.stadium && <p className="text-red-500 text-xs mt-1">{errors.stadium}</p>}
          </div>

          {/* Ticket Price + Winners */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-[#1A4D8F]" /> Ticket Price & Winners
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Ticket Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ticketPrice}
                  onChange={e => setTicketPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {selectedTier?.label} suggested: ${selectedTier?.suggestedPrice}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Number of Winners</label>
                <input
                  type="number"
                  min="1"
                  value={winners}
                  onChange={e => setWinners(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {selectedTier?.label} suggested: {selectedTier?.suggestedWinners}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Sales Close */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Ticket Sales Close</h3>
            <select
              value={closeAt}
              onChange={e => setCloseAt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white"
            >
              {CLOSE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Draft Time */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Draw Time</h3>
            <select
              value={draftAt}
              onChange={e => setDraftAt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white"
            >
              {DRAFT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Author */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-3">Author</h3>
            <select
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] bg-white"
            >
              {AUTHORS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* ── Right column (Publish panel) ────────────────── */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-6 space-y-4">
            <h3 className="font-bold text-[#1A1A2E]">Publish</h3>

            {/* Tier summary */}
            <div className={`rounded-lg p-3 border-2 ${selectedTier?.activeBg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black ${selectedTier?.badge}`}>
                  {selectedTier && <selectedTier.Icon className="w-3 h-3" />}
                  {selectedTier?.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">{selectedTier?.description}</p>
            </div>

            <button
              onClick={handleDraft}
              className="w-full border border-gray-300 text-gray-700 rounded px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiEdit2 className="w-3.5 h-3.5 text-gray-400" />
                  Status: <span className="font-medium text-[#1A1A2E]">{status}</span>
                </div>
                <button className="text-xs text-[#1A4D8F] hover:underline">Edit</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                  Publish: <span className="font-medium text-[#1A1A2E]">immediately</span>
                </div>
                <button className="text-xs text-[#1A4D8F] hover:underline">Edit</button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <button
                onClick={handlePublish}
                className="w-full bg-[#1A4D8F] text-white font-semibold rounded px-4 py-2.5 text-sm hover:bg-[#0D2B5E] transition-colors"
              >
                Publish
              </button>
              <button
                onClick={() => navigate('/admin/matches')}
                className="w-full text-xs text-red-400 hover:text-red-500 hover:underline text-center"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
