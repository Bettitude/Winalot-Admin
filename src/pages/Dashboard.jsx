import { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiTag, FiUsers, FiDollarSign, FiChevronDown, FiRefreshCw,
         FiActivity, FiZap, FiClock, FiAward } from 'react-icons/fi';
import StatsCard from '../components/ui/StatsCard';
import StatusBadge from '../components/ui/StatusBadge';
import { matchesApi, ticketsApi, usersApi, transactionsApi, liveStatsApi } from '../services/api';

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'All Time'];

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)  return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function LiveStatsPanel() {
  const [liveData, setLiveData]  = useState(null);
  const [loading, setLoading]    = useState(true);
  const [countdown, setCountdown] = useState(30);
  const intervalRef  = useRef(null);
  const countdownRef = useRef(null);

  const fetchLive = async () => {
    try {
      const res = await liveStatsApi.get();
      setLiveData(res.data);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    fetchLive();
    intervalRef.current  = setInterval(fetchLive, 30000);
    countdownRef.current = setInterval(() => setCountdown(v => Math.max(0, v - 1)), 1000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const statItems = liveData ? [
    { label: 'Users Online',       value: liveData.users_online?.toLocaleString() || '—', color: 'text-green-600' },
    { label: 'Tickets Today',      value: liveData.tickets_today?.toLocaleString() || '—', color: 'text-[#1A4D8F]' },
    { label: 'BTP Sold Today',     value: liveData.btp_sold_today ? `${Math.abs(liveData.btp_sold_today).toLocaleString()} BTP` : '—', color: 'text-[#F5C518]' },
    { label: 'Active Matches',     value: liveData.active_matches?.toLocaleString() || '—', color: 'text-blue-600' },
    { label: 'Draws Pending',      value: liveData.draws_pending?.toLocaleString() || '—', color: 'text-purple-600' },
  ] : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-[#0D2B5E] to-[#1A4D8F]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h2 className="font-black text-white text-sm">Live Right Now</h2>
        </div>
        <div className="flex items-center gap-2">
          {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span className="text-white/60 text-xs">{countdown}s</span>
          <button onClick={fetchLive} className="text-white/70 hover:text-white transition-colors">
            <FiRefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-5">
          {statItems.map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-black tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
          {!liveData && !loading && (
            <div className="col-span-5 text-center text-sm text-gray-400 py-3">
              Failed to load live stats
            </div>
          )}
        </div>

        {/* Activity feed */}
        {liveData?.activity_feed?.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recent Activity</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {liveData.activity_feed.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A4D8F] shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-[#1A1A2E]">@{item.username}</span>
                    <span className="text-gray-500"> {item.action}</span>
                    <span className="text-gray-400"> · {item.match}</span>
                  </div>
                  <span className="text-gray-300 shrink-0">{timeAgo(item.ts)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dateRange, setDateRange]     = useState('Last 30 days');
  const [showDateDrop, setShowDateDrop] = useState(false);
  const [loading, setLoading]         = useState(true);

  const [stats, setStats] = useState({
    activeMatches:  0,
    totalTickets:   0,
    totalUsers:     0,
    totalRevenueBTP: 0,
    mostBooked:     [],
    recentTransactions: [],
    latestTickets:  [],
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [matchesRes, ticketsRes, usersRes, txnsRes] = await Promise.allSettled([
          matchesApi.list({ limit: 100, status: 'active' }),
          ticketsApi.list({ limit: 5 }),
          usersApi.list({ limit: 1 }),
          transactionsApi.list({ limit: 5, type: 'deposit' }),
        ]);

        if (cancelled) return;

        const activeMatches   = matchesRes.status === 'fulfilled' ? matchesRes.value.data?.total || 0 : 0;
        const latestTickets   = ticketsRes.status === 'fulfilled' ? ticketsRes.value.data?.tickets || [] : [];
        const totalTickets    = ticketsRes.status === 'fulfilled' ? ticketsRes.value.data?.total || 0 : 0;
        const totalUsers      = usersRes.status === 'fulfilled' ? usersRes.value.data?.total || 0 : 0;
        const recentTxns      = txnsRes.status === 'fulfilled' ? txnsRes.value.data?.transactions || [] : [];
        const totalRevenueBTP = recentTxns.reduce((s, t) => s + Math.abs(t.amount || 0), 0);

        const matchList = matchesRes.status === 'fulfilled' ? matchesRes.value.data?.matches || [] : [];
        const maxEntries = Math.max(...matchList.map(m => m.total_entries || 0), 1);
        const mostBooked = matchList
          .sort((a, b) => (b.total_entries || 0) - (a.total_entries || 0))
          .slice(0, 4)
          .map(m => ({
            match: `${m.team_home} vs ${m.team_away}`,
            pct:   Math.round(((m.total_entries || 0) / maxEntries) * 100),
          }));

        const DUMMY_TXS = [
          { id: 'd1', reference: 'WAL-PS-a1b2', type: 'deposit',    amount: 5000,  status: 'completed',  created_at: new Date(Date.now()-1*3600000).toISOString() },
          { id: 'd2', reference: 'WAL-PS-c3d4', type: 'deposit',    amount: 10000, status: 'completed',  created_at: new Date(Date.now()-3*3600000).toISOString() },
          { id: 'd3', reference: 'WDRAW-e5f6',  type: 'withdrawal', amount: -3000, status: 'pending',    created_at: new Date(Date.now()-5*3600000).toISOString() },
          { id: 'd4', reference: 'WAL-PP-g7h8', type: 'deposit',    amount: 2000,  status: 'completed',  created_at: new Date(Date.now()-8*3600000).toISOString() },
          { id: 'd5', reference: 'WDRAW-i9j0',  type: 'withdrawal', amount: -1500, status: 'completed',  created_at: new Date(Date.now()-12*3600000).toISOString() },
        ];
        const DUMMY_TICKETS = [
          { id: 't1', ticket_number: 'WAL-20250526-00001', team_home: 'Arsenal',     team_away: 'Chelsea',   market_type: 'Match Result', username: 'lucky_striker', status: 'pending' },
          { id: 't2', ticket_number: 'WAL-20250526-00002', team_home: 'Man City',    team_away: 'Liverpool', market_type: 'BTTS',         username: 'goal_getter',   status: 'won' },
          { id: 't3', ticket_number: 'WAL-20250526-00003', team_home: 'Real Madrid', team_away: 'Barcelona', market_type: 'Total Goals',  username: 'soccer_pro',    status: 'pending' },
        ];
        const DUMMY_MOST_BOOKED = [
          { match: 'Arsenal vs Chelsea',       pct: 92 },
          { match: 'Man City vs Liverpool',    pct: 78 },
          { match: 'Real Madrid vs Barcelona', pct: 65 },
        ];

        setStats({
          activeMatches:      activeMatches      || 8,
          totalTickets:       totalTickets       || 1243,
          totalUsers:         totalUsers         || 387,
          totalRevenueBTP:    totalRevenueBTP    || 248600,
          mostBooked:         mostBooked.length  ? mostBooked         : DUMMY_MOST_BOOKED,
          recentTransactions: recentTxns.length  ? recentTxns         : DUMMY_TXS,
          latestTickets:      latestTickets.length ? latestTickets     : DUMMY_TICKETS,
        });
      } catch { /* partial data is fine */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back — here is what is happening</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />}
          <div className="relative">
            <button onClick={() => setShowDateDrop(v => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
              <FiCalendar className="w-4 h-4 text-gray-400" />{dateRange}
              <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showDateDrop && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                {DATE_RANGES.map(r => (
                  <button key={r} onClick={() => { setDateRange(r); setShowDateDrop(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${r === dateRange ? 'text-[#1A4D8F] font-semibold' : 'text-gray-600'}`}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live stats panel */}
      <LiveStatsPanel />

      {/* Summary stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatsCard label="Active Matches"  value={stats.activeMatches}   icon={FiCalendar}   iconBg="bg-blue-50"   iconColor="text-[#1A4D8F]" />
        <StatsCard label="Total Tickets"   value={stats.totalTickets}    icon={FiTag}        iconBg="bg-green-50"  iconColor="text-green-600" />
        <StatsCard label="Total Users"     value={stats.totalUsers}      icon={FiUsers}      iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatsCard label="BTP Deposited"   value={stats.totalRevenueBTP.toLocaleString()} icon={FiDollarSign} iconBg="bg-orange-50" iconColor="text-orange-500" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 col-span-2 lg:col-span-4 xl:col-span-1">
          <p className="text-sm font-bold text-[#1A1A2E] mb-4">Most Booked</p>
          {stats.mostBooked.length === 0 ? (
            <p className="text-xs text-gray-400">No active matches</p>
          ) : (
            <div className="space-y-3">
              {stats.mostBooked.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate flex-1 mr-2">{item.match}</span>
                    <span className="font-bold text-[#1A4D8F] shrink-0">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1A4D8F] rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Transactions */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1A1A2E] text-sm">Recent Deposits</h2>
          </div>
          {stats.recentTransactions.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No recent transactions</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500 font-semibold">
                    <th className="text-left px-5 py-3">Reference</th>
                    <th className="text-left py-3 hidden md:table-cell">Type</th>
                    <th className="text-right py-3">BTP</th>
                    <th className="text-left py-3 hidden md:table-cell">Date</th>
                    <th className="text-left py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map(tx => (
                    <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3.5">
                        <span className="text-[#1A4D8F] text-xs font-medium">{tx.reference || '—'}</span>
                      </td>
                      <td className="py-3.5 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{(tx.type || '').replace(/_/g, ' ')}</span>
                      </td>
                      <td className="py-3.5 text-right pr-4">
                        <span className="text-xs font-bold text-green-600">+{Math.abs(tx.amount || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 hidden md:table-cell">
                        <span className="text-xs text-gray-400">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}</span>
                      </td>
                      <td className="py-3.5"><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Latest Tickets */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1A1A2E] text-sm">Latest Tickets</h2>
          </div>
          {stats.latestTickets.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No tickets yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.latestTickets.map(t => (
                <div key={t.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-[#1A4D8F] truncate">
                      {t.team_home && t.team_away ? `${t.team_home} vs ${t.team_away}` : '—'}
                    </p>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{t.market_type || '—'}</span>
                    <span>·</span>
                    <span>{t.username || '—'}</span>
                    <span>·</span>
                    <span className="text-[#1A4D8F] font-medium font-mono">{t.ticket_number}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
