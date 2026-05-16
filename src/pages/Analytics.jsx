import { useState, useEffect, useCallback } from 'react';
import {
  FiUsers, FiDollarSign, FiTag, FiCalendar,
  FiTrendingUp, FiActivity, FiMonitor, FiSmartphone, FiTablet,
  FiRefreshCw, FiChevronDown, FiUser, FiCreditCard,
  FiBarChart2, FiPieChart, FiList, FiZap, FiAward, FiStar,
} from 'react-icons/fi';
import { analyticsApi } from '../services/api';

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'All Time'];

// ── Tiny stat card ────────────────────────────────────────────────────────────
function OverviewCard({ label, value, sub, icon: Icon, iconBg, iconColor, trend }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-black text-[#1A1A2E] leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {trend != null && (
          <p className={`text-xs font-semibold mt-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}% vs prev period
          </p>
        )}
      </div>
    </div>
  );
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function HBar({ label, value, max, color = 'bg-[#1A4D8F]', right }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600 truncate flex-1 mr-2">{label}</span>
        <span className="font-bold text-gray-700 shrink-0">{right ?? value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <h2 className="font-bold text-[#1A1A2E] text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── BTP sparkline (div-based) ─────────────────────────────────────────────────
function BTPChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No data available</p>;
  }
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <HBar key={i} label={d.label} value={d.amount} max={max}
          right={`${d.amount.toLocaleString()} BTP`} color="bg-[#F5C518]" />
      ))}
    </div>
  );
}

// ── Tier icon ─────────────────────────────────────────────────────────────────
function TierIcon({ tier }) {
  if (tier === 'platinum') return <FiZap className="w-3.5 h-3.5 text-purple-600" />;
  if (tier === 'gold')     return <FiAward className="w-3.5 h-3.5 text-yellow-600" />;
  return <FiStar className="w-3.5 h-3.5 text-gray-500" />;
}

// ── Device icon ───────────────────────────────────────────────────────────────
function DeviceIcon({ device }) {
  if (device === 'mobile')  return <FiSmartphone className="w-4 h-4 text-blue-500" />;
  if (device === 'tablet')  return <FiTablet className="w-4 h-4 text-purple-500" />;
  return <FiMonitor className="w-4 h-4 text-gray-500" />;
}

// ── Fallback / placeholder data used when API is unavailable ──────────────────
const EMPTY = {
  overview:    { users: 0, tickets: 0, btp_deposited: 0, active_matches: 0 },
  topPages:    [],
  topMarkets:  [],
  btpChart:    [],
  topSpenders: [],
  tierStats:   [],
  devices:     [],
  regSources:  [],
  activity:    [],
};

export default function Analytics() {
  const [dateRange, setDateRange]     = useState('Last 30 days');
  const [showDrop, setShowDrop]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [data, setData]               = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { range: dateRange };
    const [
      overviewRes, topPagesRes, topMarketsRes,
      btpRes, spendersRes, tierRes,
      devicesRes, regRes, activityRes,
    ] = await Promise.allSettled([
      analyticsApi.overview(params),
      analyticsApi.topPages(params),
      analyticsApi.topMarkets(params),
      analyticsApi.btpChart(params),
      analyticsApi.topSpenders(params),
      analyticsApi.tierStats(params),
      analyticsApi.deviceBreakdown(params),
      analyticsApi.regSources(params),
      analyticsApi.activityFeed(params),
    ]);

    setData({
      overview:   overviewRes.status  === 'fulfilled' ? overviewRes.value.data  || EMPTY.overview  : EMPTY.overview,
      topPages:   topPagesRes.status  === 'fulfilled' ? topPagesRes.value.data  || []              : [],
      topMarkets: topMarketsRes.status=== 'fulfilled' ? topMarketsRes.value.data|| []              : [],
      btpChart:   btpRes.status       === 'fulfilled' ? btpRes.value.data       || []              : [],
      topSpenders:spendersRes.status  === 'fulfilled' ? spendersRes.value.data  || []              : [],
      tierStats:  tierRes.status      === 'fulfilled' ? tierRes.value.data      || []              : [],
      devices:    devicesRes.status   === 'fulfilled' ? devicesRes.value.data   || []              : [],
      regSources: regRes.status       === 'fulfilled' ? regRes.value.data       || []              : [],
      activity:   activityRes.status  === 'fulfilled' ? activityRes.value.data  || []              : [],
    });
    setLoading(false);
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const ov = data.overview;
  const maxPageViews  = Math.max(...(data.topPages.map(p => p.views || 0)), 1);
  const maxMarketPct  = Math.max(...(data.topMarkets.map(m => m.entries || 0)), 1);
  const maxTierBTP    = Math.max(...(data.tierStats.map(t => t.btp || 0)), 1);
  const maxDevices    = Math.max(...(data.devices.map(d => d.count || 0)), 1);
  const maxRegSrc     = Math.max(...(data.regSources.map(r => r.count || 0)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Analytics</h1>
          <p className="text-sm text-gray-500">Platform performance and usage insights</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner" />}
          <div className="relative">
            <button onClick={() => setShowDrop(v => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              {dateRange}
              <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showDrop && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                {DATE_RANGES.map(r => (
                  <button key={r} onClick={() => { setDateRange(r); setShowDrop(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${r === dateRange ? 'text-[#1A4D8F] font-semibold' : 'text-gray-600'}`}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={load} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard label="Total Users"      value={ov.users?.toLocaleString() || '0'}
          icon={FiUsers}      iconBg="bg-blue-50"   iconColor="text-[#1A4D8F]" trend={ov.users_trend} />
        <OverviewCard label="Tickets Sold"     value={ov.tickets?.toLocaleString() || '0'}
          icon={FiTag}        iconBg="bg-green-50"  iconColor="text-green-600"  trend={ov.tickets_trend} />
        <OverviewCard label="BTP Deposited"    value={`${(ov.btp_deposited || 0).toLocaleString()} BTP`}
          icon={FiDollarSign} iconBg="bg-orange-50" iconColor="text-orange-500" trend={ov.btp_trend} />
        <OverviewCard label="Active Matches"   value={ov.active_matches?.toLocaleString() || '0'}
          icon={FiCalendar}   iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Row 2: BTP chart + Top Pages */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Section title="BTP Deposits Over Time" icon={FiTrendingUp} className="xl:col-span-3">
          <BTPChart data={data.btpChart} />
        </Section>
        <Section title="Most Visited Pages" icon={FiList} className="xl:col-span-2">
          {data.topPages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No page-view data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topPages.slice(0, 8).map((p, i) => (
                <HBar key={i} label={p.path} value={p.views} max={maxPageViews}
                  right={`${(p.views || 0).toLocaleString()} views`} />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Row 3: Top Markets + Top Spenders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section title="Most Predicted Markets" icon={FiBarChart2}>
          {data.topMarkets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No market data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topMarkets.slice(0, 6).map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-gray-400 shrink-0">#{i + 1}</span>
                      <span className="text-gray-700 truncate font-medium">{m.market_type || m.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-400">{m.yes_pct != null ? `${m.yes_pct}% YES` : ''}</span>
                      <span className="font-bold text-[#1A4D8F]">{(m.entries || 0).toLocaleString()} entries</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                    {m.yes_pct != null ? (
                      <>
                        <div className="h-full bg-green-500 rounded-l-full transition-all duration-500" style={{ width: `${m.yes_pct}%` }} />
                        <div className="h-full bg-red-400 rounded-r-full transition-all duration-500" style={{ width: `${100 - m.yes_pct}%` }} />
                      </>
                    ) : (
                      <div className="h-full bg-[#1A4D8F] rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(((m.entries || 0) / maxMarketPct) * 100)}%` }} />
                    )}
                  </div>
                  {m.yes_pct != null && (
                    <div className="flex gap-3 mt-0.5 text-[10px] text-gray-400">
                      <span className="text-green-600 font-semibold">{m.yes_pct}% YES</span>
                      <span className="text-red-500 font-semibold">{100 - m.yes_pct}% NO</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Top Spenders" icon={FiCreditCard}>
          {data.topSpenders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No spender data yet</p>
          ) : (
            <div className="space-y-2">
              {data.topSpenders.slice(0, 8).map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-gray-400 shrink-0 text-right">#{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-[#1A4D8F]/10 flex items-center justify-center shrink-0">
                    <FiUser className="w-3.5 h-3.5 text-[#1A4D8F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">{s.username || s.user_id?.slice(0, 10) || '—'}</p>
                    <p className="text-xs text-gray-400">{(s.tickets || 0)} tickets</p>
                  </div>
                  <span className="text-sm font-bold text-[#1A4D8F] shrink-0">{(s.total_spent || 0).toLocaleString()} BTP</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Row 4: Tier Performance + Device Breakdown + Reg Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="Tier Performance" icon={FiPieChart}>
          {data.tierStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No tier data yet</p>
          ) : (
            <div className="space-y-3">
              {data.tierStats.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TierIcon tier={t.tier} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="capitalize font-semibold text-gray-700">{t.tier}</span>
                      <span className="font-bold text-[#1A4D8F]">{(t.btp || 0).toLocaleString()} BTP</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        t.tier === 'platinum' ? 'bg-purple-600' : t.tier === 'gold' ? 'bg-[#F5C518]' : 'bg-gray-400'
                      }`} style={{ width: `${Math.round(((t.btp || 0) / maxTierBTP) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{(t.entries || 0).toLocaleString()} entries · {(t.markets || 0)} markets</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Device Breakdown" icon={FiMonitor}>
          {data.devices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No device data yet</p>
          ) : (
            <div className="space-y-3">
              {data.devices.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <DeviceIcon device={d.device} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="capitalize font-semibold text-gray-700">{d.device || 'Desktop'}</span>
                      <span className="font-bold text-gray-700">{d.pct != null ? `${d.pct}%` : (d.count || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1A4D8F] rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(((d.count || 0) / maxDevices) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Registration Sources" icon={FiActivity}>
          {data.regSources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No source data yet</p>
          ) : (
            <div className="space-y-3">
              {data.regSources.map((r, i) => (
                <HBar key={i} label={r.source || 'Direct'} value={r.count || 0} max={maxRegSrc}
                  right={`${(r.count || 0).toLocaleString()} users`} color="bg-green-500" />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Activity feed */}
      <Section title="Recent Activity" icon={FiActivity}>
        {data.activity.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
        ) : (
          <div className="divide-y divide-gray-100 -mx-5 -mb-5">
            {data.activity.slice(0, 15).map((a, i) => (
              <div key={i} className="px-5 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1A4D8F]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FiActivity className="w-3.5 h-3.5 text-[#1A4D8F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{a.description || a.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.username && <span className="text-[#1A4D8F] font-medium mr-1">{a.username}</span>}
                    {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
