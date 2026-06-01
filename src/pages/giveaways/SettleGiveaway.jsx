import { useState } from 'react';
import { FiRefreshCw, FiUsers, FiCheckCircle, FiAward, FiShuffle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const MOCK_CLOSED_GIVEAWAYS = [
  {
    id: 'g2',
    title: 'Man City vs Liverpool — Weekly Quiz',
    prize_type: 'physical',
    prize_description: 'Official Match Ball + Jersey',
    prize_walp_each: null,
    winner_count: 3,
    total_entries: 89,
    correct_pool_size: 21,
    questions_count: 4,
    closes_at: '2026-05-26T18:00:00Z',
    correct_pool: [
      { id: 'u1', username: 'jsmith92',     full_name: 'James Smith',   entry_id: 'e1' },
      { id: 'u2', username: 'footie_fan',   full_name: 'Sarah Connor',  entry_id: 'e2' },
      { id: 'u3', username: 'predictor99',  full_name: 'Mike Johnson',  entry_id: 'e3' },
      { id: 'u4', username: 'lucky_star',   full_name: 'Amira Hassan',  entry_id: 'e4' },
      { id: 'u5', username: 'guessguru',    full_name: 'Tunde Bello',   entry_id: 'e5' },
      { id: 'u6', username: 'winalot_fan',  full_name: 'Clara Obi',     entry_id: 'e6' },
      { id: 'u7', username: 'striker10',    full_name: 'Pedro Ruiz',    entry_id: 'e7' },
      { id: 'u8', username: 'quizmaster',   full_name: 'Nkechi Eze',    entry_id: 'e8' },
      { id: 'u9', username: 'goalking',     full_name: 'David Park',    entry_id: 'e9' },
      { id: 'u10', username: 'fanatic77',   full_name: 'Grace Okonkwo', entry_id: 'e10' },
    ],
  },
];

function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function GiveawayRow({ giveaway }) {
  const { addToast } = useToast();
  const [randomizing, setRandomizing] = useState(false);
  const [winners, setWinners]         = useState(null);
  const [publishing, setPublishing]   = useState(false);
  const [published, setPublished]     = useState(false);
  const [animStep, setAnimStep]       = useState(0);

  const handleRandomize = () => {
    setRandomizing(true);
    setWinners(null);
    setAnimStep(0);

    // 3-phase animation: shuffle → reveal
    const step1 = setTimeout(() => setAnimStep(1), 400);
    const step2 = setTimeout(() => setAnimStep(2), 900);
    const step3 = setTimeout(() => setAnimStep(3), 1300);
    const done  = setTimeout(() => {
      const shuffled = fisherYatesShuffle(giveaway.correct_pool);
      setWinners(shuffled.slice(0, giveaway.winner_count));
      setRandomizing(false);
      setAnimStep(0);
    }, 1600);

    return () => [step1, step2, step3, done].forEach(clearTimeout);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await new Promise(r => setTimeout(r, 700));
    setPublished(true);
    setPublishing(false);
    addToast('Winners published! Prizes have been credited.', 'success');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#1A1A2E] text-sm">{giveaway.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Closed {giveaway.closes_at ? new Date(giveaway.closes_at).toLocaleString() : '—'}
              &nbsp;·&nbsp;{giveaway.questions_count} questions
            </p>
          </div>
          {published && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              <FiCheckCircle className="w-3 h-3" /> Settled
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Total Entries</p>
            <p className="text-xl font-black text-[#1A1A2E] mt-0.5">{giveaway.total_entries}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wide">Correct Pool</p>
            <p className="text-xl font-black text-green-700 mt-0.5">{giveaway.correct_pool_size}</p>
          </div>
          <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-yellow-700 font-semibold uppercase tracking-wide">Winners to Pick</p>
            <p className="text-xl font-black text-[#1A1A2E] mt-0.5">{giveaway.winner_count}</p>
          </div>
        </div>

        {/* Prize */}
        <div className="mt-3 flex items-center gap-2">
          <FiAward className="w-4 h-4 text-[#F5C518]" />
          <span className="text-sm font-bold text-[#1A1A2E]">
            {giveaway.prize_type === 'walp'
              ? `${(giveaway.prize_walp_each / 100).toLocaleString()} WALP / winner`
              : giveaway.prize_description}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Correct pool preview */}
        {!winners && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Correct Pool ({giveaway.correct_pool.length} users, showing first 5)</p>
            <div className="space-y-1.5">
              {giveaway.correct_pool.slice(0, 5).map(u => (
                <div key={u.entry_id} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {u.full_name[0]}
                  </div>
                  <span className="font-medium">{u.username}</span>
                  <span className="text-gray-400 text-xs">{u.full_name}</span>
                </div>
              ))}
              {giveaway.correct_pool.length > 5 && (
                <p className="text-xs text-gray-400 pl-8">+{giveaway.correct_pool.length - 5} more in the pool</p>
              )}
            </div>
          </div>
        )}

        {/* Randomize button */}
        {!published && (
          <button onClick={handleRandomize} disabled={randomizing || published}
            className="w-full flex items-center justify-center gap-2 bg-[#F5C518] text-gray-900 font-black rounded-xl py-3 text-sm hover:brightness-95 disabled:opacity-60 transition-all mb-4">
            {randomizing ? (
              <>
                <span className={`w-4 h-4 border-2 border-gray-700/20 border-t-gray-800 rounded-full ${animStep > 0 ? 'spinner' : ''}`} />
                {animStep < 2 ? 'Shuffling pool…' : animStep < 3 ? 'Selecting winners…' : 'Finalizing…'}
              </>
            ) : (
              <>
                <FiShuffle className="w-4 h-4" />
                {winners ? 'Re-randomize' : 'Randomize Winners'}
              </>
            )}
          </button>
        )}

        {/* Winner reveal */}
        {winners && (
          <div className="space-y-4">
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <FiCheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm font-bold text-[#1A1A2E]">{winners.length} Winner{winners.length !== 1 ? 's' : ''} Selected</p>
              </div>
              <div className="space-y-2">
                {winners.map((w, i) => (
                  <div key={w.entry_id}
                    className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                    style={{ animation: `fadeIn 0.3s ease ${i * 0.1}s both` }}>
                    <span className="w-7 h-7 rounded-full bg-green-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-[#1A1A2E] text-sm">{w.username}</p>
                      <p className="text-xs text-gray-500">{w.full_name}</p>
                    </div>
                    <div className="ml-auto text-right">
                      {giveaway.prize_type === 'walp' ? (
                        <p className="text-sm font-black text-[#1A4D8F]">
                          {(giveaway.prize_walp_each / 100).toLocaleString()} WALP
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-gray-600">{giveaway.prize_description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!published && (
              <button onClick={handlePublish} disabled={publishing}
                className="w-full bg-[#1A4D8F] text-white font-bold rounded-xl py-3 text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {publishing
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Publishing…</>
                  : 'Publish Winners & Credit Prizes'
                }
              </button>
            )}
          </div>
        )}

        {published && winners && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <FiCheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-green-700 text-sm">Winners Published</p>
            <p className="text-xs text-gray-500 mt-1">
              {winners.length} winner{winners.length !== 1 ? 's' : ''} have been notified and prizes credited.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettleGiveaway() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Settle Giveaway</h1>
          <p className="text-sm text-gray-500">Run the randomizer and publish winners for closed giveaways</p>
        </div>
        <button onClick={() => setRefreshKey(k => k + 1)} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {MOCK_CLOSED_GIVEAWAYS.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
          <FiUsers className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No closed giveaways awaiting settlement</p>
        </div>
      ) : (
        <div className="space-y-5">
          {MOCK_CLOSED_GIVEAWAYS.map(g => (
            <GiveawayRow key={`${g.id}-${refreshKey}`} giveaway={g} />
          ))}
        </div>
      )}
    </div>
  );
}
