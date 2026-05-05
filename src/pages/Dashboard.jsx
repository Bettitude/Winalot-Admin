import { useState } from 'react';
import { FiCalendar, FiTag, FiUsers, FiEye, FiChevronDown } from 'react-icons/fi';
import StatsCard from '../components/ui/StatsCard';
import StatusBadge from '../components/ui/StatusBadge';
import { dashboardStats, mockMatches, mockTickets } from '../data/adminMockData';

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', '01 Apr, 2023 – 28 Dec, 2023'];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('01 Apr, 2023 – 28 Dec, 2023');
  const [showDateDrop, setShowDateDrop] = useState(false);

  const latestTickets = mockTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, here is what is happening</p>
        </div>

        {/* Date range picker */}
        <div className="relative">
          <button
            onClick={() => setShowDateDrop(v => !v)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            <FiCalendar className="w-4 h-4 text-gray-400" />
            {dateRange}
            <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showDateDrop && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
              {DATE_RANGES.map(r => (
                <button key={r} onClick={() => { setDateRange(r); setShowDateDrop(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${r === dateRange ? 'text-[#1A4D8F] font-semibold' : 'text-gray-600'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatsCard label="Active Matches"  value={dashboardStats.activeMatches} icon={FiCalendar} iconBg="bg-blue-50"   iconColor="text-[#1A4D8F]" />
        <StatsCard label="Total Tickets"   value={dashboardStats.totalTickets}  icon={FiTag}      iconBg="bg-green-50"  iconColor="text-green-600" trend={dashboardStats.ticketsTrend} />
        <StatsCard label="Total Users"     value={dashboardStats.totalUsers}    icon={FiUsers}    iconBg="bg-purple-50" iconColor="text-purple-600" trend={dashboardStats.usersTrend} />
        <StatsCard label="Total Visitors"  value={dashboardStats.totalVisitors} icon={FiEye}      iconBg="bg-orange-50" iconColor="text-orange-500" trend={dashboardStats.visitorsTrend} />

        {/* Most Booked card (spans 1 col on lg) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 col-span-2 lg:col-span-4 xl:col-span-1">
          <p className="text-sm font-bold text-[#1A1A2E] mb-4">Most Booked</p>
          <div className="space-y-3">
            {dashboardStats.mostBooked.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate flex-1 mr-2">{item.match}</span>
                  <span className="font-bold text-[#1A4D8F] shrink-0">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A4D8F] rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Transactions */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1A1A2E] text-sm">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 font-semibold">
                  <th className="text-left px-5 py-3">Transaction ID</th>
                  <th className="text-left py-3 hidden md:table-cell">Ticket Number</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3 hidden md:table-cell">Date</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardStats.recentTransactions.map(tx => (
                  <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <a href="#" className="text-[#1A4D8F] hover:underline text-xs font-medium">{tx.ref}</a>
                    </td>
                    <td className="py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-600">{tx.ticket}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs font-bold text-[#1A1A2E]">{tx.amount}</span>
                    </td>
                    <td className="py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-400">{tx.date}</span>
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Tickets */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1A1A2E] text-sm">Latest Tickets</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {latestTickets.map(t => (
              <div key={t.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-[#1A4D8F] truncate hover:underline cursor-pointer">{t.match}</p>
                  <StatusBadge status={t.status} />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{t.market}</span>
                  <span>·</span>
                  <span>{t.user}</span>
                  <span>·</span>
                  <span className="text-[#1A4D8F] font-medium">{t.ticketNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
