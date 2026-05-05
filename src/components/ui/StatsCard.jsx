import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function StatsCard({ label, value, trend, icon: Icon, iconBg = 'bg-blue-50', iconColor = 'text-[#1A4D8F]' }) {
  const isUp   = trend?.startsWith('+');
  const isDown = trend?.startsWith('-');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isUp   ? 'bg-green-50 text-green-600' :
            isDown ? 'bg-red-50 text-red-500' :
                     'bg-gray-100 text-gray-500'
          }`}>
            {isUp   ? <FiTrendingUp className="w-3 h-3" />   : null}
            {isDown ? <FiTrendingDown className="w-3 h-3" /> : null}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-[#1A1A2E] mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
